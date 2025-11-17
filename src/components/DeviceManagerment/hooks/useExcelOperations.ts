import { useState } from 'react';
import { ImportResponse } from '../../../types/deviceTypes';
import { userDeviceService } from '../../../services/userDeviceService';

export const useExcelOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tải template Excel
  const downloadTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      const blob = await userDeviceService.downloadTemplate();
      console.log("blob" + blob)
      userDeviceService.downloadFile(blob, 'template_thiet_bi.xlsx');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Export dữ liệu ra Excel
  const exportToExcel = async () => {
    try {
      setLoading(true);
      setError(null);
      const blob = await userDeviceService.exportToExcel();
      userDeviceService.downloadFile(blob, `thiet_bi_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export to Excel';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Import từ Excel
  const importFromExcel = async (file: File): Promise<ImportResponse> => {
    try {
      setLoading(true);
      setError(null);
      const result = await userDeviceService.importFromExcel(file);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import from Excel';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    downloadTemplate,
    exportToExcel,
    importFromExcel,
  };
};