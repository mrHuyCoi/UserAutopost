// src/hooks/useZaloConversations.ts
import { useCallback, useEffect, useState, useRef } from 'react';
import { getZaloConversations, getZaloMessages, sendZaloTextMessage, ZaloConversation, ZaloMessage } from '../../../services/zaloService';
import { getAuthToken, getApiKey } from '../../../services/apiService';

type Order = 'asc' | 'desc';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000';

export function useZaloConversations(defaultAccountId?: string) {
  const [accountId, setAccountId] = useState<string | undefined>(defaultAccountId);
  const [conversations, setConversations] = useState<ZaloConversation[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  const [active, setActive] = useState<ZaloConversation | null>(null);

  const [messages, setMessages] = useState<ZaloMessage[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [order, setOrder] = useState<Order>('asc'); // backend default asc

  // WebSocket refs
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const recentlySentRef = useRef<Record<string, Array<{ text?: string; kind?: string; time: number }>>>({});

  const loadConversations = useCallback(async (acc?: string) => {
    if (!acc) return;
    setLoadingList(true);
    setErrorList(null);
    try {
      const res = await getZaloConversations(acc);
      setConversations(res.items || []);
    } catch (e: unknown) {
      const error = e as { message?: string };
      setErrorList(error?.message || 'Không tải được hội thoại');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadMessages = useCallback(async (conv?: ZaloConversation) => {
    if (!conv || (!conv.thread_id && !conv.peer_id)) {
      setMessages([]);
      return;
    }
    setLoadingMsg(true);
    setErrorMsg(null);
    try {
      const res = await getZaloMessages(conv.thread_id, conv.peer_id, 50, order, accountId);
      setMessages(res.items || []);
    } catch (e: unknown) {
      const error = e as { message?: string };
      setErrorMsg(error?.message || 'Không tải được tin nhắn');
    } finally {
      setLoadingMsg(false);
    }
  }, [accountId, order]);

  useEffect(() => {
    loadConversations(accountId);
  }, [accountId, loadConversations]);

  useEffect(() => {
    if (active) loadMessages(active);
  }, [active, order, loadMessages]);

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
      console.log('[Zalo WebSocket] ✅ Connected successfully');
      console.log('[Zalo WebSocket] URL:', wsUrl);
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
        console.log('[Zalo WebSocket] Raw message received:', raw);
        
        if (!raw) {
          console.log('[Zalo WebSocket] Empty message, skipping');
          return;
        }

        const payload = JSON.parse(raw);
        console.log('[Zalo WebSocket] Parsed payload:', payload);
        
        if (!payload || typeof payload !== 'object') {
          console.log('[Zalo WebSocket] Invalid payload format, skipping');
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
            // Handle realtime message - can be processed similar to zalo_message
            console.log('Realtime message received:', payload.data);
          }
          return;
        }

        // Handle Zalo message
        console.log('[Zalo WebSocket] Checking payload type:', payload.type, 'Has data:', !!payload.data);
        
        // Log if payload type is not recognized
        if (payload.type !== 'pong' && 
            payload.type !== 'ack' && 
            payload.type !== 'notification' && 
            payload.type !== 'realtime' && 
            payload.type !== 'zalo_message') {
          console.log('[Zalo WebSocket] ⚠️ Unknown payload type:', payload.type, 'Full payload:', payload);
        }
        
        if (payload.type === 'zalo_message' && payload.data) {
          console.log('[Zalo WebSocket] 📨 Received zalo_message:', payload.data);
          const d = payload.data as {
            thread_id?: string | number;
            msg_id?: string;
            is_self?: boolean;
            d_name?: string;
            content?: string;
            ts?: number | string;
            direction?: string;
            [key: string]: unknown;
          };

          const threadId = d.thread_id ? String(d.thread_id) : null;
          console.log('[Zalo WebSocket] Thread ID:', threadId, 'Message data:', d);
          if (!threadId) {
            console.log('[Zalo WebSocket] ⚠️ No thread_id found, skipping message');
            return;
          }

          // Update conversation preview
          setConversations((prev) =>
            prev.map((c) => {
              const t = c.thread_id;
              if (t && String(t) === threadId) {
                return {
                  ...c,
                  last_content: d.content || c.last_content,
                  last_ts: d.ts || c.last_ts,
                };
              }
              return c;
            })
          );

          // Always update messages if this conversation exists in our list
          // This ensures incoming messages are captured even if not currently active
          const isActiveConversation = active && active.thread_id && String(active.thread_id) === threadId;
          const conversationExists = conversations.some(c => {
            const t = c.thread_id;
            return t && String(t) === threadId;
          });
          
          // Add message if it's the active conversation OR if conversation exists (for incoming messages)
          console.log('[Zalo WebSocket] Message processing:', {
            isActiveConversation,
            conversationExists,
            is_self: d.is_self,
            willProcess: isActiveConversation || (conversationExists && !d.is_self),
          });
          
          if (isActiveConversation || (conversationExists && !d.is_self)) {
            // Dedupe: check if this message was recently sent optimistically
            const now = Date.now();
            const windowMs = 4000;
            const recent = recentlySentRef.current[threadId] || [];
            const filtered = recent.filter((it) => now - it.time <= windowMs);
            recentlySentRef.current[threadId] = filtered;

            const isSelfOut = !!d.is_self || String(d.direction || '').toLowerCase() === 'out';
            if (isSelfOut) {
              // Check if this matches a recently sent message
              const normalizedText = (d.content || '').trim();
              const idx = filtered.findIndex(
                (it) => it.text && it.text.trim() === normalizedText
              );
              if (idx >= 0) {
                // This is likely a duplicate from our optimistic update
                // Remove from recently sent to prevent future duplicates
                filtered.splice(idx, 1);
                recentlySentRef.current[threadId] = filtered;
                
                // Replace optimistic message with real message from server
                setMessages((prev) => {
                  // Find and remove optimistic message with matching text
                  const optimisticIdx = prev.findIndex(
                    (m) => m.id.startsWith('temp-') && 
                           m.is_self === true && 
                           m.content && 
                           m.content.trim() === normalizedText
                  );
                  
                  if (optimisticIdx >= 0) {
                    // Replace optimistic with real message
                    const newMessages = [...prev];
                    newMessages[optimisticIdx] = {
                      id: d.msg_id || `${Date.now()}-${Math.random()}`,
                      is_self: !!d.is_self,
                      d_name: d.d_name,
                      content: d.content || '',
                      ts: d.ts || Date.now(),
                      created_at: typeof d.ts === 'number' ? new Date(d.ts).toISOString() : new Date().toISOString(),
                    };
                    return newMessages;
                  }
                  
                  // If no optimistic found, check if message already exists
                  const exists = prev.some((m) => {
                    if (m.id === (d.msg_id || '')) return true;
                    if (
                      m.ts === (d.ts || 0) &&
                      m.content === (d.content || '') &&
                      m.is_self === (!!d.is_self)
                    ) {
                      return true;
                    }
                    return false;
                  });
                  
                  if (exists) return prev;
                  
                  // Add new message
                  return [...prev, {
                    id: d.msg_id || `${Date.now()}-${Math.random()}`,
                    is_self: !!d.is_self,
                    d_name: d.d_name,
                    content: d.content || '',
                    ts: d.ts || Date.now(),
                    created_at: typeof d.ts === 'number' ? new Date(d.ts).toISOString() : new Date().toISOString(),
                  }];
                });
                return;
              }
            }

            // Create message object
            const newMsg: ZaloMessage = {
              id: d.msg_id || `${Date.now()}-${Math.random()}`,
              is_self: !!d.is_self,
              d_name: d.d_name,
              content: d.content || '',
              ts: d.ts || Date.now(),
              created_at: typeof d.ts === 'number' ? new Date(d.ts).toISOString() : new Date().toISOString(),
            };

            // Add message to list (avoid duplicates)
            setMessages((prev) => {
              // Check if message already exists
              const exists = prev.some((m) => {
                if (m.id === newMsg.id) return true;
                // Also check by ts and content for duplicates
                if (
                  m.ts === newMsg.ts &&
                  m.content === newMsg.content &&
                  m.is_self === newMsg.is_self
                ) {
                  return true;
                }
                return false;
              });

              if (exists) return prev;
              return [...prev, newMsg];
            });
          }
        }
      } catch (error) {
        console.error('[Zalo WebSocket] ❌ Error parsing WebSocket message:', error);
        console.error('[Zalo WebSocket] Error details:', {
          error,
          eventData: event.data,
          rawString: String(event.data ?? ''),
        });
      }
    };

    ws.onerror = (error) => {
      console.error('[Zalo WebSocket] ❌ Error:', error);
      console.error('[Zalo WebSocket] Error details:', {
        type: error.type,
        target: error.target,
        currentTarget: error.currentTarget,
      });
    };

    ws.onclose = (event) => {
      console.log('[Zalo WebSocket] 🔌 Closed:', {
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
  }, [accountId, active, conversations]);

  // Function to send message via WebSocket (optional, can use HTTP API instead)
  // Currently not used but available for future use
  // const sendMessageViaWebSocket = useCallback((message: { type: string; data?: unknown; [key: string]: unknown }) => {
  //   if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
  //     try {
  //       wsRef.current.send(JSON.stringify(message));
  //       return true;
  //     } catch (error) {
  //       console.error('Error sending message via WebSocket:', error);
  //       return false;
  //     }
  //   }
  //   return false;
  // }, []);

  const sendText = useCallback(async (text: string) => {
    if (!active) return;
    const threadId = active.thread_id || '';
    const accId = accountId;
    if (!threadId) return;

    // Track recently sent message for deduplication
    const tid = String(threadId);
    if (!recentlySentRef.current[tid]) {
      recentlySentRef.current[tid] = [];
    }
    recentlySentRef.current[tid].push({
      text,
      time: Date.now(),
    });

    // optimistic append
    const optimistic = {
      id: `temp-${Date.now()}`,
      content: text,
      is_self: true,
      ts: Date.now(),
      created_at: new Date().toISOString(),
    } as ZaloMessage;
    setMessages(prev => [...prev, optimistic]);

    try {
      // Option 1: Send via HTTP API (current method)
      await sendZaloTextMessage(threadId, text, accId);
      
      // Option 2: Also try to send via WebSocket if needed (for future use)
      // sendMessageViaWebSocket({
      //   type: 'message',
      //   data: {
      //     text,
      //     thread_id: threadId,
      //     account_id: accId,
      //     timestamp: new Date().toISOString(),
      //   }
      // });

      // WebSocket will receive the actual message, so we don't need to reload
      // But we'll keep the optimistic message for a short time in case WebSocket is delayed
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
    } catch (e) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      // Remove from recently sent
      const recent = recentlySentRef.current[tid] || [];
      const idx = recent.findIndex((it) => it.text === text);
      if (idx >= 0) recent.splice(idx, 1);
      recentlySentRef.current[tid] = recent;

      // Add error message
      const errMsg = {
        id: `error-${Date.now()}`,
        content: 'Gửi thất bại. Vui lòng thử lại.',
        is_self: true,
        ts: Date.now(),
        created_at: new Date().toISOString(),
      } as ZaloMessage;
      setMessages(prev => [...prev, errMsg]);
      throw e;
    }
  }, [active, accountId]);

  return {
    accountId,
    setAccountId,
    conversations,
    loadingList,
    errorList,
    active,
    setActive,
    messages,
    loadingMsg,
    errorMsg,
    order,
    setOrder,
    refreshList: () => loadConversations(accountId),
    refreshMessages: () => loadMessages(active || undefined),
    sendText
  };
}
