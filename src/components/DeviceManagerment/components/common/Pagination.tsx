import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

type AppPaginationState = {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
};

export type AnyPagination = AppPaginationState;

interface PaginationProps {
  pagination: AnyPagination;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}

const coerceNumber = (v: any, d: number) => (typeof v === 'number' && !isNaN(v) && isFinite(v) ? v : d);

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  totalItems = 0,
  onPageChange,
  onItemsPerPageChange
}) => {
  const safeLimit = coerceNumber(pagination.itemsPerPage, 10);
  const safeTotalItems = Math.max(0, coerceNumber(totalItems || pagination.totalItems, 0));
  const safeTotalPages = Math.max(1, coerceNumber(pagination.totalPages, 1));
  const safeCurrentPage = Math.max(1, Math.min(coerceNumber(pagination.currentPage, 1), safeTotalPages));

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, safeCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(safeTotalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  if (safeTotalItems === 0) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-500">Không có dữ liệu</div>
      </div>
    );
  }

  const pageNumbers = getPageNumbers();
  const startItem = (safeCurrentPage - 1) * safeLimit + 1;
  const endItem = Math.min(safeCurrentPage * safeLimit, safeTotalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700 whitespace-nowrap">Hiển thị</span>
        <select
          value={safeLimit}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (v > 0) onItemsPerPageChange(v);
          }}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-sm text-gray-700 whitespace-nowrap">
          {startItem}-{endItem} / {safeTotalItems.toLocaleString()}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage === 1}
          className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Trang đầu"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Trang trước"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[2rem] px-2 py-1.5 text-sm rounded-md border transition-colors ${
              page === safeCurrentPage ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages}
          className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Trang sau"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(safeTotalPages)}
          disabled={safeCurrentPage === safeTotalPages}
          className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Trang cuối"
        >
          <ChevronsRight size={16} />
        </button>
      </div>

      <div className="text-sm text-gray-500 whitespace-nowrap hidden lg:block">Trang {safeCurrentPage} / {safeTotalPages}</div>
    </div>
  );
};