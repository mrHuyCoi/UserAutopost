// src/components/Forms/AddServiceDetailForm.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { ServiceDetail, ServiceDetailCreate } from '../../hooks/useServiceDetails';
import { DeviceBrand } from '../../../../types/deviceBrand';
import { warrantyService, WarrantyService } from '../../../../services/warrantyService';
import { brandService } from '../../../../services/brandService';
import deviceBrandService from '../../../../services/deviceBrandService';

interface AddServiceDetailFormProps {
  serviceId: string;
  serviceName: string;
  onClose: () => void;
  onSuccess: () => void;
  onAdd: (data: ServiceDetailCreate) => Promise<void>;
  existingProducts: ServiceDetail[];
}

// Khởi tạo state rỗng
const initialState: Omit<ServiceDetailCreate, 'service_id'> = {
  name: '',
  device_brand_id: '',
  device_type: '',
  color: '',
  price: '0',
  wholesale_price: '0',
  warranty: '0 tháng',
  note: '',
};

const AddServiceDetailForm: React.FC<AddServiceDetailFormProps> = ({ 
  serviceId, 
  serviceName, 
  onClose, 
  onSuccess,
  onAdd,
  existingProducts
}) => {
// Form state
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === State Dữ Liệu Dropdown (Lấy từ API) ===
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [deviceBrands, setDeviceBrands] = useState<DeviceBrand[]>([]);
  const [warranties, setWarranties] = useState<WarrantyService[]>([]);
  
  // === State Tải Dữ Liệu ===
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);
  const [isLoadingDeviceBrands, setIsLoadingDeviceBrands] = useState(false);
  const [isLoadingWarranties, setIsLoadingWarranties] = useState(false);
  // const [isLoadingDeviceTypes, setIsLoadingDeviceTypes] = useState(false); // (Bị comment ra vì đang dùng mock)

  // "Add new" state
  const [isAddingProductType, setIsAddingProductType] = useState(false);
  const [newProductType, setNewProductType] = useState("");
  const [isAddingWarranty, setIsAddingWarranty] = useState(false);
  const [newWarranty, setNewWarranty] = useState("");

 useEffect(() => {
    const loadProductTypes = async () => {
      setIsLoadingProductTypes(true);
      try {
        const data = await brandService.getUniqueBrandNames(serviceId);
        const names = data.map((item: any) => item.name);
        setProductTypes(names);
        if (names.length > 0) {
          setFormData(prev => ({ ...prev, name: names[0] }));
        }
      } catch (err) { console.error(err); } 
      finally { setIsLoadingProductTypes(false); }
    };
    loadProductTypes();
  }, [serviceId]);

  // --- 2. Tải "Thương hiệu" (Model) từ deviceBrandService ---
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

  // --- 3. Tải "Bảo hành" từ warrantyService ---
  useEffect(() => {
    const loadWarranties = async () => {
      setIsLoadingWarranties(true);
      try {
        const data = await warrantyService.getWarrantyServices();
        setWarranties(data || []);
        const defaultWarranty = data.find(w => w.value === '0 tháng') || data[0];
        if (defaultWarranty) {
          setFormData(prev => ({ ...prev, warranty: defaultWarranty.value }));
        }
      } catch (err) { console.error(err); } 
      finally { setIsLoadingWarranties(false); }
    };
    loadWarranties();
  }, []);

  // --- NÂNG CẤP: Lọc "Loại máy" từ danh sách SP hiện có ---
  const availableDeviceTypes = useMemo(() => {
    if (!formData.device_brand_id || !existingProducts) return [];
    
    // Lấy ID thương hiệu được chọn
    const selectedBrand = deviceBrands.find(b => b.id === formData.device_brand_id);
    if (!selectedBrand) return [];

    const types = existingProducts
      // Lọc các SP có 'device_brand_id' khớp (backend của bạn lưu ID)
      .filter(p => p.device_brand_id === selectedBrand.id && p.device_type)
      .map(p => p.device_type as string);
      
    return [...new Set(types)]; // Trả về mảng string unique
  }, [formData.device_brand_id, existingProducts, deviceBrands]);

  // --- NÂNG CẤP: Lọc "Màu sắc" từ danh sách SP hiện có ---
  const availableColors = useMemo(() => {
    if (!formData.device_brand_id || !formData.device_type || !existingProducts) return [];
    
    const colors = existingProducts
      .filter(p => 
        p.device_brand_id === formData.device_brand_id &&
        p.device_type === formData.device_type &&
        p.color
      )
      .map(p => p.color as string);

    return [...new Set(colors)]; // Trả về mảng string unique
  }, [formData.device_brand_id, formData.device_type, existingProducts]);

  // --- Event Handlers ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let reset: Partial<ServiceDetailCreate> = {};
    if (name === 'device_brand_id') {
      reset = { device_type: '', color: '' };
    } else if (name === 'device_type') {
      reset = { color: '' };
    }

    setFormData(prev => ({
      ...prev,
      ...reset,
      [name]: value
    }));
  };

  const handleProductTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '__ADD_NEW__') {
      setIsAddingProductType(true);
    } else {
      handleChange(e);
    }
  };

  const handleConfirmNewProductType = () => {
    if (newProductType && !productTypes.includes(newProductType)) {
      const updatedProductTypes = [...productTypes, newProductType];
      setProductTypes(updatedProductTypes);
      setFormData(prev => ({ ...prev, name: newProductType }));
    }
    setIsAddingProductType(false);
    setNewProductType("");
  };

  const handleWarrantyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '__ADD_NEW__') {
      setIsAddingWarranty(true);
    } else {
      handleChange(e);
    }
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
    } catch (err: any) {
      setError(`Lỗi tạo bảo hành: ${err.message}`);
    } finally {
      setIsAddingWarranty(false);
      setNewWarranty("");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.name || !formData.device_brand_id || !formData.device_type) {
        setError("Tên sản phẩm, Thương hiệu và Loại máy là bắt buộc.");
        setIsSubmitting(false);
        return;
    }

    const payload: ServiceDetailCreate = {
      ...formData,
      service_id: serviceId,
      device_brand_id: formData.device_brand_id || undefined,
      color: formData.color || undefined,
      note: formData.note || undefined,
    };

    try {
      await onAdd(payload);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi thêm sản phẩm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render ---

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 lg:relative lg:inset-auto lg:bg-transparent lg:p-0 lg:mb-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto lg:max-h-none lg:rounded-lg lg:border lg:border-gray-200 lg:bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 lg:relative lg:border-b-0 lg:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-800">
              Thêm sản phẩm cho "{serviceName}"
            </h3>
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 lg:p-0 lg:hover:bg-transparent">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mã DV</label>
              <input type="text" value="(Tự động)" readOnly className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />
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
              <select 
                name="device_brand_id" 
                value={formData.device_brand_id} 
                onChange={handleChange} 
                className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg text-sm"
                disabled={isLoadingDeviceBrands}
              >
                <option value="" disabled>{isLoadingDeviceBrands ? "Đang tải..." : "-- Chọn thương hiệu --"}</option>
                {deviceBrands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            {/* Loại máy (Datalist) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại máy *</label>
              <input 
                type="text" 
                name="device_type"
                value={formData.device_type}
                onChange={handleChange}
                placeholder={!formData.device_brand_id ? "Chọn thương hiệu trước" : "Nhập hoặc chọn loại máy"}
                className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg text-sm"
                disabled={!formData.device_brand_id}
                list="device-type-list"
              />
              <datalist id="device-type-list">
                {availableDeviceTypes.map(type => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>

            {/* Màu sắc (Datalist) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc</label>
              <input 
                type="text" 
                name="color"
                value={formData.color || ''}
                onChange={handleChange}
                placeholder={!formData.device_type ? "Chọn loại máy trước" : "Nhập hoặc chọn màu"}
                className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg text-sm"
                disabled={!formData.device_type}
                list="color-list"
              />
              <datalist id="color-list">
                {availableColors.map(color => (
                  <option key={color} value={color} />
                ))}
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

          {/* Ghi chú */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
            <textarea name="note" value={formData.note || ''} onChange={handleChange} placeholder="Nhập ghi chú (nếu có)" rows={3} className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm" />
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">
                <strong>Lỗi:</strong> {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200">
            <button type="button" className="w-full sm:w-auto px-6 py-3 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </button>
            <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddServiceDetailForm;