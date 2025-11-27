import React from 'react';
import { Conversation } from '../types/channel';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: string;
  onConversationSelect: (conversationId: string) => void;
  showChannelFilter?: boolean;
  channelFilter?: 'all' | 'zalo' | 'zalo-oa' | 'messenger';
  onChannelFilterChange?: (filter: 'all' | 'zalo' | 'zalo-oa' | 'messenger') => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  onConversationSelect,
  showChannelFilter = true,
  channelFilter = 'all',
  onChannelFilterChange
}) => {
  return (
    <div className="xl:col-span-1">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {showChannelFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo kênh</label>
            <select 
              value={channelFilter}
              onChange={(e) => onChannelFilterChange?.(e.target.value as 'all' | 'zalo' | 'zalo-oa' | 'messenger')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">Tất cả kênh</option>
              <option value="zalo">Zalo</option>
              <option value="zalo-oa">Zalo OA</option>
              <option value="messenger">Messenger</option>
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Tìm theo tên, số điện thoại..."
          />
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors ${
              activeConversation === conversation.id
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => onConversationSelect(conversation.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  {conversation.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                    {conversation.name}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 truncate">
                    {conversation.preview}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="text-xs text-gray-500">{conversation.time}</div>
                {conversation.unread > 0 && (
                  <div className="bg-blue-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-semibold mt-1">
                    {conversation.unread}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};