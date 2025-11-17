// MyDevicesTable.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Trash2, CheckSquare, Square, Eye, EyeOff, Loader2 } from 'lucide-react';
import { UserDevice } from '../../../types';
import { Pagination } from '../../common/Pagination';
import { deviceStorageService } from '../../../../../services/deviceStorageService';
import { userDeviceService } from '../../../../../services/userDeviceService';
import { MyDevicesToolbar } from './MyDevicesToolBar';

interface MyDevicesTableProps {
  devices?: UserDevice[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string, checked: boolean) => void;
  selectAll: boolean;
  selectedCount: number;
  pagination: any;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
  formatCurrency: (amount: number) => string;
  reloadData: () => void;
  onEdit?: (device: UserDevice) => void;
  onAddNew: () => void;
  onDeleteSelected: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onImportExcel: () => void;
  onExportExcel: () => void;
  onDownloadTemplate: () => void;
  onDeleteAll: () => void;
  onRestore: (ids: string[]) => void;
}

const ExpandedRowContent: React.FC<{ device: UserDevice }> = ({ device }) => (
  <div className="space-y-2 text-xs p-2 sm:p-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Tình trạng pin:</span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              parseInt(device.battery_condition || '0') >= 80
                ? 'bg-green-100 text-green-800'
                : parseInt(device.battery_condition || '0') >= 60
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {device.battery_condition || '0'}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Bảo hành:</span>
          <span className="font-medium text-gray-900">{device.warranty}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Ngày tạo:</span>
          <span className="font-medium text-gray-900">
            {new Date(device.created_at).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>
    </div>
    <div className="pt-2 border-t border-gray-200">
      <div className="font-medium text-gray-700 text-xs mb-1">Ghi chú</div>
      <p className="text-gray-600 text-xs bg-gray-50 p-2 rounded leading-relaxed border border-gray-200">
        {device.notes || 'Không có ghi chú'}
      </p>
    </div>
  </div>
);

export const MyDevicesTable: React.FC<MyDevicesTableProps> = ({
  devices = [],
  onSelectAll,
  onSelectItem,
  selectAll,
  selectedCount,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  formatCurrency,
  reloadData,
  onEdit,
  onAddNew,
  onDeleteSelected,
  searchTerm,
  onSearchChange,
  onImportExcel,
  onExportExcel,
  onDownloadTemplate,
  onDeleteAll,
  onRestore,
}) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [deviceStorages, setDeviceStorages] = useState<Record<string, any[]>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStorages = async () => {
      const uniqueDeviceInfoIds: string[] = Array.from(
        new Set(devices.map((d) => d.device_info?.id).filter((id): id is string => Boolean(id)))
      );
      for (const deviceInfoId of uniqueDeviceInfoIds) {
        if (!deviceStorages[deviceInfoId]) {
          try {
            const data = await deviceStorageService.getDeviceStoragesByDevice(deviceInfoId);
            setDeviceStorages((prev) => ({ ...prev, [deviceInfoId]: Array.isArray(data) ? data : [] }));
          } catch {
            setDeviceStorages((prev) => ({ ...prev, [deviceInfoId]: [] }));
          }
        }
      }
    };
    if (devices.length > 0) fetchStorages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices]);

  const totalItems = pagination?.totalItems ?? 0;
  const uiPagination = {
    ...pagination,
    totalItems,
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) return;
    try {
      setDeletingId(id);
      await userDeviceService.deleteUserDevice(id);
      alert('Đã xóa thiết bị thành công!');
      reloadData();
    } catch {
      alert('Không thể xóa thiết bị. Vui lòng thử lại!');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (device: UserDevice) => onEdit?.(device);

  const getMemory = (device: UserDevice) => {
    const anyDev = device as any;
    const inlineCap =
      anyDev?.device_storage?.capacity ??
      anyDev?.device_storage?.capacity_gb ??
      anyDev?.device_storage?.size;
    if (inlineCap != null) return `${inlineCap}GB`;

    const deviceInfoId = String(anyDev?.device_info?.id ?? anyDev?.device_info_id ?? "");
    if (!deviceInfoId) return "Không rõ";

    const storageId = String(anyDev?.storage_id ?? anyDev?.device_storage_id ?? "");
    if (!storageId) return "Không rõ";

    const storages = deviceStorages[deviceInfoId] || [];
    const matched = storages.find((s: any) => String(s?.id ?? s?.storage_id ?? s?.device_storage_id ?? "") === storageId);
    const cap = matched?.capacity ?? matched?.capacity_gb ?? matched?.size;

    return cap != null ? `${cap}GB` : "Không rõ";
  };



  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Mới':
        return 'bg-blue-100 text-blue-800';
      case 'Tân trang':
        return 'bg-purple-100 text-purple-800';
      case 'Đã sử dụng':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBatteryColor = (battery: string | undefined) => {
    const percent = parseInt(battery || '0');
    if (percent >= 80) return 'bg-green-100 text-green-800';
    if (percent >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const toggleRow = (id: string) => setExpandedRow(expandedRow === id ? null : id);
  const renderTag = (text: string, colorClass: string) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>{text}</span>
  );
  const getDeviceName = (d: UserDevice) => d.device_info?.model || 'Unknown Device';
  const getDeviceType = (d: UserDevice) => d.device_type || 'Unknown Type';
  const getColorName = (d: UserDevice) => d.color?.name || 'Unknown Color';
  const getProductCode = (d: UserDevice) => d.product_code || d.id.slice(0, 8).toUpperCase();
  const getCondition = (d: UserDevice) => d.device_condition || 'Unknown';

  const selectedIds = useMemo(() => devices.filter(d => (d as any).selected).map(d => d.id), [devices]);

  if (totalItems === 0 && searchTerm === '') {
    return (
      <div className="space-y-4 md:space-y-6">
        <MyDevicesToolbar
          onAddNew={onAddNew}
          onDeleteSelected={onDeleteSelected}
          selectedCount={selectedCount}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onImportExcel={onImportExcel}
          onExportExcel={onExportExcel}
          onDownloadTemplate={onDownloadTemplate}
          onDeleteAll={onDeleteAll}
          onRestore={() => onRestore(selectedIds)}
        />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
            <div className="text-sm font-medium text-gray-700">Thiết bị của tôi</div>
            <div className="text-xs text-gray-500">Tổng: 0</div>
          </div>
          <div className="p-8 text-center">
            <div className="text-gray-400 text-sm">Không có thiết bị nào</div>
            <button
              onClick={onAddNew}
              className="mt-4 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
            >
              Thêm thiết bị
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <MyDevicesToolbar
        onAddNew={onAddNew}
        onDeleteSelected={onDeleteSelected}
        selectedCount={selectedCount}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onImportExcel={onImportExcel}
        onExportExcel={onExportExcel}
        onDownloadTemplate={onDownloadTemplate}
        onDeleteAll={onDeleteAll}
        onRestore={() => onRestore(selectedIds)}
      />
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={() => onSelectAll(!selectAll)}
              className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 flex-shrink-0"
            >
              {selectAll ? <CheckSquare size={14} className="text-blue-500 flex-shrink-0" /> : <Square size={14} className="flex-shrink-0" />}
              <span className="hidden xs:inline text-xs sm:text-sm whitespace-nowrap">Chọn tất cả</span>
            </button>
            <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full border flex-shrink-0 whitespace-nowrap">
              {selectedCount} đã chọn
            </span>
          </div>
          <div className="text-xs text-gray-500 flex-shrink-0 ml-2 whitespace-nowrap">Tổng: {totalItems}</div>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-8 px-2 py-3"></th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Mã sản phẩm</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tên thiết bị</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Loại thiết bị</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tồn kho</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Giá bán lẻ</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Giá bán buôn</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Màu sắc</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Bộ nhớ</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tình trạng</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Tình trạng pin</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Bảo hành</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Ngày tạo</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {devices.map((device) => (
                <React.Fragment key={device.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 py-3">
                      <input
                        type="checkbox"
                        checked={(device as any).selected || false}
                        onChange={(e) => onSelectItem(device.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs font-mono font-semibold text-blue-600">{(device.product_code || device.id.slice(0, 8)).toUpperCase()}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-sm font-semibold text-gray-900">{device.device_info?.model || 'Unknown Device'}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm text-gray-600">{device.device_type || 'Unknown Type'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900">{device.inventory}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-sm font-semibold text-green-600">{formatCurrency(device.price || 0)}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-sm font-medium text-blue-600">{formatCurrency(device.wholesale_price || 0)}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-gray-600 whitespace-nowrap">{device.color?.name || 'Unknown Color'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">{renderTag(getMemory(device), 'bg-purple-100 text-purple-800')}</td>
                    <td className="px-3 py-3">{renderTag(getCondition(device), getConditionColor(getCondition(device)))}</td>
                    <td className="px-3 py-3">{renderTag(`${device.battery_condition || '0'}%`, getBatteryColor(device.battery_condition))}</td>
                    <td className="px-3 py-3">
                      <span className="text-sm text-gray-600">{device.warranty}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        {new Date(device.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(device) }}
                          className="flex items-center justify-center p-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                          title="Sửa"
                          disabled={!!deletingId}
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(device.id)}
                          disabled={!!deletingId}
                          className="flex items-center justify-center p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors disabled:opacity-50"
                          title="Xóa"
                        >
                          {deletingId === device.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                        <button
                          className="flex items-center justify-center p-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded transition-colors"
                          title={expandedRow === device.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                          onClick={() => toggleRow(device.id)}
                          disabled={!!deletingId}
                        >
                          {expandedRow === device.id ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === device.id && (
                    <tr className="bg-gray-100/50">
                      <td colSpan={14}>
                        <ExpandedRowContent device={device} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden">
          {devices.map((device) => (
            <div key={device.id} className="border-b border-gray-200 last:border-b-0">
              <div className={`p-3 hover:bg-gray-50 transition-colors ${deletingId === device.id ? 'opacity-50' : ''}`}>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={(device as any).selected || false}
                    onChange={(e) => onSelectItem(device.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3 mt-0.5 flex-shrink-0"
                    disabled={!!deletingId}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-mono font-semibold text-blue-600 truncate">{(device.product_code || device.id.slice(0, 8)).toUpperCase()}</div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2">{device.device_info?.model || 'Unknown Device'}</h3>
                        <div className="text-xs text-gray-500 mt-0.5">{device.device_type || 'Unknown Type'}</div>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
                        <button
                          className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors flex items-center justify-center"
                          onClick={() => handleEdit(device)}
                          title="Sửa"
                          disabled={!!deletingId}
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors flex items-center justify-center"
                          onClick={() => handleDelete(device.id)}
                          title="Xóa"
                          disabled={!!deletingId}
                        >
                          {deletingId === device.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                        <button
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                          onClick={() => toggleRow(device.id)}
                          title={expandedRow === device.id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                          disabled={!!deletingId}
                        >
                          {expandedRow === device.id ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-500 font-medium">Màu:</span>
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-gray-700 truncate">{device.color?.name || 'Unknown Color'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-500 font-medium">Bộ nhớ:</span>
                        <span className="text-purple-600 font-medium">{getMemory(device)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-500 font-medium">Tình trạng:</span>
                        {renderTag(device.device_condition || 'Unknown', getConditionColor(device.device_condition || ''))}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-500 font-medium">Pin:</span>
                        {renderTag(`${device.battery_condition || '0'}%`, getBatteryColor(device.battery_condition))}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-500 font-medium">Bảo hành:</span>
                        <span className="text-gray-700">{device.warranty}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-500 font-medium">Ngày tạo:</span>
                        <span className="text-gray-700">{new Date(device.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-green-600 font-semibold text-sm">{formatCurrency(device.price || 0)}</div>
                          <div className="text-gray-400 text-xs">Bán lẻ</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-600 font-medium text-sm">{formatCurrency(device.wholesale_price || 0)}</div>
                          <div className="text-gray-400 text-xs">Bán buôn</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {expandedRow === device.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 -mx-3 px-3 bg-gray-100/50">
                    <ExpandedRowContent device={device} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Pagination
          pagination={uiPagination}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>
    </div>
  );
};