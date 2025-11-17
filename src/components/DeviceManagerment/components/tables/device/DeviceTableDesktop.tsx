import React, { useState } from 'react';
import { Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import { DeviceInfo } from '../../../types';

interface DeviceTableMobileProps {
  devices: DeviceInfo[];
  onSelectItem: (id: string, checked: boolean) => void;
  setViewDevice: (device: DeviceInfo | null) => void;
  expandedRow: string | null;
  toggleRow: (id: string) => void;
  onEditDevice: (device: DeviceInfo) => void;
  onDeleteDevice: (id: string) => void;
}

export const DeviceTableMobile: React.FC<DeviceTableMobileProps> = ({
  devices,
  onSelectItem,
  expandedRow,
  toggleRow,
  onEditDevice,
  onDeleteDevice,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const truncateText = (text: string, maxLength: number = 20) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  const handleDeleteClick = (deviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm(deviceId);
  };

  const handleConfirmDelete = (deviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteDevice(deviceId);
    setDeleteConfirm(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm(null);
  };

  const handleEditClick = (device: DeviceInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditDevice(device);
  };

  const handleEyeClick = (deviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleRow(deviceId);
  };

  return (
    <div className="lg:hidden">
      {devices.map((device) => {
        const isExpanded = expandedRow === device.id;
        const isDeleteConfirm = deleteConfirm === device.id;

        return (
          <div key={device.id} className="border-b border-gray-200 last:border-b-0">
            <div className="p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={device.selected || false}
                  onChange={(e) => onSelectItem(device.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3 mt-0.5 flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2">
                        {device.model}
                      </h3>
                      <div className="text-xs text-gray-500 mt-0.5">{device.release_date || 'Chưa có ngày ra mắt'}</div>
                    </div>

                    <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
                      <button
                        className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors flex items-center justify-center"
                        onClick={(e) => handleEditClick(device, e)}
                        title="Sửa thông tin"
                      >
                        <Edit size={12} />
                      </button>

                      {isDeleteConfirm ? (
                        <div className="flex items-center gap-0.5">
                          <button
                            className="p-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors text-xs px-1.5"
                            onClick={(e) => handleConfirmDelete(device.id, e)}
                          >
                            Xóa
                          </button>
                          <button
                            className="p-1 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors text-xs px-1.5"
                            onClick={handleCancelDelete}
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors flex items-center justify-center"
                          onClick={(e) => handleDeleteClick(device.id, e)}
                          title="Xóa"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}

                      <button
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                        onClick={(e) => handleEyeClick(device.id, e)}
                        title={isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}
                      >
                        {isExpanded ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-500 font-medium">Màn hình:</span>
                      <span className="text-gray-700 truncate" title={device.screen || ''}>
                        {truncateText(device.screen || 'Chưa có thông tin', 15)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-500 font-medium">Chip/RAM:</span>
                      <span className="text-gray-700 truncate" title={device.chip_ram || ''}>
                        {truncateText(device.chip_ram || 'Chưa có thông tin', 12)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-500 font-medium">Camera:</span>
                      <span className="text-gray-700 truncate" title={device.camera || ''}>
                        {truncateText(device.camera || 'Chưa có thông tin', 12)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-500 font-medium">Pin:</span>
                      <span className="text-gray-700 truncate" title={device.battery || ''}>
                        {truncateText(device.battery || 'Chưa có thông tin', 12)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-500 font-medium">Kết nối:</span>
                      <span className="text-gray-700 truncate" title={device.connectivity_os || ''}>
                        {truncateText(device.connectivity_os || 'Chưa có thông tin', 15)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-500 font-medium">Màu sắc:</span>
                      <span className="text-gray-700 truncate" title={device.color_english || ''}>
                        {truncateText(device.color_english || 'Chưa có thông tin', 10)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs col-span-2">
                      <span className="text-gray-500 font-medium">Kích thước:</span>
                      <span className="text-gray-700 truncate" title={device.dimensions_weight || ''}>
                        {truncateText(device.dimensions_weight || 'Chưa có thông tin', 20)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-gray-400 text-xs">Tồn kho</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-200 -mx-3 px-3 bg-gray-100/50">
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Thương hiệu:</span>
                          <span className="font-medium text-gray-900">{device.brand || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Model:</span>
                          <span className="font-medium text-gray-900">{device.model}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Ngày ra mắt:</span>
                          <span className="font-medium text-gray-900">{device.release_date || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Màn hình:</span>
                          <span className="font-medium text-gray-900">{device.screen || '-'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Chip/RAM:</span>
                          <span className="font-medium text-gray-900">{device.chip_ram || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Camera:</span>
                          <span className="font-medium text-gray-900">{device.camera || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Pin:</span>
                          <span className="font-medium text-gray-900">{device.battery || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Kết nối/HĐH:</span>
                          <span className="font-medium text-gray-900">{device.connectivity_os || '-'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Màu (EN):</span>
                          <span className="font-medium text-gray-900">{device.color_english || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Kích thước/Trọng lượng:</span>
                          <span className="font-medium text-gray-900">{device.dimensions_weight || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Cảm biến & Sức khỏe:</span>
                          <span className="font-medium text-gray-900">{device.sensors_health_features || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Bảo hành:</span>
                          <span className="font-medium text-gray-900">{device.warranty || '-'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Ngày tạo:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(device.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-500">Cập nhật lần cuối:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(device.updated_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};