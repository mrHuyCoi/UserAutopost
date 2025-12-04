import { useCallback, useEffect, useState, useRef } from 'react';
import {
  listOaConversations,
  listOaMessages,
  sendOaTextMessage,
  sendOaImageMessage,
  uploadOaImage,
  OaConversationItem,
  OaMessageItem,
} from '../../../services/zaloOAService';
import { getAuthToken, getApiKey } from '../../../services/apiService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000';

export function useZaloOAConversations(accountId?: string) {
  const [conversations, setConversations] = useState<OaConversationItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<OaMessageItem[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // WebSocket refs
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const recentlySentRef = useRef<Record<string, Array<{ text?: string; kind?: string; time: number }>>>({});

  const loadConversations = useCallback(async (accId?: string) => {
    if (!accId) return;
    setLoadingList(true);
    setErrorList(null);
    try {
      const res = await listOaConversations(accId, { limit: 50, offset: 0 });
      setConversations(res.data || []);
    } catch (e: unknown) {
      const error = e as { message?: string };
      setErrorList(error?.message || 'Không tải được hội thoại');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadMessages = useCallback(async (convId?: string, accId?: string) => {
    if (!convId || !accId) {
      setMessages([]);
      return;
    }
    setLoadingMsg(true);
    setErrorMsg(null);
    try {
      const res = await listOaMessages(accId, convId, { limit: 50, offset: 0, order: 'desc' });
      // Reverse để hiển thị từ cũ đến mới
      setMessages((res.data || []).reverse());
    } catch (e: unknown) {
      const error = e as { message?: string };
      setErrorMsg(error?.message || 'Không tải được tin nhắn');
    } finally {
      setLoadingMsg(false);
    }
  }, []);

  useEffect(() => {
    if (accountId) {
      loadConversations(accountId);
    }
  }, [accountId, loadConversations]);

  useEffect(() => {
    if (activeConversationId && accountId) {
      loadMessages(activeConversationId, accountId);
    }
  }, [activeConversationId, accountId, loadMessages]);

  // WebSocket connection for real-time messages
  useEffect(() => {
    if (!accountId) {
      // Close WebSocket if no account
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    // Try to get API key (optional, will use token if API key not available)
    // Note: WebSocket API in browser doesn't support custom headers, so we use token in query
    getApiKey().catch(() => {}); // Cache API key for future use if needed

    // Build WS URL with token
    const host = API_BASE_URL.replace(/^https?:\/\//, '');
    const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
    const wsUrl = `${wsProtocol}://${host}/api/v1/ws?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[Zalo OA WebSocket] ✅ Connected successfully');
      console.log('[Zalo OA WebSocket] URL:', wsUrl);
      // Periodic ping to keep alive
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      pingIntervalRef.current = window.setInterval(() => {
        try {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        } catch (error) {
          console.error('Error sending ping:', error);
        }
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const raw = String(event.data ?? '');
        console.log('[Zalo OA WebSocket] Raw message received:', raw);
        
        if (!raw) {
          console.log('[Zalo OA WebSocket] Empty message, skipping');
          return;
        }

        const payload = JSON.parse(raw);
        console.log('[Zalo OA WebSocket] Parsed payload:', payload);
        
        if (!payload || typeof payload !== 'object') {
          console.log('[Zalo OA WebSocket] Invalid payload format, skipping');
          return;
        }

        // Handle pong response
        if (payload.type === 'pong') {
          return;
        }

        // Handle acknowledgment
        if (payload.type === 'ack') {
          console.log('Message acknowledged:', payload.echo);
          return;
        }

        // Handle notification
        if (payload.type === 'notification') {
          console.log('Notification received:', payload.title, payload.message);
          // You can add notification display logic here
          return;
        }

        // Handle realtime events
        if (payload.type === 'realtime') {
          if (payload.event === 'new_message' && payload.data) {
            // Handle realtime message - can be processed similar to zalo_oa_message
            console.log('Realtime message received:', payload.data);
          }
          return;
        }

        // Handle Zalo OA message
        console.log('[Zalo OA WebSocket] Checking payload type:', payload.type, 'Has data:', !!payload.data);
        
        // Log if payload type is not recognized
        if (payload.type !== 'pong' && 
            payload.type !== 'ack' && 
            payload.type !== 'notification' && 
            payload.type !== 'realtime' && 
            payload.type !== 'zalo_oa_message') {
          console.log('[Zalo OA WebSocket] ⚠️ Unknown payload type:', payload.type, 'Full payload:', payload);
        }
        
        if (payload.type === 'zalo_oa_message' && payload.data) {
          console.log('[Zalo OA WebSocket] 📨 Received zalo_oa_message:', payload.data);
          const data = payload.data as {
            conversation_id?: string;
            user_id?: string;
            message_id?: string;
            direction?: 'in' | 'out';
            msg_type?: string;
            text?: string;
            attachments?: { type: string; url?: string; thumb?: string; description?: string };
            timestamp?: string;
            [key: string]: unknown;
          };

          const convId = data.conversation_id || data.user_id;
          console.log('[Zalo OA WebSocket] Conversation ID:', convId, 'Message data:', data);
          if (!convId) {
            console.log('[Zalo OA WebSocket] ⚠️ No conversation_id/user_id found, skipping message');
            return;
          }

          // Update conversation preview
          setConversations((prev) =>
            prev.map((c) => {
              const cId = c.conversation_id || c.id;
              if (cId && String(cId) === String(convId)) {
                return {
                  ...c,
                  last_message_at: data.timestamp || new Date().toISOString(),
                };
              }
              return c;
            })
          );

          // Always update messages if this conversation exists in our list
          // This ensures incoming messages are captured even if not currently active
          const isActiveConversation = activeConversationId && String(activeConversationId) === String(convId);
          const conversationExists = conversations.some(c => {
            const cId = c.conversation_id || c.id;
            return cId && String(cId) === String(convId);
          });
          
          // Add message if it's the active conversation OR if conversation exists (for incoming messages)
          console.log('[Zalo OA WebSocket] Message processing:', {
            isActiveConversation,
            conversationExists,
            direction: data.direction,
            willProcess: isActiveConversation || (conversationExists && data.direction === 'in'),
          });
          
          if (isActiveConversation || (conversationExists && data.direction === 'in')) {
            // Dedupe: check if this message was recently sent optimistically
            const now = Date.now();
            const windowMs = 4000;
            const recent = recentlySentRef.current[convId] || [];
            const filtered = recent.filter((it) => now - it.time <= windowMs);
            recentlySentRef.current[convId] = filtered;

            const isOutgoing = data.direction === 'out';
            if (isOutgoing) {
              // Check if this matches a recently sent message
              const normalizedText = (data.text || '').trim();
              const idx = filtered.findIndex(
                (it) => it.text && it.text.trim() === normalizedText
              );
              if (idx >= 0) {
                // This is likely a duplicate from our optimistic update
                // Remove from recently sent to prevent future duplicates
                filtered.splice(idx, 1);
                recentlySentRef.current[convId] = filtered;
                
                // Replace optimistic message with real message from server
                setMessages((prev) => {
                  // Find and remove optimistic message with matching text
                  const optimisticIdx = prev.findIndex(
                    (m) => m.id.startsWith('temp-') && 
                           m.direction === 'out' && 
                           m.text && 
                           m.text.trim() === normalizedText
                  );
                  
                  if (optimisticIdx >= 0) {
                    // Replace optimistic with real message
                    const newMessages = [...prev];
                    newMessages[optimisticIdx] = {
                      id: data.message_id || `ws-${Date.now()}-${Math.random()}`,
                      direction: data.direction || 'out',
                      msg_type: data.msg_type || 'text',
                      text: data.text || null,
                      attachments: data.attachments?.type === 'photo'
                        ? {
                            type: 'photo',
                            url: data.attachments.url,
                            thumb: data.attachments.thumb,
                            description: data.attachments.description,
                          }
                        : undefined,
                      timestamp: data.timestamp || new Date().toISOString(),
                    };
                    return newMessages;
                  }
                  
                  // If no optimistic found, check if message already exists
                  const exists = prev.some((m) => {
                    if (m.id === (data.message_id || '')) return true;
                    if (
                      m.timestamp === (data.timestamp || '') &&
                      m.text === (data.text || null) &&
                      m.direction === (data.direction || 'out')
                    ) {
                      return true;
                    }
                    return false;
                  });
                  
                  if (exists) return prev;
                  
                  // Add new message
                  return [...prev, {
                    id: data.message_id || `ws-${Date.now()}-${Math.random()}`,
                    direction: data.direction || 'out',
                    msg_type: data.msg_type || 'text',
                    text: data.text || null,
                    attachments: data.attachments?.type === 'photo'
                      ? {
                          type: 'photo',
                          url: data.attachments.url,
                          thumb: data.attachments.thumb,
                          description: data.attachments.description,
                        }
                      : undefined,
                    timestamp: data.timestamp || new Date().toISOString(),
                  }];
                });
                return;
              }
            }

            // Create message object
            const newMessage: OaMessageItem = {
              id: data.message_id || `ws-${Date.now()}-${Math.random()}`,
              direction: data.direction || 'in',
              msg_type: data.msg_type || 'text',
              text: data.text || null,
              attachments: data.attachments?.type === 'photo'
                ? {
                    type: 'photo',
                    url: data.attachments.url,
                    thumb: data.attachments.thumb,
                    description: data.attachments.description,
                  }
                : undefined,
              timestamp: data.timestamp || new Date().toISOString(),
            };

            // Add message to list (avoid duplicates)
            setMessages((prev) => {
              // Check if message already exists
              const exists = prev.some((m) => {
                if (m.id === newMessage.id) return true;
                // Also check by timestamp and text for duplicates
                if (
                  m.timestamp === newMessage.timestamp &&
                  m.text === newMessage.text &&
                  m.direction === newMessage.direction
                ) {
                  return true;
                }
                return false;
              });

              if (exists) return prev;
              return [...prev, newMessage];
            });
          }
        }
      } catch (error) {
        console.error('[Zalo OA WebSocket] ❌ Error parsing WebSocket message:', error);
        console.error('[Zalo OA WebSocket] Error details:', {
          error,
          eventData: event.data,
          rawString: String(event.data ?? ''),
        });
      }
    };

    ws.onerror = (error) => {
      console.error('[Zalo OA WebSocket] ❌ Error:', error);
      console.error('[Zalo OA WebSocket] Error details:', {
        type: error.type,
        target: error.target,
        currentTarget: error.currentTarget,
      });
    };

    ws.onclose = (event) => {
      console.log('[Zalo OA WebSocket] 🔌 Closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      // Auto-reconnect after 3 seconds if not a normal closure
      if (event.code !== 1000) {
        setTimeout(() => {
          if (accountId && !wsRef.current) {
            // Trigger reconnect by re-running effect
            const token = getAuthToken();
            if (token) {
              const host = API_BASE_URL.replace(/^https?:\/\//, '');
              const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
              const wsUrl = `${wsProtocol}://${host}/api/v1/ws?token=${encodeURIComponent(token)}`;
              wsRef.current = new WebSocket(wsUrl);
            }
          }
        }, 3000);
      }
    };

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [accountId, activeConversationId, conversations]);

  const sendText = useCallback(async (toUserId: string, text: string) => {
    if (!accountId) return;

    // Track recently sent message for deduplication
    const convId = activeConversationId || toUserId;
    if (!recentlySentRef.current[convId]) {
      recentlySentRef.current[convId] = [];
    }
    recentlySentRef.current[convId].push({
      text,
      time: Date.now(),
    });

    // Optimistic update
    const optimistic: OaMessageItem = {
      id: `temp-${Date.now()}`,
      direction: 'out',
      msg_type: 'text',
      text: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      await sendOaTextMessage(accountId, toUserId, text);
      // WebSocket will receive the actual message, so we don't need to reload
      // But we'll remove the optimistic message after a short delay if WebSocket doesn't deliver it
      setTimeout(() => {
        setMessages((prev) => {
          const optimisticMsg = prev.find((m) => m.id === optimistic.id);
          if (optimisticMsg && optimisticMsg.id.startsWith('temp-')) {
            // If optimistic message still exists, keep it (WebSocket might be delayed)
            return prev;
          }
          return prev;
        });
      }, 2000);
    } catch (e: unknown) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      // Remove from recently sent
      const recent = recentlySentRef.current[convId] || [];
      const idx = recent.findIndex((it) => it.text === text);
      if (idx >= 0) recent.splice(idx, 1);
      recentlySentRef.current[convId] = recent;

      const error = e as { message?: string };
      const errMsg: OaMessageItem = {
        id: `error-${Date.now()}`,
        direction: 'out',
        msg_type: 'text',
        text: `Gửi thất bại: ${error?.message || 'Lỗi không xác định'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
      throw e;
    }
  }, [accountId, activeConversationId]);

  const sendImage = useCallback(async (toUserId: string, file: File) => {
    if (!accountId) return;

    // Track recently sent image for deduplication
    const convId = activeConversationId || toUserId;
    if (!recentlySentRef.current[convId]) {
      recentlySentRef.current[convId] = [];
    }
    recentlySentRef.current[convId].push({
      kind: 'image',
      time: Date.now(),
    });

    try {
      // Upload image first
      const uploadRes = await uploadOaImage(accountId, file);
      const attachmentId = uploadRes.data?.attachment_id;
      if (!attachmentId) throw new Error('Không lấy được attachment_id');

      // Send image
      await sendOaImageMessage(accountId, toUserId, attachmentId);
      
      // WebSocket will receive the actual message, so we don't need to reload
    } catch (e: unknown) {
      // Remove from recently sent
      const recent = recentlySentRef.current[convId] || [];
      const idx = recent.findIndex((it) => it.kind === 'image');
      if (idx >= 0) recent.splice(idx, 1);
      recentlySentRef.current[convId] = recent;

      const error = e as { message?: string };
      const errMsg: OaMessageItem = {
        id: `error-${Date.now()}`,
        direction: 'out',
        msg_type: 'text',
        text: `Gửi ảnh thất bại: ${error?.message || 'Lỗi không xác định'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errMsg]);
      throw e;
    }
  }, [accountId, activeConversationId]);

  return {
    conversations,
    loadingList,
    errorList,
    activeConversationId,
    setActiveConversationId,
    messages,
    loadingMsg,
    errorMsg,
    refreshList: () => loadConversations(accountId),
    refreshMessages: () => loadMessages(activeConversationId || undefined, accountId),
    sendText,
    sendImage,
  };
}

