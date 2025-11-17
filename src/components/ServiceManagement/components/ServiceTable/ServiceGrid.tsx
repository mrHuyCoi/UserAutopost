// src/components/ServiceTable/ServiceGrid.tsx
import React, { useState } from 'react';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { Service } from '../../hooks/useServices';

interface ServiceGridProps {
  services: Service[];
  selectedService: string;
  onServiceSelect: (id: string) => void;
  onDeleteService: (id: string) => void;
  onEditService: (service: Service) => void; // <-- THÊM PROP MỚI
}

const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  selectedService,
  onServiceSelect,
  onDeleteService,
  onEditService, // <-- Lấy prop
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
              selectedService === service.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => onServiceSelect(service.id)}
          >
            {/* Action Menu */}
            <div className="absolute top-3 right-3">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === service.id ? null : service.id);
                  }}
                  className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
                >
                  <MoreVertical size={16} />
                </button>

                {activeMenu === service.id && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(null);
                        onEditService(service); // <-- GỌI HÀM SỬA
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <Edit size={14} />
                      Sửa
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(null);
                        if (window.confirm(`Bạn có chắc muốn xóa dịch vụ "${service.name}"?`)) {
                          onDeleteService(service.id);
                        }
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <Trash2 size={14} />
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Service Content */}
            <div className="text-center"> 
              <h3 className="font-bold text-gray-900 text-lg mb-1">{service.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceGrid;