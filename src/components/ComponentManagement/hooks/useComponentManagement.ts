// hooks/useComponentManagement.tsx

import { useState, useEffect, useCallback } from 'react';
import { 
  Component, 
  ColumnConfig, 
  ComponentManagementState, 
  PaginationState 
} from '../types';
import { ProductComponent } from '../../../types/productComponentTypes';
import { productComponentService } from '../../../services/productComponentService';

// Định nghĩa cột mặc định
const initialColumnConfig: ColumnConfig[] = [
  { id: 'code', label: 'Mã SP', visible: true },
  { id: 'name', label: 'Tên Sản Phẩm', visible: true },
  { id: 'image', label: 'Ảnh Sản Phẩm', visible: true },
  { id: 'category', label: 'Danh Mục', visible: true },
  { id: 'attribute', label: 'Thuộc Tính', visible: true },
  { id: 'retailPrice', label: 'Giá bán lẻ', visible: true },
  { id: 'wholesalePrice', label: 'Giá Bán Buôn', visible: false },
  { id: 'brand', label: 'Thương Hiệu', visible: false },
  { id: 'warranty', label: 'Bảo Hành', visible: false },
  { id: 'stock', label: 'Tồn Kho', visible: true },
  { id: 'description', label: 'Mô Tả Sản Phẩm', visible: false },
  { id: 'link', label: 'Link Sản Phẩm', visible: false },
];

// Hàm helper để parse ảnh
const parseImages = (photoData?: string): string[] => {
  if (!photoData) return [];
  try {
    // Thử parse JSON
    const parsed = JSON.parse(photoData);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean);
    }
  } catch (e) {
    
  }
  // Xử lý chuỗi (một URL hoặc nhiều URL cách nhau bằng dấu phẩy)
  if (typeof photoData === 'string' && photoData.length > 0) {
    return photoData.split(',').map(url => url.trim()).filter(Boolean);
  }
  return [];
};

// Hàm helper để map dữ liệu backend sang frontend
export const mapBackendToFrontend = (beComponent: ProductComponent): Component => ({
  id: beComponent.id,
  code: beComponent.product_code,
  name: beComponent.product_name,
  category: beComponent.category || '',
  attribute: beComponent.properties || '',
  retailPrice: beComponent.amount,
  wholesalePrice: beComponent.wholesale_price || 0,
  brand: beComponent.trademark || '',
  warranty: beComponent.guarantee || '',
  stock: beComponent.stock,
  description: beComponent.description || '',
  images: parseImages(beComponent.product_photo),
  productLink: beComponent.product_link || '',
  deletedAt: beComponent.deleted_at,
});

const initialPagination: PaginationState = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  limit: 10,
};

export const useComponentManagement = () => {
  const [state, setState] = useState<ComponentManagementState>({
    components: [],
    isLoading: true,
    error: null,
    pagination: initialPagination,
    
    categories: ['Tất cả danh mục'],
    brands: ['Tất cả thương hiệu'],
    stockStatuses: ['Tình trạng tồn kho', 'Còn hàng', 'Sắp hết hàng', 'Hết hàng'],
    
    showColumnSelector: false,
    showAdvancedFilter: false,
    showDeleteModal: false,
    showImageModal: false,
    selectedImage: '',
    currentImageIndex: 0,
    expandedRows: new Set(),
    searchTerm: '',
    selectedCategory: 'Tất cả danh mục',
    selectedBrand: 'Tất cả thương hiệu',
    stockStatus: 'Tình trạng tồn kho',
    showDeleted: false,
    selectedComponents: [],
    selectAll: false,
    columnConfig: initialColumnConfig,

    // === STATE MỚI ===
    showFormModal: null,
    editingComponent: null,
    isFormLoading: false,
  });

  const updateState = (updates: Partial<ComponentManagementState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Hàm gọi API chính
  const fetchData = useCallback(async () => {
    updateState({ isLoading: true, error: null });
    
    try {
      const filters: { [key: string]: any } = {
        deleted: state.showDeleted,
      };
      if (state.selectedCategory !== 'Tất cả danh mục') {
        filters.category = state.selectedCategory;
      }
      if (state.selectedBrand !== 'Tất cả thương hiệu') {
        filters.trademark = state.selectedBrand;
      }
      if (state.stockStatus === 'Còn hàng') {
        filters.stock_status = 'in_stock';
      } else if (state.stockStatus === 'Sắp hết hàng') {
        filters.stock_status = 'low_stock';
      } else if (state.stockStatus === 'Hết hàng') {
        filters.stock_status = 'out_of_stock';
      }

      const response = await productComponentService.getAllProductComponents(
        state.pagination.currentPage,
        state.pagination.limit,
        state.searchTerm,
        undefined, 
        undefined, 
        filters
      );

      const mappedComponents = response.data.map(mapBackendToFrontend);
      updateState({
        components: mappedComponents,
        pagination: {
          ...state.pagination,
          totalItems: response.total,
          totalPages: response.total_pages,
        },
        isLoading: false,
        selectAll: false,
        selectedComponents: [],
      });
    } catch (err) {
      updateState({ isLoading: false, error: 'Không thể tải dữ liệu.' });
      console.error(err);
    }
  }, [
    state.pagination.currentPage, 
    state.pagination.limit, 
    state.searchTerm, 
    state.selectedCategory, 
    state.selectedBrand, 
    state.stockStatus,
    state.showDeleted
  ]);

  // Hàm gọi API filter
  const fetchFilters = useCallback(async () => {
    try {
      const filterOptions = await productComponentService.getFilterOptions();
      updateState({
        categories: ['Tất cả danh mục', ...filterOptions.categories],
        brands: ['Tất cả thương hiệu', ...filterOptions.trademarks],
      });
    } catch (err) {
      console.error("Không thể tải bộ lọc:", err);
    }
  }, []);

  // useEffects (giữ nguyên)
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const visibleColumns = state.columnConfig.filter(column => column.visible);

  return {
    state,
    updateState,
    refetch: fetchData,
    categories: state.categories,
    brands: state.brands,
    stockStatuses: state.stockStatuses,
    visibleColumns,
    initialColumnConfig,
  };
};