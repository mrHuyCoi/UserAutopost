// src/hooks/useChannels.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Channel } from '../types/channel';
import { getFacebookPages, FacebookAccount } from '../../../services/facebookService';
import { getZaloSessions, ZaloSessionInfo } from '../../../services/zaloService';
import { listOaAccounts, OaAccountItem } from '../../../services/zaloOAService';

type LoadState = 'idle' | 'loading' | 'error' | 'ready';

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [state, setState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);

  const mapFB = (pages: FacebookAccount[]): Channel[] =>
    pages.map(p => ({
      id: `messenger-${p.id}`,
      name: p.account_name || `Page ${p.account_id}`,
      type: 'messenger',
      status: p.is_active ? 'connected' : 'disconnected',
      // lưu pageId để dùng khi gọi hội thoại
      phone: p.account_id, // tạm reuse field phone để giữ page_id
    }));

  const mapZaloSessions = (items: ZaloSessionInfo[]): Channel[] =>
    items.map(s => ({
      id: `zalo-${s.id}`,
      name: s.display_name || s.account_id || s.session_key,
      type: 'zalo',
      status: s.is_active ? 'connected' : 'disconnected',
      phone: s.account_id || undefined,
    }));

  const mapOa = (items: OaAccountItem[]): Channel[] =>
    items.map(o => ({
      id: `zalo-oa-${o.id}`,
      name: o.name || o.oa_id,
      type: 'zalo-oa',
      status: (o.status === 'connected' || o.connected_at) ? 'connected' : 'disconnected',
    }));

  const refresh = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const [fb, zalo, oa] = await Promise.allSettled([
        getFacebookPages(),
        getZaloSessions().then(r => r.items || []),
        listOaAccounts().then(r => r.data || []),
      ]);

      const fbCh = fb.status === 'fulfilled' ? mapFB(fb.value) : [];
      const zaloCh = zalo.status === 'fulfilled' ? mapZaloSessions(zalo.value) : [];
      const oaCh = oa.status === 'fulfilled' ? mapOa(oa.value) : [];

      setChannels([...fbCh, ...zaloCh, ...oaCh]);
      setState('ready');
    } catch (e: any) {
      setError(e?.message || 'Không tải được danh sách kênh');
      setState('error');
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addChannel = (channel: Channel) => {
    // Với kênh “thêm tay” từ modal, chỉ push vào UI (backend có thể tạo sau)
    setChannels(prev => [...prev, channel]);
  };

  const deleteChannel = (channelId: string) => {
    setChannels(prev => prev.filter(c => c.id !== channelId));
  };

  const updateChannelStatus = (channelId: string, status: 'connected' | 'disconnected') => {
    setChannels(prev => prev.map(c => (c.id === channelId ? { ...c, status } : c)));
  };

  const connectedCount = useMemo(
    () => channels.filter(c => c.status === 'connected').length,
    [channels]
  );

  return {
    channels,
    state,
    error,
    refresh,
    addChannel,
    deleteChannel,
    updateChannelStatus,
    connectedCount,
  };
};
