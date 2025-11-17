// src/hooks/useZaloConversations.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getZaloConversations, getZaloMessages, sendZaloTextMessage, ZaloConversation, ZaloMessage } from '../../../services/zaloService';

type Order = 'asc' | 'desc';

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

  const loadConversations = useCallback(async (acc?: string) => {
    if (!acc) return;
    setLoadingList(true);
    setErrorList(null);
    try {
      const res = await getZaloConversations(acc);
      setConversations(res.items || []);
    } catch (e: any) {
      setErrorList(e?.message || 'Không tải được hội thoại');
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
    } catch (e: any) {
      setErrorMsg(e?.message || 'Không tải được tin nhắn');
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

  const sendText = useCallback(async (text: string) => {
    if (!active) return;
    const threadId = active.thread_id || '';
    const accId = accountId;
    if (!threadId) return;

    // optimistic append
    const optimistic = {
      id: `${Date.now()}`,
      content: text,
      is_self: true,
      ts: Date.now(),
      created_at: new Date().toISOString(),
    } as ZaloMessage;
    setMessages(prev => [...prev, optimistic]);

    try {
      await sendZaloTextMessage(threadId, text, accId);
    } catch (e) {
      // rollback UI? Tùy bạn, ở đây chỉ thêm một message báo lỗi
      const errMsg = {
        id: `${Date.now()}-err`,
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
