import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PostComposer } from '../components/PostComposer';
import { PostHistory } from '../components/PostHistory';
import { PromptManager } from '../components/PromptManager';
import type { PlatformAccount } from '../types/platform';
import {
  getPublishedPlatformPosts,
  getUnpublishedPlatformPosts,
  updateScheduledPost as svcUpdateScheduledPost,
  deleteScheduledPost as svcDeleteScheduledPost,
  retryFailedPost as svcRetryFailedPost,
  publishPost as svcPublishPost,
  PlatformPost,
} from '../services/scheduledPostService';
import {
  getFacebookPages,
  getInstagramAccounts,
  getYoutubeAccounts,
} from '../services/facebookService';

type ApiAccount = {
  id: string;
  platform: string;
  account_name: string;
  account_id: string;
  thumbnail?: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type PlatformKey = 'facebook' | 'instagram' | 'youtube';

const asPlatformKey = (val: string): PlatformKey => {
  const v = (val || '').toLowerCase();
  if (v.includes('insta')) return 'instagram';
  if (v.includes('you')) return 'youtube';
  return 'facebook';
};

const PLATFORM_STYLE: Record<
  PlatformKey,
  { platformId: string; platformName: string; color: string; gradient: string; icon: string }
> = {
  facebook: {
    platformId: 'facebook',
    platformName: 'Facebook',
    color: '#1877F2',
    gradient: 'linear-gradient(135deg, #4e8ef7 0%, #1a6afc 100%)',
    icon: 'facebook',
  },
  instagram: {
    platformId: 'instagram',
    platformName: 'Instagram',
    color: '#E1306C',
    gradient: 'linear-gradient(135deg, #feda75 0%, #fa7e1e 30%, #d62976 60%, #962fbf 100%)',
    icon: 'instagram',
  },
  youtube: {
    platformId: 'youtube',
    platformName: 'YouTube',
    color: '#FF0000',
    gradient: 'linear-gradient(135deg, #ff6a6a 0%, #ff0000 100%)',
    icon: 'youtube',
  },
};

interface BackendPost {
  id: string;
  social_account_id: string;
  platform: string;
  status: string;
  scheduled_at: string;
  generated_content: string | null;
  post_url: string | null;
  created_at: string;
  updated_at: string;
}

const toPlatformAccount = (a: ApiAccount): PlatformAccount => {
  const key = asPlatformKey(a.platform);
  const style = PLATFORM_STYLE[key];
  return {
    id: a.id,
    platformId: style.platformId,
    platformName: style.platformName,
    accountName: a.account_name,
    accessToken: '',
    connected: a.is_active,
    lastPost: undefined,
    followers: undefined,
    profileInfo: {
      username: undefined,
      displayName: a.account_name,
      profilePicture: a.thumbnail ?? undefined,
      verified: undefined,
    },
    createdAt: a.created_at ? new Date(a.created_at) : new Date(),
    color: style.color,
    gradient: style.gradient,
    icon: style.icon,
  };
};

const normalizePlatformPost = (p: PlatformPost): BackendPost => ({
  id: String(p.id),
  social_account_id: String((p as any).social_account_id || (p as any).account_id || ''),
  platform: String((p as any).platform || (p as any).platform_type || 'facebook'),
  status: String(p.status),
  scheduled_at: String(p.scheduled_at),
  generated_content:
    typeof (p as any).preview_content === 'string'
      ? (p as any).preview_content
      : ((p as any).generated_content as string) ?? null,
  post_url: (p as any).post_url ?? null,
  created_at: String(p.created_at),
  updated_at: String(p.updated_at),
});

export const PostsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<PlatformAccount[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<BackendPost[]>([]);
  const [unpublishedPosts, setUnpublishedPosts] = useState<BackendPost[]>([]);
  const [isLoadingPublished, setIsLoadingPublished] = useState(false);
  const [isLoadingUnpublished, setIsLoadingUnpublished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    try {
      const [fb, ig, yt] = await Promise.allSettled([
        getFacebookPages(),
        getInstagramAccounts(),
        getYoutubeAccounts(),
      ]);
      const list: PlatformAccount[] = [];
      if (fb.status === 'fulfilled') list.push(...fb.value.map(toPlatformAccount));
      if (ig.status === 'fulfilled') list.push(...ig.value.map(toPlatformAccount));
      if (yt.status === 'fulfilled') list.push(...yt.value.map(toPlatformAccount));
      setAccounts(list);
    } catch (e: any) {
      setError(e?.message || 'Không tải được danh sách tài khoản.');
    }
  }, []);

  const loadPublished = useCallback(async () => {
    try {
      setIsLoadingPublished(true);
      const res = await getPublishedPlatformPosts(0, 100);
      setPublishedPosts(res.map(normalizePlatformPost));
    } catch (e: any) {
      setError(e?.message || 'Không tải được bài đã đăng.');
    } finally {
      setIsLoadingPublished(false);
    }
  }, []);

  const loadUnpublished = useCallback(async () => {
    try {
      setIsLoadingUnpublished(true);
      const res = await getUnpublishedPlatformPosts(0, 100);
      setUnpublishedPosts(res.map(normalizePlatformPost));
    } catch (e: any) {
      setError(e?.message || 'Không tải được bài chưa đăng.');
    } finally {
      setIsLoadingUnpublished(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadAccounts(), loadPublished(), loadUnpublished()]);
  }, [loadAccounts, loadPublished, loadUnpublished]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const getSocialAccountId = useCallback(
    (platformAccountId: string): string | null => {
      const acc = accounts.find((a) => a.id === platformAccountId);
      return acc ? acc.id : null;
    },
    [accounts]
  );

  const onRefreshPosts = useCallback(() => {
    loadPublished();
    loadUnpublished();
  }, [loadPublished, loadUnpublished]);

  const onUpdatePost = useCallback(
    async (postId: string, data: { preview_content: string; scheduled_at: string }) => {
      const res = await svcUpdateScheduledPost(postId, data);
      await onRefreshPosts();
      return res;
    },
    [onRefreshPosts]
  );

  const onDeletePost = useCallback(
    async (postId: string) => {
      await svcDeleteScheduledPost(postId);
      await onRefreshPosts();
    },
    [onRefreshPosts]
  );

  const onRetryPost = useCallback(
    async (postId: string) => {
      const res = await svcRetryFailedPost(postId);
      await onRefreshPosts();
      return res;
    },
    [onRefreshPosts]
  );

  const onPublishPost = useCallback(
    async (postId: string) => {
      // không await nữa
      svcPublishPost(postId)
        .catch((err) => console.error('Publish error:', err))
        .finally(() => {
          // backend cần thời gian để update database
          setTimeout(() => onRefreshPosts(), 2000);
        });

      return { message: 'Đang đăng bài…' };
    },
    [onRefreshPosts]
  );


  const connectedAccounts = useMemo(() => accounts.filter((a) => a.connected), [accounts]);

  const errorBox = useMemo(() => {
    if (!error) return null;
    return (
      <div className="my-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
        {error}
      </div>
    );
  }, [error]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {errorBox}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Quản lý lịch đăng bài trên mạng xã hội</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Tạo nội dung hấp dẫn với AI, upload media, và lên lịch đăng bài trên tất cả các tài khoản mạng xã hội của bạn.
        </p>
      </div>
      <section className="mb-8">
        <PromptManager />
      </section>
      <section className="mb-8">
        <PostComposer accounts={accounts} getSocialAccountId={getSocialAccountId} onPostScheduled={onRefreshPosts} />
      </section>
      <section className="mb-8">
        <PostHistory
          publishedPosts={publishedPosts}
          unpublishedPosts={unpublishedPosts}
          isLoadingPublished={isLoadingPublished}
          isLoadingUnpublished={isLoadingUnpublished}
          accounts={accounts}
          getSocialAccountId={getSocialAccountId}
          onRefreshPosts={onRefreshPosts}
          onUpdatePost={onUpdatePost}
          onDeletePost={onDeletePost}
          onRetryPost={onRetryPost}
        />
      </section>
      <section className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Tính năng nâng cao</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🤖</span>
            </div>
            <h4 className="font-semibold mb-2">AI Content Generation</h4>
            <p className="text-sm text-gray-600">Tạo nội dung với AI, tuỳ chỉnh theo từng nền tảng</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📅</span>
            </div>
            <h4 className="font-semibold mb-2">Scheduling</h4>
            <p className="text-sm text-gray-600">Tự động hoá quy trình lên lịch và đăng bài</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🔗</span>
            </div>
            <h4 className="font-semibold mb-2">Server Accounts</h4>
            <p className="text-sm text-gray-600">Tài khoản được quản lý tập trung từ database</p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">⚡</span>
            </div>
            <h4 className="font-semibold mb-2">Speed</h4>
            <p className="text-sm text-gray-600">Tốc độ xử lý nhanh chóng, dễ sử dụng</p>
          </div>
        </div>
      </section>
      {connectedAccounts.length === 0 && (
        <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Bắt đầu sử dụng</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔗</span>
              </div>
              <h4 className="font-semibold mb-2">1. Kết nối tài khoản</h4>
              <p className="text-sm text-gray-600">Vào trang Accounts để kết nối các nền tảng mạng xã hội</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✍️</span>
              </div>
              <h4 className="font-semibold mb-2">2. Tạo nội dung</h4>
              <p className="text-sm text-gray-600">Viết bài, upload media, hoặc dùng AI để tạo nội dung hấp dẫn</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📅</span>
              </div>
              <h4 className="font-semibold mb-2">3. Lên lịch đăng</h4>
              <p className="text-sm text-gray-600">Chọn thời gian và lên lịch đăng trên các tài khoản đã kết nối</p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};
