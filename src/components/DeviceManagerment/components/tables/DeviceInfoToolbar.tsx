import React from "react";
import { Upload, Download, FileText, Trash2, ShieldAlert, Filter, Search, Plus } from "lucide-react";

interface DeviceInfoToolbarProps {
  selectedCount: number;
  onImportClick: () => void;
  onExportClick: () => void;
  onTemplateClick: () => void;
  onDeleteSelectedClick: () => void;
  onDeleteAllClick: () => void;
  allBrands: string[];
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  onAddNewDeviceInfo: () => void;
  deviceInfoSearchTerm: string;
  onSearchDeviceInfos: (term: string) => void;
}

export const DeviceInfoToolbar: React.FC<DeviceInfoToolbarProps> = ({
  selectedCount,
  onImportClick,
  onExportClick,
  onTemplateClick,
  onDeleteSelectedClick,
  onDeleteAllClick,
  allBrands,
  selectedBrand,
  onBrandChange,
  onAddNewDeviceInfo,
  deviceInfoSearchTerm,
  onSearchDeviceInfos,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50/50 rounded-lg border">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={onAddNewDeviceInfo} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition">
          <Plus size={14} />
          Thêm thông tin
        </button>
        <button onClick={onImportClick} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 transition">
          <Upload size={14} />
          Import Excel
        </button>
        <button onClick={onExportClick} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 transition">
          <Download size={14} />
          Export Excel
        </button>
        <button onClick={onTemplateClick} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 transition">
          <FileText size={14} />
          Tải file mẫu
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 ml-2">
          <Filter size={14} className="text-gray-500" />
          <select
            value={selectedBrand}
            onChange={(e) => onBrandChange(e.target.value)}
            className="flex items-center px-3 py-2 text-xs font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ height: "34px" }}
          >
            <option value="">Tất cả thương hiệu</option>
            {allBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px] sm:max-w-xs">
          <div className="relative">
            <input
              type="text"
              value={deviceInfoSearchTerm}
              onChange={(e) => onSearchDeviceInfos(e.target.value)}
              placeholder="Tìm theo model..."
              className="w-full pl-8 pr-3 py-2 text-xs font-medium text-gray-700 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedCount > 0 && (
          <button
            onClick={onDeleteSelectedClick}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 transition"
          >
            <Trash2 size={14} />
            Xóa {selectedCount} mục
          </button>
        )}
        <button
          onClick={onDeleteAllClick}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-700 bg-transparent hover:bg-red-100 rounded-md transition"
        >
          <ShieldAlert size={14} />
          Xóa tất cả
        </button>
      </div>
    </div>
  );
};
