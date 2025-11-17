// hooks/useSelection.ts
import { useState, useCallback, useEffect } from 'react';

export interface SelectableItem {
  id: string;
  selected?: boolean;
}

export const useSelection = <T extends SelectableItem>(
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>
) => {
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectAll(checked);
    setItems(prev => prev.map(item => ({
      ...item,
      selected: checked
    })));
  }, [setItems]);
  useEffect(() => {
    if (items.length === 0) {
      setSelectAll(false);
      return;
    }
    
    const allSelected = items.every(item => item.selected);
    setSelectAll(allSelected);
  }, [items]);

  const handleSelectItem = useCallback((id: string, checked: boolean) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, selected: checked } : item
    ));
    
    // Update selectAll state
    const allSelected = items.every(item => 
      item.id === id ? checked : item.selected
    );
    setSelectAll(allSelected);
  }, [items, setItems]);

  const getSelectedCount = useCallback(() => {
    return items.filter(item => item.selected).length;
  }, [items]);

    const clearSelection = useCallback(() => {
    setSelectAll(false);
    setItems(prev => prev.map(item => ({
      ...item,
      selected: false
    })));
  }, [setItems]);

  return {
    selectAll,
    setSelectAll,
    handleSelectAll,
    handleSelectItem,
    getSelectedCount,
    clearSelection,
  };
};