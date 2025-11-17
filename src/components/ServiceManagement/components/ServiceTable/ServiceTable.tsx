// src/components/ServiceTable/ServiceTable.tsx
import React, { useState } from 'react';
import { usePagination } from '../../hooks/usePagination';
import { Service } from '../../hooks/useServices';
import ServiceTableRow from './ServiceTableRow';
import ServiceMobileCard from './ServiceMobileCard';
import Pagination from '../Pagination/Pagination';

interface ServiceTableProps {
  services: Service[];
  selectedService: string;
  onServiceSelect: (id: string) => void;
  onDeleteService: (id: string) => void;
  onEditService: (service: Service) => void;
}

const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  selectedService,
  onServiceSelect,
  onDeleteService,
  onEditService,
}) => {
  const [filter] = useState({ search: '', status: 'all' });
  const { currentPage, pageSize, setCurrentPage, setPageSize, getPaginationData } = usePagination(10);

  const filteredServices = services.filter(service => {
    return service.name.toLowerCase().includes(filter.search.toLowerCase());
  });

  const { totalItems, currentItems, startIndex, endIndex } = getPaginationData(filteredServices);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">TÊN DỊCH VỤ</th>
              <th className="w-40 px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((service) => (
                <ServiceTableRow
                  key={service.id}
                  service={service}
                  isSelected={selectedService === service.id}
                  onSelect={onServiceSelect}
                  onDelete={onDeleteService}
                  onEdit={onEditService} // <-- TRUYỀN PROP XUỐNG
                />
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-4 py-12 text-center">
                  <div className="text-gray-500 text-lg font-medium">Không có dịch vụ nào</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-gray-200">
        {currentItems.length > 0 ? (
          currentItems.map((service) => (
            <ServiceMobileCard
              key={service.id}
              service={service}
              isSelected={selectedService === service.id}
              onSelect={onServiceSelect}
              onDelete={onDeleteService}
              onEdit={onEditService} // <-- TRUYỀN PROP XUỐNG
            />
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-500 text-base font-medium">Không có dịch vụ nào</div>
          </div>
        )}
      </div>
      
      {currentItems.length > 0 && (
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
};

export default ServiceTable;