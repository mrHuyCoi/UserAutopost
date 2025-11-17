import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete 
} from './apiService';

// Interfaces
export interface MaterialCreate {
  name: string;
  description?: string;
  user_id?: string;
}

export interface MaterialUpdate {
  name?: string;
  description?: string;
}

export interface MaterialRead {
  id: string;
  name: string;
  description?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialInfo {
  id: string;
  name: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error_code?: string;
}

// Material Service
class MaterialService {
  private baseEndpoint = '/materials';

  /**
   * Lấy danh sách tất cả materials với phân trang
   */
  async getAllMaterials(
    skip: number = 0, 
    limit: number = 100, 
    user_id?: string
  ): Promise<MaterialRead[]> {
    try {
      let url = `${this.baseEndpoint}?skip=${skip}&limit=${limit}`;
      if (user_id) {
        url += `&user_id=${user_id}`;
      }
      
      return await apiGet<MaterialRead[]>(url);
    } catch (error) {
      console.error('Error getting all materials:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin material theo ID
   */
  async getMaterialById(materialId: string): Promise<MaterialRead> {
    try {
      return await apiGet<MaterialRead>(`${this.baseEndpoint}/${materialId}`);
    } catch (error) {
      console.error(`Error getting material ${materialId}:`, error);
      throw error;
    }
  }

  /**
   * Tạo material mới
   */
  async createMaterial(materialData: MaterialCreate): Promise<MaterialRead> {
    try {
      return await apiPost<MaterialRead>(this.baseEndpoint, materialData);
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin material
   */
  async updateMaterial(
    materialId: string, 
    materialData: MaterialUpdate
  ): Promise<MaterialRead> {
    try {
      return await apiPut<MaterialRead>(`${this.baseEndpoint}/${materialId}`, materialData);
    } catch (error) {
      console.error(`Error updating material ${materialId}:`, error);
      throw error;
    }
  }

  /**
   * Xóa material
   */
  async deleteMaterial(materialId: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiDelete<{ success: boolean; message: string }>(`${this.baseEndpoint}/${materialId}`);
    } catch (error) {
      console.error(`Error deleting material ${materialId}:`, error);
      throw error;
    }
  }

  /**
   * Tìm kiếm materials theo tên
   */
  async searchMaterialsByName(
    name: string, 
    skip: number = 0, 
    limit: number = 100
  ): Promise<MaterialRead[]> {
    try {
      const encodedName = encodeURIComponent(name);
      return await apiGet<MaterialRead[]>(
        `${this.baseEndpoint}/search/name?name=${encodedName}&skip=${skip}&limit=${limit}`
      );
    } catch (error) {
      console.error(`Error searching materials by name "${name}":`, error);
      throw error;
    }
  }

  /**
   * Lấy thông tin đơn giản của nhiều materials theo danh sách IDs
   */
  async getMaterialsInfoBatch(materialIds: string[]): Promise<MaterialInfo[]> {
    try {
      return await apiPost<MaterialInfo[]>(`${this.baseEndpoint}/batch/info`, materialIds);
    } catch (error) {
      console.error('Error getting materials info batch:', error);
      throw error;
    }
  }

  /**
   * Tạo nhiều materials cùng lúc (nếu có endpoint batch create)
   */
  async createMaterialsBatch(materialsData: MaterialCreate[]): Promise<MaterialRead[]> {
    try {
      return await apiPost<MaterialRead[]>(`${this.baseEndpoint}/batch`, materialsData);
    } catch (error) {
      console.error('Error creating materials batch:', error);
      throw error;
    }
  }

  /**
   * Lấy materials với filter và search kết hợp
   */
  async getMaterialsWithFilters(params: {
    skip?: number;
    limit?: number;
    user_id?: string;
    search?: string;
  }): Promise<MaterialRead[]> {
    try {
      const { skip = 0, limit = 100, user_id, search } = params;
      
      let url = `${this.baseEndpoint}?skip=${skip}&limit=${limit}`;
      
      if (user_id) {
        url += `&user_id=${user_id}`;
      }
      
      if (search) {
        const encodedSearch = encodeURIComponent(search);
        url += `&search=${encodedSearch}`;
      }
      
      return await apiGet<MaterialRead[]>(url);
    } catch (error) {
      console.error('Error getting materials with filters:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const materialService = new MaterialService();

// Export hooks style (optional - for React components)
export const useMaterialService = () => {
  return {
    getAll: materialService.getAllMaterials.bind(materialService),
    getById: materialService.getMaterialById.bind(materialService),
    create: materialService.createMaterial.bind(materialService),
    update: materialService.updateMaterial.bind(materialService),
    delete: materialService.deleteMaterial.bind(materialService),
    searchByName: materialService.searchMaterialsByName.bind(materialService),
    getBatchInfo: materialService.getMaterialsInfoBatch.bind(materialService),
    createBatch: materialService.createMaterialsBatch.bind(materialService),
    getWithFilters: materialService.getMaterialsWithFilters.bind(materialService),
  };
};

export default materialService;