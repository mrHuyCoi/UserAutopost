import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Plus,
} from "lucide-react";
import type { DeviceColorLink } from "../../../types";
import { Pagination, type AnyPagination } from "../../common/Pagination";

const ALL_COLUMNS = [
  { key: "device_brand", label: "Thương hiệu" },
  { key: "device_model", label: "Model" },
  { key: "device_release_date", label: "Ngày ra mắt" },
  { key: "color_name", label: "Tên màu" },
  { key: "color_hex", label: "Mã màu" },
  { key: "created_at", label: "Ngày tạo" },
] as const;

const LabelValue: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-gray-600 text-xs">{label}:</span>
    <span className="font-medium">{value || "-"}</span>
  </div>
);

const ExpandedRowContent: React.FC<{ deviceColor: DeviceColorLink }> = ({ deviceColor }) => {
  const device = deviceColor.device_info;
  const color = deviceColor.color;
  
  return (
    <div className="text-sm bg-gray-50 p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <LabelValue label="Thương hiệu" value={device?.brand} />
          <LabelValue label="Model" value={device?.model} />
          <LabelValue label="Ngày ra mắt" value={device?.release_date} />
        </div>
        <div className="space-y-2">
          <LabelValue label="Màn hình" value={device?.screen} />
          <LabelValue label="Chip/RAM" value={device?.chip_ram} />
          <LabelValue label="Camera" value={device?.camera} />
        </div>
        <div className="space-y-2">
          <LabelValue label="Pin" value={device?.battery} />
          <LabelValue label="Kết nối/HĐH" value={device?.connectivity_os} />
          <LabelValue label="Màu (EN)" value={device?.color_english} />
        </div>
        <div className="space-y-2">
          <LabelValue label="Tên màu" value={color?.name} />
          <LabelValue label="Mã màu" value={color?.hex_code} />
          {color?.hex_code && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-600 text-xs">Màu sắc:</span>
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: color.hex_code }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <LabelValue label="Ngày tạo" value={new Date(deviceColor.created_at).toLocaleDateString('vi-VN')} />
        <div className="flex flex-col mt-2">
          <span className="text-gray-600 text-xs">Cập nhật lần cuối:</span>
          <span className="font-medium">{new Date(deviceColor.updated_at).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>
    </div>
  );
};

interface DeviceColorsTableProps {
  deviceColors: DeviceColorLink[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string, checked: boolean) => void;
  selectAll: boolean;
  selectedCount: number;
  pagination: AnyPagination;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
  onDeleteDeviceColor?: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddDeviceColorLink?: () => void;
}

const DeviceColorsTable: React.FC<DeviceColorsTableProps> = ({
  deviceColors,
  onSelectAll,
  onSelectItem,
  selectAll,
  selectedCount,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  onDeleteDeviceColor,
  searchTerm,
  onSearchChange,
  onAddDeviceColorLink,
}) => {
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () => ALL_COLUMNS.reduce((acc, c) => ({ ...acc, [c.key]: true }), {})
  );
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const displayedDeviceColors = deviceColors;

  const totalItems = pagination?.totalItems ?? 0;
  const uiPagination = pagination;

  const toggleRow = (id: string) => setExpandedRow(expandedRow === id ? null : id);
  const truncateText = (text?: string, maxLength: number = 25) =>
    !text ? "-" : text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

  const handleDeleteDeviceColor = (deviceColor: DeviceColorLink) => {
    const deviceName = deviceColor.device_info?.model || 'thiết bị';
    const colorName = deviceColor.color?.name || 'màu sắc';
    if (window.confirm(`Bạn có chắc chắn muốn xóa liên kết giữa "${deviceName}" và "${colorName}"?`)) {
      onDeleteDeviceColor?.(deviceColor.id);
    }
  };

  const getColumnValue = (deviceColor: DeviceColorLink, key: string): string => {
    switch (key) {
      case "device_brand":
        return deviceColor.device_info?.brand || "-";
      case "device_model":
        return deviceColor.device_info?.model || "-";
      case "device_release_date":
        return deviceColor.device_info?.release_date || "-";
      case "color_name":
        return deviceColor.color?.name || "-";
      case "color_hex":
        return deviceColor.color?.hex_code || "-";
      case "created_at":
        return new Date(deviceColor.created_at).toLocaleDateString('vi-VN');
      default:
        return "-";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Search Bar */}
      <div className="px-3 sm:px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-[200px] sm:max-w-xs w-full">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm theo tên màu, model..."
                className="w-full pl-8 pr-3 py-2 text-xs font-medium text-gray-700 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex w-full sm:w-auto sm:justify-end">
            <button
              type="button"
              onClick={onAddDeviceColorLink}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              <Plus size={14} />
              <span>Thêm liên kết màu sắc - thiết bị</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => onSelectAll(!selectAll)}
            className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 flex-shrink-0"
          >
            {selectAll ? <CheckSquare size={16} className="text-blue-500" /> : <Square size={16} />}
            <span className="hidden xs:inline text-xs sm:text-sm whitespace-nowrap">Chọn tất cả</span>
          </button>
          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full border flex-shrink-0 whitespace-nowrap">
            {selectedCount} đã chọn
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <details className="relative">
              <summary className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border rounded-md cursor-pointer text-sm hover:bg-gray-50 whitespace-nowrap">
                <Settings size={14} /> Hiển thị cột
              </summary>
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-sm z-40 p-3">
                <div className="text-xs text-gray-500 mb-2">Chọn cột hiển thị</div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-auto">
                  {ALL_COLUMNS.map((col) => (
                    <label key={col.key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!visibleColumns[col.key]}
                        onChange={() => setVisibleColumns((prev) => ({ ...prev, [col.key]: !prev[col.key] }))}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              </div>
            </details>
          </div>

          <div className="text-xs text-gray-500 flex-shrink-0 ml-2 whitespace-nowrap">Tổng: {totalItems}</div>
        </div>
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 h-4 w-4"
                />
              </th>
              {ALL_COLUMNS.map((column) =>
                visibleColumns[column.key] ? (
                  <th key={column.key} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    {column.label}
                  </th>
                ) : null
              )}
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {displayedDeviceColors.length === 0 && (
              <tr>
                <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="text-center py-10 text-gray-500">
                  Không tìm thấy liên kết thiết bị - màu sắc nào.
                </td>
              </tr>
            )}

            {displayedDeviceColors.map((deviceColor) => (
              <React.Fragment key={deviceColor.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={deviceColor.selected || false}
                      onChange={(e) => onSelectItem(deviceColor.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 h-4 w-4"
                    />
                  </td>

                  {ALL_COLUMNS.map((column) =>
                    visibleColumns[column.key] ? (
                      <td key={column.key} className="px-3 py-3">
                        <div className="text-sm text-gray-900 truncate max-w-[150px]" title={getColumnValue(deviceColor, column.key)}>
                          {column.key === "color_hex" && deviceColor.color?.hex_code ? (
                            <div className="flex items-center gap-2">
                              <span>{truncateText(getColumnValue(deviceColor, column.key), 10)}</span>
                              <div
                                className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                                style={{ backgroundColor: deviceColor.color.hex_code }}
                                title={deviceColor.color.hex_code}
                              />
                            </div>
                          ) : (
                            truncateText(getColumnValue(deviceColor, column.key), 25)
                          )}
                        </div>
                      </td>
                    ) : null
                  )}

                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <button
                        className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded"
                        title="Xóa"
                        onClick={() => handleDeleteDeviceColor(deviceColor)}
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        className="p-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded"
                        title={expandedRow === deviceColor.id ? "Ẩn chi tiết" : "Xem chi tiết"}
                        onClick={() => toggleRow(deviceColor.id)}
                      >
                        {expandedRow === deviceColor.id ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>

                {expandedRow === deviceColor.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="p-0">
                      <ExpandedRowContent deviceColor={deviceColor} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="lg:hidden">
        {displayedDeviceColors.map((deviceColor) => {
          const isExpanded = expandedRow === deviceColor.id;
          return (
            <div key={deviceColor.id} className="border-b border-gray-200 last:border-b-0 p-3">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={deviceColor.selected || false}
                  onChange={(e) => onSelectItem(deviceColor.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3 mt-0.5 flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2">
                        {deviceColor.device_info?.model || '-'}
                      </h3>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {deviceColor.color?.name || 'Chưa có màu'}
                        {deviceColor.color?.hex_code && (
                          <span className="ml-2 inline-block w-3 h-3 rounded border border-gray-300" style={{ backgroundColor: deviceColor.color.hex_code }} />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
                      <button
                        className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors flex items-center justify-center"
                        onClick={() => handleDeleteDeviceColor(deviceColor)}
                        title="Xóa"
                      >
                        <Trash2 size={12} />
                      </button>
                      <button
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                        onClick={() => toggleRow(deviceColor.id)}
                        title={isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}
                      >
                        {isExpanded ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <ExpandedRowContent deviceColor={deviceColor} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayedDeviceColors.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <Pagination
            pagination={uiPagination}
            totalItems={totalItems}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default DeviceColorsTable;
export { DeviceColorsTable };

