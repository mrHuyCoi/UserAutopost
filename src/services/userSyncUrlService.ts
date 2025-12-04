import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

export interface UserSyncUrl {
  user_id: string;
  url: string;
  is_active: boolean;
  type_url?: 'device' | 'component' | 'service' | string;
  url_today?: string | null;
}

export const userSyncUrlService = {
  get: async (type_url?: string) => {
    const qs = type_url ? `?type_url=${encodeURIComponent(type_url)}` : '';
    return await apiGet<UserSyncUrl | null>(`/sync-url${qs}`);
  },
  upsert: async (url: string, is_active: boolean = true, type_url?: string, url_today?: string) => {
    return await apiPost<UserSyncUrl>('/sync-url', { url, is_active, type_url, url_today });
  },
  update: async (url?: string, is_active?: boolean, type_url?: string, url_today?: string) => {
    return await apiPut<UserSyncUrl>('/sync-url', { url, is_active, type_url, url_today });
  },
  deactivate: async (type_url?: string) => {
    const qs = type_url ? `?type_url=${encodeURIComponent(type_url)}` : '';
    return await apiDelete<{ success: boolean }>(`/sync-url${qs}`);
  },
  syncDevices: async (updated_today: boolean = false, type_url?: string) => {
    const params = new URLSearchParams();
    if (updated_today) params.append('updated_today', 'true');
    if (type_url) params.append('type_url', type_url);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await apiPost<unknown>(`/sync-url/sync-devices${qs}`, {});
  },
  // Add method to check synchronization status
  checkStatus: async (type_url: string) => {
    try {
      const response = await fetch(`/api/v1/sync-url/status?type_url=${type_url}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking sync status:", error);
      throw new Error("Failed to check sync status");
    }
  },

  // Add method for syncing components
  syncComponents: async (updatedToday: boolean) => {
    try {
      const response = await fetch(`/api/v1/sync-url/sync-devices?updated_today=${updatedToday}`, {
        method: 'POST',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error syncing components:", error);
      throw new Error("Failed to sync components");
    }
  },
};
