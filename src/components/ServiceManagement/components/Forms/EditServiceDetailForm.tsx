// src/components/Forms/EditServiceDetailForm.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { ServiceDetail, ServiceDetailCreate, ServiceDetailUpdate } from '../../hooks/useServiceDetails';
import { brandService } from '../../../../services/brandService'; 
import  deviceBrandService  from '../../../../services/deviceBrandService'; 
import  { warrantyService, WarrantyService } from '../../../../services/warrantyService';
import { DeviceBrand } from '../../../../types/deviceBrand'; 

// --- Props ---
interface EditServiceDetailFormProps {
  serviceDetail: ServiceDetail; // Dữ liệu sản phẩm cần sửa
  serviceName: string;
  existingProducts: ServiceDetail[]; 
  onClose: () => void;
  onSuccess: () => void;
  onUpdate: (id: string, data: ServiceDetailUpdate) => Promise<void>;
}

const EditServiceDetailForm: React.FC<EditServiceDetailFormProps> = ({ 
  serviceDetail, 
  serviceName, 
  existingProducts,
  onClose, 
  onSuccess,
  onUpdate
}) => {
  // Form state (Khởi tạo từ prop)
  const [formData, setFormData] = useState<Omit<ServiceDetailCreate, 'service_id'>>({
      name: serviceDetail.name || '',
      device_brand_id: serviceDetail.device_brand_id || '',
      device_type: serviceDetail.device_type || '',
      color: serviceDetail.color || '',
      price: serviceDetail.price || '0',
      wholesale_price: serviceDetail.wholesale_price || '0',
      warranty: serviceDetail.warranty || '0 tháng',
      note: serviceDetail.note || '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === State Dữ Liệu Dropdown (Tải như form Add) ===
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [deviceBrands, setDeviceBrands] = useState<DeviceBrand[]>([]);
  const [warranties, setWarranties] = useState<WarrantyService[]>([]);
  
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);
  const [isLoadingDeviceBrands, setIsLoadingDeviceBrands] = useState(false);
  const [isLoadingWarranties, setIsLoadingWarranties] = useState(false);

  const [isAddingProductType, setIsAddingProductType] = useState(false);
  const [newProductType, setNewProductType] = useState("");
  const [isAddingWarranty, setIsAddingWarranty] = useState(false);
  const [newWarranty, setNewWarranty] = useState("");

  // --- Tải dữ liệu cho các dropdowns (giống hệt form Add) ---
  useEffect(() => {
    const loadProductTypes = async () => {
      setIsLoadingProductTypes(true);
      try {
        const data = await brandService.getUniqueBrandNames(serviceDetail.service_id);
        const names = data.map((item: any) => item.name);
        setProductTypes(names);
      } catch (err) { console.error(err); } 
      finally { setIsLoadingProductTypes(false); }
    };
    loadProductTypes();
  }, [serviceDetail.service_id]);

  useEffect(() => {
    const loadDeviceBrands = async () => {
      setIsLoadingDeviceBrands(true);
      try {
        const response = await deviceBrandService.getDistinctDeviceBrands();
        setDeviceBrands(response || []); 
      } catch (err) { console.error(err); } 
      finally { setIsLoadingDeviceBrands(false); }
    };
    loadDeviceBrands();
  }, []);

  useEffect(() => {
    const loadWarranties = async () => {
      setIsLoadingWarranties(true);
      try {
        const data = await warrantyService.getWarrantyServices();
        setWarranties(data || []);
      } catch (err) { console.error(err); } 
      finally { setIsLoadingWarranties(false); }
    };
    loadWarranties();
  }, []);

  // --- Lọc "Loại máy" và "Màu sắc" (giống hệt form Add) ---
  const availableDeviceTypes = useMemo(() => {
    if (!formData.device_brand_id || !existingProducts) return [];
    const selectedBrand = deviceBrands.find(b => b.id === formData.device_brand_id);
    if (!selectedBrand) return [];
    const types = existingProducts
      .filter(p => p.device_brand_id === selectedBrand.id && p.device_type)
      .map(p => p.device_type as string);
    return [...new Set(types)];
  }, [formData.device_brand_id, existingProducts, deviceBrands]);

  const availableColors = useMemo(() => {
    if (!formData.device_brand_id || !formData.device_type || !existingProducts) return [];
    const colors = existingProducts
      .filter(p => p.device_brand_id === formData.device_brand_id && p.device_type === formData.device_type && p.color)
      .map(p => p.color as string);
    return [...new Set(colors)];
  }, [formData.device_brand_id, formData.device_type, existingProducts]);

  // --- Event Handlers (giống hệt form Add) ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let reset: Partial<ServiceDetailCreate> = {};
    if (name === 'device_brand_id') reset = { device_type: '', color: '' };
    else if (name === 'device_type') reset = { color: '' };
    setFormData(prev => ({ ...prev, ...reset, [name]: value }));
  };
  const handleProductTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '__ADD_NEW__') setIsAddingProductType(true);
    else handleChange(e);
  };
  const handleConfirmNewProductType = () => {
    if (newProductType && !productTypes.includes(newProductType)) {
      setProductTypes(prev => [...prev, newProductType]);
      setFormData(prev => ({ ...prev, name: newProductType }));
    }
    setIsAddingProductType(false);
    setNewProductType("");
  };
  const handleWarrantyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '__ADD_NEW__') setIsAddingWarranty(true);
    else handleChange(e);
  };
  const handleConfirmNewWarranty = async () => {
    if (!newWarranty) {
      setIsAddingWarranty(false);
      return;
    }
    const existing = warranties.find(w => w.value === newWarranty);
    if (existing) {
       setFormData(prev => ({ ...prev, warranty: existing.value }));
       setIsAddingWarranty(false);
       setNewWarranty("");
       return;
    }
    setIsSubmitting(true);
    try {
      const createdWarranty = await warrantyService.createWarrantyService({ value: newWarranty });
      setWarranties(prev => [...prev, createdWarranty]);
      setFormData(prev => ({ ...prev, warranty: createdWarranty.value }));
    } catch (err: any) { setError(`Lỗi tạo bảo hành: ${err.message}`); }
    finally {
      setIsAddingWarranty(false);
      setNewWarranty("");
      setIsSubmitting(false);
    }
  };

  // SỬA: Hàm Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.name || !formData.device_brand_id || !formData.device_type) {
        setError("Tên sản phẩm, Thương hiệu và Loại máy là bắt buộc.");
        setIsSubmitting(false);
        return;
    }

    const payload: ServiceDetailUpdate = {
      ...formData,
      device_brand_id: formData.device_brand_id || undefined,
      color: formData.color || undefined,
      note: formData.note || undefined,
    };

    try {
      await onUpdate(serviceDetail.id, payload); // Gọi hàm onUpdate
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi cập nhật sản phẩm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-800">
            Sửa sản phẩm (dịch vụ "{serviceName}")
          </h3>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Form Body (Cho phép cuộn) */}
        <div className="p-4 lg:p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            {/* Mã DV */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mã DV</label>
              <input type="text" value={serviceDetail.service_code} readOnly className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />
            </div>

            {/* Tên sản phẩm (Loại sản phẩm) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm *</label>
              {isAddingProductType ? (
                <div className="flex gap-1">
                  <input type="text" value={newProductType} onChange={(e) => setNewProductType(e.target.value)} placeholder="Tên loại mới" className="w-full px-3 py-3 lg:py-2 border border-blue-500 rounded-lg text-sm" autoFocus />
                  <button type="button" onClick={handleConfirmNewProductType} className="p-2 bg-blue-600 text-white rounded-lg"><Check size={16}/></button>
                  <button type="button" onClick={() => setIsAddingProductType(false)} className="p-2 bg-gray-200 text-gray-700 rounded-lg"><X size={16}/></button>
                </div>
              ) : (
                <select name="name" value={formData.name} onChange={handleProductTypeChange} className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg text-sm" disabled={isLoadingProductTypes}>
                  <option value="" disabled>{isLoadingProductTypes ? "Đang tải..." : "-- Chọn loại sản phẩm --"}</option>
                  {productTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                  <option value="__ADD_NEW__" className="text-blue-600 font-medium">... Thêm loại mới ...</option>
                </select>
              )}
            </div>

            {/* Thương hiệu (Model) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thương hiệu *</label>
              <select name="device_brand_id" value={formData.device_brand_id} onChange={handleChange} className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg text-sm" disabled={isLoadingDeviceBrands}>
                <option value="" disabled>{isLoadingDeviceBrands ? "Đang tải..." : "-- Chọn thương hiệu --"}</option>
                {deviceBrands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            {/* Loại máy (Datalist) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại máy *</label>
              <input type="text" name="device_type" value={formData.device_type} onChange={handleChange} placeholder={!formData.device_brand_id ? "Chọn thương hiệu trước" : "Nhập hoặc chọn loại máy"} className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg text-sm" disabled={!formData.device_brand_id} list="device-type-list" />
              <datalist id="device-type-list">
                {availableDeviceTypes.map(type => ( <option key={type} value={type} /> ))}
              </datalist>
            </div>

            {/* Màu sắc (Datalist) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc</label>
              <input type="text" name="color" value={formData.color || ''} onChange={handleChange} placeholder={!formData.device_type ? "Chọn loại máy trước" : "Nhập hoặc chọn màu"} className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg text-sm" disabled={!formData.device_type} list="color-list" />
              <datalist id="color-list">
                {availableColors.map(color => ( <option key={color} value={color} /> ))}
              </datalist>
            </div>

            {/* Giá bán lẻ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá bán lẻ</label>
              <input type="text" name="price" value={formData.price} onChange={handleChange} placeholder="0" className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg text-sm" />
            </div>

            {/* Giá bán buôn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá bán buôn</label>
              <input type="text" name="wholesale_price" value={formData.wholesale_price} onChange={handleChange} placeholder="0" className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg text-sm" />
            </div>

            {/* Bảo hành */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bảo hành</label>
              {isAddingWarranty ? (
                 <div className="flex gap-1">
                  <input type="text" value={newWarranty} onChange={(e) => setNewWarranty(e.target.value)} placeholder="VD: 24 tháng" className="w-full px-3 py-3 lg:py-2 border border-blue-500 rounded-lg text-sm" autoFocus />
                  <button type="button" onClick={handleConfirmNewWarranty} className="p-2 bg-blue-600 text-white rounded-lg" disabled={isSubmitting}><Check size={16}/></button>
                  <button type="button" onClick={() => setIsAddingWarranty(false)} className="p-2 bg-gray-200 text-gray-700 rounded-lg" disabled={isSubmitting}><X size={16}/></button>
                </div>
              ) : (
                <select name="warranty" value={formData.warranty} onChange={handleWarrantyChange} className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg text-sm" disabled={isLoadingWarranties}>
                  <option value="" disabled>{isLoadingWarranties ? "Đang tải..." : "-- Chọn bảo hành --"}</option>
                  {warranties.map(w => (
                    <option key={w.id} value={w.value}>{w.value}</option>
                  ))}
                  <option value="__ADD_NEW__" className="text-blue-600 font-medium">... Thêm bảo hành mới ...</option>
                </select>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
            <textarea name="note" value={formData.note || ''} onChange={handleChange} placeholder="Nhập ghi chú (nếu có)" rows={3} className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm" />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">
                <strong>Lỗi:</strong> {error}
            </div>
          )}
        </div>

        {/* Form Actions (Footer) */}
        <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end p-4 bg-gray-50 rounded-b-xl border-t">
          <button type="button" className="w-full sm:w-auto px-6 py-3 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </button>
          <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300" disabled={isSubmitting}>
            {isSubmitting ? 'Đang cập nhật...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditServiceDetailForm;