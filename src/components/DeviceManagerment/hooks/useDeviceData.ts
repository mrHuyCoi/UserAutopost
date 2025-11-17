// hooks/useDeviceData.ts
import { useEffect, useState } from 'react';
import { deviceApiService } from '../../../services/deviceApiService';
import materialService from '../../../services/materialService';
import { brandService } from '../../../services/brandService';
import { colorService } from '../../../services';
import type {
  UserDevice,
  DeviceInfo,
  Color,
  DeviceStorage,
  Material,
} from '../types';

const pickArray = (res: any): any[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.devices)) return res.devices;
  if (Array.isArray(res.storages)) return res.storages;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.colors)) return res.colors;
  if (Array.isArray(res.materials)) return res.materials;
  if (Array.isArray(res.brands)) return res.brands;
  return [];
};

const withSelected = <T extends object>(arr: any[]): (T & { selected: boolean })[] =>
  arr.map((x) => ({ ...(x as T), selected: false }));

export const useDeviceData = () => {
  const [userDevices, setUserDevices] = useState<UserDevice[]>([]);
  const [deviceInfos, setDeviceInfos] = useState<DeviceInfo[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [storages, setStorages] = useState<DeviceStorage[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    const tasks = await Promise.allSettled([
      deviceApiService.getUserDevices(),   
      deviceApiService.getDeviceInfos(),    
      colorService.getColors(),              
      deviceApiService.getStoragesFromAll(),      
      materialService.getAllMaterials(),    
      brandService.getAllBrands(),    
    ]);

    // User Devices
    if (tasks[0].status === 'fulfilled') {
      const res = tasks[0].value; // { devices, total }
      const list = pickArray(res);
      setUserDevices(withSelected<UserDevice>(list));
      console.debug('[userDevices]', res, list);
    } else {
      console.error('[userDevices][error]', tasks[0].reason);
    }

    // Device Infos
    if (tasks[1].status === 'fulfilled') {
      const res = tasks[1].value; // { devices, pagination }
      const list = pickArray(res);
      setDeviceInfos(withSelected<DeviceInfo>(list));
      console.debug('[deviceInfos]', res, list);
    } else {
      console.error('[deviceInfos][error]', tasks[1].reason);
    }

    // Colors
    if (tasks[2].status === 'fulfilled') {
      const res = tasks[2].value; // { data, metadata } hoặc biến thể
      const raw = pickArray(res);
      const list = raw.map((c: any) => ({
        ...c,
        hex_code: c?.hex_code ?? '#CCCCCC',
      }));
      setColors(withSelected<Color>(list));
      console.debug('[colors]', res, list);
    } else {
      console.error('[colors][error]', tasks[2].reason);
    }

    // Storages
    if (tasks[3].status === 'fulfilled') {
      const res = tasks[3].value; // { storages, pagination } hoặc { data }
      const list = pickArray(res);
      setStorages(withSelected<DeviceStorage>(list));
      console.debug('[storages]', res, list);
    } else {
      console.error('[storages][error]', tasks[3].reason);
    }

    // Materials
    if (tasks[4].status === 'fulfilled') {
      const res = tasks[4].value; // { data } hoặc []
      const list = pickArray(res);
      setMaterials(withSelected<Material>(list));
      console.debug('[materials]', res, list);
    } else {
      console.error('[materials][error]', tasks[4].reason);
    }

    // Brands
    if (tasks[5].status === 'fulfilled') {
      const res = tasks[5].value; // { data } hoặc []
      const list = pickArray(res);
      setBrands(withSelected<any>(list));
      console.debug('[brands]', res, list);
    } else {
      console.error('[brands][error]', tasks[5].reason);
    }

    const anyRejected = tasks.some((t) => t.status === 'rejected');
    if (anyRejected) {
      setError('Một số nguồn dữ liệu không tải được. Kiểm tra log để biết chi tiết.');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const refetch = fetchAll;

  return {
    userDevices,
    deviceInfos,
    colors,
    storages,
    materials,
    brands,
    setUserDevices,
    setDeviceInfos,
    setColors,
    setStorages,
    setMaterials,
    setBrands,
    loading,
    error,
    refetch,
  };
};
