import { Color } from '../types/deviceTypes';
import { getAuthToken } from './apiService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000';
const NGROK_SKIP_HEADER = { 'ngrok-skip-browser-warning': 'true' };
interface DeviceColorsResponse {
  data: Color[];
  total: number;
  totalPages: number;
}

interface DeviceColorLink {
  id: string;
  device_info_id: string;
  color_id: string;
  user_id: string;
  device_info: any;
  color: Color;
  created_at: string;
  updated_at: string;
  selected?: boolean;
}

interface DeviceColorLinksResponse {
  data: DeviceColorLink[];
  total: number;
  totalPages: number;
  pagination: {
    pageNum: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const deviceColorService = {
  async getDeviceColorLinks(
    filter: { search?: string } = {},
    pagination: { pageNum?: number; pageSize?: number } = {}
  ): Promise<DeviceColorLinksResponse> {
    const token = getAuthToken();
    const params = new URLSearchParams();
    const pageNum = pagination.pageNum || 1;
    const pageSize = pagination.pageSize || 10;
    params.append('pageNum', pageNum.toString());
    params.append('pageSize', pageSize.toString());
    if (filter.search) {
      params.append('search', filter.search);
    }
    
    const response = await fetch(`${API_BASE_URL}/api/v1/device-colors?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,...NGROK_SKIP_HEADER
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch device colors');
    }
    const data = await response.json();
    return {
      data: data.data || [],
      total: data.total || 0,
      totalPages: data.totalPages || data.pagination?.totalPages || 1,
      pagination: data.pagination || {
        pageNum,
        pageSize,
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      },
    };
  },

  async getDeviceColors(deviceInfoId: string, pagination: { page: number, limit: number }): Promise<DeviceColorsResponse> {
    const token = getAuthToken();
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const response = await fetch(`${API_BASE_URL}/api/v1/device-infos/${deviceInfoId}/colors?skip=${skip}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,...NGROK_SKIP_HEADER
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch device colors');
    }
    const data = await response.json();
    return {
        data: data.data,
        total: data.total,
        totalPages: data.totalPages
    };
  },

  async addDeviceColor(deviceInfoId: string, colorId: string): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/device-infos/${deviceInfoId}/colors/${colorId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to add color to device');
    }
    return response.json();
  },

  async removeDeviceColor(deviceInfoId: string, colorId: string): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/device-infos/${deviceInfoId}/colors/${colorId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      let message = 'Failed to remove color from device';
      try {
        const data = await response.json();
        message = data?.detail || message;
      } catch {}
      throw { status: response.status, message };
    }
    return response.json();
  },

  async deleteDeviceColorLink(id: string): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/device-colors/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      let message = 'Failed to delete device color link';
      try {
        const data = await response.json();
        message = data?.detail || data?.message || message;
      } catch {}
      throw { status: response.status, message };
    }
    if (response.status === 204) {
      return true;
    }
    try {
      const data = await response.json();
      if (typeof data?.data === 'boolean') {
        return data.data;
      }
      if (typeof data?.result === 'boolean') {
        return data.result;
      }
      return true;
    } catch {
      return true;
    }
  },
};

export type { DeviceColorLink, DeviceColorLinksResponse };
