// ComponentManagement.tsx

import React,{ useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { mapBackendToFrontend, useComponentManagement } from './hooks/useComponentManagement';
import { productComponentService } from '../../services/productComponentService';
import Header from './components/Header';
import SearchFilters from './components/SearchFilters';
import ColumnSelector from './components/ColumnSelector';
import ComponentsTable from './components/ComponentsTable';
import DeleteModal from './components/DeleteModal';
import ImageModal from './components/ImageModal';
import { Component } from './types';

// Giả sử bạn có 1 component Toast để thông báo
import { toast } from 'react-hot-toast'; 
import { ProductComponentCreate, ProductComponentUpdate } from '../../types/productComponentTypes';
import ComponentFormModal from './components/ComponentFormModal';

const ComponentManagement: React.FC = () => {
  const {
    state,
    updateState,
    refetch,
    categories,
    brands,
    stockStatuses,
    visibleColumns,
    initialColumnConfig,
  } = useComponentManagement();

  // Event handlers
  const handleImportTemplate = () => console.log('Tải template Excel');
  const handleDeleteAll = () => updateState({ showDeleteModal: true });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleConfirmDelete = async () => {
    try {
      if (state.selectedComponents.length > 0) {
        await productComponentService.bulkDeleteProductComponents(state.selectedComponents);
          toast.success(`Đã xóa ${state.selectedComponents.length} linh kiện.`);
      } else {
       
        await productComponentService.deleteAllProductComponents();
        toast.success('Đã xóa tất cả linh kiện.');
      }
      updateState({ showDeleteModal: false, selectedComponents: [], selectAll: false });
      refetch(); // Tải lại dữ liệu
    } catch (err) {
      toast.error('Đã xảy ra lỗi khi xóa.');
    }
  };

  const handleRestoreDeleted = async () => {
    try {
      const result = await productComponentService.restoreAllDeletedToday();
      toast.success(`Đã khôi phục ${result.restored_count} linh kiện.`);
      refetch();
    } catch (err) {
      console.error("Lỗi khi khôi phục:", err);
      toast.error('Lỗi khi khôi phục.');
    }
  };

  const handleSelectComponent = (id: string) => {
    const newSelected = new Set(state.selectedComponents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    const newSelectedArray = Array.from(newSelected);
    updateState({ 
      selectedComponents: newSelectedArray,
      selectAll: newSelectedArray.length === state.components.length && state.components.length > 0
    });
  };

  const handleSelectAll = () => {
    const newSelectAll = !state.selectAll;
    const newSelected = newSelectAll ? state.components.map(comp => comp.id) : [];
    updateState({ 
      selectedComponents: newSelected,
      selectAll: newSelectAll 
    });
  };
  const serializeImages = (images: string[]): string => {
    // API có thể muốn JSON string
    return JSON.stringify(images);
    // Hoặc API muốn chuỗi cách nhau bằng dấu phẩy
    // return images.join(',');
  };
  const handleDownloadFile = async (apiCall: () => Promise<Blob>, filename: string) => {
    toast.loading('Đang chuẩn bị file...');
    try {
      const blob = await apiCall();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss(); // Tắt loading
      toast.success('Tải file thành công!');
    } catch (err) {
      console.error("Lỗi khi tải file:", err);
      toast.error('Tải file thất bại.');
    }
  };
  const mapFrontendToBackendCreate = (feData: Component): ProductComponentCreate => ({
    product_code: feData.code,
    product_name: feData.name,
    amount: Number(feData.retailPrice),
    wholesale_price: Number(feData.wholesalePrice) || undefined,
    stock: Number(feData.stock),
    category: feData.category || undefined,
    trademark: feData.brand || undefined,
    guarantee: feData.warranty || undefined,
    properties: feData.attribute || undefined,
    description: feData.description || undefined,
    product_link: feData.productLink || undefined,
    product_photo: feData.images ? serializeImages(feData.images) : undefined,
  });
  const mapFrontendToBackendUpdate = (feData: Component): ProductComponentUpdate => ({
    product_code: feData.code,
    product_name: feData.name,
    amount: Number(feData.retailPrice),
    wholesale_price: Number(feData.wholesalePrice) || undefined,
    stock: Number(feData.stock),
    category: feData.category || undefined,
    trademark: feData.brand || undefined,
    guarantee: feData.warranty || undefined,
    properties: feData.attribute || undefined,
    description: feData.description || undefined,
    product_link: feData.productLink || undefined,
    product_photo: feData.images ? serializeImages(feData.images) : undefined,
  });

    // Handlers cho từng hàng
  const handleEdit = async (id: string) => {
      updateState({ showFormModal: 'edit', isFormLoading: true, editingComponent: null });
      try {
        const beComponent = await productComponentService.getProductComponentById(id);
        const feComponent = mapBackendToFrontend(beComponent); // Dùng map helper
        updateState({
          editingComponent: feComponent,
          isFormLoading: false,
        });
      } catch (err) {
        console.error("Lỗi khi tải linh kiện để sửa:", err);
        toast.error("Không thể tải dữ liệu linh kiện.");
        updateState({ showFormModal: null, isFormLoading: false });
      }
  };
  const handleExportTemplate = () => {
    handleDownloadFile(
      productComponentService.exportSampleExcel, 
      'mau_linh_kien.xlsx'
    );
  };

  /**
   * Gọi khi nhấn nút "Xuất Excel"
   */
  const handleExportExcel = () => {
    handleDownloadFile(
      productComponentService.exportAllExcel, 
      'linh_kien.xlsx'
    );
  };

  /**
   * Kích hoạt cửa sổ chọn file khi nhấn "Nhập Excel"
   */
  const handleImportExcelClick = () => {
    fileInputRef.current?.click();
  };
  const handleFormSubmit = async (formData: Component) => {
    // Ném lỗi để modal biết và không tự đóng
    try {
      if (state.showFormModal === 'edit' && state.editingComponent) {
        // Chế độ Sửa
        const updateData = mapFrontendToBackendUpdate(formData);
        await productComponentService.updateProductComponent(state.editingComponent.id, updateData);
        // toast.success("Cập nhật linh kiện thành công!");
      } else {
        // Chế độ Thêm
        const createData = mapFrontendToBackendCreate(formData);
        await productComponentService.createProductComponent(createData);
        // toast.success("Thêm linh kiện thành công!");
      }
      handleFormModalClose();
      refetch(); // Tải lại bảng
    } catch (err) {
      console.error("Lỗi khi lưu linh kiện:", err);
      // toast.error("Đã xảy ra lỗi khi lưu.");
      throw err; // Báo lỗi cho modal
    }
  };
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      toast.loading('Đang nhập file Excel...');
      try {
        const result = await productComponentService.importExcel(file);
        toast.dismiss();
        toast.success(
          `Import thành công!
          Tổng cộng: ${result.total}
          Tạo mới: ${result.created_count}
          Cập nhật: ${result.updated_count}
          Lỗi: ${result.error}`
        , { duration: 6000 });
        
        refetch();

      } catch (err: any) { 
        toast.dismiss();

        let errorMessage = 'Import file thất bại.';
        
        if (err.message) {
          errorMessage = err.message;
        }

        toast.error(errorMessage, { duration: 6000 });

      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
  const handleFormModalClose = () => {
    updateState({
      showFormModal: null,
      editingComponent: null,
      isFormLoading: false,
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa linh kiện này?")) {
      try {
        await productComponentService.deleteProductComponent(id);
        toast.success('Đã xóa linh kiện.');
        refetch();
      } catch (err) {
        toast.error('Lỗi khi xóa linh kiện.');
      }
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await productComponentService.restoreProductComponent(id);
      toast.success('Đã khôi phục linh kiện.');
      refetch();
    } catch (err) {
      toast.error('Lỗi khi khôi phục.');
    }
  };
  
  // Tìm component đang được chọn trong ImageModal
  const currentComponent = state.components.find(comp => 
    comp.images?.includes(state.selectedImage)
  );

  // Image modal functions
  const openImageModal = (component: Component, index: number = 0) => {
    if (component.images && component.images.length > 0) {
      updateState({
        selectedImage: component.images[index],
        currentImageIndex: index,
        showImageModal: true
      });
    }
  };

  const closeImageModal = () => {
    updateState({ 
      showImageModal: false, 
      selectedImage: '', 
      currentImageIndex: 0 
    });
  };

  const nextImage = () => {
    if (currentComponent && currentComponent.images) {
      const nextIndex = (state.currentImageIndex + 1) % currentComponent.images.length;
      updateState({
        selectedImage: currentComponent.images[nextIndex],
        currentImageIndex: nextIndex
      });
    }
  };

  const prevImage = () => {
    if (currentComponent && currentComponent.images) {
      const prevIndex = (state.currentImageIndex - 1 + currentComponent.images.length) % currentComponent.images.length;
      updateState({
        selectedImage: currentComponent.images[prevIndex],
        currentImageIndex: prevIndex
      });
    }
  };

  const selectImage = (image: string, index: number) => {
    updateState({
      selectedImage: image,
      currentImageIndex: index
    });
  };

  // Pagination Handlers
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= state.pagination.totalPages) {
      updateState({ 
      	pagination: { ...state.pagination, currentPage: newPage },
      });
    }
  };

  const handleLimitChange = (newLimit: number) => {
    updateState({
      pagination: { ...state.pagination, limit: newLimit, currentPage: 1 },
    });
  };
const handleAddNewClick = () => {
    updateState({
      showFormModal: 'add',
      editingComponent: null,
      isFormLoading: false,
    });
  };

  // Tính toán chỉ số phân trang
  const { currentPage, limit, totalItems, totalPages } = state.pagination;
  const startIndex = totalItems > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endIndex = Math.min(currentPage * limit, totalItems);
  
  // Đếm số lượng đã xóa (cần API hỗ trợ, tạm thời dựa trên dữ liệu đã tải)
  const deletedCount = state.showDeleted ? totalItems : 0; // Cần API riêng để đếm chính xác

  return (
    <div className="min-h-screen bg-gray-50">
      <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelected}
            className="hidden"
            accept=".xlsx, .xls"
          />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Header
          showDeleted={state.showDeleted}
          deletedCount={deletedCount} // Cần API
          onAddNew={handleAddNewClick}
          onImportExcel={handleImportExcelClick}
          onExportTemplate={handleExportTemplate}
          onExportExcel={handleExportExcel}
          onDeleteAll={handleDeleteAll}
          onRestoreDeleted={handleRestoreDeleted}
          onShowColumnSelector={() => updateState({ showColumnSelector: true })}
          onRefresh={refetch}
          visibleColumnsCount={visibleColumns.length}
          totalColumnsCount={state.columnConfig.length}
        	totalProducts={state.pagination.totalItems}
      />

        <SearchFilters
          searchTerm={state.searchTerm}
          selectedCategory={state.selectedCategory}
          selectedBrand={state.selectedBrand}
          stockStatus={state.stockStatus}
          showAdvancedFilter={state.showAdvancedFilter}
          showDeleted={state.showDeleted}
          deletedCount={deletedCount} // Cần API
          categories={categories}
          brands={brands}
          stockStatuses={stockStatuses}
          onSearchChange={(value) => updateState({ searchTerm: value, pagination: { ...state.pagination, currentPage: 1 } })}
          onCategoryChange={(value) => updateState({ selectedCategory: value, pagination: { ...state.pagination, currentPage: 1 } })}
          onBrandChange={(value) => updateState({ selectedBrand: value, pagination: { ...state.pagination, currentPage: 1 } })}
          onStockStatusChange={(value) => updateState({ stockStatus: value, pagination: { ...state.pagination, currentPage: 1 } })}
          onToggleAdvancedFilter={() => updateState({ showAdvancedFilter: !state.showAdvancedFilter })}
          onToggleShowDeleted={() => updateState({ showDeleted: !state.showDeleted, pagination: { ...state.pagination, currentPage: 1 } })}
        />

        {/* Selection Info */}
        {state.selectedComponents.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">
                Đã chọn {state.selectedComponents.length} linh kiện
              </span>
              <button
                onClick={() => updateState({ selectedComponents: [], selectAll: false })}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Bỏ chọn tất cả
              </button>
            </div>
          </div>
        )}

        {/* Loading and Error State */}
        {state.isLoading && (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-700">Đang tải dữ liệu...</span>
          </div>
        )}
        
        {state.error && !state.isLoading && (
          <div className="flex flex-col justify-center items-center h-64 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <span className="text-red-700 font-medium">Lỗi!</span>
            <span className="text-gray-700 mt-2">{state.error}</span>
            <button onClick={refetch} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Thử lại
            </button>
          </div>
        )}
				
    	{!state.isLoading && !state.error && state.components.length === 0 && (
    		<div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
    		  <span className="text-gray-500">Không tìm thấy linh kiện nào.</span>
    		</div>
    	)}

        {!state.isLoading && !state.error && state.components.length > 0 && (
          <ComponentsTable
            components={state.components}
            columnConfig={state.columnConfig}
            visibleColumns={visibleColumns}
            selectedComponents={state.selectedComponents}
            selectAll={state.selectAll}
            expandedRows={state.expandedRows}
            onSelectComponent={handleSelectComponent}
            onSelectAll={handleSelectAll}
            onToggleRowExpansion={(id) => {
              const newExpanded = new Set(state.expandedRows);
              newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
              updateState({ expandedRows: newExpanded });
            }}
            onOpenImageModal={openImageModal}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        )}

        {/* Pagination */}
        {totalItems > 0 && !state.isLoading && !state.error && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
            <select 
            	value={limit}
            	onChange={(e) => handleLimitChange(Number(e.target.value))}
            	className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="10">10 dòng</option>
              <option value="25">25 dòng</option>
              <option value="50">50 dòng</option>
              <option value="100">100 dòng</option>
            </select>
            <div className="text-sm text-gray-600">
            	Hiển thị {startIndex}-{endIndex} của {totalItems} sản phẩm
            </div>
            <div className="flex items-center gap-2">
              <button 
            		onClick={() => handlePageChange(currentPage - 1)}
            		disabled={currentPage === 1}
            		className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            	>
              	<ChevronLeft size={16} />
           	</button>
          	<span className="text-sm text-gray-600">Trang {currentPage} / {totalPages}</span>
            	<button 
            		onClick={() => handlePageChange(currentPage + 1)}
            		disabled={currentPage === totalPages}
            		className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            	>
              	<ChevronRight size={16} />
            	</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ColumnSelector
        isOpen={state.showColumnSelector}
        columnConfig={state.columnConfig}
        onClose={() => updateState({ showColumnSelector: false })}
        onToggleColumn={(columnId) => {
          const newConfig = state.columnConfig.map(column => 
            column.id === columnId ? { ...column, visible: !column.visible } : column
          );
          updateState({ columnConfig: newConfig });
        }}
        onShowAll={() => {
          updateState({
            columnConfig: state.columnConfig.map(column => ({ ...column, visible: true }))
          });
        }}
        onHideAll={() => {
          updateState({
            columnConfig: state.columnConfig.map(column => ({ ...column, visible: false }))
          });
        }}
      	onReset={() => {
          updateState({
            columnConfig: initialColumnConfig
          });
        }}
      />

      <DeleteModal
        isOpen={state.showDeleteModal}
        selectedCount={state.selectedComponents.length}
        onClose={() => updateState({ showDeleteModal: false })}
        onConfirm={handleConfirmDelete}
      />

      <ImageModal
        isOpen={state.showImageModal}
        selectedImage={state.selectedImage}
        currentImageIndex={state.currentImageIndex}
        component={currentComponent}
        onClose={closeImageModal}
        onNextImage={nextImage}
        onPrevImage={prevImage}
        onSelectImage={selectImage}
      />
      <ComponentFormModal
              isOpen={state.showFormModal !== null}
              mode={state.showFormModal || 'add'}
              isLoading={state.isFormLoading}
              initialData={state.editingComponent}
              onClose={handleFormModalClose}
              onSubmit={handleFormSubmit}
            />
    </div>
  );
};

export default ComponentManagement;