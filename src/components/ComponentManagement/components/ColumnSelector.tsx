import React from 'react';
import { X } from 'lucide-react';
import { ColumnConfig } from '../types';

interface ColumnSelectorProps {
  isOpen: boolean;
  columnConfig: ColumnConfig[];
  onClose: () => void;
  onToggleColumn: (columnId: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  onReset: () => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  isOpen,
  columnConfig,
  onClose,
  onToggleColumn,
  onShowAll,
  onHideAll,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Chọn cột hiển thị</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-2 mb-3">
            <button
              onClick={onShowAll}
              className="flex-1 px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Hiện tất cả
            </button>
            <button
              onClick={onHideAll}
              className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Ẩn tất cả
            </button>
            <button
              onClick={onReset}
              className="flex-1 px-3 py-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            >
              Mặc định
            </button>
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {columnConfig.map((column) => (
            <label
              key={column.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={column.visible}
                  onChange={() => onToggleColumn(column.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">
                  {column.label}
                </span>
              </div>
              <div className={`w-2 h-2 rounded-full ${column.visible ? 'bg-green-500' : 'bg-gray-300'}`} />
            </label>
          ))}
        </div>
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              Đã chọn {columnConfig.filter(col => col.visible).length} cột
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnSelector;