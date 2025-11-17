// src/components/ServiceTable/ServiceTableRow.tsx
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Service } from '../../hooks/useServices';

interface ServiceTableRowProps {
  service: Service;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (service: Service) => void; // <-- THÊM PROP MỚI
}

const ServiceTableRow: React.FC<ServiceTableRowProps> = ({
  service,
  isSelected,
  onSelect,
  onDelete,
  onEdit, // <-- Lấy prop
}) => {
  return (
    <tr 
      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={() => onSelect(service.id)}
    >
      <td className="px-4 py-4">
        <div className="font-semibold text-gray-900 text-lg">{service.name}</div>
      </td>
      <td className="px-4 py-4 text-center">
        <div className="flex justify-center gap-2">
          <button 
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(service); // <-- GỌI HÀM SỬA
            }}
          >
            <Edit size={16} />
            Sửa
          </button>
          <button 
            className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Bạn có chắc muốn xóa dịch vụ "${service.name}"?`)) {
                onDelete(service.id);
              }
            }}
          >
            <Trash2 size={16} />
            Xóa
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ServiceTableRow;