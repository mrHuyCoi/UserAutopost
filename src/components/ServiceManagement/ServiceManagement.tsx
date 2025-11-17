// src/pages/ServiceManagement.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Menu, X, Grid3X3, List } from 'lucide-react';
import { useServices, Service } from './hooks/useServices';
import ServiceTable from './components/ServiceTable/ServiceTable';
import ServiceDetailTable from './components/ServiceDetailTable/ServiceDetailTable';
import AddServiceForm from './components/Forms/AddServiceForm';
import EditServiceForm from './components/Forms/EditServiceForm';
import ServiceGrid from './components/ServiceTable/ServiceGrid';

const ServiceManagement: React.FC = () => {
  // State của trang
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null); 
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Dùng hook
  const {
    services,
    loading: servicesLoading,
    deleteService,
    addService,
    updateService
  } = useServices();

  // Tự động chọn service đầu tiên khi tải xong
  useEffect(() => {
    if (!selectedService && services.length > 0) {
      setSelectedService(services[0].id);
    }
  }, [services, selectedService]);

  const selectedServiceData = services.find(service => service.id === selectedService);

  // Hàm làm mới
  const handleDeleteService = async (id: string) => {
    await deleteService(id);
    // Nếu service bị xóa là service đang chọn, hãy bỏ chọn nó
    if (selectedService === id) {
        setSelectedService(null);
    }
  };

  const handleAddServiceSuccess = (newService: Service) => {
      setShowAddServiceForm(false);
      setSelectedService(newService.id); 
  };
  
  const handleEditServiceSuccess = () => {
    setEditingService(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-6">
        
        {/* Desktop Header */}
        <div className="hidden lg:flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý Dịch vụ <span className="text-base font-normal text-gray-500">({services.length} dịch vụ)</span>
            </h1>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              >
                <List size={14} /> Danh sách
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              >
                <Grid3X3 size={14} /> Lưới
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              onClick={() => setShowAddServiceForm(true)}
            >
              <Plus size={16} />
              Thêm dịch vụ mới
            </button>
          </div>
        </div>
        {/* Services Display (List hoặc Grid) */}
        {servicesLoading ? (
          <div className="text-center p-10">Đang tải danh sách dịch vụ...</div>
        ) : viewMode === 'list' ? (
          <ServiceTable
            services={services}
            selectedService={selectedService || ''}
            onServiceSelect={setSelectedService}
            onDeleteService={handleDeleteService}
            onEditService={setEditingService}
          />
        ) : (
          <ServiceGrid
            services={services}
            selectedService={selectedService || ''}
            onServiceSelect={setSelectedService}
            onDeleteService={handleDeleteService}
            onEditService={setEditingService}
          />
        )}

        {/* Form Thêm Dịch Vụ MỚI (Modal) */}
        {showAddServiceForm && (
          <AddServiceForm 
            onClose={() => setShowAddServiceForm(false)} 
            onAddService={addService} 
            onSuccess={handleAddServiceSuccess}
          />
        )}
        
        {/* THÊM MỚI: Form Sửa Dịch Vụ (Modal) */}
        {editingService && (
            <EditServiceForm
                service={editingService}
                onClose={() => setEditingService(null)}
                onSuccess={handleEditServiceSuccess}
                onUpdate={updateService}
            />
        )}

        {/* Service Detail Section */}
        {selectedService && (
          <ServiceDetailTable
            key={selectedService} 
            serviceId={selectedService}
            serviceName={selectedServiceData?.name || ''}
          />
        )}
      </div>
    </div>
  );
};

export default ServiceManagement;