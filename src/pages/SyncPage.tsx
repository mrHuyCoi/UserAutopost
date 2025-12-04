import React, { useState } from 'react';
import UrlDevicesTab from '../tabs/UrlDevicesTab';
import UrlComponentsTab from '../tabs/UrlComponentsTab';

const SyncPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'device' | 'component'>('device');

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Đồng bộ dữ liệu</h1>

      {/* TAB HEADER */}
      <div className="flex border-b border-gray-300 mb-6">
        <button
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === 'device'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('device')}
        >
          Đồng bộ thiết bị
        </button>

        <button
          className={`px-6 py-3 font-medium text-sm ${
            activeTab === 'component'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('component')}
        >
          Đồng bộ linh kiện
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'device' && <UrlDevicesTab />}
      {activeTab === 'component' && <UrlComponentsTab />}
    </div>
  );
};

export default SyncPage;
