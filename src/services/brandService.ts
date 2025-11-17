// src/services/brandService.ts
import { Brand } from '../types/Brand';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000';

class BrandService {

  // SỬA LỖI 2: Implement hàm deleteManyBrands
  deleteManyBrands(ids: string[]) {
    // Gọi API delete cho từng ID song song
    return Promise.all(ids.map(id => this.deleteBrand(id)));
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("auth_token");

    const config: RequestInit = {
      headers: {
        ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_URL}/api/v1${endpoint}`, config);

    if (!response.ok) {
      if (response.headers.get("Content-Type")?.includes("application/json")) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;
        const error = new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        (error as any).response = { data: errorData, status: response.status };
        throw error;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    if (response.headers.get("Content-Type")?.includes("sheet")) {
        return response;
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  async getAllBrands(skip = 0, limit = 1000, search = '', service_id?: string, sort_by?: keyof Brand, sort_order?: 'asc' | 'desc') {
    const params = new URLSearchParams({
      skip: String(skip),
      limit: String(limit), // Thêm limit
      ...(search && { search }),
      ...(service_id && { service_id }),
      ...(sort_by && { sort_by }),
      ...(sort_order && { sort_order }),
    });
    
    // SỬA LỖI 1: Thêm `params.toString()` vào request
    const response = await this.makeRequest(`/brands?${params.toString()}`);
    return response.data; // Backend của bạn trả về { data: [...] }
  }

  async getUniqueBrandNames(serviceId: string) {
    // Backend của bạn trả về List[dict], không phải {data: ...}
    return this.makeRequest(`/brands/unique-names/${serviceId}`);
  }

  async createBrand(data: Partial<Brand>) {
    const response = await this.makeRequest('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data; // Backend trả về {data: ...}
  }

  async updateBrand(brandId: string, data: Partial<Brand>) {
    const response = await this.makeRequest(`/brands/${brandId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteBrand(brandId: string) {
    return this.makeRequest(`/brands/${brandId}`, { method: 'DELETE' });
  }

  async restoreBrand(brandId: string) {
    const response = await this.makeRequest(`/brands/${brandId}/restore`, { method: 'POST' });
    return response.data;
  }

  async getDeletedBrandsToday() {
    const response = await this.makeRequest('/brands/deleted-today');
    return response.data; // Backend trả về {data: ...}
  }

  async restoreAllDeletedBrandsToday() {
    const response = await this.makeRequest('/brands/restore-all-today', { method: 'POST' });
    return response.data;
  }

  async importBrands(file: File) {
     const formData = new FormData();
     formData.append('file', file);
     return this.makeRequest('/brands/import', {
       method: 'POST',
       body: formData,
     });
  }

  async exportBrands(serviceIds?: string[]) {
    const params = new URLSearchParams();
    if (serviceIds) {
      serviceIds.forEach(id => params.append('service_ids', id));
    }
    const response = await this.makeRequest(`/brands/export?${params}`);
    
    // Logic tải file
    const blob = await response.blob(); 
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brands_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    return response;
  }
  async exportBrandsTemplate(): Promise<Blob> {
    return fetchBlob(`/brands/export-template`);
  }
}

export const brandService = new BrandService();

async function fetchBlob(endpoint: string, options: RequestInit = {}): Promise<Blob> {
  const token = localStorage.getItem("auth_token");

  const config: RequestInit = {
    ...options,
    headers: {
      // Không cần 'Content-Type' cho GET
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}/api/v1${endpoint}`, config);

  if (!response.ok) {
    if (response.headers.get("Content-Type")?.includes("application/json")) {
      const errorData = await response.json();
      const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;
      const error = new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      (error as any).response = { data: errorData, status: response.status };
      throw error;
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  // Kiểm tra chắc chắn là file blob
  const contentType = response.headers.get("Content-Type");
  if (contentType?.includes("sheet") || contentType?.includes("octet-stream") || contentType?.includes("excel")) {
      return response.blob(); // Trả về NỘI DUNG file
  }

  // Nếu server không trả về file
  throw new Error("Server không trả về file Excel. Đã nhận được " + contentType);
}
