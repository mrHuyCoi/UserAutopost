export interface Material {
  id: string;
  name: string;
  description?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  selected?: boolean;
}

export interface DeviceInfo {
  id: string;
  model: string;
  brand?: string;
  release_date?: string;
  screen?: string;
  chip_ram?: string;
  camera?: string;
  battery?: string;
  connectivity_os?: string;
  color_english?: string;
  dimensions_weight?: string;
  sensors_health_features?: string;
  warranty?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  materials?: Material[];
  selected?: boolean;
}

export interface Color {
  id: string;
  name: string;
  hex_code?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  selected?: boolean;
}

export interface DeviceColorLink {
  id: string;
  device_info_id: string;
  color_id: string;
  user_id: string;
  device_info: DeviceInfo;
  color: Color;
  created_at: string;
  updated_at: string;
  selected?: boolean;
}

export interface DeviceStorage {
  id: string;
  capacity: number;
  created_at: string;
  updated_at: string;
  selected?: boolean;
}

export interface UserDevice {
  id: string;
  user_id: string;
  product_code: string;
  device_name?: string;
  warranty: string;
  device_condition: string;
  device_type: string;
  battery_condition: string;
  price: number;
  wholesale_price?: number;
  storage_id: string;
  inventory: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;

  device_info?: DeviceInfo | null;
  color?: Color | null;
  device_storage?: DeviceStorage | null;
  device_storage_id?: string | null;

  deviceModel?: string;
  colorName?: string;
  storageCapacity?: number;
  selected?: boolean;
}

export interface DeviceBrand {
  id: string;
  name: string;
  warranty?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  selected?: boolean;
}

export interface ImportResult {
  total: number;
  success: number;
  updated_count: number;
  created_count: number;
  error: number;
  errors?: string[];
}

export interface ImportResponse {
  data: ImportResult;
  message: string;
  status_code: number;
  total: number | null;
  totalPages: number | null;
  pagination: any;
  user_id?: string;
  created_at: string;
  updated_at: string;
  device_info?: DeviceInfo;
  color?: Color;
}

export interface RestoreResponse {
  restored_count: number;
  message: string;
  restored_devices?: UserDevice[];
}

export interface ExportResponse {
  file_url?: string;
  message: string;
  total_records: number;
}

export type SubTabType = 'my-devices' | 'device-info' | 'colors' | 'storage' | 'materials' | 'brands' | 'device-colors';

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

export interface PaginationHook {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  currentItems: any[];
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (value: number) => void;
}

export interface DeviceInfoFormData {
  model: string;
  brand: string;
  release_date: string;
  warranty: string;
  materials?: Material[];
  screen: string;
  chip_ram: string;
  camera: string;
  battery: string;
  connectivity_os: string;
  color_english: string;
  dimensions_weight: string;
  sensors_health_features: string;
}

export interface MyDeviceFormData {
  device_info_id: string;
  color_id: string;
  storage_id: string;
  device_type: string;
  warranty: string;
  device_condition: string;
  battery_condition: string;
  price: string;
  wholesale_price: string;
  inventory: string;
  notes: string;
}

export interface StorageFormData {
  capacity: string;
}

export interface ColorFormData {
  name: string;
  hex_code: string;
}

export interface MaterialFormData {
  name: string;
  description: string;
}

export interface BrandFormData {
  name: string;
  warranty: string;
}