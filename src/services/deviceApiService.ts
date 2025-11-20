import {
  DeviceInfo,
  Color,
  DeviceColor,
  DeviceStorage,
  UserDevice,
  DeviceFilter,
  DevicePagination,
} from "../types/device";
import type { ImportResponse } from "../types/deviceTypes";

const PUBLIC_URL =
  import.meta.env.VITE_API_BASE_URL || "http://192.168.1.161:8000";
const NGROK_SKIP_HEADER = { 'ngrok-skip-browser-warning': 'true' };
class DeviceApiService {
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("auth_token");
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,...NGROK_SKIP_HEADER
      },
      ...options,
    };
    const response = await fetch(`${PUBLIC_URL}/api/v1${endpoint}`, config);
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        window.location.href = "/login";
        throw new Error("Unauthorized");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }
    if (response.status === 204) return null;
    return await response.json();
  }

  async getDeviceInfos(
    filter: DeviceFilter = {},
    pagination: Partial<DevicePagination> = {}
  ): Promise<{ items: DeviceInfo[]; pagination: DevicePagination }> {
    const params = new URLSearchParams();
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;
    params.append("skip", String(skip));
    params.append("limit", String(limit));
    if (filter.search) params.append("search", filter.search);
    if (filter.brand) params.append("brand", filter.brand);
    const res = await this.makeRequest(`/device-infos?${params.toString()}`);
    console.log("device info", res);
    const items: DeviceInfo[] = res?.data ?? res?.devices ?? [];
    const total: number = res?.total ?? items.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      items,
      pagination: { page, limit, total, totalPages },
    };
  }
  async getStoragesFromAll(): Promise<{
    items: DeviceStorage[];
    pagination: DevicePagination;
  }> {
    const raw = await this.makeRequest(`/device-storages/all?t=${Date.now()}`);
    const all: DeviceStorage[] = Array.isArray(raw)
      ? raw
      : raw?.data ?? raw?.storages ?? [];
    console.log("storage", raw);
    const total = all.length;
    return {
      items: all,
      pagination: {
        page: raw.pagination.page,
        limit: raw.pagination.limit || 1,
        total,
        totalPages: raw.pagination.totalPages,
      },
    };
  }

  async getDeviceInfoById(id: string): Promise<DeviceInfo> {
    if (!this.isValidUUID(id))
      throw new Error(`Invalid device info ID format: ${id}`);
    const res = await this.makeRequest(`/device-infos/${id}`);
    return res.data;
  }

  async createDeviceInfo(deviceInfo: Partial<DeviceInfo>): Promise<DeviceInfo> {
    const res = await this.makeRequest("/device-infos", {
      method: "POST",
      body: JSON.stringify(deviceInfo),
    });
    return res.data;
  }

  async updateDeviceInfo(
    id: string,
    deviceInfo: Partial<DeviceInfo>
  ): Promise<DeviceInfo> {
    const res = await this.makeRequest(`/device-infos/${id}`, {
      method: "PUT",
      body: JSON.stringify(deviceInfo),
    });
    return res.data;
  }

  async deleteDeviceInfo(id: string): Promise<boolean> {
    const res = await this.makeRequest(`/device-infos/${id}`, {
      method: "DELETE",
    });
    return res?.data ?? true;
  }

  async getColors(
    skip: number = 0,
    limit: number = 100,
    search: string = ""
  ): Promise<{ items: Color[]; pagination: DevicePagination }> {
    const q = new URLSearchParams();
    q.append("skip", String(skip));
    q.append("limit", String(limit));
    if (search) q.append("search", search);
    const res = await this.makeRequest(`/colors?${q.toString()}`);
    const items: Color[] = res?.data ?? res?.colors ?? [];
    const total = res?.total ?? items.length ?? 0;
    const page = Math.floor(skip / limit) + 1;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { items, pagination: { page, limit, total, totalPages } };
  }

  async getColorById(id: string): Promise<Color> {
    const res = await this.makeRequest(`/colors/${id}`);
    return res.data;
  }

  async createColor(color: Partial<Color>): Promise<Color> {
    const res = await this.makeRequest("/colors", {
      method: "POST",
      body: JSON.stringify(color),
    });
    return res.data;
  }

  async updateColor(id: string, color: Partial<Color>): Promise<Color> {
    const res = await this.makeRequest(`/colors/${id}`, {
      method: "PUT",
      body: JSON.stringify(color),
    });
    return res.data;
  }

  async deleteColor(id: string): Promise<boolean> {
    const res = await this.makeRequest(`/colors/${id}`, { method: "DELETE" });
    return res?.data ?? true;
  }

  async getDeviceColors(deviceInfoId: string): Promise<DeviceColor[]> {
    const res = await this.makeRequest(`/device-colors/device/${deviceInfoId}`);
    return res.data ?? [];
  }

  async getAllDeviceColors(
    filter: DeviceFilter = {},
    pagination: Partial<DevicePagination> = {}
  ): Promise<{ items: DeviceColor[]; pagination: DevicePagination }> {
    const params = new URLSearchParams();
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;
    params.append("skip", String(skip));
    params.append("limit", String(limit));
    if (filter.search) params.append("search", filter.search);
    const res = await this.makeRequest(`/device-colors?${params.toString()}`);
    const items: DeviceColor[] = res?.data ?? [];
    const total: number = res?.total ?? items.length ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { items, pagination: { page, limit, total, totalPages } };
  }

  async getDeviceColorsWithColor(deviceInfoId: string): Promise<DeviceColor[]> {
    const res = await this.makeRequest(
      `/device-colors/device/${deviceInfoId}/with-color`
    );
    return res.data ?? [];
  }

  async deleteDeviceColor(deviceColorId: string): Promise<boolean> {
    if (!this.isValidUUID(deviceColorId)) {
      throw new Error(`Invalid device color ID format: ${deviceColorId}`);
    }
    const res = await this.makeRequest(`/device-colors/${deviceColorId}`, {
      method: "DELETE",
    });
    if (res === null) return true;
    if (typeof res?.data === "boolean") return res.data;
    if (typeof res?.result === "boolean") return res.result;
    return true;
  }

  async getColorsByDeviceInfoId(deviceInfoId: string): Promise<Color[]> {
    try {
      const res = await this.makeRequest(
        `/device-infos/${deviceInfoId}/colors`
      );
      return res.data ?? [];
    } catch {
      const res2 = await this.makeRequest(
        `/device-colors/device/${deviceInfoId}/colors`
      );
      return res2.data ?? [];
    }
  }

  async getDevicesByColorId(colorId: string): Promise<DeviceInfo[]> {
    try {
      const res = await this.makeRequest(`/colors/${colorId}/devices`);
      return res.data ?? [];
    } catch {
      return [];
    }
  }

  async addColorToDevice(
    deviceInfoId: string,
    colorId: string
  ): Promise<boolean> {
    if (!this.isValidUUID(deviceInfoId))
      throw new Error(`Invalid device info ID format: ${deviceInfoId}`);
    if (!this.isValidUUID(colorId))
      throw new Error(`Invalid color ID format: ${colorId}`);
    const res = await this.makeRequest(
      `/device-infos/${deviceInfoId}/colors/${colorId}`,
      {
        method: "POST",
      }
    );
    return res?.data ?? true;
  }

  async removeColorFromDevice(
    deviceInfoId: string,
    colorId: string
  ): Promise<boolean> {
    if (!this.isValidUUID(deviceInfoId))
      throw new Error(`Invalid device info ID format: ${deviceInfoId}`);
    if (!this.isValidUUID(colorId))
      throw new Error(`Invalid color ID format: ${colorId}`);
    const res = await this.makeRequest(
      `/device-infos/${deviceInfoId}/colors/${colorId}`,
      {
        method: "DELETE",
      }
    );
    return res?.data ?? true;
  }

  async getStorages(
    filter: DeviceFilter = {},
    pagination: Partial<DevicePagination> = {}
  ): Promise<{ items: DeviceStorage[]; pagination: DevicePagination }> {
    const raw = await this.makeRequest(`/device-storages/all`);
    const all: DeviceStorage[] = Array.isArray(raw)
      ? raw
      : raw?.data ?? raw?.storages ?? [];
    const search = (filter.search || "").toLowerCase().trim();
    type DeviceStorageLike = DeviceStorage & {
      capacity?: number;
      unit?: string;
      type?: string;
      storage?: { capacity?: number; unit?: string; type?: string };
    };
    const filtered = search
      ? all.filter((storage) => {
          const item = storage as DeviceStorageLike;
          const capacityValue =
            item.capacity ??
            item.storage?.capacity ??
            (typeof (item as { value?: number }).value === "number"
              ? (item as { value?: number }).value
              : undefined);
          const unitValue = item.unit ?? item.type ?? item.storage?.type;
          const cap = String(capacityValue ?? "").toLowerCase();
          const unit = String(unitValue ?? "").toLowerCase();
          return cap.includes(search) || unit.includes(search);
        })
      : all;
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);
    return { items, pagination: { page, limit, total, totalPages } };
  }

  async getStorageById(id: string): Promise<DeviceStorage> {
    const res = await this.makeRequest(`/device-storages/${id}`);
    return res.data;
  }

  async createStorage(storage: Partial<DeviceStorage>): Promise<DeviceStorage> {
    const res = await this.makeRequest("/device-storages", {
      method: "POST",
      body: JSON.stringify(storage),
    });
    return res.data;
  }

  async updateStorage(
    id: string,
    storage: Partial<DeviceStorage>
  ): Promise<DeviceStorage> {
    const res = await this.makeRequest(`/device-storages/${id}`, {
      method: "PUT",
      body: JSON.stringify(storage),
    });
    return res.data;
  }

  async deleteStorage(id: string): Promise<boolean> {
    const res = await this.makeRequest(`/device-storages/${id}`, {
      method: "DELETE",
    });
    return res?.data ?? true;
  }

  async getDevicesByStorageId(storageId: string): Promise<DeviceInfo[]> {
    const res = await this.makeRequest(`/device-storages/${storageId}/devices`);
    return res?.data ?? [];
  }

  async getDeviceStorages(deviceInfoId: string): Promise<DeviceStorage[]> {
    try {
      const res = await this.makeRequest(
        `/device-infos/${deviceInfoId}/storages`
      );
      return res.data ?? [];
    } catch {
      const res2 = await this.makeRequest(
        `/device-storages/by-device/${deviceInfoId}`
      );
      return res2.data ?? [];
    }
  }

  async addStorageToDevice(
    deviceInfoId: string,
    storageId: string
  ): Promise<boolean> {
    if (!this.isValidUUID(deviceInfoId))
      throw new Error(`Invalid device info ID format: ${deviceInfoId}`);
    if (!this.isValidUUID(storageId))
      throw new Error(`Invalid storage ID format: ${storageId}`);
    const res = await this.makeRequest(
      `/device-infos/${deviceInfoId}/storages/${storageId}`,
      {
        method: "POST",
      }
    );
    return res?.data ?? true;
  }

  async removeStorageFromDevice(
    deviceInfoId: string,
    storageId: string
  ): Promise<boolean> {
    const res = await this.makeRequest(
      `/device-storages/${storageId}?device_info_id=${deviceInfoId}`,
      { method: "DELETE" }
    );
    return res?.data ?? true;
  }

  async getUserDevices(
    userId?: string,
    skip: number = 0,
    limit: number = 10,
    search?: string
  ): Promise<{ items: UserDevice[]; pagination: DevicePagination }> {
    const page = Math.floor(skip / limit) + 1;
    const params = new URLSearchParams();
    params.append('skip', String(skip));
    params.append('limit', String(limit));
    if (search) {
      params.append('search', search);
    }
    let endpoint = `/user-devices/my-devices?${params.toString()}`;
    if (userId)
      endpoint = `/user-devices/user/${userId}?${params.toString()}`;
    const res = await this.makeRequest(endpoint);
    const items: UserDevice[] = res?.data ?? res?.devices ?? [];
    const total: number = res?.pagination?.total ?? res?.total ?? items.length ?? 0;
    const totalPages = res?.pagination?.totalPages ?? res?.totalPages ?? Math.max(1, Math.ceil(total / limit));
    console.log("user devices", res)
    return { items, pagination: { page, limit, total, totalPages } };
  }

  async getUserDeviceById(id: string): Promise<UserDevice> {
    const res = await this.makeRequest(`/user-devices/${id}`);
    return res.data;
  }

  async createUserDevice(userDevice: Partial<UserDevice>): Promise<UserDevice> {
    const res = await this.makeRequest("/user-devices", {
      method: "POST",
      body: JSON.stringify(userDevice),
    });
    return res.data;
  }

  async updateUserDevice(
    id: string,
    userDevice: Partial<UserDevice>
  ): Promise<UserDevice> {
    const res = await this.makeRequest(`/user-devices/${id}`, {
      method: "PUT",
      body: JSON.stringify(userDevice),
    });
    return res.data;
  }

  async deleteUserDevice(id: string): Promise<boolean> {
    const res = await this.makeRequest(`/user-devices/${id}`, {
      method: "DELETE",
    });
    return res?.data ?? true;
  }

  async importUserDevices(file: File): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${PUBLIC_URL}/api/v1/user-devices/import`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }
    const data: ImportResponse = await response.json();
    return data;
  }

  async exportUserDevices(userId?: string): Promise<Blob> {
    const endpoint = userId
      ? `/user-devices/export?user_id=${userId}`
      : "/user-devices/export";
    const response = await fetch(`${PUBLIC_URL}/api/v1${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.blob();
  }

  async exportMyDevices(): Promise<Blob> {
    const response = await fetch(
      `${PUBLIC_URL}/api/v1/user-devices/export/my-devices`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.blob();
  }

  async downloadTemplate(): Promise<Blob> {
    const response = await fetch(`${PUBLIC_URL}/api/v1/user-devices/template`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.blob();
  }
}

export const deviceApiService = new DeviceApiService();
