// src/components/ServiceDetailTable/ServiceDetailTable.tsx
import React, { useState, useRef, useMemo } from 'react';
import { Plus, Trash2, Filter, Search, Download, FileDown, Upload, Undo2 } from 'lucide-react';
import { usePagination } from '../../hooks/usePagination';
import { useServiceDetails, ServiceDetail} from '../../hooks/useServiceDetails';
import { brandService } from '../../../../services/brandService'; 

// Import các component con
import Pagination from '../Pagination/Pagination';
import ColumnMenu from '../ColumnMenu/ColumnMenu';
import AddServiceDetailForm from '../Forms/AddServiceDetailForm';
import EditServiceDetailForm from '../Forms/EditServiceDetailForm';
import ServiceDetailTableHeader from './ServiceDetailTableHeader';
import ServiceDetailTableRow from './ServiceDetailTableRow';
import ServiceDetailMobileCard from './ServiceDetailMobileCard';

interface ServiceDetailTableProps {
  serviceId: string;
  serviceName: string;
}

const ServiceDetailTable: React.FC<ServiceDetailTableProps> = ({
  serviceId,
  serviceName
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDetail, setEditingDetail] = useState<ServiceDetail | null>(null); // <-- THÊM MỚI
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [filter, setFilter] = useState({ search: '' });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    serviceDetails,
    isLoading,
    mutating,
    deletedItems,
    selectedRows,
    columnConfig,
    addServiceDetail,
    updateServiceDetail,
    deleteServiceDetail,
    deleteSelected,
    restoreItems,
    fetchServiceDetails,
    toggleColumn,
    handleSelectAll,
    handleSelectRow
  } = useServiceDetails(serviceId);

  const { currentPage, pageSize, setCurrentPage, setPageSize, getPaginationData } = usePagination(10);

  const filteredServiceDetails = useMemo(() => {
    return serviceDetails.filter(detail => {
      const searchLower = filter.search.toLowerCase();
      if (!searchLower) return true;
      return (detail.service_code || '').toLowerCase().includes(searchLower) ||
             (detail.device_type || '').toLowerCase().includes(searchLower) ||
             (detail.name || '').toLowerCase().includes(searchLower);
    });
  }, [serviceDetails, filter.search]);

  const { totalItems, currentItems, startIndex, endIndex } = getPaginationData(filteredServiceDetails);
  const visibleColumns = columnConfig.filter(col => col.visible);

  const handleDeleteSelected = () => {
    if (window.confirm(`Bạn có chắc muốn xóa ${selectedRows.length} mục đã chọn?`)) {
      deleteSelected(selectedRows);
    }
  };

  const handleRestoreTodayData = () => {
    if (window.confirm(`Bạn có chắc muốn khôi phục ${deletedItems.length} mục đã xóa hôm nay?`)) {
      restoreItems();
    }
  };

  // SỬA LỖI EXPORT
  const handleExportExcel = async () => {
    alert(`Đang chuẩn bị xuất Excel cho dịch vụ: ${serviceName}`);
    try {
      const blob = await brandService.exportBrands([serviceId]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chi_tiet_${serviceName}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi xuất Excel.");
    }
  };
  
  // SỬA LỖI TẢI TEMPLATE
  const handleDownloadExcelTemplate = async () => {
    alert(`Đang tải file mẫu...`);
    try {
      const blob = await brandService.exportBrandsTemplate() // Gọi API
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mau_nhap_lieu_dich_vu.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
       console.error(error);
       alert("Lỗi khi tải file mẫu.");
    }
  };

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };
  
  // SỬA LỖI IMPORT
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!window.confirm(`Bạn có chắc muốn nhập file "${file.name}"?`)) {
        if (event.target) event.target.value = '';
        return;
    }

    try {
      const response = await brandService.importBrands(file); // Gọi hàm không cần serviceId
      alert(response.message || `Nhập thành công ${response.imported_count || 0} mục.`);
      fetchServiceDetails(); 
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Lỗi khi nhập file Excel.";
      alert(errorMsg);
    } finally {
      if (event.target) event.target.value = '';
    }
  };
  const handleAddSuccess = () => {
    setShowAddForm(false);
  };
  
  // THÊM MỚI: Hàm xử lý khi sửa thành công
  const handleEditSuccess = () => {
    setEditingDetail(null);
  };
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 mt-6">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-lg lg:text-xl font-bold text-gray-800">
          Chi tiết dịch vụ: "{serviceName}"
        </h2>
        <button 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={16} />
          Thêm sản phẩm
        </button>
      </div>

      {/* 2. Thanh công cụ Desktop (Toolbar) */}
      <div className="hidden lg:flex flex-col sm:flex-row justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg border">
        {selectedRows.length === 0 ? (
          // Chế độ Mặc Định
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Download size={16} /> Xuất Excel
            </button>
            <button onClick={handleDownloadExcelTemplate} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              <FileDown size={16} /> Tải Excel mẫu
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileImport} style={{ display: 'none' }} accept=".xlsx, .xls" />
            <button onClick={handleImportExcel} className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">
              <Upload size={16} /> Nhập Excel
            </button>
            {deletedItems.length > 0 && (
              <button onClick={handleRestoreTodayData} className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                <Undo2 size={16} /> Khôi phục ({deletedItems.length})
              </button>
            )}
          </div>
        ) : (
          // Chế độ Đã Chọn
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleDeleteSelected} disabled={mutating} className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
              <Trash2 size={16} />
              {mutating ? 'Đang xóa...' : `Xóa đã chọn (${selectedRows.length})`}
            </button>
          </div>
        )}
        {/* Tìm kiếm & Cột */}
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    placeholder="Tìm sản phẩm..."
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    className="w-full lg:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
            </div>
            <ColumnMenu
                columnConfig={columnConfig}
                isOpen={showColumnMenu}
                onToggle={setShowColumnMenu}
                onColumnToggle={toggleColumn}
            />
        </div>
      </div>

      {/* 3. Thanh công cụ Mobile */}
      <div className="lg:hidden flex flex-wrap gap-2 mb-4">
        {selectedRows.length === 0 ? (
          <>
            <button 
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <Filter size={16} /> Lọc
            </button>
            <button 
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm"
              onClick={handleImportExcel}
            >
              <Upload size={16} /> Nhập
            </button>
            <button 
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm"
              onClick={handleExportExcel}
            >
              <Download size={16} /> Xuất
            </button>
            {deletedItems.length > 0 && (
              <button 
                className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 border border-purple-300 rounded-lg text-sm"
                onClick={handleRestoreTodayData}
              >
                <Undo2 size={16} /> ({deletedItems.length})
              </button>
            )}
          </>
        ) : (
          <button 
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium"
            onClick={handleDeleteSelected}
            disabled={mutating}
          >
            <Trash2 size={16} />
            {mutating ? 'Đang xóa...' : `Xóa (${selectedRows.length})`}
          </button>
        )}
      </div>
      
      {/* 4. Panel Lọc Mobile */}
      {showMobileFilters && (
        <div className="lg:hidden mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
           <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
           <div className="relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
             <input
               type="text"
               placeholder="Tìm sản phẩm..."
               value={filter.search}
               onChange={(e) => setFilter({ ...filter, search: e.target.value })}
               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
             />
           </div>
        </div>
      )}


      {/* 5. Form Thêm (Modal) */}
      {showAddForm && (
        <AddServiceDetailForm 
          serviceId={serviceId}
          serviceName={serviceName}
          existingProducts={serviceDetails}
          onClose={() => setShowAddForm(false)}
          onAdd={addServiceDetail} 
          onSuccess={handleAddSuccess}
        />
      )}
      
      {/* THÊM MỚI: Form Sửa (Modal) */}
      {editingDetail && (
        <EditServiceDetailForm
          serviceDetail={editingDetail}
          serviceName={serviceName}
          existingProducts={serviceDetails}
          onClose={() => setEditingDetail(null)}
          onUpdate={updateServiceDetail}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* 6. Bảng dữ liệu */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">Đang tải dữ liệu sản phẩm...</div>
        ) : totalItems === 0 ? (
            <div className="p-10 text-center text-gray-500">
                Không tìm thấy sản phẩm nào.
            </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <ServiceDetailTableHeader
                    visibleColumns={visibleColumns}
                    currentItems={currentItems}
                    selectedRows={selectedRows}
                    onSelectAll={handleSelectAll}
                  />
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((detail) => (
                    <ServiceDetailTableRow
                      key={detail.id}
                      detail={detail}
                      visibleColumns={visibleColumns}
                      isSelected={selectedRows.includes(detail.id)}
                      onSelect={handleSelectRow}
                      onDelete={deleteServiceDetail}
                      onEdit={setEditingDetail} // <-- THÊM HÀM GỌI
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden">
              {currentItems.map((detail) => (
                <ServiceDetailMobileCard
                  key={detail.id}
                  detail={detail}
                  isSelected={selectedRows.includes(detail.id)}
                  onSelect={handleSelectRow}
                  onDelete={deleteServiceDetail}
                  onEdit={setEditingDetail} // <-- THÊM HÀM GỌI
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceDetailTable;