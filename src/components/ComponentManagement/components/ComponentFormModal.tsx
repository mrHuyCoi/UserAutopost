// components/ComponentFormModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Plus, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Component } from '../types';
// Import service
import { productComponentService } from '../../../services/productComponentService';

interface ComponentFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  isLoading: boolean;
  initialData: Component | null;
  onClose: () => void;
  onSubmit: (data: Component) => Promise<void>;
}

interface AttributeItem {
  key: string;
  values: string[]; // Lưu dưới dạng mảng string để dễ xử lý UI
}

const emptyComponent: Component = {
  id: '',
  code: '',
  name: '',
  category: '',
  attribute: '',
  retailPrice: 0,
  wholesalePrice: 0,
  brand: '',
  warranty: '',
  stock: 0,
  description: '',
  images: [],
  productLink: '',
};

const ComponentFormModal: React.FC<ComponentFormModalProps> = ({
  isOpen,
  mode,
  isLoading,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Component>(emptyComponent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageText, setImageText] = useState('');

  // --- State quản lý thuộc tính ---
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeItem[]>([]);
  
  // State chứa dữ liệu từ API getFilterOptions
  const [availableOptions, setAvailableOptions] = useState<{
    keys: string[];
    values: { [key: string]: string[] };
  }>({ keys: [], values: {} });

  // State quản lý việc mở rộng/thu gọn các card thuộc tính
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // State cho việc thêm thuộc tính mới thủ công
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValues, setNewAttrValues] = useState('');

  // Load Filter Options từ API khi mở modal
  useEffect(() => {
    if (isOpen) {
      const fetchOptions = async () => {
        try {
          const res = await productComponentService.getFilterOptions();
          if (res) {
            setAvailableOptions({
              keys: res.property_keys || [],
              values: res.property_values || {}
            });
          }
        } catch (error) {
          console.error("Lỗi lấy filter options:", error);
        }
      };
      fetchOptions();
    }
  }, [isOpen]);

  // Load Data khi Edit
  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData(initialData);
      setImageText(initialData.images ? initialData.images.join('\n') : '');

      try {
        if (initialData.attribute && initialData.attribute.trim() !== '') {
          const parsed = JSON.parse(initialData.attribute);
          if (Array.isArray(parsed)) {
            // Chuẩn hóa dữ liệu về dạng { key, values: [] }
            const formatted = parsed.map((item: any) => ({
              key: item.key,
              values: Array.isArray(item.values) ? item.values : [item.values]
            }));
            setSelectedAttributes(formatted);
          }
        } else {
          setSelectedAttributes([]);
        }
      } catch (e) {
        setSelectedAttributes([]);
      }
    } else {
      setFormData(emptyComponent);
      setImageText('');
      setSelectedAttributes([]);
    }
  }, [isOpen, mode, initialData]);

  // --- Logic Xử Lý Thuộc Tính ---

  // Toggle mở rộng card
  const toggleExpand = (key: string) => {
    setExpandedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Helper: Tìm thuộc tính đã chọn theo key
  const findSelectedAttr = (key: string) => selectedAttributes.find(a => a.key === key);

  // Chọn tất cả giá trị của 1 key
  const handleSelectAll = (key: string) => {
    const allValues = availableOptions.values[key] || [];
    
    setSelectedAttributes(prev => {
      const exists = prev.find(item => item.key === key);
      if (exists) {
        // Nếu đã có, gộp thêm các giá trị chưa có
        const newValues = Array.from(new Set([...exists.values, ...allValues]));
        return prev.map(item => item.key === key ? { ...item, values: newValues } : item);
      } else {
        // Nếu chưa có, thêm mới
        return [...prev, { key, values: allValues }];
      }
    });
  };

  // Toggle chọn 1 giá trị cụ thể
  const handleToggleValue = (key: string, value: string) => {
    setSelectedAttributes(prev => {
      const existingAttr = prev.find(item => item.key === key);
      
      if (existingAttr) {
        // Đã có key này
        const valueExists = existingAttr.values.includes(value);
        let newValues;
        
        if (valueExists) {
          // Bỏ chọn
          newValues = existingAttr.values.filter(v => v !== value);
        } else {
          // Chọn thêm
          newValues = [...existingAttr.values, value];
        }

        if (newValues.length === 0) {
          // Nếu không còn giá trị nào, xóa luôn key khỏi danh sách chọn
          return prev.filter(item => item.key !== key);
        }

        return prev.map(item => item.key === key ? { ...item, values: newValues } : item);
      } else {
        // Chưa có key này, tạo mới
        return [...prev, { key, values: [value] }];
      }
    });
  };

  // Xóa toàn bộ key khỏi danh sách đã chọn
  const handleRemoveAttribute = (key: string) => {
    setSelectedAttributes(prev => prev.filter(item => item.key !== key));
  };

  // Thêm thuộc tính thủ công (custom)
  const handleAddCustomAttribute = () => {
    if (!newAttrKey.trim()) return;
    
    const valuesArray = newAttrValues.split(',').map(v => v.trim()).filter(Boolean);
    
    setSelectedAttributes(prev => {
      const existing = prev.find(p => p.key === newAttrKey);
      if (existing) {
        const mergedValues = Array.from(new Set([...existing.values, ...valuesArray]));
        return prev.map(p => p.key === newAttrKey ? { ...p, values: mergedValues } : p);
      }
      return [...prev, { key: newAttrKey, values: valuesArray }];
    });

    setIsAddingNew(false);
    setNewAttrKey('');
    setNewAttrValues('');
  };

  // --- Submit Form ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const images = imageText.split('\n').map(url => url.trim()).filter(Boolean);
    
    // Convert về chuỗi JSON chuẩn
    const attributeJsonString = JSON.stringify(selectedAttributes);
    
    try {
      await onSubmit({ 
        ...formData, 
        images,
        attribute: attributeJsonString
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{mode === 'add' ? 'Thêm linh kiện' : 'Cập nhật linh kiện'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Các Input cơ bản giữ nguyên */}
              <FormInput label="Mã SP" name="code" value={formData.code} onChange={handleChange} required />
              <FormInput label="Tên Sản Phẩm" name="name" value={formData.name} onChange={handleChange} required />
              <FormInput label="Giá Bán Lẻ" name="retailPrice" type="number" value={formData.retailPrice} onChange={handleChange} required />
              <FormInput label="Giá Bán Buôn" name="wholesalePrice" type="number" value={formData.wholesalePrice} onChange={handleChange} />
              <FormInput label="Tồn Kho" name="stock" type="number" value={formData.stock} onChange={handleChange} required />
              <FormInput label="Danh Mục" name="category" value={formData.category} onChange={handleChange} />
              <FormInput label="Thương Hiệu" name="brand" value={formData.brand} onChange={handleChange} />
              <FormInput label="Bảo Hành" name="warranty" value={formData.warranty} onChange={handleChange} />
              <FormInput label="Link Sản Phẩm" name="productLink" value={formData.productLink} onChange={handleChange} className="md:col-span-2" />
              
              {/* --- PHẦN UI THUỘC TÍNH MỚI (Giống hình ảnh) --- */}
              <div className="md:col-span-2 space-y-4 mt-2">
                <label className="block text-sm font-medium text-gray-700">Thuộc tính</label>
                
                {/* 1. Thuộc tính đã chọn */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Thuộc tính đã chọn</p>
                  
                  {selectedAttributes.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Chưa chọn thuộc tính nào</p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {selectedAttributes.map((attr, idx) => (
                        <div key={idx} className="relative bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg min-w-[150px]">
                          <div className="flex justify-between items-start">
                            <span className="font-semibold uppercase text-sm">{attr.key}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveAttribute(attr.key)}
                              className="text-blue-400 hover:text-blue-600"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div className="text-xs mt-1 text-blue-600">
                            {attr.values.length} giá trị: {attr.values.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Chọn thuộc tính (List Accordion) */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Chọn thuộc tính có sẵn</p>
                  
                  {availableOptions.keys.map((key) => {
                    const isExpanded = expandedKeys.includes(key);
                    const valuesList = availableOptions.values[key] || [];
                    const selectedForThisKey = findSelectedAttr(key)?.values || [];
                    const isFullSelected = valuesList.length > 0 && valuesList.every(v => selectedForThisKey.includes(v));

                    return (
                      <div key={key} className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-sm">
                        <div className="flex items-center justify-between p-3 bg-white">
                          <span className="font-medium text-gray-800 ml-2">{key}</span>
                          
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleSelectAll(key)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 flex items-center gap-1"
                            >
                              <Check size={12} /> Chọn tất cả
                            </button>
                            <button 
                              type="button"
                              onClick={() => toggleExpand(key)}
                              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                            >
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                          </div>
                        </div>

                        {/* Dropdown values */}
                        {isExpanded && (
                          <div className="p-3 border-t border-gray-100 bg-gray-50 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {valuesList.map((val) => {
                              const isChecked = selectedForThisKey.includes(val);
                              return (
                                <label key={val} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white rounded transition">
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked}
                                    onChange={() => handleToggleValue(key, val)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                  />
                                  <span className={`text-sm ${isChecked ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                                    {val}
                                  </span>
                                </label>
                              );
                            })}
                            {valuesList.length === 0 && (
                                <span className="text-xs text-gray-500 italic col-span-3">Không có giá trị gợi ý sẵn.</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 3. Button Thêm thuộc tính mới (Dashed Border) */}
                {!isAddingNew ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(true)}
                    className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition flex items-center justify-center gap-2 font-medium"
                  >
                    <Plus size={20} /> Thêm thuộc tính mới
                  </button>
                ) : (
                  <div className="bg-white p-4 rounded-lg border border-blue-200 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <input 
                        placeholder="Tên thuộc tính (VD: Dung lượng pin)" 
                        className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newAttrKey}
                        onChange={e => setNewAttrKey(e.target.value)}
                        autoFocus
                      />
                      <input 
                        placeholder="Giá trị (VD: 5000mAh, 4000mAh)" 
                        className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newAttrValues}
                        onChange={e => setNewAttrValues(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setIsAddingNew(false)}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                      >
                        Hủy
                      </button>
                      <button 
                        type="button"
                        onClick={handleAddCustomAttribute}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Thêm vào danh sách
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* -------------------------------------- */}

              <FormTextArea label="Mô Tả" rows={3} name="description" value={formData.description} onChange={handleChange} className="md:col-span-2" />
              <FormTextArea label="Links Ảnh (mỗi link 1 dòng)" rows={4} name="images" value={imageText} onChange={e => setImageText(e.target.value)} className="md:col-span-2" />
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-white sticky bottom-0">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Lưu lại
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Component con giữ nguyên
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }> = ({ label, name, className, ...props }) => (
  <div className={className}>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label} {props.required && <span className="text-red-500">*</span>}</label>
    <input id={name} name={name} {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>
);

const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; className?: string }> = ({ label, name, className, ...props }) => (
  <div className={className}>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea id={name} name={name} {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
  </div>
);

export default ComponentFormModal;