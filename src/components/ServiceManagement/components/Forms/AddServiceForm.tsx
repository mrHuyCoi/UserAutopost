// src/components/Forms/AddServiceForm.tsx
import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Service } from '../../../../types/Service';

interface AddServiceFormProps {
  onClose: () => void;
  // SỬA 1: Hàm add giờ trả về Service
  onAddService: (data: Partial<Service>) => Promise<Service>; 
  onSuccess: (newService: Service) => void; // <-- SỬA 2: Thêm prop onSuccess
}

const AddServiceForm: React.FC<AddServiceFormProps> = ({ 
  onClose, 
  onAddService, 
  onSuccess // <-- SỬA 3: Nhận prop
}) => {
  const [serviceName, setServiceName] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null); // Thêm state cho lỗi

  const handleConditionChange = (index: number, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = value;
    setConditions(newConditions);
  };

  const addCondition = () => {
    setConditions([...conditions, '']);
  };

  const removeCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    setConditions(newConditions);
  };

  const handleSubmit = async (e: React.FormEvent) => { // <-- SỬA 4: Thêm e: React.FormEvent
    e.preventDefault(); // Ngăn form submit
    if (!serviceName.trim()) {
      setError('Vui lòng nhập tên dịch vụ.'); // Sửa: Dùng state error
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const finalConditions = conditions.filter(c => c.trim() !== '');

    const newServiceData: Partial<Service> = {
      name: serviceName,
      conditions: finalConditions, 
    };

    try {
      // SỬA 5: Lấy newService
      const newService = await onAddService(newServiceData); 
      onSuccess(newService); // <-- SỬA 6: Gọi onSuccess thay vì onClose
    } catch (err: any) {
      console.error('Lỗi khi thêm dịch vụ:', err);
      setError(err.message || 'Không thể thêm dịch vụ. Vui lòng thử lại.'); // Hiển thị lỗi
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // SỬA 7: Chuyển thành Modal và <form>
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <form 
        onSubmit={handleSubmit} // <-- Thêm onSubmit
        className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-800">
            Thêm dịch vụ mới
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 lg:p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            
            {/* Cột 1: Tên dịch vụ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên dịch vụ *</label>
              <input 
                type="text" 
                placeholder="Nhập tên dịch vụ"
                className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Cột 2: Điều kiện áp dụng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Điều kiện áp dụng</label>
              <div className="space-y-3">
                {conditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Điều kiện ${index + 1}`}
                      className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg text-sm"
                      value={condition}
                      onChange={(e) => handleConditionChange(index, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 flex-shrink-0"
                      aria-label="Xóa điều kiện"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addCondition}
                className="flex items-center gap-2 mt-3 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Plus size={16} />
                Thêm điều kiện
              </button>
            </div>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm mt-4 p-3 bg-red-50 rounded-lg">
                <strong>Lỗi:</strong> {error}
            </div>
          )}
        </div>
        
        {/* Footer: Các nút actions */}
        <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end p-4 bg-gray-50 rounded-b-xl border-t">
          <button 
            type="button"
            className="w-full sm:w-auto px-6 py-3 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button 
            type="submit" // <-- Sửa: Dùng type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu dịch vụ'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddServiceForm;