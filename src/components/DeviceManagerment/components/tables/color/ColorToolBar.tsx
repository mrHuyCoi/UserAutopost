// components/tables/color/ColorToolBar.tsx
import React from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';

interface ColorsToolbarProps {
  onAddNew: () => void;
  onDeleteSelected: () => void;
  selectedCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  
  mode?: 'master' | 'link';
  
  // Props cho 'link' mode
  deviceInfos?: any[];
  selectedDeviceInfo?: string;
  onDeviceInfoChange?: (id: string) => void;
}

export const ColorsToolbar: React.FC<ColorsToolbarProps> = ({
  onAddNew,
  onDeleteSelected,
  selectedCount,
  searchTerm,
  onSearchChange,
  mode = 'master',
  deviceInfos = [],
  selectedDeviceInfo = '',
  onDeviceInfoChange = () => {},
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50/50 rounded-lg border">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onAddNew}
          disabled={mode === 'link' && !selectedDeviceInfo}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          <Plus size={14} />
          {mode === 'link' ? 'Liên kết màu' : 'Thêm màu mới'}
        </button>
        {selectedCount > 0 && (
          <button
            onClick={onDeleteSelected}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 transition"
          >
            <Trash2 size={14} />
            Xóa ({selectedCount})
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {mode === 'link' && (
          <div className="flex-1 min-w-[200px] sm:max-w-xs">
            <select
              value={selectedDeviceInfo}
              onChange={(e) => onDeviceInfoChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn thiết bị để xem màu --</option>
              {deviceInfos.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.brand} {device.model}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="flex-1 min-w-[200px] sm:max-w-xs">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo tên, mã hex..."
              className="w-full pl-8 pr-3 py-2 text-xs font-medium text-gray-700 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};