// src/hooks/useServices.ts
import { useState, useEffect, useCallback } from 'react';
import { Service } from '../../../types/Service';
import { serviceService } from '../../../services/serviceService';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Lấy danh sách tất cả dịch vụ
   */
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceService.getAllServices(0, 1000, ''); 
      setServices(response || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải dữ liệu lần đầu
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  /**
   * Thêm một dịch vụ mới
   */
  const addService = async (serviceData: Partial<Service>): Promise<Service> => { 
    setMutating(true);
    setError(null);
    try {
      const newService = await serviceService.createService(serviceData);
      await fetchServices();
      return newService;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setMutating(false);
    }
  };
  
  /**
   * Xóa một dịch vụ
   */
  const deleteService = async (id: string) => {
    setMutating(true);
    setError(null);
    try {
      await serviceService.deleteService(id);
      await fetchServices();
    } catch (err) {
      setError(err as Error);
    } finally {
      setMutating(false);
    }
  };

  /**
   * Cập nhật một dịch vụ
   */
  const updateService = async (id: string, serviceData: Partial<Service>) => {
    setMutating(true);
    setError(null);
    try {
      await serviceService.updateService(id, serviceData);
      await fetchServices();
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setMutating(false);
    }
  };

  return {
    services,
    loading,
    mutating,
    error,
    fetchServices,
    addService,
    deleteService,
    updateService,
    setServices,
  };
};

export type { Service };