import { useEffect, useRef, useState, useCallback } from 'react';
import { getAuthToken } from '../services/apiService';
import { getFBConversationMessages } from '../services/facebookService';
import type { FBMessageItem } from '../services/facebookService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000';

interface WebSocketMessage {
  type: string;
  event?: string;
  page_id?: string;
  sender_id?: string;
  message?: {
    id: string;
    mid?: string;
    text?: string;
    direction?: 'in' | 'out';
    timestamp_ms?: number;
    created_time?: string;
    attachments?: {
      data?: Array<{
        id?: string;
        image_data?: {
          url?: string;
          preview_url?: string;
        };
        name?: string;
      }>;
    };
    status?: string;
    from?: {
      id?: string;
      name?: string;
    };
  };
}

interface UseMessengerWebSocketOptions {
  pageId: string | null;
  psid: string | null;
  conversationId: string | null;
  enabled?: boolean;
  onNewMessage?: (message: FBMessageItem) => void;
  onConversationUpdate?: (pageId: string, psid: string) => void;
}

export const useMessengerWebSocket = ({
  pageId,
  psid,
  conversationId,
  enabled = true,
  onNewMessage,
  onConversationUpdate,
}: UseMessengerWebSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const [usePolling, setUsePolling] = useState(false);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 seconds
  const PING_INTERVAL = 30000; // 30 seconds
  const POLLING_INTERVAL = 5000; // 5 seconds (fallback)

  // Cleanup function
  const cleanup = useCallback(() => {
    // Clear WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        console.error('[Messenger WS] Error closing WebSocket:', e);
      }
      wsRef.current = null;
    }

    // Clear ping interval
    if (pingIntervalRef.current) {
      try {
        window.clearInterval(pingIntervalRef.current);
      } catch {
        // Ignore
      }
      pingIntervalRef.current = null;
    }

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      try {
        window.clearTimeout(reconnectTimeoutRef.current);
      } catch {
        // Ignore
      }
      reconnectTimeoutRef.current = null;
    }

    // Clear polling interval
    if (pollingIntervalRef.current) {
      try {
        window.clearInterval(pollingIntervalRef.current);
      } catch {
        // Ignore
      }
      pollingIntervalRef.current = null;
    }
  }, []);

  // Polling fallback function
  const startPolling = useCallback(async () => {
    if (!pageId || !psid || !conversationId) return;

    const poll = async () => {
      try {
        const res = await getFBConversationMessages(pageId, conversationId, 20);
        const items = res?.messages?.data || [];
        
        if (items.length > 0) {
          // Find new messages
          const newMessages = items.filter((msg) => {
            if (!lastMessageIdRef.current) {
              lastMessageIdRef.current = msg.id;
              return false; // Don't add first message, just set reference
            }
            const isNew = msg.id !== lastMessageIdRef.current;
            return isNew;
          });

          // Update last message ID
          if (items[0]?.id) {
            lastMessageIdRef.current = items[0].id;
          }

          // Call onNewMessage for each new message
          newMessages.forEach((msg) => {
            if (onNewMessage) {
              try {
                onNewMessage(msg);
              } catch (callbackError) {
                console.error(`[Messenger Polling] ❌ Error in onNewMessage callback:`, callbackError);
              }
            }
          });
        }
      } catch (error) {
        console.error('[Messenger Polling] ❌ Error polling messages:', error);
      }
    };

    // Initial poll
    await poll();

    // Set up interval
    pollingIntervalRef.current = window.setInterval(poll, POLLING_INTERVAL);
  }, [pageId, psid, conversationId, onNewMessage]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      window.clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    lastMessageIdRef.current = null;
  }, []);

  // Connect WebSocket
  const connect = useCallback(() => {
    // Don't connect if disabled or missing required params
    if (!enabled || !pageId || !psid) {
      return;
    }

    // Don't reconnect if already connected or connecting
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setConnectionError('No authentication token');
      return;
    }

    // Build WebSocket URL
    const host = API_BASE_URL.replace(/^https?:\/\//, '');
    const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
    const wsUrl = `${wsProtocol}://${host}/api/v1/ws?token=${encodeURIComponent(token)}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
        setUsePolling(false);
        stopPolling(); // Stop polling when WS connects

        // Start ping interval
        if (pingIntervalRef.current) {
          window.clearInterval(pingIntervalRef.current);
        }
        pingIntervalRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({ type: 'ping' }));
            } catch (e) {
              console.error('[Messenger WS] Error sending ping:', e);
            }
          }
        }, PING_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const raw = String(event.data ?? '');
          
          if (!raw.trim()) {
            return;
          }

          const data: WebSocketMessage = JSON.parse(raw);

          // Handle pong response
          if (data.type === 'pong') {
            return;
          }

          // Handle new message
          if (data.type === 'new_message' && data.message) {
            const { page_id, sender_id, message: msgData } = data;

            // Verify this message is for the current conversation
            // Use string comparison to handle number/string mismatch
            const pageIdMatches = String(page_id) === String(pageId);
            const senderIdMatches = String(sender_id) === String(psid);
            
            if (pageIdMatches && senderIdMatches) {
              // Convert WebSocket message format to FBMessageItem format
              const fbMessage: FBMessageItem = {
                id: msgData.id || msgData.mid || `ws-${Date.now()}`,
                created_time: msgData.created_time || 
                  (msgData.timestamp_ms ? new Date(msgData.timestamp_ms).toISOString() : undefined),
                message: msgData.text || '',
                from: msgData.from || {
                  id: msgData.direction === 'out' ? pageId : sender_id,
                },
              };

              // Update last message ID for polling fallback
              if (fbMessage.id) {
                lastMessageIdRef.current = fbMessage.id;
              }

              // Call callback
              if (onNewMessage) {
                try {
                  onNewMessage(fbMessage);
                } catch (callbackError) {
                  console.error('[Messenger WS] ❌ Error in onNewMessage callback:', callbackError);
                }
              }
            } else {
              // Message from different conversation
              if (onConversationUpdate && page_id && sender_id) {
                onConversationUpdate(page_id, sender_id);
              }
            }
          }
        } catch (error) {
          console.error('[Messenger WS] ❌ Error parsing message:', error);
          console.error('[Messenger WS] Raw message:', event.data);
        }
      };

      ws.onerror = (error) => {
        console.error('[Messenger WS] ❌ WebSocket error:', error);
        console.error('[Messenger WS] ❌ Error details:', {
          type: error.type,
          target: error.target,
          readyState: ws.readyState,
          url: wsUrl,
        });
        setIsConnected(false);
        setConnectionError('WebSocket connection error');
      };

      ws.onclose = (event) => {
        setIsConnected(false);

        // Cleanup ping interval
        if (pingIntervalRef.current) {
          window.clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Attempt reconnect if not a clean close and we haven't exceeded max attempts
        if (
          !event.wasClean &&
          reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS &&
          enabled &&
          pageId &&
          psid
        ) {
          reconnectAttemptsRef.current += 1;

          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          // Switch to polling after max reconnect attempts
          setUsePolling(true);
          setConnectionError('WebSocket connection failed, using polling fallback');
        }
      };
    } catch (error) {
      console.error('[Messenger WS] Error creating WebSocket:', error);
      setConnectionError('Failed to create WebSocket connection');
      setIsConnected(false);
    }
  }, [enabled, pageId, psid, onNewMessage, onConversationUpdate, stopPolling]);

  // Main effect: connect/disconnect based on dependencies
  useEffect(() => {
    if (!enabled || !pageId || !psid) {
      cleanup();
      setIsConnected(false);
      return;
    }

    // Only connect if not already connected
    const currentState = wsRef.current?.readyState;
    if (currentState === WebSocket.OPEN || currentState === WebSocket.CONNECTING) {
      return;
    }

    // Connect WebSocket
    connect();

    // Cleanup on unmount or dependency change
    return () => {
      cleanup();
    };
  }, [enabled, pageId, psid, connect, cleanup]);

  // Fallback to polling if WebSocket fails
  useEffect(() => {
    if (usePolling && enabled && pageId && psid && conversationId) {
      startPolling();
      return () => {
        stopPolling();
      };
    } else {
      stopPolling();
    }
  }, [usePolling, enabled, pageId, psid, conversationId, startPolling, stopPolling]);

  // Reset last message ID when conversation changes
  useEffect(() => {
    lastMessageIdRef.current = null;
  }, [conversationId]);

  // Test connection function - can be called manually
  const testConnection = useCallback(() => {
    const ws = wsRef.current;
    if (!ws) {
      return {
        connected: false,
        readyState: 'NONE',
        error: 'No WebSocket instance',
      };
    }

    const readyState = ws.readyState;
    const readyStateText = 
      readyState === WebSocket.OPEN ? 'OPEN' :
      readyState === WebSocket.CONNECTING ? 'CONNECTING' :
      readyState === WebSocket.CLOSING ? 'CLOSING' :
      readyState === WebSocket.CLOSED ? 'CLOSED' : 'UNKNOWN';

    const result = {
      connected: readyState === WebSocket.OPEN,
      readyState,
      readyStateText,
      url: ws.url,
      isConnected,
      connectionError,
      usePolling,
      pageId,
      psid,
    };

    return result;
  }, [isConnected, connectionError, usePolling, pageId, psid]);

  return {
    isConnected,
    connectionError,
    usePolling,
    reconnect: connect,
    testConnection,
  };
};


