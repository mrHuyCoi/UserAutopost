import React from 'react';
import { ServiceDetail, ColumnConfig } from '../../hooks/useServiceDetails';

interface ServiceDetailTableHeaderProps {
  visibleColumns: ColumnConfig[];
  currentItems: ServiceDetail[];
  selectedRows: string[];
  onSelectAll: (checked: boolean, items: ServiceDetail[]) => void;
}

const ServiceDetailTableHeader: React.FC<ServiceDetailTableHeaderProps> = ({
  visibleColumns,
  currentItems,
  selectedRows,
  onSelectAll
}) => {
  return (
    <tr>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <input
          type="checkbox"
          checked={selectedRows.length === currentItems.length && currentItems.length > 0}
          onChange={(e) => onSelectAll(e.target.checked, currentItems)}
          className="rounded border-gray-300"
        />
      </th>
      {visibleColumns.map((column) => (
        <th key={column.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {column.label}
        </th>
      ))}
    </tr>
  );
};

export default ServiceDetailTableHeader;