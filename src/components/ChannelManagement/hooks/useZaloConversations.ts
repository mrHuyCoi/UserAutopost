// src/hooks/useZaloConversations.ts
import { useCallback, useEffect, useState, useRef } from "react";
import {
  getZaloConversations,
  getZaloMessages,
  sendZaloTextMessage,
  ZaloConversation,
  ZaloMessage,
} from "../../../services/zaloService";
import { getAuthToken, getApiKey } from "../../../services/apiService";

type Order = "asc" | "desc";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://test.doiquanai.vn";

export function useZaloConversations(defaultAccountId?: string) {
  const [accountId, setAccountId] = useState<string | undefined>(
    defaultAccountId
  );
  const [conversations, setConversations] = useState<ZaloConversation[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  const [active, setActive] = useState<ZaloConversation | null>(null);

  const [messages, setMessages] = useState<ZaloMessage[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [order, setOrder] = useState<Order>("asc"); // backend default asc

  // WebSocket refs
  const activeRef = useRef<ZaloConversation | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const recentlySentRef = useRef<
    Record<string, Array<{ text?: string; kind?: string; time: number }>>
  >({});
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  const loadConversations = useCallback(async (acc?: string) => {
    if (!acc) return;
    setLoadingList(true);
    setErrorList(null);
    try {
      const res = await getZaloConversations(acc);
      console.log("res", res);
      setConversations(res.items || []);
    } catch (e: unknown) {
      const error = e as { message?: string };
      setErrorList(error?.message || "Không tải được hội thoại");
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (conv?: ZaloConversation) => {
      if (!conv?.thread_id) {
        setMessages([]);
        return;
      }
      setLoadingMsg(true);
      try {
        // Mặc định lấy 50 tin mới nhất
        const res = await getZaloMessages(
          conv.thread_id,
          undefined,
          50,
          "desc",
          accountId
        );
        // Backend trả về DESC (mới nhất trước), đảo ngược lại để hiển thị chat (cũ nhất trên cùng)
        setMessages(res.items.reverse() || []);
      } catch (e: unknown) {
        const error = e as { message?: string };
        setErrorMsg(error?.message || "Lỗi tải tin nhắn");
      } finally {
        setLoadingMsg(false);
      }
    },
    [accountId]
  );

  useEffect(() => {
    if (accountId) loadConversations(accountId);
  }, [accountId, loadConversations]);

  useEffect(() => {
    if (active) loadMessages(active);
  }, [active, order, loadMessages]);

  // WebSocket connection for real-time messages
  useEffect(() => {
    if (!accountId) return;

    const token = getAuthToken();
    if (!token) return;

    // Setup URL
    const host = API_BASE_URL.replace(/^https?:\/\//, "");
    const wsProtocol = API_BASE_URL.startsWith("https") ? "wss" : "ws";
    const wsUrl = `${wsProtocol}://${host}/api/v1/ws?token=${encodeURIComponent(
      token
    )}`;

    console.log("[WS] Connecting to:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected");
      // Ping keep-alive
      pingIntervalRef.current = window.setInterval(() => {
        if (ws.readyState === WebSocket.OPEN)
          ws.send(JSON.stringify({ type: "ping" }));
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "pong" || payload.type === "ack") return;

        // Xử lý tin nhắn đến
        if (payload.type === "zalo_message" && payload.data) {
          handleIncomingMessage(payload.data);
        }
      } catch (e) {
        console.error("[WS] Parse error", e);
      }
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected");
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      // Simple reconnect logic (optional)
    };

    return () => {
      ws.close();
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };

    // QUAN TRỌNG: Chỉ chạy lại khi accountId thay đổi, KHÔNG phụ thuộc active/conversations
  }, [accountId]);

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

  const handleIncomingMessage = (data: any) => {
    const threadId = String(data.thread_id);
    const currentActiveThreadId = activeRef.current?.thread_id; // Đọc từ Ref

    // A. Cập nhật Snippet ở Sidebar (Conversations List)
    setConversations((prev) => {
      // Tìm xem hội thoại đã tồn tại chưa
      const exists = prev.some((c) => c.thread_id === threadId);

      if (exists) {
        // Nếu có rồi: update nội dung cuối & đưa lên đầu
        const updatedList = prev.map((c) => {
          if (c.thread_id === threadId) {
            return {
              ...c,
              last_content: data.content,
              last_ts: data.ts,
            };
          }
          return c;
        });
        // Sort lại để thread vừa có tin nhắn nhảy lên đầu (Optional)
        return updatedList.sort(
          (a, b) => Number(b.last_ts) - Number(a.last_ts)
        );
      } else {
        // Nếu chưa có (tin nhắn từ người lạ mới): Nên gọi API load lại list
        // Hoặc tạm thời append vào (cần đúng cấu trúc ZaloConversation)
        return prev;
      }
    });

    // B. Nếu tin nhắn thuộc Thread đang mở -> Append vào list Messages
    if (currentActiveThreadId && String(currentActiveThreadId) === threadId) {
      setMessages((prevMsgs) => {
        // 1. Kiểm tra duplicate (Do socket mạng lag có thể gửi 2 lần)
        const isDuplicate = prevMsgs.some((m) => m.id === data.msg_id);
        if (isDuplicate) return prevMsgs;

        // 2. Xử lý Optimistic Message (Tin nhắn ảo tự tạo lúc gửi)
        // Nếu tin nhắn này là "is_self" (mình gửi) -> Tìm và thay thế tin nhắn tạm
        if (data.is_self) {
          // Tìm tin nhắn tạm có nội dung giống
          const tempMsgIndex = prevMsgs.findIndex(
            (m) => m.id.startsWith("temp-") && m.content === data.content
          );

          if (tempMsgIndex !== -1) {
            const newArr = [...prevMsgs];
            newArr[tempMsgIndex] = {
              ...newArr[tempMsgIndex],
              id: data.msg_id, // Cập nhật ID thật
              ts: data.ts,
              created_at: new Date(data.ts).toISOString(),
            };
            return newArr;
          }
        }

        // 3. Tin nhắn mới bình thường
        const newMsg: ZaloMessage = {
          id: data.msg_id || `ws-${Date.now()}`,
          content: data.content,
          is_self: !!data.is_self,
          d_name: data.d_name,
          ts: data.ts,
          created_at: new Date(data.ts).toISOString(),
          // Các trường khác nếu cần
        };
        return [...prevMsgs, newMsg];
      });
    }
  };

  const sendText = useCallback(
    async (text: string) => {
      if (!active) return;
      const threadId = active.thread_id || "";
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
      setMessages((prev) => [...prev, optimistic]);

      try {
        console.log("ok");
        // Option 1: Send via HTTP API (current method)
        const res = await sendZaloTextMessage(threadId, text, accId);
        console.log("res send text", res);

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
            if (optimisticMsg && optimisticMsg.id.startsWith("temp-")) {
              // If optimistic message still exists, keep it (WebSocket might be delayed)
              return prev;
            }
            return prev;
          });
        }, 2000);
      } catch (e) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        // Remove from recently sent
        const recent = recentlySentRef.current[tid] || [];
        const idx = recent.findIndex((it) => it.text === text);
        if (idx >= 0) recent.splice(idx, 1);
        recentlySentRef.current[tid] = recent;

        // Add error message
        const errMsg = {
          id: `error-${Date.now()}`,
          content: "Gửi thất bại. Vui lòng thử lại.",
          is_self: true,
          ts: Date.now(),
          created_at: new Date().toISOString(),
        } as ZaloMessage;
        setMessages((prev) => [...prev, errMsg]);
        throw e;
      }
    },
    [active, accountId]
  );

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
    sendText,
  };
}
