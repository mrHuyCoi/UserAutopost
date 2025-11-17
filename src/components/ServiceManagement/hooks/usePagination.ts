// src/hooks/usePagination.ts
import { useState } from 'react';

export const usePagination = (defaultPageSize = 5) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const getPaginationData = <T,>(data: T[]) => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const currentItems = data.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentItems
    };
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };


  return {
    currentPage,
    pageSize,
    setCurrentPage: handlePageChange,
    setPageSize: handlePageSizeChange, 
    getPaginationData
  };
};