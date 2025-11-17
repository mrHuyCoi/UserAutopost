import React from 'react';
import { Plus, Search, Upload, Download, FileText, ShieldAlert, RotateCw, Trash2 } from 'lucide-react';

interface MyDevicesToolbarProps {
  onAddNew: () => void;
  onDeleteSelected: () => void;
  selectedCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onImportExcel: () => void;
  onExportExcel: () => void;
  onDownloadTemplate: () => void;
  onDeleteAll: () => void;
  onRestore: () => void;
}

export const MyDevicesToolbar: React.FC<MyDevicesToolbarProps> = ({
  onAddNew,
  onDeleteSelected,
  selectedCount,
  searchTerm,
  onSearchChange,
  onImportExcel,
  onExportExcel,
  onDownloadTemplate,
  onDeleteAll,
  onRestore,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50/50 rounded-lg border">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
        >
          <Plus size={14} />
          Thêm thiết bị
        </button>
        <button
          onClick={onImportExcel}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 transition"
        >
          <Upload size={14} />
          Import Excel
        </button>
        <button
          onClick={onExportExcel}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 transition"
        >
          <Download size={14} />
          Export Excel
        </button>
        <button
          onClick={onDownloadTemplate}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 transition"
        >
          <FileText size={14} />
          Tải mẫu
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[200px] sm:max-w-xs">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo mã, tên, S/N..."
              className="w-full pl-8 pr-3 py-2 text-xs font-medium text-gray-700 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <button
          onClick={onRestore}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 transition"
        >
          <RotateCw size={14} />
          Khôi phục
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
        <button
          onClick={onDeleteAll}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-700 bg-transparent hover:bg-red-100 rounded-md transition"
        >
          <ShieldAlert size={14} />
          Xóa tất cả
        </button>
      </div>
    </div>
  );
};
