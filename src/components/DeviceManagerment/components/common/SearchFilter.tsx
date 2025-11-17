import React from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilter: boolean;
  onToggleFilter: () => void;
  filterDate: string;
  onFilterDateChange: (value: string) => void;
  filterBrand: string;
  onFilterBrandChange: (value: string) => void;
  onApplyFilter: () => void;
  onClearFilter: () => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  showFilter,
  onToggleFilter,
  filterDate,
  onFilterDateChange,
  onApplyFilter,
  onClearFilter
}) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm thiết bị..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 border border-gray-300 rounded-lg font-medium transition-colors shrink-0"
            onClick={onToggleFilter}
          >
            <Filter size={16} />
            Bộ lọc
            {showFilter ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bộ lọc nâng cao</h3>
            <button
              onClick={onToggleFilter}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronUp size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Các filter fields giữ nguyên */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => onFilterDateChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* ... các filter fields khác ... */}
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClearFilter}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={onApplyFilter}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      )}
    </div>
  );
};