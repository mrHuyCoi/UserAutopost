import React from 'react';
import { X, Settings, Check } from 'lucide-react';
import { ColumnConfig } from '../../hooks/useServiceDetails';

interface ColumnMenuProps {
  columnConfig: ColumnConfig[];
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  onColumnToggle: (key: ColumnConfig['key']) => void;
}

const ColumnMenu: React.FC<ColumnMenuProps> = ({
  columnConfig,
  isOpen,
  onToggle,
  onColumnToggle
}) => {
  if (!isOpen) {
    return (
      <button 
        className="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl text-base font-medium hover:bg-gray-50 w-full sm:w-auto shadow-sm"
        onClick={() => onToggle(true)}
      >
        <Settings size={20} />
        <span>Cột hiển thị</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 sm:relative sm:inset-auto sm:bg-transparent sm:flex sm:items-start">
      <div className="bg-white rounded-t-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden sm:rounded-xl sm:absolute sm:top-full sm:left-0 sm:mt-2 sm:min-w-64 sm:border sm:border-gray-200 sm:shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white sticky top-0 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900 sm:text-base">Chọn cột hiển thị</span>
            <button 
              onClick={() => onToggle(false)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <X size={24} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Column List */}
        <div className="max-h-[60vh] overflow-y-auto p-6 sm:max-h-64 sm:p-4">
          <div className="space-y-3">
            {columnConfig.map((column) => (
              <label 
                key={column.key} 
                className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer border border-gray-200 transition-colors"
                onClick={() => onColumnToggle(column.key)}
              >
                <div className={`flex items-center justify-center w-6 h-6 border-2 rounded-md transition-colors ${
                  column.visible 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'border-gray-300'
                }`}>
                  {column.visible && <Check size={16} />}
                </div>
                <span className="text-gray-900 font-medium flex-1">{column.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 sm:hidden">
          <button 
            onClick={() => onToggle(false)}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnMenu;