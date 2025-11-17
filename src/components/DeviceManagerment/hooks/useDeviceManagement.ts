import { useState } from 'react';
import { SubTabType } from '../types'; 

export const initialFilterState = {
  'my-devices': {
    brand: '',
    storage: '', 
    inventoryMin: '',
    inventoryMax: '',
    priceMin: '',
    priceMax: '',
    wholesalePriceMin: '',
    wholesalePriceMax: '',
  },
  'device-info': {
    brand: '',
    release_date: '', 
  },
  'colors': {},
  'storage': {},
  'materials': {},
  'brands': {},
};

export type FilterState = typeof initialFilterState;

export const useDeviceManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  const handleFilterChange = (
    tab: SubTabType,
    field: string,
    value: string | number
  ) => {
    setFilters(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value,
      },
    }));
  };

  const resetFiltersForTab = (tab: SubTabType) => {
    setFilters(prev => ({
      ...prev,
      [tab]: initialFilterState[tab],
    }));
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    showFilter,
    setShowFilter,
    filters,
    handleFilterChange,
    resetFiltersForTab, 
  };
};