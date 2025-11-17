// hooks/useDeviceForms.ts
import React, { useState } from 'react';
import {
  MyDeviceFormData,
  UserDevice,
  DeviceInfo,
  Color,
  DeviceStorage,
  StorageFormData,
  DeviceInfoFormData,
  Material,
} from '../types';
import { getAuthToken } from '../../../services/apiService';
import { colorService } from '../../../services/colorService';
import { deviceInfoService } from '../../../services/deviceInfoService';

const getUserIdFromToken = (): string | null => {
  try {
    const token = getAuthToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.user_id || null;
  } catch {
    return null;
  }
};

type MyDeviceFormState = DeviceInfoFormData & {
  device_info_id: string;
  color_id: string;
  storage_id: string;
  device_type: string;
  device_condition: string;
  battery_condition: string;
  price: number;
  wholesale_price: number;
  inventory: number;
  notes: string;
  product_code: string;
};

export const useDeviceForms = (
  setUserDevices?: React.Dispatch<React.SetStateAction<UserDevice[]>>,
  setDeviceInfos?: React.Dispatch<React.SetStateAction<DeviceInfo[]>>,
  setColors?: React.Dispatch<React.SetStateAction<Color[]>>,
  setStorages?: React.Dispatch<React.SetStateAction<DeviceStorage[]>>,
) => {
  const [deviceForm, setDeviceForm] = useState<DeviceInfoFormData>({
    model: '',
    brand: '',
    release_date: '',
    warranty: '',
    materials: [],
    screen: '',
    chip_ram: '',
    camera: '',
    battery: '',
    connectivity_os: '',
    color_english: '',
    dimensions_weight: '',
    sensors_health_features: ''
  });

  const [myDeviceForm, setMyDeviceForm] = useState<MyDeviceFormState>({
    model: '',
    brand: '',
    release_date: '',
    warranty: '',
    screen: '',
    chip_ram: '',
    camera: '',
    battery: '',
    connectivity_os: '',
    color_english: '',
    dimensions_weight: '',
    sensors_health_features: '',
    materials: [],
    device_info_id: '',
    color_id: '',
    storage_id: '',
    device_type: 'new',
    device_condition: '',
    battery_condition: '',
    price: 0,
    wholesale_price: 0,
    inventory: 0,
    notes: '',
    product_code: ''
  });

  const [colorForm, setColorForm] = useState({ name: '', hex_code: '' });

  const [storageForm, setStorageForm] = useState<StorageFormData>({
    capacity: '',
  });

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const handleDeviceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeviceForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMyDeviceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMyDeviceForm(prev => ({
      ...prev,
      [name]: (name === 'price' || name === 'wholesale_price' || name === 'inventory') ? Number(value) : value
    }));
  };

  const handleColorFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setColorForm(prev => ({ ...prev, [name]: value }));
  };

  const handleStorageFormChange = (field: keyof StorageFormData, value: string) => {
    setStorageForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setDeviceInfos) return;
    const userId = getUserIdFromToken();
    if (!userId) {
      alert('Vui lòng đăng nhập để thực hiện thao tác này');
      return;
    }
    
    try {
      // SỬA LỖI: Xóa kiểu ': DeviceInfoFormData' khỏi biến payload
      const payload = { ...deviceForm, user_id: userId };
      
      const newDeviceInfo = await deviceInfoService.createDeviceInfo(payload);
      setDeviceInfos(prev => [...prev, { ...newDeviceInfo, selected: false }]);
      resetForms();
    } catch (error: any) {
      alert(`Lỗi khi tạo thông tin thiết bị: ${error.message}`);
    }
  };

  const handleSubmitMyDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setUserDevices) return;
    const userId = getUserIdFromToken();
    if (!userId) {
      alert('Vui lòng đăng nhập để thực hiện thao tác này');
      return;
    }
    const newUserDevice: UserDevice = {
      id: generateId(),
      user_id: userId,
      product_code: myDeviceForm.product_code || `P-${generateId().slice(0, 5)}`,
      device_name: myDeviceForm.model,
      warranty: myDeviceForm.warranty,
      device_condition: myDeviceForm.device_condition,
      device_type: myDeviceForm.device_type,
      battery_condition: myDeviceForm.battery_condition,
      price: myDeviceForm.price,
      storage_id: myDeviceForm.storage_id,
      wholesale_price: myDeviceForm.wholesale_price,
      inventory: myDeviceForm.inventory,
      notes: myDeviceForm.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      device_storage_id: myDeviceForm.storage_id,
      device_info: null,
      color: null,
      device_storage: null,
      selected: false,
    };
    setUserDevices(prev => [...prev, newUserDevice]);
    resetForms();
  };

  const handleSubmitColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setColors) return;
    const userId = getUserIdFromToken();
    if (!userId) {
      alert('Vui lòng đăng nhập để thực hiện thao tác này');
      return;
    }
    
    try {
      const payload = {
        name: colorForm.name,
        hex_code: colorForm.hex_code || '#CCCCCC',
        user_id: userId,
      };
      
      const newColor = await colorService.createColor(payload);
      
      setColors(prev => [...prev, { ...newColor, selected: false }]);
      setColorForm({ name: '', hex_code: '' });
    } catch (error: any) {
      alert(`Lỗi khi tạo màu: ${error.message}`);
    }
  };

  const handleSubmitStorage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setStorages) return;
    const userId = getUserIdFromToken();
    if (!userId) {
      alert('Vui lòng đăng nhập để thực hiện thao tác này');
      return;
    }
    const capacityValue = parseFloat(storageForm.capacity);
    if (isNaN(capacityValue) || capacityValue <= 0) {
      alert('Vui lòng nhập dung lượng hợp lệ');
      return;
    }
    const newStorage: DeviceStorage = {
      id: generateId(),
      capacity: capacityValue,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      selected: false
    };
    setStorages(prev => [...prev, newStorage]);
    setStorageForm({ capacity: '' });
  };

  const resetForms = () => {
    setDeviceForm({
      model: '',
      brand: '',
      release_date: '',
      warranty: '',
      materials: [],
      screen: '',
      chip_ram: '',
      camera: '',
      battery: '',
      connectivity_os: '',
      color_english: '',
      dimensions_weight: '',
      sensors_health_features: ''
    });
    setMyDeviceForm({
      model: '',
      brand: '',
      release_date: '',
      warranty: '',
      screen: '',
      chip_ram: '',
      camera: '',
      battery: '',
      connectivity_os: '',
      color_english: '',
      dimensions_weight: '',
      sensors_health_features: '',
      materials: [],
      device_info_id: '',
      color_id: '',
      storage_id: '',
      device_type: 'new',
      device_condition: '',
      battery_condition: '',
      price: 0,
      wholesale_price: 0,
      inventory: 0,
      notes: '',
      product_code: ''
    });
    setColorForm({ name: '', hex_code: '' });
    setStorageForm({ capacity: '' });
  };

  return {
    deviceForm,
    myDeviceForm,
    colorForm,
    storageForm,
    setStorageForm,
    handleDeviceFormChange,
    handleMyDeviceFormChange,
    handleColorFormChange,
    handleStorageFormChange,
    handleSubmitDevice,
    handleSubmitMyDevice,
    handleSubmitColor,
    handleSubmitStorage,
    resetForms
  };
};