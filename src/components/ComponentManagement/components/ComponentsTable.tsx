import React from 'react';
import { Component, ColumnConfig } from '../types';
import TableRow from './TableRow';
import ExpandedRow from './ExpandedRow';
import MobileTableRow from './MobileTableRow';

interface ComponentsTableProps {
  components: Component[];
  columnConfig: ColumnConfig[];
  visibleColumns: ColumnConfig[];
  selectedComponents: string[];
  selectAll: boolean;
  expandedRows: Set<string>;
  onSelectComponent: (id: string) => void;
  onSelectAll: () => void;
  onToggleRowExpansion: (id: string) => void;
  onOpenImageModal: (component: Component, index?: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

const ComponentsTable: React.FC<ComponentsTableProps> = ({
  components,
  columnConfig,
  visibleColumns,
  selectedComponents,
  selectAll,
  expandedRows,
  onSelectComponent,
  onSelectAll,
  onToggleRowExpansion,
  onOpenImageModal,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const getStockClass = (stock: number) => {
    if (stock === 0) return 'text-red-700 font-bold';
    if (stock <= 5) return 'text-red-600 font-semibold';
    return '';
  };

  // Mobile view: hiển thị dưới dạng card
  if (window.innerWidth < 768) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={onSelectAll}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Chọn tất cả ({components.length})
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {visibleColumns.length} cột
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {components.map((component) => (
            <MobileTableRow
              key={component.id}
              component={component}
              isSelected={selectedComponents.includes(component.id)}
              isExpanded={expandedRows.has(component.id)}
              getStockClass={getStockClass}
              onSelect={onSelectComponent}
              onToggleExpansion={onToggleRowExpansion}
              onOpenImageModal={onOpenImageModal}
              // Truyền props
              onEdit={onEdit}
              onDelete={onDelete}
              onRestore={onRestore}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop view: hiển thị bảng
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={onSelectAll}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
              {columnConfig.map((column) => 
                column.visible && (
                  <th 
                    key={column.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                )
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Hành Động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {components.map((component) => {
              const isExpanded = expandedRows.has(component.id);
              
              return (
                <React.Fragment key={component.id}>
                  <TableRow
                    component={component}
                    columnConfig={columnConfig}
                    visibleColumns={visibleColumns}
                    isSelected={selectedComponents.includes(component.id)}
                    isExpanded={isExpanded}
                    getStockClass={getStockClass}
                    onSelect={onSelectComponent}
                    onToggleExpansion={onToggleRowExpansion}
                    onOpenImageModal={onOpenImageModal}
                    // Truyền props
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onRestore={onRestore}
                  />
                  
                  {isExpanded && component.images && component.images.length > 0 && (
                    <ExpandedRow
                      component={component}
                      visibleColumnsCount={visibleColumns.length + 2}
                      onOpenImageModal={onOpenImageModal}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComponentsTable;