// components/tables/color/ColorsTable.tsx
import React from 'react';
import { Edit, Trash2, CheckSquare, Square } from 'lucide-react';
import { Color } from '../../../types';
import { Pagination } from '../../common/Pagination';
import { ColorsToolbar } from '../color/ColorToolBar';

// Kiểu 'master' là Color, kiểu 'link' là Color nhưng có thêm device_color_id
interface ColorData extends Color {
  device_color_id?: string; // ID của liên kết (chỉ dùng ở mode 'link')
}

interface ColorsTableProps {
  colors?: ColorData[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string, checked: boolean) => void;
  selectAll: boolean;
  selectedCount: number;
  pagination: any;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
  
  onAddNew: () => void;
  onDeleteSelected: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;

  mode?: 'master' | 'link';

  // Props cho 'master' mode
  onEditColor?: (color: Color) => void;
  onDeleteColor?: (color: Color) => void;

  // Props cho 'link' mode
  onDeleteLinkedColor?: (deviceColorId: string) => void;
  deviceInfos?: any[];
  selectedDeviceInfo?: string;
  onDeviceInfoChange?: (id: string) => void;
}

export const ColorsTable: React.FC<ColorsTableProps> = ({
  colors = [],
  onSelectAll,
  onSelectItem,
  selectAll,
  selectedCount,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  onEditColor,
  onDeleteColor,
  onAddNew,
  onDeleteSelected,
  searchTerm,
  onSearchChange,
  mode = 'master',
  onDeleteLinkedColor,
  deviceInfos = [],
  selectedDeviceInfo = '',
  onDeviceInfoChange = () => {},
}) => {
  const getHexCode = (color: ColorData) => color.hex_code || '#CCCCCC';
  const totalItems = pagination?.totalItems ?? 0;
  const uiPagination = { ...pagination, totalItems };

  const getKey = (color: ColorData) => {
    return mode === 'link' ? color.device_color_id! : color.id;
  };

  if (mode === 'link' && totalItems === 0 && searchTerm === '' && !selectedDeviceInfo) {
    return (
      <div className="space-y-4">
        <ColorsToolbar
          mode={mode}
          onAddNew={onAddNew}
          onDeleteSelected={onDeleteSelected}
          selectedCount={selectedCount}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          deviceInfos={deviceInfos}
          selectedDeviceInfo={selectedDeviceInfo}
          onDeviceInfoChange={onDeviceInfoChange}
        />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-8 text-center">
            <div className="text-gray-400 text-sm">Vui lòng chọn một thiết bị để xem các màu đã liên kết.</div>
          </div>
        </div>
      </div>
    );
  }
  
  if (totalItems === 0 && searchTerm === '') {
     return (
      <div className="space-y-4">
        <ColorsToolbar
          mode={mode}
          onAddNew={onAddNew}
          onDeleteSelected={onDeleteSelected}
          selectedCount={selectedCount}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          deviceInfos={deviceInfos}
          selectedDeviceInfo={selectedDeviceInfo}
          onDeviceInfoChange={onDeviceInfoChange}
        />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-8 text-center">
            <div className="text-gray-400 text-sm">
              {mode === 'link' ? 'Thiết bị này chưa được liên kết với màu nào.' : 'Không có màu sắc nào.'}
            </div>
            <button
              onClick={onAddNew}
              disabled={mode === 'link' && !selectedDeviceInfo}
              className="mt-4 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {mode === 'link' ? 'Liên kết màu mới' : 'Thêm màu mới'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ColorsToolbar
        mode={mode}
        onAddNew={onAddNew}
        onDeleteSelected={onDeleteSelected}
        selectedCount={selectedCount}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        deviceInfos={deviceInfos}
        selectedDeviceInfo={selectedDeviceInfo}
        onDeviceInfoChange={onDeviceInfoChange}
      />
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50 gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <button
              onClick={() => onSelectAll(!selectAll)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 min-w-0 flex-1 sm:flex-none"
            >
              {selectAll ? <CheckSquare size={18} className="text-blue-500 shrink-0" /> : <Square size={18} className="shrink-0" />}
              <span className="hidden xs:inline">Chọn tất cả</span>
              <span className="xs:hidden">Tất cả</span>
            </button>
            {selectedCount > 0 && (
              <span className="text-sm text-gray-600 bg-white px-2 sm:px-3 py-1 rounded-full border shrink-0">{selectedCount} đã chọn</span>
            )}
          </div>
          <div className="text-sm text-gray-500 text-center sm:text-right">Tổng: {totalItems} màu sắc</div>
        </div>
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 sm:px-6 py-3 sm:py-4"></th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Màu sắc</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã màu</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày tạo (của màu)</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {colors?.map((color) => (
                <tr key={getKey(color)} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <input
                      type="checkbox"
                      checked={color.selected || false}
                      onChange={(e) => onSelectItem(getKey(color), e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: getHexCode(color) }} title={color.name} />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate max-w-[120px]">{color.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded font-mono">{getHexCode(color)}</code>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="text-sm text-gray-500">
                      {color.created_at ? new Date(color.created_at).toLocaleDateString('vi-VN') : '-'}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      {mode === 'master' && onEditColor && (
                        <button
                          onClick={() => onEditColor(color)}
                          className="p-1 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (mode === 'master' && onDeleteColor) {
                            onDeleteColor(color);
                          } else if (mode === 'link' && onDeleteLinkedColor && color.device_color_id) {
                            onDeleteLinkedColor(color.device_color_id);
                          }
                        }}
                        className="p-1 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={mode === 'link' ? "Xóa liên kết" : "Xóa màu"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Mobile/Tablet Views */}
        <div className="block lg:hidden">
          <div className="divide-y divide-gray-200">
            {colors?.map((color) => (
              <div key={getKey(color)} className="p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={color.selected || false}
                      onChange={(e) => onSelectItem(getKey(color), e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 h-4 w-4 mt-1 shrink-0"
                    />
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full border border-gray-300 shrink-0 mt-0.5" style={{ backgroundColor: getHexCode(color) }} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 truncate text-sm">{color.name}</div>
                        <div className="flex flex-col gap-1.5 mt-1.5">
                          <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded font-mono w-fit">{getHexCode(color)}</code>
                          {color.created_at && <div className="text-xs text-gray-500">{new Date(color.created_at).toLocaleDateString('vi-VN')}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {mode === 'master' && onEditColor && (
                       <button onClick={() => onEditColor(color)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        if (mode === 'master' && onDeleteColor) {
                          onDeleteColor(color);
                        } else if (mode === 'link' && onDeleteLinkedColor && color.device_color_id) {
                          onDeleteLinkedColor(color.device_color_id);
                        }
                      }} 
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <Pagination
            pagination={uiPagination}
            totalItems={totalItems}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </div>
      </div>
    </div>
  );
};