import React, { useState } from "react";
import { CheckSquare, Square, Settings, Eye, EyeOff, Edit, Trash2 } from "lucide-react";
import type { DeviceInfo } from "../../../types";
import { DeviceTableMobile } from "./DeviceTableMobile";
// 1. IMPORT Pagination CHUNG VÀ KIỂU AnyPagination
import { Pagination, type AnyPagination } from "../../common/Pagination";

const ALL_COLUMNS = [
  { key: "brand", label: "Thương hiệu" },
  { key: "model", label: "Model" },
  { key: "release_date", label: "Ngày ra mắt" },
  { key: "screen", label: "Màn hình" },
  { key: "chip_ram", label: "Chip/RAM" },
  { key: "camera", label: "Camera" },
  { key: "battery", label: "Pin" },
  { key: "connectivity_os", label: "Kết nối/HĐH" },
  { key: "color_english", label: "Màu (EN)" },
  { key: "dimensions_weight", label: "Kích thước/Trọng lượng" },
  { key: "sensors_health_features", label: "Cảm biến & Sức khỏe" },
  { key: "warranty", label: "Bảo hành" },
  { key: "created_at", label: "Ngày tạo" },
] as const;

const LabelValue: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-gray-600 text-xs">{label}:</span>
    <span className="font-medium">{value || "-"}</span>
  </div>
);

const ExpandedRowContent: React.FC<{ device: DeviceInfo }> = ({ device }) => (
  <div className="text-sm bg-gray-50 p-3">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-2">
        <LabelValue label="Thương hiệu" value={device.brand} />
        <LabelValue label="Model" value={device.model} />
        <LabelValue label="Ngày ra mắt" value={device.release_date} />
      </div>
      <div className="space-y-2">
        <LabelValue label="Màn hình" value={device.screen} />
        <LabelValue label="Chip/RAM" value={device.chip_ram} />
        <LabelValue label="Camera" value={device.camera} />
      </div>
      <div className="space-y-2">
        <LabelValue label="Pin" value={device.battery} />
        <LabelValue label="Kết nối/HĐH" value={device.connectivity_os} />
        <LabelValue label="Màu (EN)" value={device.color_english} />
      </div>
      <div className="space-y-2">
        <LabelValue label="Kích thước/Trọng lượng" value={device.dimensions_weight} />
        <LabelValue label="Cảm biến & Sức khỏe" value={device.sensors_health_features} />
        <LabelValue label="Bảo hành" value={device.warranty} />
      </div>
    </div>

    <div className="mt-3 pt-3 border-t border-gray-200">
      <LabelValue label="Ngày tạo" value={device.created_at} />
      <div className="flex flex-col mt-2">
        <span className="text-gray-600 text-xs">Cập nhật lần cuối:</span>
        <span className="font-medium">{device.updated_at}</span>
      </div>
    </div>
  </div>
);

// 2. XOÁ component Pagination VÀ KIỂU PaginationLike BỊ LỖI Ở ĐÂY

interface DeviceInfoTableProps {
  devices: DeviceInfo[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string, checked: boolean) => void;
  selectAll: boolean;
  selectedCount: number;
  pagination: AnyPagination; // 3. SỬ DỤNG KIỂU AnyPagination
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
  onEditDevice?: (device: DeviceInfo) => void;
  onDeleteDevice?: (id: string) => void;
}

const DeviceInfoTable: React.FC<DeviceInfoTableProps> = ({
  devices,
  onSelectAll,
  onSelectItem,
  selectAll,
  selectedCount,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  onEditDevice,
  onDeleteDevice,
}) => {
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    () => ALL_COLUMNS.reduce((acc, c) => ({ ...acc, [c.key]: true }), {})
  );
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // 4. XOÁ LOGIC LỌC (useMemo, selectedBrand, deviceInfoSearchTerm)
  // Logic này đã được xử lý ở component cha (DeviceManagement)
  const displayedDevices = devices;

  // 5. LẤY TỔNG SỐ MỤC TỪ pagination (do component cha truyền xuống)
  const totalItems = pagination?.totalItems ?? 0;
  const uiPagination = { ...pagination, totalItems };

  const toggleRow = (id: string) => setExpandedRow(expandedRow === id ? null : id);
  const truncateText = (text?: string, maxLength: number = 25) =>
    !text ? "-" : text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

  const handleEditDevice = (device: DeviceInfo) => onEditDevice?.(device);
  const handleDeleteDevice = (device: DeviceInfo) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa model "${device.model}"?`)) onDeleteDevice?.(device.id);
  };


  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
            {displayedDevices.length === 0 && (
              <tr>
                <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="text-center py-10 text-gray-500">
                  Không tìm thấy thông tin thiết bị nào.
                </td>
              </tr>
            )}

            {displayedDevices.map((device) => (
              <React.Fragment key={device.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={device.selected || false}
                      onChange={(e) => onSelectItem(device.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 h-4 w-4"
                    />
                  </td>

                  {ALL_COLUMNS.map((column) =>
                    visibleColumns[column.key] ? (
                      <td key={column.key} className="px-3 py-3">
                        <div className="text-sm text-gray-900 truncate max-w-[150px]" title={(device as any)[column.key] || "-"}>
                          {truncateText((device as any)[column.key], 25)}
                        </div>
                      </td>
                    ) : null
                  )}

                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <button className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded" title="Sửa" onClick={() => handleEditDevice(device)}>
                        <Edit size={14} />
                      </button>
                      <button className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded" title="Xóa" onClick={() => handleDeleteDevice(device)}>
                        <Trash2 size={14} />
                      </button>
                      <button
                        className="p-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded"
                        title={expandedRow === device.id ? "Ẩn chi tiết" : "Xem chi tiết"}
                        onClick={() => toggleRow(device.id)}
                      >
                        {expandedRow === device.id ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>

                {expandedRow === device.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="p-0">
                      <ExpandedRowContent device={device} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <DeviceTableMobile
        devices={displayedDevices}
        onSelectItem={onSelectItem}
        expandedRow={expandedRow}
        toggleRow={toggleRow}
        onEditDevice={(d) => onEditDevice?.(d)}
        onDeleteDevice={(id) => onDeleteDevice?.(id)}
      />

      {displayedDevices.length > 0 && (
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

export default DeviceInfoTable;
export { DeviceInfoTable };