// src/components/ServiceDetailTable/ServiceDetailTableRow.tsx
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { ServiceDetail, ColumnConfig } from '../../hooks/useServiceDetails';

interface ServiceDetailTableRowProps {
  detail: ServiceDetail;
  visibleColumns: ColumnConfig[];
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (detail: ServiceDetail) => void; // <-- THÊM PROP MỚI
}

const ServiceDetailTableRow: React.FC<ServiceDetailTableRowProps> = ({
  detail,
  visibleColumns,
  isSelected,
  onSelect,
  onDelete,
  onEdit, // <-- Lấy prop
}) => {

  const handleDelete = () => {
    if (window.confirm(`Bạn có chắc muốn xóa sản phẩm ${detail.service_code} - ${detail.device_type}?`)) {
      onDelete(detail.id);
    }
  };

  return (
    <tr key={detail.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(detail.id, e.target.checked)}
          className="rounded border-gray-300"
        />
      </td>
      {visibleColumns.map((column) => {
        if (column.key === 'actions') {
          return (
            <td key="actions" className="px-4 py-3">
              <div className="flex gap-1">
                <button 
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  onClick={() => onEdit(detail)} // <-- GỌI HÀM SỬA
                >
                  <Edit size={12} />
                  Sửa
                </button>
                <button 
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  onClick={handleDelete}
                >
                  <Trash2 size={12} />
                  Xóa
                </button>
              </div>
            </td>
          );
        }
        
        const value = detail[column.key as keyof ServiceDetail];
        
        if (column.key === 'price' || column.key === 'wholesale_price') {
            return (
                <td key={column.key} className="px-4 py-3 font-medium text-gray-700">
                    {`${Number(value || 0).toLocaleString()} ₫`}
                </td>
            );
        }

        return (
          <td key={column.key} className="px-4 py-3 text-gray-600">
            {String(value ?? '') || '-'}
          </td>
        );
      })}
    </tr>
  );
};

export default ServiceDetailTableRow;