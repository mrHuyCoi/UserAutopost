// src/components/ServiceTable/ServiceMobileCard.tsx
import React, { useState } from 'react';
import { Edit, Trash2, ChevronRight, MoreVertical } from 'lucide-react';
import { Service } from '../../hooks/useServices';

interface ServiceMobileCardProps {
  service: Service;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (service: Service) => void; // <-- THÊM PROP MỚI
}

const ServiceMobileCard: React.FC<ServiceMobileCardProps> = ({
  service,
  isSelected,
  onSelect,
  onDelete,
  onEdit, // <-- Lấy prop
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div 
      className={`p-4 cursor-pointer transition-colors border-b border-gray-200 ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white hover:bg-gray-50'
      }`}
      onClick={() => onSelect(service.id)}
    >
      <div className="flex items-start justify-between"> 
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base">{service.name}</h3>
        </div>
        <div className="flex items-center gap-1">
          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={18} className="text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit(service); // <-- GỌI HÀM SỬA
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                >
                  <Edit size={16} />
                  Sửa
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    if (window.confirm(`Bạn có chắc muốn xóa dịch vụ "${service.name}"?`)) {
                      onDelete(service.id);
                    }
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg"
                >
                  <Trash2 size={16} />
                  Xóa
                </button>
              </div>
            )}
          </div>
          <ChevronRight size={18} className="text-gray-400 ml-1" />
        </div>
      </div>
    </div>
  );
};

export default ServiceMobileCard;