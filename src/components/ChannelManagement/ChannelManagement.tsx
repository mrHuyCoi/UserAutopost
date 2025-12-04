import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
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
import ZaloOATab from '../../pages/ChatbotPage/ZaloOATab';
import ZaloTab from '../../pages/ChatbotPage/ZaloTab';
import FacebookConversationsTab from '../../pages/ChatbotPage/FacebookConversationsTab';
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

  // Auto-refresh channels when window regains focus (after OAuth login)
  useEffect(() => {
    const handleFocus = () => {
      if (['zalo', 'zalo-oa', 'messenger'].includes(activeTab)) {
        refresh();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeTab, refresh]);

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

  // Helper function: Send Zalo message directly via API (independent of hook state)
  const sendZaloMessageDirect = async (threadId: string, messageText: string, accountId?: string) => {
    if (!messageText.trim() || !threadId) {
      console.error('Missing threadId or messageText for sending Zalo message');
      return;
    }

    try {
      const { sendZaloTextMessage } = await import('../../services/zaloService');
      await sendZaloTextMessage(String(threadId), messageText, accountId);
    } catch (error) {
      console.error('Error sending Zalo message:', error);
      throw error;
    }
  };

  // Send Zalo message - uses hook if active conversation exists, otherwise requires threadId/accountId
  const sendZaloMessage = async (
    _conversationId: string, 
    messageText: string,
    options?: { threadId?: string; accountId?: string }
  ) => {
    if (!messageText.trim()) return;

    try {
      // If threadId and accountId provided, send directly
      if (options?.threadId) {
        await sendZaloMessageDirect(options.threadId, messageText, options.accountId);
        return;
      }

      // Otherwise, use hook if active conversation exists
      if (!zaloConversationsHook.active) {
        console.error('No active Zalo conversation and no threadId provided');
        return;
      }

      const threadId = zaloConversationsHook.active.thread_id;
      if (!threadId) {
        console.error('No thread_id found for active conversation');
        return;
      }

      await zaloConversationsHook.sendText(messageText);
    } catch (error) {
      console.error('Error sending Zalo message:', error);
      // Error is already handled in the hook or thrown from sendZaloMessageDirect
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

  // Load conversations from all connected channels for "Hội thoại" tab
  const [allZaloConversations, setAllZaloConversations] = useState<Conversation[]>([]);
  const [allZaloOAConversations, setAllZaloOAConversations] = useState<Conversation[]>([]);
  const [allMessengerConversations, setAllMessengerConversations] = useState<Conversation[]>([]);
  const [loadingAllConversations, setLoadingAllConversations] = useState(false);

  // Load conversations from all connected channels when on conversations tab
  useEffect(() => {
    if (activeTab === 'conversations') {
      const loadAllConversations = async () => {
        setLoadingAllConversations(true);
        try {
          // Get all connected channels
          const connectedZaloChannels = channels.filter(c => c.type === 'zalo' && c.status === 'connected' && c.phone);
          const connectedOAChannels = channels.filter(c => c.type === 'zalo-oa' && c.status === 'connected');
          const connectedMessengerChannels = channels.filter(c => c.type === 'messenger' && c.status === 'connected' && c.phone);

          // Load Zalo conversations from all connected accounts
          const zaloConvs: Conversation[] = [];
          for (const channel of connectedZaloChannels) {
            try {
              const { getZaloConversations } = await import('../../services/zaloService');
              const res = await getZaloConversations(channel.phone!);
              const mapped = (res.items || []).map(conv => 
                mapZaloConversationToConversation(conv, [])
              );
              zaloConvs.push(...mapped);
            } catch (e) {
              console.error(`Error loading Zalo conversations for ${channel.phone}:`, e);
            }
          }
          setAllZaloConversations(zaloConvs);

          // Load Zalo OA conversations from all connected accounts
          const oaConvs: Conversation[] = [];
          for (const channel of connectedOAChannels) {
            try {
              const match = channel.id.match(/^zalo-oa-(.+)$/);
              if (match) {
                const accountId = match[1];
                const { listOaConversations } = await import('../../services/zaloOAService');
                const res = await listOaConversations(accountId, { limit: 50, offset: 0 });
                const mapped = (res.data || []).map(conv => 
                  mapZaloOAConversationToConversation(conv, [])
                );
                oaConvs.push(...mapped);
              }
            } catch (e) {
              console.error(`Error loading Zalo OA conversations for ${channel.id}:`, e);
            }
          }
          setAllZaloOAConversations(oaConvs);

          // Load Messenger conversations from all connected pages
          const messengerConvs: Conversation[] = [];
          for (const channel of connectedMessengerChannels) {
            try {
              const { getFBConversations } = await import('../../services/facebookService');
              const res = await getFBConversations(channel.phone!, 'messenger', 50);
              const mapped = (res.data || []).map(conv => 
                mapFBConversationToConversation(conv, [], channel.phone!)
              );
              messengerConvs.push(...mapped);
            } catch (e) {
              console.error(`Error loading Messenger conversations for ${channel.phone}:`, e);
            }
          }
          setAllMessengerConversations(messengerConvs);
        } catch (e) {
          console.error('Error loading all conversations:', e);
        } finally {
          setLoadingAllConversations(false);
        }
      };

      loadAllConversations();
    }
  }, [activeTab, channels]);

  // All conversations for "Hội thoại" tab (merged from all channels)
  const allConversations = useMemo(() => {
    if (activeTab === 'conversations') {
      // Use conversations from all connected channels
      return [
        ...allZaloConversations,
        ...allZaloOAConversations,
        ...allMessengerConversations
      ];
    } else {
      // Use conversations from selected channel (for backward compatibility)
      return [
        ...zaloConversations,
        ...zaloOAConversations,
        ...messengerConversations
      ];
    }
  }, [
    activeTab,
    allZaloConversations,
    allZaloOAConversations,
    allMessengerConversations,
    zaloConversations,
    zaloOAConversations,
    messengerConversations
  ]);

  const [activeAllConversation, setActiveAllConversation] = useState<string>('');
  const [conversationFilter, setConversationFilter] = useState<'all' | 'zalo' | 'zalo-oa' | 'messenger'>('all');

  // Filter conversations based on selected filter
  const filteredAllConversations = useMemo(() => {
    if (conversationFilter === 'all') {
      return allConversations;
    }
    return allConversations.filter(conv => conv.channel === conversationFilter);
  }, [allConversations, conversationFilter]);

  // Reset active conversation if it's not in filtered list when filter changes
  useEffect(() => {
    if (activeAllConversation && !filteredAllConversations.find(c => c.id === activeAllConversation)) {
      setActiveAllConversation('');
    }
  }, [conversationFilter, filteredAllConversations, activeAllConversation]);

  const getActiveAllConversation = () => {
    return filteredAllConversations.find(conv => conv.id === activeAllConversation);
  };

  // Store messages for conversations in "all conversations" tab
  const [allConversationMessages, setAllConversationMessages] = useState<Record<string, Message[]>>({});
  const [loadingAllMessages, setLoadingAllMessages] = useState<string | null>(null);

  // Load messages for a conversation in "all conversations" tab
  const loadMessagesForConversation = async (conversation: Conversation) => {
    if (allConversationMessages[conversation.id]) return; // Already loaded
    
    setLoadingAllMessages(conversation.id);
    try {
      let messages: Message[] = [];
      
      if (conversation.channel === 'zalo') {
        // Find the channel for this conversation
        const channel = channels.find(c => c.type === 'zalo' && c.status === 'connected' && c.phone);
        if (channel?.phone) {
          const { getZaloMessages } = await import('../../services/zaloService');
          // Extract thread_id and peer_id from conversation
          const threadId = conversation.id.split('-')[0] || '';
          const peerId = conversation.id.split('-')[1] || conversation.id;
          const res = await getZaloMessages(threadId, peerId, 50, 'asc', channel.phone);
          const zaloMessages = res.items || [];
          // Map Zalo messages to Message format
          messages = zaloMessages.map(msg => ({
            id: msg.id || `${msg.ts}`,
            text: msg.content || '',
            time: msg.created_at || (msg.ts ? new Date(msg.ts).toISOString() : new Date().toISOString()),
            sender: msg.is_self ? 'bot' : 'user',
          }));
        }
      } else if (conversation.channel === 'zalo-oa') {
        // Find the OA account for this conversation
        const channel = channels.find(c => c.type === 'zalo-oa' && c.status === 'connected');
        if (channel) {
          const match = channel.id.match(/^zalo-oa-(.+)$/);
          if (match) {
            const accountId = match[1];
            const { listOaMessages } = await import('../../services/zaloOAService');
            const res = await listOaMessages(accountId, conversation.id, { limit: 50, offset: 0, order: 'desc' });
            const oaMessages = (res.data || []).reverse();
            messages = oaMessages.map(msg => ({
              id: msg.id,
              text: msg.text || '',
              time: msg.timestamp || '',
              sender: msg.direction === 'out' ? 'bot' : 'user',
            }));
          }
        }
      } else if (conversation.channel === 'messenger') {
        // Find the page for this conversation
        const channel = channels.find(c => c.type === 'messenger' && c.status === 'connected' && c.phone);
        if (channel?.phone) {
          const { getFBConversationMessages } = await import('../../services/facebookService');
          const res = await getFBConversationMessages(channel.phone, conversation.id, 50);
          const fbMessages = res.messages?.data || [];
          messages = fbMessages.map(msg => ({
            id: msg.id || '',
            text: msg.message || '',
            time: msg.created_time || '',
            sender: msg.from?.id === channel.phone ? 'bot' : 'user',
          }));
        }
      }
      
      setAllConversationMessages(prev => ({ ...prev, [conversation.id]: messages }));
    } catch (e) {
      console.error('Error loading messages for conversation:', e);
    } finally {
      setLoadingAllMessages(null);
    }
  };

  const sendMessageToAllConversation = async (conversationId: string, messageText: string) => {
    const conversation = allConversations.find(conv => conv.id === conversationId);
    if (!conversation || !messageText.trim()) return;

    // Optimistic update: Thêm tin nhắn vào UI ngay lập tức
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      text: messageText,
      time: new Date().toISOString(),
      sender: 'bot', // Tin nhắn mình gửi -> sender = 'bot' để hiển thị bên phải (màu xanh)
    };

    // Add optimistic message vào danh sách hiện có
    setAllConversationMessages(prev => {
      const currentMessages = prev[conversationId] || [];
      return {
        ...prev,
        [conversationId]: [...currentMessages, optimisticMessage],
      };
    });

    try {
      // Determine channel type and call appropriate send function
      if (conversation.channel === 'zalo') {
        // Extract threadId and accountId from conversation metadata
        const convWithMeta = conversation as Conversation & {
          thread_id?: string;
          account_id?: string;
        };
        
        const threadId = convWithMeta.thread_id || conversation.id.split('-')[0] || conversation.id;
        const accountId = convWithMeta.account_id || 
          channels.find(c => c.type === 'zalo' && c.status === 'connected' && c.phone)?.phone;

        if (!threadId) {
          console.error('No thread_id found for Zalo conversation');
          // Xóa optimistic message nếu lỗi
          setAllConversationMessages(prev => ({
            ...prev,
            [conversationId]: (prev[conversationId] || []).filter(m => m.id !== optimisticMessage.id),
          }));
          return;
        }

        await sendZaloMessageDirect(threadId, messageText, accountId);
        // ✅ THÀNH CÔNG: Tin nhắn optimistic đã được thêm vào UI, không cần reload
      } else if (conversation.channel === 'zalo-oa') {
        await sendZaloOAMessage(conversationId, messageText);
      } else if (conversation.channel === 'messenger') {
        await sendMessengerMessage(conversationId, messageText);
      }
    } catch (error) {
      console.error('Error sending message in all-conversations view:', error);
      // Xóa optimistic message khi có lỗi
      setAllConversationMessages(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).filter(m => m.id !== optimisticMessage.id),
      }));
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
    console.log("ok4", channelType, conversationId, messageText);
    switch (channelType) {
      case 'zalo':
        console.log("ok3");
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
    // { id: 'settings', label: 'Cài đặt' }
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
              {/* <button
                className="flex items-center justify-center gap-1 sm:gap-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none min-w-0"
                onClick={() => setShowAddChannelModal(true)}
              >
                <Plus size={14} className="sm:w-4 sm:h-4" />
                <span className="truncate">Thêm kênh</span>
              </button> */}
              {/* <button
                onClick={refresh}
                className="flex items-center justify-center gap-1 sm:gap-2 bg-white hover:bg-gray-50 text-gray-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-gray-300 transition-colors flex-1 sm:flex-none min-w-0"
              >
                <RefreshCw size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Làm mới</span>
                <span className="sm:hidden">Mới</span>
              </button> */}
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
                {activeTab === 'zalo-oa' ? (
                  // Sử dụng ZaloOATab component cho Zalo OA
                  <div className="bg-white rounded-lg shadow-sm -m-3 sm:-m-4 lg:-m-6">
                    <ZaloOATab 
                      initialActiveTab="connect"
                      key={activeTab} // Force re-render when tab changes
                    />
                  </div>
                ) : activeTab === 'zalo' ? (
                  // Sử dụng ZaloTab component cho Zalo cá nhân
                  <div className="bg-white rounded-lg shadow-sm -m-3 sm:-m-4 lg:-m-6">
                    <ZaloTab 
                      initialActiveTab="login"
                      key={activeTab} // Force re-render when tab changes
                    />
                  </div>
                ) : activeTab === 'messenger' ? (
                  // Sử dụng FacebookConversationsTab component cho Messenger
                  <div className="bg-white rounded-lg shadow-sm -m-3 sm:-m-4 lg:-m-6">
                    <FacebookConversationsTab 
                      key={activeTab} // Force re-render when tab changes
                    />
                  </div>
                ) : (
                  <>
                    <div className="mb-4 sm:mb-6">
                      <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">
                        Kênh
                      </h2>
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
                  </>
                )}
              </div>
            )}

            {/* Conversations Tab - Shows all conversations from all channels */}
            {viewMode === 'channels' && activeTab === 'conversations' && (
              <div>
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">
                        Tất cả Hội thoại
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Xem và quản lý tất cả hội thoại từ tất cả các nền tảng đã kết nối
                        {conversationFilter !== 'all' && (
                          <span className="ml-2 text-blue-600">
                            ({filteredAllConversations.length} {conversationFilter === 'zalo' ? 'Zalo' : conversationFilter === 'zalo-oa' ? 'Zalo OA' : 'Messenger'})
                          </span>
                        )}
                      </p>
                    </div>
                    {conversationFilter === 'all' && (
                      <div className="text-sm text-gray-500">
                        Tổng: {filteredAllConversations.length} hội thoại
                      </div>
                    )}
                  </div>
                </div>
                
                {loadingAllConversations ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-500">Đang tải hội thoại...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-1">
                      <ConversationList
                        conversations={filteredAllConversations}
                        activeConversation={activeAllConversation}
                        onConversationSelect={(id) => {
                          setActiveAllConversation(id);
                          const conv = filteredAllConversations.find(c => c.id === id);
                          if (conv) {
                            loadMessagesForConversation(conv);
                          }
                        }}
                        showChannelFilter={true}
                        channelFilter={conversationFilter}
                        onChannelFilterChange={setConversationFilter}
                      />
                    </div>
                    <div className="lg:col-span-2">
                      {getActiveAllConversation() ? (
                        loadingAllMessages === activeAllConversation ? (
                          <div className="h-[400px] sm:h-[500px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                              <p className="text-gray-500 text-sm">Đang tải tin nhắn...</p>
                            </div>
                          </div>
                        ) : (
                          <ChatArea
                            conversation={{
                              ...getActiveAllConversation()!,
                              messages: allConversationMessages[activeAllConversation] || []
                            }}
                            onSendMessage={(message) => sendMessageToAllConversation(activeAllConversation, message)}
                            onAddToFAQ={handleAddToFAQ}
                          />
                        )
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