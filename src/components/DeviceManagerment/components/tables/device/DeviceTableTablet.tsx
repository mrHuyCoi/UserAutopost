import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { DeviceInfo } from '../../../types';

interface DeviceTableTabletProps {
  devices: DeviceInfo[];
  onSelectItem: (id: string, checked: boolean) => void;
  setViewDevice: (device: DeviceInfo | null) => void;
  onEditDevice?: (device: DeviceInfo) => void;
  onDeleteDevice?: (device: DeviceInfo) => void;
}

export const DeviceTableTablet: React.FC<DeviceTableTabletProps> = ({
  devices,
  onSelectItem,
  setViewDevice,
  onEditDevice,
  onDeleteDevice,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const truncateText = (text: string, maxLength: number = 20) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="hidden sm:block xl:hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-10 px-3 py-2"></th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hãng</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Model</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày ra mắt</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá bán lẻ</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {devices.map((device) => (
            <tr key={device.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  checked={device.selected || false}
                  onChange={(e) => onSelectItem(device.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                />
              </td>
              <td className="px-3 py-2" title={device.brand || ''}>
                <div className="text-gray-700 truncate max-w-[100px]">
                  {truncateText(device.brand || 'Chưa có', 15)}
                </div>
              </td>
              <td className="px-3 py-2" title={device.model}>
                <div className="text-gray-900 font-medium truncate max-w-[120px]">
                  {truncateText(device.model, 18)}
                </div>
              </td>
              <td className="px-3 py-2" title={device.release_date || ''}>
                <div className="text-gray-600 text-xs truncate max-w-[80px]">
                  {truncateText(device.release_date || '-', 10)}
                </div>
              </td>
              <td className="px-3 py-2 text-right">
                <div className="flex justify-end gap-1">
                  <button 
                    onClick={() => setViewDevice(device)} 
                    title="Xem chi tiết" 
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Eye size={14} className="text-gray-600" />
                  </button>
                  <button 
                    onClick={() => onEditDevice?.(device)} 
                    title="Sửa" 
                    className="p-1.5 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={() => onDeleteDevice?.(device)} 
                    title="Xóa" 
                    className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};