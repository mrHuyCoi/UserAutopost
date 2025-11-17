import React from 'react';

export const SettingsPanel: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Cài đặt Kênh Kết Nối</h2>
        <p className="text-sm text-gray-600 mt-1">
          Cấu hình các thiết lập chung cho tất cả kênh kết nối
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tên hiển thị</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="Cửa Hàng Điện Thoại ABC"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="https://example.com/avatar.jpg"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tính Năng Kênh Kết Nối</h3>
        
        {[
          { label: 'Tự động phản hồi tin nhắn', description: 'Tự động phản hồi tin nhắn đến từ tất cả kênh', checked: true },
          { label: 'Gửi tin nhắn chào mừng', description: 'Gửi tin nhắn chào mừng khi có khách hàng mới', checked: true },
          { label: 'Chuyển tiếp tin nhắn cho nhân viên', description: 'Chuyển tiếp tin nhắn phức tạp cho nhân viên xử lý', checked: true }
        ].map((setting, index) => (
          <div key={index} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
            <div>
              <div className="font-medium text-gray-800">{setting.label}</div>
              <div className="text-sm text-gray-600 mt-1">{setting.description}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={setting.checked} />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
          Hủy
        </button>
        <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
          Lưu cài đặt
        </button>
      </div>
    </div>
  );
};