import { useMemo, useState, useEffect } from 'react';

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export const usePagination = <T,>(data: T[], initialItemsPerPage: number = 10) => {
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: initialItemsPerPage,
    totalItems: data.length,
    totalPages: Math.max(1, Math.ceil(Math.max(0, data.length) / Math.max(1, initialItemsPerPage)))
  });

  useEffect(() => {
    setPagination((prev) => {
      const totalItems = data.length;
      const totalPages = Math.max(1, Math.ceil(Math.max(0, totalItems) / Math.max(1, prev.itemsPerPage)));
      const currentPage = Math.max(1, Math.min(prev.currentPage, totalPages));
      return { ...prev, totalItems, totalPages, currentPage };
    });
  }, [data]);

  const currentData = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, pagination.currentPage, pagination.itemsPerPage]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => {
      const totalPages = Math.max(1, prev.totalPages);
      const next = Math.max(1, Math.min(page, totalPages));
      return { ...prev, currentPage: next };
    });
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setPagination((prev) => {
      const per = Math.max(1, itemsPerPage);
      const totalPages = Math.max(1, Math.ceil(Math.max(0, prev.totalItems) / per));
      return { ...prev, itemsPerPage: per, currentPage: 1, totalPages };
    });
  };

  return {
    pagination,
    getCurrentPageData: () => currentData,
    handlePageChange,
    handleItemsPerPageChange
  };
};
