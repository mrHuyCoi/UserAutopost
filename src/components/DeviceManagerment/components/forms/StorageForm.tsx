import React from 'react';

interface StorageFormData {
  capacity: string;
  device_info_id?: string;
}

interface StorageFormProps {
  formData: StorageFormData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: 'capacity' | 'device_info_id', value: string) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  deviceInfos?: any[];
  selectedDeviceInfoId?: string;
  disableSubmit?: boolean;
}

export const StorageForm: React.FC<StorageFormProps> = ({
  formData,
  onSubmit,
  onChange,
  onCancel,
  isEditMode = false,
  deviceInfos = [],
  selectedDeviceInfoId = '',
  disableSubmit = false,
}) => {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {isEditMode ? 'Sửa dung lượng' : 'Thêm dung lượng'}
      </h2>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chọn thiết bị <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedDeviceInfoId}
            onChange={(e) => onChange('device_info_id', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            required
            disabled={deviceInfos.length === 0}
          >
            <option value="">{deviceInfos.length === 0 ? 'Đang tải danh sách thiết bị...' : '-- Chọn thiết bị --'}</option>
            {deviceInfos.map((device: any) => (
              <option key={device.id} value={device.id}>
                {device.brand} {device.model}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Dung lượng sẽ được gán cho thiết bị đã chọn</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dung lượng (GB) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.capacity}
            onChange={(e) => onChange('capacity', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập dung lượng (VD: 64, 128, 256, 512)"
            required
            min={1}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={disableSubmit}
            className={`px-6 py-2.5 rounded-lg font-medium transition ${disableSubmit ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            {isEditMode ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </form>
    </div>
  );
};
