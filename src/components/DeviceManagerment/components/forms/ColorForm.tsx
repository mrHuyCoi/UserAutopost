// components/forms/ColorForm.tsx
import React from 'react';

interface ColorFormData {
  name: string;
  hex_code?: string;
}

interface ColorFormProps {
  formData: ColorFormData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  isEditMode?: boolean;
}

export const ColorForm: React.FC<ColorFormProps> = ({
  formData,
  onSubmit,
  onChange,
  onCancel,
  isEditMode = false
}) => {
  const hex = formData.hex_code ?? '#000000';
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {isEditMode ? 'Sửa màu' : 'Thêm màu'}
      </h2>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Tên màu</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập tên màu"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Mã màu</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="hex_code"
                value={hex}
                onChange={onChange}
                className="h-10 w-14 p-1 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="hex_code"
                value={hex}
                onChange={onChange}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            {isEditMode ? 'Cập nhật' : 'Thêm màu'}
          </button>
        </div>
      </form>
    </div>
  );
};
