// components/ComponentFormModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { Component } from '../types';

interface ComponentFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  isLoading: boolean; // Dùng khi tải data cho 'edit'
  initialData: Component | null;
  onClose: () => void;
  onSubmit: (data: Component) => Promise<void>;
}

// Dữ liệu form rỗng
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
  // State riêng cho images (vì ta dùng textarea)
  const [imageText, setImageText] = useState('');

  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData(initialData);
      // Chuyển mảng images thành chuỗi (mỗi URL một dòng)
      setImageText(initialData.images ? initialData.images.join('\n') : '');
    } else {
      setFormData(emptyComponent);
      setImageText('');
    }
  }, [isOpen, mode, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setImageText(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Chuyển đổi text ảnh về mảng
    const images = imageText.split('\n').map(url => url.trim()).filter(Boolean);
    
    try {
      await onSubmit({ ...formData, images });
    } catch (error) {
      console.error('Lỗi khi submit form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const title = mode === 'add' ? 'Thêm linh kiện mới' : 'Cập nhật linh kiện';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Mã SP"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Tên Sản Phẩm"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Giá Bán Lẻ"
                name="retailPrice"
                type="number"
                value={formData.retailPrice}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Giá Bán Buôn"
                name="wholesalePrice"
                type="number"
                value={formData.wholesalePrice}
                onChange={handleChange}
              />
              <FormInput
                label="Tồn Kho"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Danh Mục"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />
              <FormInput
                label="Thương Hiệu"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              />
              <FormInput
                label="Bảo Hành"
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
              />
              <FormInput
                label="Link Sản Phẩm"
                name="productLink"
                value={formData.productLink}
                onChange={handleChange}
                className="md:col-span-2"
              />
              <FormTextArea
                label="Thuộc Tính"
                name="attribute"
            	  rows={3}
                value={formData.attribute}
                onChange={handleChange}
                className="md:col-span-2"
              />
              <FormTextArea
                label="Mô Tả"
            	  rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="md:col-span-2"
              />
              <FormTextArea
                label="Links Ảnh (mỗi link 1 dòng)"
            	  rows={4}
                name="images"
                value={imageText}
                onChange={handleImageTextChange}
                className="md:col-span-2"
              />
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-blue-400"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Component con cho Input
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; className?: string }> = ({
  label,
  name,
  className,
  ...props
}) => (
  <div className={className}>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={name}
      name={name}
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

// Component con cho TextArea
const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; className?: string }> = ({
  label,
  name,
  className,
  ...props
}) => (
  <div className={className}>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

export default ComponentFormModal;