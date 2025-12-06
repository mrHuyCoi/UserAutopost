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
  return (
    <div className="relative">
      {/* ===== BUTTON "Cột hiển thị" ===== */}
      <button 
        className="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl text-base font-medium hover:bg-gray-50 shadow-sm"
        onClick={() => onToggle(!isOpen)}
      >
        <Settings size={20} />
        <span>Cột hiển thị</span>
      </button>

      {/* ===== DESKTOP DROPDOWN (ổn định, không nhảy lung tung) ===== */}
      {isOpen && (
        <div
          className="
            absolute left-0 top-full mt-2
            bg-white w-64
            rounded-xl shadow-xl
            border border-gray-200
            max-h-80 overflow-y-auto 
            z-50
            hidden sm:block
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <span className="font-semibold text-gray-800">Chọn cột hiển thị</span>
            <button 
              onClick={() => onToggle(false)}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
            >
              <X size={18} />
            </button>
          </div>

          {/* List */}
          <div className="p-3 space-y-2">
            {columnConfig.map((col) => (
              <label
                key={col.key}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onColumnToggle(col.key)}
              >
                <div
                  className={`w-5 h-5 flex items-center justify-center rounded border
                    ${col.visible ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}
                  `}
                >
                  {col.visible && <Check size={14} />}
                </div>
                <span className="text-sm text-gray-800">{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ===== MOBILE BOTTOM SHEET ===== */}
      {isOpen && (
        <div className="sm:hidden fixed inset-0 bg-black bg-opacity-40 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Chọn cột hiển thị</h2>
              <button 
                onClick={() => onToggle(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            {/* List */}
            <div className="space-y-3">
              {columnConfig.map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => onColumnToggle(col.key)}
                >
                  <div
                    className={`w-6 h-6 flex items-center justify-center rounded border
                      ${col.visible ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}
                    `}
                  >
                    {col.visible && <Check size={16} />}
                  </div>
                  <span className="text-gray-800">{col.label}</span>
                </label>
              ))}
            </div>

            {/* Apply Button */}
            <button
              onClick={() => onToggle(false)}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnMenu;
