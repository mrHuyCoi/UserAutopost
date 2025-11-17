import React from 'react';
import { MessageCircle, Building2, MessageSquare } from 'lucide-react'; // ← Giữ import icons cho empty state
import { Channel, TabType } from '../types/channel';
import { ChannelCard } from './ChannelCard';

interface ChannelListProps {
  channels: Channel[];
  activeTab: TabType;
  onConnect: (channelId: string) => void;
  onDisconnect: (channelId: string) => void;
  onDelete: (channelId: string) => void;
  onAddChannel: () => void;
  onViewMessages?: (channelId: string) => void;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  activeTab,
  onConnect,
  onDisconnect,
  onDelete,
  onAddChannel,
  onViewMessages
}) => {
  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'zalo':
        return 'Chưa có kênh Zalo nào được kết nối';
      case 'zalo-oa':
        return 'Chưa có kênh Zalo OA nào được kết nối';
      case 'messenger':
        return 'Chưa có kênh Messenger nào được kết nối';
      default:
        return 'Chưa có kênh nào được kết nối';
    }
  };

  const getEmptyStateIcon = () => {
    switch (activeTab) {
      case 'zalo':
        return <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />;
      case 'zalo-oa':
        return <Building2 size={64} className="mx-auto text-gray-400 mb-4" />;
      case 'messenger':
        return <MessageSquare size={64} className="mx-auto text-gray-400 mb-4" />;
      default:
        return <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />;
    }
  };

  if (channels.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        {getEmptyStateIcon()}
        <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">{getEmptyStateMessage()}</p>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
          onClick={onAddChannel}
        >
          Thêm kênh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {channels.map((channel) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          onDelete={onDelete}
          onViewMessages={onViewMessages}
        />
      ))}
    </div>
  );
};