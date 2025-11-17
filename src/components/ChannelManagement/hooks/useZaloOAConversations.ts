import { useCallback, useEffect, useState } from 'react';
import {
  listOaConversations,
  listOaMessages,
  sendOaTextMessage,
  sendOaImageMessage,
  uploadOaImage,
  OaConversationItem,
  OaMessageItem,
} from '../../../services/zaloOAService';

export function useZaloOAConversations(accountId?: string) {
  const [conversations, setConversations] = useState<OaConversationItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<OaMessageItem[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const sendText = useCallback(async (toUserId: string, text: string) => {
    if (!accountId) return;

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
      // Reload messages to get the actual message from server
      await loadMessages(activeConversationId || undefined, accountId);
    } catch (e: unknown) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
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
  }, [accountId, activeConversationId, loadMessages]);

  const sendImage = useCallback(async (toUserId: string, file: File) => {
    if (!accountId) return;

    try {
      // Upload image first
      const uploadRes = await uploadOaImage(accountId, file);
      const attachmentId = uploadRes.data?.attachment_id;
      if (!attachmentId) throw new Error('Không lấy được attachment_id');

      // Send image
      await sendOaImageMessage(accountId, toUserId, attachmentId);
      
      // Reload messages
      await loadMessages(activeConversationId || undefined, accountId);
    } catch (e: unknown) {
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
  }, [accountId, activeConversationId, loadMessages]);

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

