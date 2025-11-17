// src/components/ServiceDetailTable/ServiceDetailMobileCard.tsx
import React from 'react';
import { Edit, Trash2, Check } from 'lucide-react';
import { ServiceDetail } from '../../hooks/useServiceDetails';

interface ServiceDetailMobileCardProps {
  detail: ServiceDetail;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (detail: ServiceDetail) => void; // <-- THÊM PROP MỚI
}

const ServiceDetailMobileCard: React.FC<ServiceDetailMobileCardProps> = ({
  detail,
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

  const retailPrice = Number(detail.price) || 0;
  const wholesalePrice = Number(detail.wholesale_price) || 0;

  return (
    <div className={`border-b border-gray-200 p-4 ${isSelected ? 'bg-blue-50' : 'bg-white'}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onSelect(detail.id, !isSelected)}
          className={`flex-shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center mt-1 ${
            isSelected 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'border-gray-300'
          }`}
        >
          {isSelected && <Check size={12} />}
        </button>
        
        <div className="flex-1 min-w-0">
          {/* ... (Code render tên, mã, device_type giữ nguyên) ... */}
          
          {/* Prices */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <span className="text-xs text-gray-500">Giá lẻ:</span>
              <div className="text-sm font-semibold text-green-600">
                {retailPrice.toLocaleString()} ₫
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Giá buôn:</span>
              <div className="text-sm font-semibold text-blue-600">
                {wholesalePrice.toLocaleString()} ₫
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              BH: {detail.warranty}
            </span>
            
            <div className="flex gap-1">
              <button 
                className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                onClick={() => onEdit(detail)} // <-- GỌI HÀM SỬA
              >
                <Edit size={14} />
              </button>
              <button 
                className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                onClick={handleDelete}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {detail.note && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              {detail.note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailMobileCard;