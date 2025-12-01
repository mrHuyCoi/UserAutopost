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
import StaffManagement from './components/StaffManagement';
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
  formatPreviewTime,
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

  // Get first connected Zalo account ID for staff management
  const firstZaloAccountId = useMemo(() => {
    const connectedZaloChannel = channels.find(c => c.type === 'zalo' && c.status === 'connected' && c.phone);
    return connectedZaloChannel?.phone || undefined;
  }, [channels]);

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
      
      return mapZaloConversationToConversation(conv, messages, zaloAccountId);
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
      
      return mapZaloOAConversationToConversation(conv, messages, zaloOAAccountId);
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
      // Lấy conversation object từ hook để lấy conversation_id (user_id)
      const activeConv = zaloOAConversationsHook.conversations.find(
        conv => conv.id === zaloOAConversationsHook.activeConversationId || 
                conv.conversation_id === zaloOAConversationsHook.activeConversationId
      );
      
      if (!activeConv) {
        console.error('Không tìm thấy conversation');
        return;
      }
      
      // conversation_id chính là user_id cần gửi đến
      const toUserId = activeConv.conversation_id || activeConv.id;
      await zaloOAConversationsHook.sendText(toUserId, messageText);
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

  // Sync WebSocket updates from hooks to allConversations
  useEffect(() => {
    if (activeTab !== 'conversations') return;

    // Sync Zalo conversations updates
    const connectedZaloChannels = channels.filter(c => c.type === 'zalo' && c.status === 'connected' && c.phone);
    connectedZaloChannels.forEach(channel => {
      if (zaloConversationsHook.accountId === channel.phone) {
        // Update allZaloConversations with latest data from hook
        setAllZaloConversations(prev => {
          const updated = prev.map(conv => {
            if (conv.channel !== 'zalo' || conv.account_id !== channel.phone) return conv;
            
            // Find matching conversation in hook
            const hookConv = zaloConversationsHook.conversations.find(
              c => (c.thread_id && String(c.thread_id) === conv.thread_id) ||
                   (c.peer_id && String(c.peer_id) === conv.peer_id) ||
                   (c.conversation_id && String(c.conversation_id) === conv.conversation_id) ||
                   (c.thread_id && String(c.thread_id) === conv.id) ||
                   (c.peer_id && String(c.peer_id) === conv.id) ||
                   (c.conversation_id && String(c.conversation_id) === conv.id)
            );
            
            if (hookConv) {
              // Get latest message for preview if available
              let preview = hookConv.last_content || conv.preview;
              // If this conversation is active in hook, get latest message
              if (zaloConversationsHook.active && 
                  (String(zaloConversationsHook.active.thread_id) === String(hookConv.thread_id) ||
                   String(zaloConversationsHook.active.peer_id) === String(hookConv.peer_id))) {
                const latestMsg = zaloConversationsHook.messages[zaloConversationsHook.messages.length - 1];
                if (latestMsg?.content) {
                  preview = latestMsg.content;
                }
              }
              
              // Update preview and time from hook
              return {
                ...conv,
                preview,
                time: formatPreviewTime(hookConv.last_ts || hookConv.last_created_at),
              };
            }
            return conv;
          });
          
          // Add new conversations from hook that don't exist in allZaloConversations
          const existingIds = new Set(updated.map(c => c.id));
          const newConvs = zaloConversationsHook.conversations
            .filter(c => {
              const convId = c.conversation_id || c.thread_id || c.peer_id || '';
              return convId && !existingIds.has(convId);
            })
            .map(conv => mapZaloConversationToConversation(conv, [], channel.phone));
          
          return [...updated, ...newConvs];
        });
      }
    });
  }, [activeTab, channels, zaloConversationsHook.conversations, zaloConversationsHook.accountId, zaloConversationsHook.active, zaloConversationsHook.messages]);

  // Sync Zalo OA conversations updates
  useEffect(() => {
    if (activeTab !== 'conversations') return;

    const connectedOAChannels = channels.filter(c => c.type === 'zalo-oa' && c.status === 'connected');
    connectedOAChannels.forEach(channel => {
      const match = channel.id.match(/^zalo-oa-(.+)$/);
      if (match) {
        const accountId = match[1];
        // Update allZaloOAConversations with latest data from hook
        setAllZaloOAConversations(prev => {
          const updated = prev.map(conv => {
            if (conv.channel !== 'zalo-oa' || conv.account_id !== accountId) return conv;
            
            // Find matching conversation in hook
            const hookConv = zaloOAConversationsHook.conversations.find(
              c => (c.conversation_id && String(c.conversation_id) === conv.conversation_id) ||
                   (c.id && String(c.id) === conv.id) ||
                   (c.conversation_id && String(c.conversation_id) === conv.id) ||
                   (c.id && String(c.id) === conv.conversation_id)
            );
            
            if (hookConv) {
              // Get latest message for preview if available
              let preview = conv.preview;
              // If this conversation is active in hook, get latest message
              if (zaloOAConversationsHook.activeConversationId &&
                  (String(zaloOAConversationsHook.activeConversationId) === String(hookConv.id) ||
                   String(zaloOAConversationsHook.activeConversationId) === String(hookConv.conversation_id))) {
                const latestMsg = zaloOAConversationsHook.messages[zaloOAConversationsHook.messages.length - 1];
                if (latestMsg?.text) {
                  preview = latestMsg.text;
                }
              }
              
              // Update preview and time from hook
              const lastMsg = hookConv.last_message_at ? new Date(hookConv.last_message_at) : null;
              return {
                ...conv,
                preview,
                time: lastMsg ? formatPreviewTime(lastMsg.toISOString()) : conv.time,
              };
            }
            return conv;
          });
          
          // Add new conversations from hook that don't exist in allZaloOAConversations
          const existingIds = new Set(updated.map(c => c.id));
          const newConvs = zaloOAConversationsHook.conversations
            .filter(c => {
              const convId = c.conversation_id || c.id || '';
              return convId && !existingIds.has(convId);
            })
            .map(conv => mapZaloOAConversationToConversation(conv, [], accountId));
          
          return [...updated, ...newConvs];
        });
      }
    });
  }, [activeTab, channels, zaloOAConversationsHook.conversations, zaloOAConversationsHook.activeConversationId, zaloOAConversationsHook.messages]);

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
                mapZaloConversationToConversation(conv, [], channel.phone)
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
                  mapZaloOAConversationToConversation(conv, [], accountId)
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
  const [zaloSubTab, setZaloSubTab] = useState<'conversations' | 'staff-management'>('conversations');

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

  // Listen to WebSocket messages and update allConversationMessages directly
  // This ensures incoming messages are displayed in real-time even if conversation is not active in hook
  useEffect(() => {
    if (activeTab !== 'conversations') return;

    // This effect will sync messages from hooks to allConversationMessages
    // The hooks now capture ALL incoming messages (even if conversation not active)
    // So we just need to sync them properly
  }, [
    activeTab,
    allConversations,
    zaloConversationsHook.messages,
    zaloConversationsHook.active,
    zaloOAConversationsHook.messages,
    zaloOAConversationsHook.activeConversationId,
    allConversationMessages, // Include to check for duplicates
  ]);

  // Sync messages from hooks to allConversationMessages when active conversation changes or messages update
  useEffect(() => {
    if (activeTab !== 'conversations' || !activeAllConversation) return;

    const conversation = allConversations.find(c => c.id === activeAllConversation);
    if (!conversation) return;

    // Sync Zalo messages
    if (conversation.channel === 'zalo' && zaloConversationsHook.active) {
      const activeConvId = zaloConversationsHook.active.conversation_id || 
                          zaloConversationsHook.active.thread_id || 
                          zaloConversationsHook.active.peer_id || '';
      
      if (String(activeConvId) === String(conversation.id) || 
          (conversation.thread_id && String(zaloConversationsHook.active.thread_id) === String(conversation.thread_id)) ||
          (conversation.peer_id && String(zaloConversationsHook.active.peer_id) === String(conversation.peer_id))) {
        // Map Zalo messages to Message format
        const messages: Message[] = zaloConversationsHook.messages.map(msg => ({
          id: msg.id || `${msg.ts}`,
          text: msg.content || '',
          time: msg.created_at || (msg.ts ? new Date(msg.ts).toISOString() : new Date().toISOString()),
          sender: msg.is_self ? 'user' : 'bot',
        }));
        
        setAllConversationMessages(prev => {
          // Replace optimistic messages with real ones
          const currentMessages = prev[activeAllConversation] || [];
          const optimisticIndices: number[] = [];
          currentMessages.forEach((m, idx) => {
            if (m.id.startsWith('temp-')) {
              // Check if there's a matching real message
              const matchingReal = messages.find(
                realMsg => realMsg.text === m.text && realMsg.sender === m.sender
              );
              if (matchingReal) {
                optimisticIndices.push(idx);
              }
            }
          });
          
          // If we have matching real messages, replace optimistic ones
          if (optimisticIndices.length > 0) {
            const newMessages = [...currentMessages];
            optimisticIndices.forEach((idx) => {
              const matchingReal = messages.find(
                realMsg => realMsg.text === newMessages[idx].text && realMsg.sender === newMessages[idx].sender
              );
              if (matchingReal) {
                newMessages[idx] = matchingReal;
              }
            });
            // Merge with new messages from hook, avoiding duplicates
            const existingIds = new Set(newMessages.map(m => m.id));
            const newFromHook = messages.filter(m => !existingIds.has(m.id));
            return {
              ...prev,
              [activeAllConversation]: [...newMessages, ...newFromHook],
            };
          }
          
          // No optimistic to replace, just update with hook messages
          return {
            ...prev,
            [activeAllConversation]: messages,
          };
        });
      }
    }

    // Sync Zalo OA messages
    if (conversation.channel === 'zalo-oa' && zaloOAConversationsHook.activeConversationId) {
      const activeConvId = zaloOAConversationsHook.activeConversationId;
      
      if (String(activeConvId) === String(conversation.id) || 
          String(activeConvId) === String(conversation.conversation_id)) {
        // Map Zalo OA messages to Message format
        const messages: Message[] = zaloOAConversationsHook.messages.map(msg => ({
          id: msg.id,
          text: msg.text || '',
          time: msg.timestamp || '',
          sender: msg.direction === 'in' ? 'user' : 'bot',
        }));
        
        setAllConversationMessages(prev => {
          // Replace optimistic messages with real ones
          const currentMessages = prev[activeAllConversation] || [];
          const optimisticIndices: number[] = [];
          currentMessages.forEach((m, idx) => {
            if (m.id.startsWith('temp-')) {
              // Check if there's a matching real message
              const matchingReal = messages.find(
                realMsg => realMsg.text === m.text && realMsg.sender === m.sender
              );
              if (matchingReal) {
                optimisticIndices.push(idx);
              }
            }
          });
          
          // If we have matching real messages, replace optimistic ones
          if (optimisticIndices.length > 0) {
            const newMessages = [...currentMessages];
            optimisticIndices.forEach((idx) => {
              const matchingReal = messages.find(
                realMsg => realMsg.text === newMessages[idx].text && realMsg.sender === newMessages[idx].sender
              );
              if (matchingReal) {
                newMessages[idx] = matchingReal;
              }
            });
            // Merge with new messages from hook, avoiding duplicates
            const existingIds = new Set(newMessages.map(m => m.id));
            const newFromHook = messages.filter(m => !existingIds.has(m.id));
            return {
              ...prev,
              [activeAllConversation]: [...newMessages, ...newFromHook],
            };
          }
          
          // No optimistic to replace, just update with hook messages
          return {
            ...prev,
            [activeAllConversation]: messages,
          };
        });
      }
    }
  }, [
    activeTab,
    activeAllConversation,
    allConversations,
    zaloConversationsHook.active,
    zaloConversationsHook.messages,
    zaloOAConversationsHook.activeConversationId,
    zaloOAConversationsHook.messages,
    allConversationMessages, // Add this to track optimistic messages
  ]);

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
            sender: msg.is_self ? 'user' : 'bot',
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
              sender: msg.direction === 'in' ? 'user' : 'bot',
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
    if (!conversation || !messageText.trim()) {
      console.log('No conversation found or empty message', { conversationId, messageText });
      return;
    }

    try {
      // Determine channel type and send message
      if (conversation.channel === 'zalo') {
        // Find the channel for this conversation
        const channel = channels.find(c => c.type === 'zalo' && c.status === 'connected' && c.phone);
        if (!channel?.phone) {
          console.error('No connected Zalo channel found');
          alert('Không tìm thấy kênh Zalo đã kết nối');
          return;
        }

        // Get thread_id and peer_id from conversation metadata
        const threadId = conversation.thread_id || '';
        const peerId = conversation.peer_id || '';
        const accountId = conversation.account_id || channel.phone;

        if (!threadId && !peerId) {
          console.error('Missing thread_id and peer_id in conversation', conversation);
          alert('Không tìm thấy thông tin cuộc hội thoại. Vui lòng thử lại.');
          return;
        }

        console.log('Sending Zalo message', { conversationId, threadId, peerId, accountId });

        // Try to find conversation in hook first
        const zaloConv = zaloConversationsHook.conversations.find(
          c => (c.thread_id && String(c.thread_id) === threadId) || 
               (c.peer_id && String(c.peer_id) === peerId) ||
               (c.conversation_id && String(c.conversation_id) === conversationId)
        );

        if (zaloConv && zaloConversationsHook.accountId === channel.phone) {
          // Set as active in hook
          zaloConversationsHook.setActive(zaloConv);
          // Send message via hook
          await zaloConversationsHook.sendText(messageText);
        } else {
          // If not found in hook, send directly via API
          const { sendZaloTextMessage } = await import('../../services/zaloService');
          await sendZaloTextMessage(threadId, messageText, channel.phone);
        }
      } else if (conversation.channel === 'zalo-oa') {
        // Find the OA account for this conversation
        const channel = channels.find(c => c.type === 'zalo-oa' && c.status === 'connected');
        if (!channel) {
          console.error('No connected Zalo OA channel found');
          alert('Không tìm thấy kênh Zalo OA đã kết nối');
          return;
        }

        const match = channel.id.match(/^zalo-oa-(.+)$/);
        if (!match) {
          console.error('Invalid Zalo OA channel ID format');
          return;
        }

        const accountId = conversation.account_id || match[1];
        const toUserId = conversation.conversation_id || conversation.id; // conversation_id is the user_id for Zalo OA

        if (!toUserId || !accountId) {
          console.error('Missing toUserId or accountId in conversation', conversation);
          alert('Không tìm thấy thông tin cuộc hội thoại. Vui lòng thử lại.');
          return;
        }

        console.log('Sending Zalo OA message', { conversationId, toUserId, accountId });

        // Try to find conversation in hook first
        const oaConv = zaloOAConversationsHook.conversations.find(
          c => c.conversation_id === toUserId || c.id === toUserId || c.id === conversationId
        );

        if (oaConv && zaloOAConversationsHook.conversations.length > 0) {
          // Set as active in hook
          const convId = oaConv.id || oaConv.conversation_id || toUserId;
          zaloOAConversationsHook.setActiveConversationId(convId);
          // Send message via hook
          await zaloOAConversationsHook.sendText(toUserId, messageText);
        } else {
          // If not found in hook, send directly via API
          const { sendOaTextMessage } = await import('../../services/zaloOAService');
          await sendOaTextMessage(accountId, toUserId, messageText);
        }
      } else if (conversation.channel === 'messenger') {
        sendMessengerMessage(conversationId, messageText);
      }
      
      // Add optimistic message to allConversationMessages if viewing this conversation
      if (activeAllConversation === conversationId) {
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          text: messageText,
          time: new Date().toISOString(),
          sender: 'user',
        };
        
        setAllConversationMessages(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), optimisticMessage],
        }));
      }
      
      // Reload messages after sending (with a small delay to allow WebSocket to update)
      // Note: WebSocket will update messages in real-time, so this is just a fallback
      setTimeout(async () => {
        // Only reload if WebSocket hasn't updated (check if optimistic message still exists)
        const currentMessages = allConversationMessages[conversationId] || [];
        const stillHasOptimistic = currentMessages.some(m => m.id.startsWith('temp-'));
        if (stillHasOptimistic) {
          await loadMessagesForConversation(conversation);
        }
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể gửi tin nhắn. Vui lòng thử lại.';
      alert(errorMessage);
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
                {/* Sub-tabs for Zalo filter */}
                {conversationFilter === 'zalo' && (
                  <div className="mb-4 border-b border-gray-200">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setZaloSubTab('conversations')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          zaloSubTab === 'conversations'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Hội thoại
                      </button>
                      <button
                        onClick={() => setZaloSubTab('staff-management')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          zaloSubTab === 'staff-management'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Quản lý nhân viên
                      </button>
                    </div>
                  </div>
                )}

                {/* Staff Management Tab */}
                {conversationFilter === 'zalo' && zaloSubTab === 'staff-management' ? (
                  firstZaloAccountId ? (
                    <StaffManagement accountId={firstZaloAccountId} />
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="text-center py-12">
                        <p className="text-gray-500 text-sm">Vui lòng kết nối ít nhất một kênh Zalo để quản lý nhân viên</p>
                      </div>
                    </div>
                  )
                ) : (
                  <>
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
                            onChannelFilterChange={(filter) => {
                              setConversationFilter(filter);
                              // Reset to conversations tab when filter changes
                              if (filter !== 'zalo') {
                                setZaloSubTab('conversations');
                              }
                            }}
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
                                onSendMessage={(message) => {
                                  console.log('ChatArea onSendMessage called', { activeAllConversation, message });
                                  if (!activeAllConversation) {
                                    console.warn('No active conversation selected');
                                    alert('Vui lòng chọn một cuộc hội thoại để gửi tin nhắn');
                                    return;
                                  }
                                  sendMessageToAllConversation(activeAllConversation, message);
                                }}
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
                  </>
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