import axios from 'axios';
import { DeviceStorage } from '../types/deviceTypes';
import { getAuthToken } from './apiService';
const NGROK_SKIP_HEADER = { 'ngrok-skip-browser-warning': 'true' };
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000';
interface DeviceStoragesResponse {
  data: DeviceStorage[];
  total: number;
  totalPages: number;
}

export const deviceStorageService = {
  async getDeviceStorages(deviceInfoId: string, pagination: { page: number, limit: number }): Promise<DeviceStoragesResponse> {
    const token = getAuthToken();
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const response = await fetch(`${API_BASE_URL}/api/v1/device-infos/${deviceInfoId}/storages?skip=${skip}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...NGROK_SKIP_HEADER
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch device storages');
    }
    const data = await response.json();
    return {
        data: data.data,
        total: data.total,
        totalPages: data.totalPages
    };
  },
 async getDeviceStoragesByDevice(deviceInfoId: string): Promise<any> {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await axios.get(
        `${API_BASE_URL}/api/v1/device-storages/by-device/${deviceInfoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...NGROK_SKIP_HEADER
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy danh sách dung lượng:', error);
      throw new Error(error?.response?.data?.detail || 'Không thể tải dữ liệu dung lượng');
    }
  },

  async addDeviceStorage(deviceInfoId: string, storageId: string): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/device-infos/${deviceInfoId}/storages/${storageId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to add storage to device');
    }
    return response.json();
  },

  // SỬA LỖI: Thêm lại deviceInfoId để khớp với backend
  async removeDeviceStorage(deviceInfoId: string, storageId: string): Promise<any> {
    const token = getAuthToken();
    // Thêm lại device_info_id vào query param
    const response = await fetch(`${API_BASE_URL}/api/v1/device-storages/${storageId}?device_info_id=${deviceInfoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      let message = 'Failed to remove storage from device';
      try {
        const data = await response.json();
        message = data?.detail || message;
      } catch {}
      throw new Error(message); // Ném ra lỗi với message từ backend
    }
    return response.json();
  },
  
  async createDeviceStorage(payload: { device_info_id: string; capacity: number }): Promise<any> {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/v1/device-storages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let message = 'Failed to create storage';
      try {
        message = (await res.json())?.detail || message;
      } catch {}
      throw new Error(message);
    }
    return res.json();
  },
};
