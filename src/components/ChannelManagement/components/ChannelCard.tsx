import React from 'react';
import { Channel } from '../types/channel';
import { ChannelIcon } from './ChannelIcon';

interface ChannelCardProps {
  channel: Channel;
  onConnect: (channelId: string) => void;
  onDisconnect: (channelId: string) => void;
  onDelete: (channelId: string) => void;
  onViewMessages?: (channelId: string) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  onConnect,
  onDisconnect,
  onDelete,
  onViewMessages
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0 w-full sm:w-auto">
        <ChannelIcon type={channel.type} className="w-8 h-8 sm:w-10 sm:h-10" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">
            {channel.name}
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full ${
              channel.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span>{channel.status === 'connected' ? 'Đã kết nối' : 'Chưa kết nối'}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        {onViewMessages ? (
          <button 
            onClick={() => onViewMessages(channel.id)}
            className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors"
          >
            Tin nhắn
          </button>
        ) : (
          <button className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors">
            Tin nhắn
          </button>
        )}
        {channel.status === 'connected' ? (
          <button 
            onClick={() => onDisconnect(channel.id)}
            className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 sm:px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors"
          >
            Ngắt
          </button>
        ) : (
          <button 
            onClick={() => onConnect(channel.id)}
            className="flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors"
          >
            Kết nối
          </button>
        )}
        <button 
          onClick={() => onDelete(channel.id)}
          className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm font-medium transition-colors"
        >
          Xóa
        </button>
      </div>
    </div>
  );
};