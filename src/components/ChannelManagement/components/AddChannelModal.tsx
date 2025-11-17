import React, { useState } from 'react';
import { Channel } from '../types/channel';
import { getChannelIcon } from '../utils/channelHelpers';

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChannel: (channel: Channel) => void;
}

export const AddChannelModal: React.FC<AddChannelModalProps> = ({
  isOpen,
  onClose,
  onAddChannel
}) => {
  const [selectedChannelType, setSelectedChannelType] = useState<'zalo' | 'zalo-oa' | 'messenger' | ''>('');
  const [channelName, setChannelName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');

  const handleConnect = () => {
    if (!selectedChannelType || !channelName) return;

    const newChannel: Channel = {
      id: `${selectedChannelType}-${Date.now()}`,
      name: channelName,
      type: selectedChannelType,
      status: 'disconnected',
      ...(selectedChannelType === 'zalo' && { phone })
    };

    onAddChannel(newChannel);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedChannelType('');
    setChannelName('');
    setPhone('');
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Thêm Kênh Kết Nối Mới</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 mb-6">
            {[
              { type: 'zalo', label: 'Zalo Cá Nhân', description: 'Kết nối tài khoản Zalo cá nhân' },
              { type: 'zalo-oa', label: 'Zalo OA', description: 'Kết nối Zalo Official Account' },
              { type: 'messenger', label: 'Messenger', description: 'Kết nối Facebook Messenger' }
            ].map((channel) => (
              <div
                key={channel.type}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedChannelType === channel.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedChannelType(channel.type as any)}
              >
                <div className="flex items-center space-x-4">
                  {getChannelIcon(channel.type as any)}
                  <div>
                    <div className="font-semibold text-gray-800">{channel.label}</div>
                    <div className="text-sm text-gray-600">{channel.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedChannelType && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên kênh</label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên kênh"
                />
              </div>

              {selectedChannelType === 'zalo' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại Zalo</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số điện thoại Zalo"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả (tùy chọn)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Nhập mô tả kênh"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConnect}
            disabled={!selectedChannelType || !channelName}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            Kết nối
          </button>
        </div>
      </div>
    </div>
  );
};