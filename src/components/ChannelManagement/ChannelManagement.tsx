import React, { useState, useMemo, useEffect } from 'react';
import { Plus, RefreshCw, ArrowLeft } from 'lucide-react';
import { TabType, Conversation, Message } from './types/channel';
import { useChannels } from './hooks/useChannels';
import { useFAQ } from './hooks/useFAQ';
import { ChannelList } from './components/ChannelList';
import { ConversationList } from './components/ConversationList';
import { ChatArea } from './components/ChatArea';
import { SettingsPanel } from './components/SettingsPanel';
import { AddChannelModal } from './components/AddChannelModal';
import { QRModal } from './components/QRModal';
import { AddFAQModal } from './components/AddFAQModal';
import { useZaloSessions } from './hooks/useZaloSessions';
import { useZaloConversations } from './hooks/useZaloConversations';
import { useZaloOAConversations } from './hooks/useZaloOAConversations';
import { useMessengerConversations } from './hooks/useMessengerConversations';
import {
  mapZaloConversationToConversation,
  mapZaloOAConversationToConversation,
  mapFBConversationToConversation,
} from './utils/apiDataMapper';

const ChannelManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('zalo');
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);
  const [viewMode, setViewMode] = useState<'channels' | 'conversations'>('channels');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const {
    channels,
    refresh,
    connectedCount,
    addChannel,
    deleteChannel,
    updateChannelStatus
  } = useChannels();
  const zalo = useZaloSessions();
  const filteredChannels = channels.filter(c => c.type === activeTab);

  const {
    selectedMessage,
    setSelectedMessage,
    addFAQItem
  } = useFAQ();

  // Get selected channel info
  const selectedChannel = useMemo(() => {
    if (!selectedChannelId) return null;
    return channels.find(c => c.id === selectedChannelId);
  }, [selectedChannelId, channels]);

  // Extract account IDs from selected channels
  const zaloAccountId = useMemo(() => {
    if (selectedChannel?.type === 'zalo' && selectedChannel.phone) {
      return selectedChannel.phone;
    }
    return undefined;
  }, [selectedChannel]);

  const zaloOAAccountId = useMemo(() => {
    if (selectedChannel?.type === 'zalo-oa') {
      // Extract account ID from channel ID (format: zalo-oa-{accountId})
      const match = selectedChannel.id.match(/^zalo-oa-(.+)$/);
      return match ? match[1] : undefined;
    }
    return undefined;
  }, [selectedChannel]);

  // Hooks for fetching conversations and messages from API
  const zaloConversationsHook = useZaloConversations(zaloAccountId);
  const zaloOAConversationsHook = useZaloOAConversations(zaloOAAccountId);
  const messengerConversationsHook = useMessengerConversations();

  // Set active Messenger page when channel is selected
  useEffect(() => {
    if (selectedChannel?.type === 'messenger' && selectedChannel.phone) {
      const page = messengerConversationsHook.pages.find(p => p.account_id === selectedChannel.phone);
      if (page && messengerConversationsHook.activePage?.account_id !== page.account_id) {
        messengerConversationsHook.setActivePage(page);
      }
    }
  }, [selectedChannel, messengerConversationsHook.pages, messengerConversationsHook.activePage, messengerConversationsHook]);

  // Map API data to Conversation format for Zalo
  const zaloConversations = useMemo<Conversation[]>(() => {
    if (!zaloAccountId || !zaloConversationsHook.conversations.length) return [];
    
    return zaloConversationsHook.conversations.map(conv => {
      // Get messages for this conversation if it's active
      const messages = conv.conversation_id === zaloConversationsHook.active?.conversation_id
        ? zaloConversationsHook.messages
        : [];
      
      return mapZaloConversationToConversation(conv, messages);
    });
  }, [zaloAccountId, zaloConversationsHook.conversations, zaloConversationsHook.active, zaloConversationsHook.messages]);

  // Map API data to Conversation format for Zalo OA
  const zaloOAConversations = useMemo<Conversation[]>(() => {
    if (!zaloOAAccountId || !zaloOAConversationsHook.conversations.length) return [];
    
    return zaloOAConversationsHook.conversations.map(conv => {
      // Get messages for this conversation if it's active
      const messages = conv.conversation_id === zaloOAConversationsHook.activeConversationId
        ? zaloOAConversationsHook.messages
        : [];
      
      return mapZaloOAConversationToConversation(conv, messages);
    });
  }, [zaloOAAccountId, zaloOAConversationsHook.conversations, zaloOAConversationsHook.activeConversationId, zaloOAConversationsHook.messages]);

  // Map API data to Conversation format for Messenger
  const messengerConversations = useMemo<Conversation[]>(() => {
    if (!messengerConversationsHook.convs.length) return [];
    
    const pageId = messengerConversationsHook.activePage?.account_id;
    
    return messengerConversationsHook.convs.map(conv => {
      // Get messages for this conversation if it's active
      const messages = conv.id === messengerConversationsHook.activeConvId
        ? messengerConversationsHook.msgs
        : [];
      
      return mapFBConversationToConversation(conv, messages, pageId);
    });
  }, [messengerConversationsHook.convs, messengerConversationsHook.activeConvId, messengerConversationsHook.msgs, messengerConversationsHook.activePage]);

  // Legacy mock data removed - now using API data

  // Active conversation IDs - sync with hooks
  const activeZaloConversation = useMemo(() => {
    return zaloConversationsHook.active?.conversation_id || zaloConversationsHook.active?.thread_id || zaloConversationsHook.active?.peer_id || '';
  }, [zaloConversationsHook.active]);

  const getActiveZaloConversation = () => {
    if (!zaloConversationsHook.active) return undefined;
    return zaloConversations.find(conv => {
      const convId = zaloConversationsHook.active?.conversation_id || zaloConversationsHook.active?.thread_id || zaloConversationsHook.active?.peer_id;
      return conv.id === convId;
    });
  };

  const sendZaloMessage = async (_conversationId: string, messageText: string) => {
    if (!messageText.trim() || !zaloConversationsHook.active) return;

    try {
      const threadId = zaloConversationsHook.active.thread_id;
      if (!threadId) {
        console.error('No thread_id found for conversation');
        return;
      }

      await zaloConversationsHook.sendText(messageText);
    } catch (error) {
      console.error('Error sending Zalo message:', error);
      // Error is already handled in the hook
    }
  };

  // Active Zalo OA conversation
  const activeZaloOAConversation = useMemo(() => {
    return zaloOAConversationsHook.activeConversationId || '';
  }, [zaloOAConversationsHook.activeConversationId]);

  const getActiveZaloOAConversation = () => {
    if (!zaloOAConversationsHook.activeConversationId) return undefined;
    return zaloOAConversations.find(conv => conv.id === zaloOAConversationsHook.activeConversationId);
  };

  const sendZaloOAMessage = async (_conversationId: string, messageText: string) => {
    if (!messageText.trim() || !zaloOAConversationsHook.activeConversationId) return;

    try {
      await zaloOAConversationsHook.sendText(zaloOAConversationsHook.activeConversationId, messageText);
    } catch (error) {
      console.error('Error sending Zalo OA message:', error);
      // Error is already handled in the hook
    }
  };

  // Active Messenger conversation
  const activeMessengerConversation = useMemo(() => {
    return messengerConversationsHook.activeConvId || '';
  }, [messengerConversationsHook.activeConvId]);

  const getActiveMessengerConversation = () => {
    if (!messengerConversationsHook.activeConvId) return undefined;
    return messengerConversations.find(conv => conv.id === messengerConversationsHook.activeConvId);
  };

  const sendMessengerMessage = async (_conversationId: string, messageText: string) => {
    if (!messageText.trim() || !messengerConversationsHook.activePage?.account_id) return;

    try {
      // Get PSID from active conversation
      const psid = messengerConversationsHook.psidOfActive;
      if (!psid) {
        console.error('No PSID found for conversation');
        return;
      }

      await messengerConversationsHook.sendText(psid, messageText);
    } catch (error) {
      console.error('Error sending Messenger message:', error);
      // Error is already handled in the hook
    }
  };

  // All conversations for "Hội thoại" tab (merged from all channels)
  const allConversations = useMemo(() => {
    return [
      ...zaloConversations,
      ...zaloOAConversations,
      ...messengerConversations
    ];
  }, [zaloConversations, zaloOAConversations, messengerConversations]);

  const [activeAllConversation, setActiveAllConversation] = useState<string>('');

  const getActiveAllConversation = () => {
    return allConversations.find(conv => conv.id === activeAllConversation);
  };

  const sendMessageToAllConversation = (conversationId: string, messageText: string) => {
    const conversation = allConversations.find(conv => conv.id === conversationId);
    if (!conversation) return;

    // Determine channel type and call appropriate send function
    if (conversation.channel === 'zalo') {
      sendZaloMessage(conversationId, messageText);
    } else if (conversation.channel === 'zalo-oa') {
      sendZaloOAMessage(conversationId, messageText);
    } else if (conversation.channel === 'messenger') {
      sendMessengerMessage(conversationId, messageText);
    }
  };

  const handleConnectChannel = (channelId: string) => {
    if (activeTab === 'zalo') {
      // setShowQrModal(true);
      // setConnectionStatus('waiting');
      
      zalo.connectViaQR();
    } else {
      updateChannelStatus(channelId, 'connected');
    }
  };

  const handleAddToFAQ = (message: Message) => {
    setSelectedMessage(message);
  };

  const handleSaveFAQ = (question: string, answer: string, category: string) => {
    let activeConv: Conversation | undefined;
    if (viewMode === 'conversations' && selectedChannel) {
      if (selectedChannel.type === 'zalo') {
        activeConv = getActiveZaloConversation();
      } else if (selectedChannel.type === 'zalo-oa') {
        activeConv = getActiveZaloOAConversation();
      } else if (selectedChannel.type === 'messenger') {
        activeConv = getActiveMessengerConversation();
      }
    } else if (activeTab === 'conversations') {
      activeConv = getActiveAllConversation();
    }
    const source = `Tin nhắn từ ${activeConv?.name}`;
    addFAQItem(question, answer, category, source);
  };

  const handleViewMessages = (channelId: string) => {
    setSelectedChannelId(channelId);
    setViewMode('conversations');
  };

  const handleBackToChannels = () => {
    setViewMode('channels');
    setSelectedChannelId(null);
  };

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    // Reset view mode when switching to a different tab
    if (!['zalo', 'zalo-oa', 'messenger'].includes(tabId) || viewMode === 'conversations') {
      setViewMode('channels');
      setSelectedChannelId(null);
    }
  };

  // Get conversations based on channel type
  const getConversationsByChannelType = (channelType: 'zalo' | 'zalo-oa' | 'messenger') => {
    switch (channelType) {
      case 'zalo':
        return zaloConversations;
      case 'zalo-oa':
        return zaloOAConversations;
      case 'messenger':
        return messengerConversations;
      default:
        return [];
    }
  };

  // Get active conversation based on channel type
  const getActiveConversationByChannelType = (channelType: 'zalo' | 'zalo-oa' | 'messenger') => {
    switch (channelType) {
      case 'zalo':
        return getActiveZaloConversation();
      case 'zalo-oa':
        return getActiveZaloOAConversation();
      case 'messenger':
        return getActiveMessengerConversation();
      default:
        return undefined;
    }
  };

  // Get active conversation ID based on channel type
  const getActiveConversationIdByChannelType = (channelType: 'zalo' | 'zalo-oa' | 'messenger') => {
    switch (channelType) {
      case 'zalo':
        return activeZaloConversation;
      case 'zalo-oa':
        return activeZaloOAConversation;
      case 'messenger':
        return activeMessengerConversation;
      default:
        return '';
    }
  };

  // Set active conversation based on channel type
  const setActiveConversationByChannelType = (channelType: 'zalo' | 'zalo-oa' | 'messenger', conversationId: string) => {
    switch (channelType) {
      case 'zalo': {
        // Find the conversation in the hook's conversations list
        const conv = zaloConversationsHook.conversations.find(c => 
          c.conversation_id === conversationId || c.thread_id === conversationId || c.peer_id === conversationId
        );
        if (conv) {
          zaloConversationsHook.setActive(conv);
        }
        break;
      }
      case 'zalo-oa':
        zaloOAConversationsHook.setActiveConversationId(conversationId);
        break;
      case 'messenger':
        messengerConversationsHook.selectConversation(conversationId);
        break;
    }
  };

  // Send message based on channel type
  const sendMessageByChannelType = (channelType: 'zalo' | 'zalo-oa' | 'messenger', conversationId: string, messageText: string) => {
    switch (channelType) {
      case 'zalo':
        sendZaloMessage(conversationId, messageText);
        break;
      case 'zalo-oa':
        sendZaloOAMessage(conversationId, messageText);
        break;
      case 'messenger':
        sendMessengerMessage(conversationId, messageText);
        break;
    }
  };

  // Get channel label for back button
  const getChannelLabel = (channelType: 'zalo' | 'zalo-oa' | 'messenger') => {
    switch (channelType) {
      case 'zalo':
        return 'Kênh Zalo';
      case 'zalo-oa':
        return 'Kênh Zalo OA';
      case 'messenger':
        return 'Kênh Messenger';
      default:
        return 'Kênh';
    }
  };

  const tabs = [
    { id: 'zalo', label: 'Zalo' },
    { id: 'zalo-oa', label: 'Zalo OA' },
    { id: 'messenger', label: 'Messenger' },
    { id: 'conversations', label: 'Hội thoại' },
    { id: 'settings', label: 'Cài đặt' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto pb-20 sm:pb-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                Quản lý Kênh Kết Nối
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {connectedCount} kênh đã kết nối
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                className="flex items-center justify-center gap-1 sm:gap-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none min-w-0"
                onClick={() => setShowAddChannelModal(true)}
              >
                <Plus size={14} className="sm:w-4 sm:h-4" />
                <span className="truncate">Thêm kênh</span>
              </button>
              <button
                onClick={refresh}
                className="flex items-center justify-center gap-1 sm:gap-2 bg-white hover:bg-gray-50 text-gray-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-gray-300 transition-colors flex-1 sm:flex-none min-w-0"
              >
                <RefreshCw size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Làm mới</span>
                <span className="sm:hidden">Mới</span>
              </button>
            </div>
          </div>

          {/* Tabs - Better responsive */}
          <div className="border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
            <div className="flex min-w-max pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => handleTabChange(tab.id as TabType)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 min-h-[500px]">
            {/* Conversation View for all channel types */}
            {viewMode === 'conversations' && selectedChannel && ['zalo', 'zalo-oa', 'messenger'].includes(selectedChannel.type) && (
              <div>
                {/* Header with Back Button */}
                <div className="mb-4 sm:mb-6">
                  <button
                    onClick={handleBackToChannels}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                  >
                    <ArrowLeft size={20} />
                    <span className="text-sm sm:text-base font-medium">Quay lại {getChannelLabel(selectedChannel.type)}</span>
                  </button>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">
                        Tin nhắn - {selectedChannel.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Quản lý tin nhắn từ kênh {selectedChannel.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conversation List and Chat Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-1">
                    <ConversationList
                      conversations={getConversationsByChannelType(selectedChannel.type)}
                      activeConversation={getActiveConversationIdByChannelType(selectedChannel.type)}
                      onConversationSelect={(id) => setActiveConversationByChannelType(selectedChannel.type, id)}
                      showChannelFilter={false}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    {getActiveConversationByChannelType(selectedChannel.type) ? (
                      <ChatArea
                        conversation={getActiveConversationByChannelType(selectedChannel.type)!}
                        onSendMessage={(message) => sendMessageByChannelType(selectedChannel.type, getActiveConversationIdByChannelType(selectedChannel.type), message)}
                        onAddToFAQ={handleAddToFAQ}
                      />
                    ) : (
                      <div className="h-[400px] sm:h-[500px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-center text-gray-500">
                          <p className="text-sm">Chọn một cuộc hội thoại để xem tin nhắn</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Channel Tabs */}
            {viewMode === 'channels' && ['zalo', 'zalo-oa', 'messenger'].includes(activeTab) && (
              <div>
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">
                    {activeTab === 'zalo' && 'Kênh Zalo'}
                    {activeTab === 'zalo-oa' && 'Kênh Zalo OA'}
                    {activeTab === 'messenger' && 'Kênh Messenger'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {activeTab === 'zalo' && 'Quản lý các tài khoản Zalo kết nối với hệ thống chatbot'}
                    {activeTab === 'zalo-oa' && 'Quản lý các tài khoản Zalo Official Account kết nối với hệ thống chatbot'}
                    {activeTab === 'messenger' && 'Quản lý các trang Facebook kết nối với hệ thống chatbot qua Messenger'}
                  </p>
                </div>

                <ChannelList
                  channels={filteredChannels}
                  activeTab={activeTab}
                  onConnect={handleConnectChannel}
                  onDisconnect={(channelId) => updateChannelStatus(channelId, 'disconnected')}
                  onDelete={deleteChannel}
                  onAddChannel={() => setShowAddChannelModal(true)}
                  onViewMessages={handleViewMessages}
                />
              </div>
            )}

            {/* Conversations Tab - Shows all conversations from all channels */}
            {viewMode === 'channels' && activeTab === 'conversations' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-1">
                  <ConversationList
                    conversations={allConversations}
                    activeConversation={activeAllConversation}
                    onConversationSelect={setActiveAllConversation}
                  />
                </div>
                <div className="lg:col-span-2">
                  {getActiveAllConversation() ? (
                    <ChatArea
                      conversation={getActiveAllConversation()!}
                      onSendMessage={(message) => sendMessageToAllConversation(activeAllConversation, message)}
                      onAddToFAQ={handleAddToFAQ}
                    />
                  ) : (
                    <div className="h-[400px] sm:h-[500px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-center text-gray-500">
                        <p className="text-sm">Chọn một cuộc hội thoại để xem tin nhắn</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {viewMode === 'channels' && activeTab === 'settings' && <SettingsPanel />}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddChannelModal
        isOpen={showAddChannelModal}
        onClose={() => setShowAddChannelModal(false)}
        onAddChannel={addChannel}
      />

      <QRModal
        isOpen={zalo.qr.open}
        connectionStatus={zalo.qr.phase === 'connected' ? 'connected' : 'waiting'}
        onClose={zalo.qr.close}
        onConnectionComplete={refresh}
        image={zalo.qr.image}
        phase={zalo.qr.phase}
        messageHint={zalo.qr.msg || undefined}
      />

      <AddFAQModal
        isOpen={!!selectedMessage}
        message={selectedMessage}
        conversation={viewMode === 'conversations' && selectedChannel
          ? getActiveConversationByChannelType(selectedChannel.type)
          : activeTab === 'conversations'
          ? getActiveAllConversation()
          : undefined}
        onClose={() => setSelectedMessage(null)}
        onSave={handleSaveFAQ}
      />
    </div>
  );
};

export default ChannelManagement;