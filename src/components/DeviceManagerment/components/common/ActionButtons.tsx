import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, Upload, Trash2, RotateCcw, MoreVertical, X } from 'lucide-react';

interface ActionButtonsProps {
  selectedCount: number;
  deletedItemsCount: number;
  onAddNew: () => void;
  onDownloadTemplate: () => void;
  onImportExcel: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onExportExcel: () => Promise<void>;
  loading?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectedCount,
  deletedItemsCount,
  onAddNew,
  onDownloadTemplate,
  onImportExcel,
  onDelete,
  onRestore,
  onExportExcel
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const actions = [
    {
      label: "Thêm mới",
      icon: Plus,
      onClick: onAddNew,
      color: "text-green-600 hover:bg-green-50",
    },
    {
      label: "Excel mẫu",
      icon: Download,
      onClick: onDownloadTemplate,
      color: "text-blue-600 hover:bg-blue-50",
    },
    {
      label: "Nhập Excel",
      icon: Upload,
      onClick: onImportExcel,
      color: "text-purple-600 hover:bg-purple-50",
    },
    {
      label: `Xóa (${selectedCount})`,
      icon: Trash2,
      onClick: onDelete,
      color: selectedCount > 0 ? "text-red-600 hover:bg-red-50" : "text-gray-400 cursor-not-allowed",
      disabled: selectedCount === 0
    },
    {
      label: "Khôi phục",
      icon: RotateCcw,
      onClick: onRestore,
      color: deletedItemsCount > 0 ? "text-orange-600 hover:bg-orange-50" : "text-gray-400 cursor-not-allowed",
      disabled: deletedItemsCount === 0
    },
    {
      label: "Xuất Excel",
      icon: Download,
      onClick: onExportExcel,
      color: "text-gray-600 hover:bg-gray-50",
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Action Button */}
      <div className="flex gap-2">
        <button 
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm flex-1 sm:flex-none justify-center min-w-[140px]"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <MoreVertical size={16} />
          <span>Thao tác</span>
          {selectedCount > 0 && (
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs min-w-[20px]">
              {selectedCount}
            </span>
          )}
        </button>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-2 animate-fadeIn">
          {/* Dropdown Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
            <span className="font-medium text-gray-900">Tác vụ</span>
            <button 
              onClick={() => setShowDropdown(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          
          {/* Actions List */}
          <div className="py-1">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors ${action.color} ${
                  action.disabled ? 'cursor-not-allowed opacity-50' : ''
                }`}
                onClick={action.disabled ? undefined : action.onClick}
                disabled={action.disabled}
              >
                <action.icon size={16} className="shrink-0" />
                <span className="text-left flex-1">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};