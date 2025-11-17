// src/hooks/useMessengerConversations.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getFacebookPages,
  getFBConversations,
  getFBConversationMessages,
  sendFBTextMessage,
  FBConversationItem,
  FBMessageItem,
  FacebookAccount,
} from '../../../services/facebookService';

export function useMessengerConversations() {
  const [pages, setPages] = useState<FacebookAccount[]>([]);
  const [activePage, setActivePage] = useState<FacebookAccount | null>(null);

  const [convs, setConvs] = useState<FBConversationItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errList, setErrList] = useState<string | null>(null);
  const [cursorAfter, setCursorAfter] = useState<string | undefined>();
  const [cursorBefore, setCursorBefore] = useState<string | undefined>();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<FBMessageItem[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // load pages
  useEffect(() => {
    (async () => {
      try {
        const p = await getFacebookPages();
        setPages(p || []);
        setActivePage(p?.[0] || null);
      } catch (e: any) {
        setErrList(e?.message || 'Không tải được Page');
      }
    })();
  }, []);

  const loadConversations = useCallback(async (direction?: 'next' | 'prev') => {
    if (!activePage?.account_id) return;
    setLoadingList(true);
    setErrList(null);
    try {
      const res = await getFBConversations(
        activePage.account_id,
        'messenger',
        25,
        direction === 'prev' ? cursorBefore : undefined,
        direction === 'next' ? cursorAfter : undefined
      );
      setConvs(res.data || []);
      setCursorAfter(res.paging?.cursors?.after);
      setCursorBefore(res.paging?.cursors?.before);
    } catch (e: any) {
      setErrList(e?.message || 'Không tải được hội thoại');
    } finally {
      setLoadingList(false);
    }
  }, [activePage, cursorAfter, cursorBefore]);

  useEffect(() => {
    setConvs([]);
    setActiveConvId(null);
    if (activePage) loadConversations();
  }, [activePage, loadConversations]);

  const loadMessages = useCallback(async (convId?: string) => {
    if (!activePage?.account_id || !convId) return;
    setLoadingMsg(true);
    setErrMsg(null);
    try {
      const res = await getFBConversationMessages(activePage.account_id, convId, 50);
      const list = res.messages?.data || [];
      // đảo ngược để cũ -> mới
      list.sort((a, b) => (a.created_time || '').localeCompare(b.created_time || ''));
      setMsgs(list);
    } catch (e: any) {
      setErrMsg(e?.message || 'Không tải được tin nhắn');
    } finally {
      setLoadingMsg(false);
    }
  }, [activePage]);

  const selectConversation = useCallback((convId: string) => {
    setActiveConvId(convId);
  }, []);

  useEffect(() => {
    if (activeConvId) loadMessages(activeConvId);
  }, [activeConvId, loadMessages]);

  const sendText = useCallback(async (psid: string, text: string) => {
    if (!activePage?.account_id) return;
    // append optimistic
    const optimistic: FBMessageItem = {
      id: `${Date.now()}`,
      created_time: new Date().toISOString(),
      from: { id: 'me', name: 'me' },
      message: text,
    };
    setMsgs(prev => [...prev, optimistic]);
    try {
      await sendFBTextMessage(activePage.account_id, psid, text);
      // Optionally: reload messages
      // await loadMessages(activeConvId || undefined);
    } catch (e) {
      const errItem: FBMessageItem = {
        id: `${Date.now()}-err`,
        created_time: new Date().toISOString(),
        from: { id: 'me', name: 'me' },
        message: 'Gửi thất bại. Vui lòng thử lại.',
      };
      setMsgs(prev => [...prev, errItem]);
      throw e;
    }
  }, [activePage/*, activeConvId*/]);

  const psidOfActive = useMemo(() => {
    const conv = convs.find(c => c.id === activeConvId);
    // participants: khách và page. Tìm participant không phải pageId
    const partner = conv?.participants?.data?.find(p => p?.id !== activePage?.account_id);
    return partner?.id || '';
  }, [convs, activeConvId, activePage]);

  return {
    pages, activePage, setActivePage,
    convs, loadingList, errList, loadConversations,
    activeConvId, selectConversation,
    msgs, loadingMsg, errMsg, loadMessages,
    sendText,
    psidOfActive,
  };
}
