import React, { useState } from 'react';
import { Search, Filter, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface SearchFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  selectedBrand: string;
  stockStatus: string;
  showAdvancedFilter: boolean;
  showDeleted: boolean;
  deletedCount: number;
  categories: string[];
  brands: string[];
  stockStatuses: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onStockStatusChange: (value: string) => void;
  onToggleAdvancedFilter: () => void;
  onToggleShowDeleted: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  selectedCategory,
  selectedBrand,
  stockStatus,
  showAdvancedFilter,
  showDeleted,
  deletedCount,
  categories,
  brands,
  stockStatuses,
  onSearchChange,
  onCategoryChange,
  onBrandChange,
  onStockStatusChange,
  onToggleAdvancedFilter,
  onToggleShowDeleted,
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="space-y-4 mb-6">
      {/* Main Search and Filters */}
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm linh kiện..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex gap-2">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Filter size={16} />
            Bộ lọc
            {showMobileFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={onToggleShowDeleted}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              showDeleted 
                ? 'bg-red-100 text-red-700 border-red-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">{showDeleted ? 'Đang xem' : 'Đã xóa'}</span>
            ({deletedCount})
          </button>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          <SelectFilter
            value={selectedCategory}
            onChange={onCategoryChange}
            options={categories}
            className="min-w-[150px]"
          />
          <SelectFilter
            value={selectedBrand}
            onChange={onBrandChange}
            options={brands}
            className="min-w-[140px]"
          />
          <SelectFilter
            value={stockStatus}
            onChange={onStockStatusChange}
            options={stockStatuses}
            className="min-w-[160px]"
          />
          <button
            onClick={onToggleAdvancedFilter}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              showAdvancedFilter 
                ? 'bg-blue-100 text-blue-700 border-blue-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            Bộ lọc nâng cao
          </button>
          <button
            onClick={onToggleShowDeleted}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              showDeleted 
                ? 'bg-red-100 text-red-700 border-red-300' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Trash2 size={16} />
            {showDeleted ? 'Đang xem' : 'Đã xóa'} ({deletedCount})
          </button>
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && (
          <div className="lg:hidden bg-white p-4 border border-gray-200 rounded-lg space-y-3">
            <SelectFilter
              value={selectedCategory}
              onChange={onCategoryChange}
              options={categories}
              fullWidth
            />
            <SelectFilter
              value={selectedBrand}
              onChange={onBrandChange}
              options={brands}
              fullWidth
            />
            <SelectFilter
              value={stockStatus}
              onChange={onStockStatusChange}
              options={stockStatuses}
              fullWidth
            />
            <button
              onClick={onToggleAdvancedFilter}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                showAdvancedFilter 
                  ? 'bg-blue-100 text-blue-700 border-blue-300' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter size={16} />
              Bộ lọc nâng cao
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filter Panel */}
      {showAdvancedFilter && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng giá bán lẻ</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Từ"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            {/* ... other advanced filters */}
          </div>
          <div className="flex justify-end gap-2">
            <button 
              onClick={onToggleAdvancedFilter}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Select Filter Component
const SelectFilter: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: string[];
  className?: string;
  fullWidth?: boolean;
}> = ({ value, onChange, options, className = '', fullWidth = false }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
};

export default SearchFilters;