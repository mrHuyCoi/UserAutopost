import React from 'react';
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = window.innerWidth < 768 ? 3 : 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`min-w-[2.5rem] px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === i
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div className="pagination flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 gap-4 bg-white">
      {/* Page Size Selector */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <span className="text-sm text-gray-600 hidden sm:inline">Hiển thị:</span>
        <select 
          className="page-size-select px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          <option value={5}>5 dòng / trang</option>
          <option value={10}>10 dòng / trang</option>
          <option value={20}>20 dòng / trang</option>
          <option value={50}>50 dòng / trang</option>
        </select>
      </div>

      {/* Page Info */}
      <div className="page-info text-sm text-gray-600 text-center sm:text-left">
        Hiển thị <span className="font-semibold">{startIndex + 1}-{endIndex}</span> của{' '}
        <span className="font-semibold">{totalItems.toLocaleString()}</span> mục
      </div>

      {/* Page Navigation */}
      <div className="flex items-center gap-1 w-full sm:w-auto justify-center">
        {/* First Page Button - Mobile Only */}
        <button 
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed sm:hidden"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronFirst size={16} />
        </button>

        {/* Previous Page Button */}
        <button 
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        <div className="flex gap-1 mx-2">
          {renderPagination()}
        </div>

        {/* Next Page Button */}
        <button 
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={16} />
        </button>

        {/* Last Page Button - Mobile Only */}
        <button 
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed sm:hidden"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronLast size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;