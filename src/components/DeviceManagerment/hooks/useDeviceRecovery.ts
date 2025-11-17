import { useState } from 'react';
import { UserDevice } from '../../../types/deviceTypes';
import { userDeviceService } from '../../../services/userDeviceService';

export const useDeviceRecovery = () => {
  const [deletedDevices, setDeletedDevices] = useState<UserDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách thiết bị đã xóa trong ngày
  const fetchDeletedDevicesToday = async () => {
    try {
      setLoading(true);
      setError(null);
      const devices = await userDeviceService.getDeletedDevicesToday();
      setDeletedDevices(devices);
      return devices;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch deleted devices';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Khôi phục một thiết bị
  const restoreDevice = async (deviceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const restoredDevice = await userDeviceService.restoreUserDevice(deviceId);
      setDeletedDevices(prev => prev.filter(device => device.id !== deviceId));
      return restoredDevice;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore device';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Khôi phục tất cả thiết bị đã xóa trong ngày
  const restoreAllDeletedToday = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await userDeviceService.restoreAllDeletedToday();
      setDeletedDevices([]);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore all devices';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deletedDevices,
    loading,
    error,
    fetchDeletedDevicesToday,
    restoreDevice,
    restoreAllDeletedToday,
  };
};