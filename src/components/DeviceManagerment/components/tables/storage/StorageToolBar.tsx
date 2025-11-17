// components/tables/storage/StorageToolBar.tsx
import React from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';

interface StorageToolbarProps {
  onAddNew: () => void;
  onDeleteSelected: () => void;
  selectedCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const StorageToolbar: React.FC<StorageToolbarProps> = ({
  onAddNew,
  onDeleteSelected,
  selectedCount,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50/50 rounded-lg border">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
        >
          <Plus size={14} />
          Thêm dung lượng
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
      <div className="flex-1 min-w-[200px] sm:max-w-xs">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo dung lượng (ví dụ: 128, 256)..."
            className="w-full pl-8 pr-3 py-2 text-xs font-medium text-gray-700 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>
    </div>
  );
};