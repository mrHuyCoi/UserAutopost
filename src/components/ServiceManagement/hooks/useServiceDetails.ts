// src/hooks/useServiceDetails.ts
import { useState, useEffect, useCallback } from 'react';
import { brandService } from '../../../services/brandService'; 
import { Brand } from '../../../types/Brand'; // Import kiểu "Brand"

export type ServiceDetail = Brand;
// Sửa: Kiểu Update không cần service_id
export type ServiceDetailCreate = Omit<ServiceDetail, 'id' | 'created_at' | 'updated_at' | 'service' | 'device_brand' | 'service_code'>;
export type ServiceDetailUpdate = Omit<ServiceDetailCreate, 'service_id'>;


export interface ColumnConfig {
  key: keyof ServiceDetail | 'actions';
  label: string;
  visible: boolean;
}

export const useServiceDetails = (serviceId: string | null) => {
  const [serviceDetails, setServiceDetails] = useState<ServiceDetail[]>([]);
  const [deletedItems, setDeletedItems] = useState<ServiceDetail[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mutating, setMutating] = useState(false);

  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([
    { key: 'service_code', label: 'Mã DV', visible: true },
    { key: 'name', label: 'Tên (Thương hiệu)', visible: true },
    { key: 'device_type', label: 'Loại máy', visible: true },
    { key: 'color', label: 'Màu sắc', visible: true },
    { key: 'price', label: 'Giá bán lẻ', visible: true },
    { key: 'wholesale_price', label: 'Giá bán buôn', visible: true },
    { key: 'warranty', label: 'Bảo hành', visible: true },
    { key: 'note', label: 'Ghi chú', visible: true },
    { key: 'actions', label: 'Hành động', visible: true },
  ]);

  const fetchServiceDetails = useCallback(async () => {
    if (!serviceId) {
      setServiceDetails([]); 
      return;
    }
    setIsLoading(true);
    try {
      const response = await brandService.getAllBrands(0, 1000, '', serviceId); 
      setServiceDetails(response || []);
    } catch (error: any) {
      console.error("Failed to fetch service details:", error.message);
      setServiceDetails([]);
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  const fetchDeletedToday = useCallback(async () => {
    if (!serviceId) return;
    try {
      const response: ServiceDetail[] = await brandService.getDeletedBrandsToday();
      const filteredDeleted = (response || []).filter((item: ServiceDetail) => item.service_id === serviceId);
      setDeletedItems(filteredDeleted);
    } catch (err: any) {
      console.error("Failed to fetch deleted service details:", err.message);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchServiceDetails();
    fetchDeletedToday();
  }, [fetchServiceDetails, fetchDeletedToday]);
  
  const addServiceDetail = async (detailData: ServiceDetailCreate) => {
    if (!serviceId) throw new Error("Không có Service ID");
    
    setMutating(true);
    try {
      await brandService.createBrand({...detailData, service_id: serviceId});
      await fetchServiceDetails();
    } catch (err: any) {
      console.error("Failed to add service detail:", err.message);
      throw err;
    } finally {
      setMutating(false);
    }
  };

  // THÊM MỚI: Hàm Update
  const updateServiceDetail = async (detailId: string, detailData: ServiceDetailUpdate) => {
    setMutating(true);
    try {
      await brandService.updateBrand(detailId, detailData);
      await fetchServiceDetails();
    } catch (err: any) {
      console.error("Failed to update service detail:", err.message);
      throw err;
    } finally {
      setMutating(false);
    }
  };

  const deleteServiceDetail = async (id: string) => {
    setMutating(true);
    try {
      await brandService.deleteBrand(id);
      await fetchServiceDetails();
      await fetchDeletedToday();
    } catch (err: any) {
      console.error("Failed to delete service detail:", err.message);
    } finally {
      setMutating(false);
    }
  };

  const deleteSelected = async (ids: string[]) => {
    setMutating(true);
    try {
      await brandService.deleteManyBrands(ids);
      setSelectedRows([]);
      await fetchServiceDetails();
      await fetchDeletedToday();
    } catch (err: any) {
      console.error("Failed to delete selected service details:", err.message);
    } finally {
      setMutating(false);
    }
  };

  const restoreItems = async () => {
    setMutating(true);
    try {
      await brandService.restoreAllDeletedBrandsToday();
      setDeletedItems([]);
      await fetchServiceDetails();
    } catch (err: any) {
      console.error("Failed to restore service details:", err.message);
    } finally {
      setMutating(false);
    }
  };

  const toggleColumn = (key: ColumnConfig['key']) => {
    setColumnConfig(prev => 
      prev.map(col => 
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleSelectAll = (checked: boolean, currentItems: ServiceDetail[]) => {
    if (checked) {
      setSelectedRows(currentItems.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, id]);
    } else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id));
    }
  };

  return {
    serviceDetails,
    isLoading,
    mutating,
    deletedItems,
    selectedRows,
    columnConfig,
    addServiceDetail,
    updateServiceDetail, 
    deleteServiceDetail,
    deleteSelected,
    restoreItems,
    fetchServiceDetails,
    toggleColumn,
    handleSelectAll,
    handleSelectRow,
    setServiceDetails,
    setSelectedRows
  };
};