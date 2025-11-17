import React, { useState } from "react";
import { Eye, EyeOff, Edit, Trash2 } from "lucide-react";
import type { DeviceInfo } from "../../../types";

interface DeviceTableMobileProps {
  devices: DeviceInfo[];
  onSelectItem: (id: string, checked: boolean) => void;
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

  const truncateText = (text?: string, maxLength: number = 20) => {
    if (!text) return "-";
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
    <div className="lg:hidden divide-y divide-gray-200">
      {devices.map((device) => {
        const isExpanded = expandedRow === device.id;
        const isDeleteConfirm = deleteConfirm === device.id;

        return (
          <div key={device.id} className="p-3">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={device.selected || false}
                onChange={(e) => onSelectItem(device.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 h-3 w-3 mt-0.5 flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2">
                      {device.model}
                    </h3>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {device.release_date || "Chưa có ngày ra mắt"}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
                    <button
                      className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded"
                      onClick={(e) => handleEditClick(device, e)}
                      title="Sửa thông tin"
                    >
                      <Edit size={12} />
                    </button>

                    {isDeleteConfirm ? (
                      <div className="flex items-center gap-0.5">
                        <button
                          className="p-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs px-1.5"
                          onClick={(e) => handleConfirmDelete(device.id, e)}
                        >
                          Xóa
                        </button>
                        <button
                          className="p-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs px-1.5"
                          onClick={handleCancelDelete}
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded"
                        onClick={(e) => handleDeleteClick(device.id, e)}
                        title="Xóa"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}

                    <button
                      className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"
                      onClick={(e) => handleEyeClick(device.id, e)}
                      title={isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}
                    >
                      {isExpanded ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
                  <Item label="Màn hình" value={truncateText(device.screen, 15)} />
                  <Item label="Chip/RAM" value={truncateText(device.chip_ram, 12)} />
                  <Item label="Camera" value={truncateText(device.camera, 12)} />
                  <Item label="Pin" value={truncateText(device.battery, 12)} />
                  <Item label="Kết nối" value={truncateText(device.connectivity_os, 15)} />
                  <Item label="Màu sắc" value={truncateText(device.color_english, 10)} />
                  <div className="flex items-center gap-1 text-xs col-span-2">
                    <span className="text-gray-500 font-medium">Kích thước:</span>
                    <span className="text-gray-700 truncate" title={device.dimensions_weight || ""}>
                      {truncateText(device.dimensions_weight, 20)}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-200 -mx-3 px-3 bg-gray-100/50">
                    <div className="space-y-2 text-xs">
                      <KV k="Thương hiệu" v={device.brand} />
                      <KV k="Model" v={device.model} />
                      <KV k="Ngày ra mắt" v={device.release_date} />
                      <KV k="Màn hình" v={device.screen} />
                      <KV k="Chip/RAM" v={device.chip_ram} />
                      <KV k="Camera" v={device.camera} />
                      <KV k="Pin" v={device.battery} />
                      <KV k="Kết nối/HĐH" v={device.connectivity_os} />
                      <KV k="Màu (EN)" v={device.color_english} />
                      <KV k="Kích thước/Trọng lượng" v={device.dimensions_weight} />
                      <KV k="Cảm biến & Sức khỏe" v={device.sensors_health_features} />
                      <KV k="Bảo hành" v={device.warranty} />
                      <KV k="Ngày tạo" v={new Date(device.created_at).toLocaleDateString("vi-VN")} />
                      <KV k="Cập nhật" v={new Date(device.updated_at).toLocaleDateString("vi-VN")} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Item: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="flex items-center gap-1 text-xs">
    <span className="text-gray-500 font-medium">{label}:</span>
    <span className="text-gray-700 truncate">{value || "Chưa có thông tin"}</span>
  </div>
);

const KV: React.FC<{ k: string; v?: string | null }> = ({ k, v }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-500">{k}:</span>
    <span className="font-medium text-gray-900">{v || "-"}</span>
  </div>
);
