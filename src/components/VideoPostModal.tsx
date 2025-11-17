import React, { useState, useEffect } from 'react';
import { X, Loader2, Check, Send, Upload, Film } from 'lucide-react';
import { getFacebookPages, getInstagramAccounts, getYoutubeAccounts, FacebookAccount } from '../services/facebookService';
import { CompletedVideo } from './VideoCreation/VideoCreationShared';

interface VideoPostModalProps {
  show: boolean;
  onClose: () => void;
  onPost: (selectedAccounts: SelectedAccount[], videoFile: File, postContent: PostContent) => Promise<void>;
  defaultPostContent?: PostContent;
  isPosting?: boolean;
  completedVideos?: CompletedVideo[];
}

export interface SelectedAccount {
  id: string;
  platform: string;
  account_name: string;
  platform_type: string; // 'facebook-page' | 'facebook-reels' | 'instagram-feed' | 'instagram-reels' | 'youtube'
}

export interface PostContent {
  title: string;
  description: string;
  hashtags: string;
}

const PLATFORM_TYPES = {
  facebook: [
    { value: 'facebook-page', label: 'Facebook Page Post' },
    { value: 'facebook-reels', label: 'Facebook Reels' },
  ],
  instagram: [
    { value: 'instagram-feed', label: 'Instagram Feed' },
    { value: 'instagram-reels', label: 'Instagram Reels' },
  ],
  youtube: [
    { value: 'youtube', label: 'YouTube Video' },
  ],
};

const VideoPostModal: React.FC<VideoPostModalProps> = ({
  show,
  onClose,
  onPost,
  defaultPostContent,
  isPosting = false,
  completedVideos = [],
}) => {
  const [accounts, setAccounts] = useState<FacebookAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Map<string, SelectedAccount>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [downloadingVideo, setDownloadingVideo] = useState(false);
  const [postContent, setPostContent] = useState<PostContent>(
    defaultPostContent || { title: '', description: '', hashtags: '' }
  );

  useEffect(() => {
    if (show) {
      loadAccounts();
      if (defaultPostContent) {
        setPostContent(defaultPostContent);
      }
    } else {
      // Reset state when modal closes
      setVideoFile(null);
      setSelectedVideoUrl(null);
      setError(null);
    }
  }, [show, defaultPostContent]);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fbPages, igAccounts, ytAccounts] = await Promise.all([
        getFacebookPages(),
        getInstagramAccounts(),
        getYoutubeAccounts(),
      ]);

      const allAccounts = [
        ...fbPages.map(acc => ({ ...acc, platform: 'facebook' })),
        ...igAccounts.map(acc => ({ ...acc, platform: 'instagram' })),
        ...ytAccounts.map(acc => ({ ...acc, platform: 'youtube' })),
      ];

      setAccounts(allAccounts);
    } catch (err: unknown) {
      console.error('Error loading accounts:', err);
      setError('Không thể tải danh sách tài khoản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAccount = (account: FacebookAccount, platformType: string) => {
    const key = `${account.id}-${platformType}`;
    const newSelected = new Map(selectedAccounts);

    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.set(key, {
        id: account.id,
        platform: account.platform,
        account_name: account.account_name,
        platform_type: platformType,
      });
    }

    setSelectedAccounts(newSelected);
  };

  const isAccountSelected = (account: FacebookAccount, platformType: string): boolean => {
    const key = `${account.id}-${platformType}`;
    return selectedAccounts.has(key);
  };

  // Download video from URL and convert to File
  const downloadVideoFromUrl = async (videoUrl: string): Promise<File> => {
    try {
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error('Không thể tải video từ URL');
      }
      const blob = await response.blob();
      const fileName = `video-${Date.now()}.mp4`;
      return new File([blob], fileName, { type: blob.type || 'video/mp4' });
    } catch (error) {
      console.error('Error downloading video:', error);
      throw new Error('Không thể tải video. Vui lòng thử lại.');
    }
  };

  // Handle select video from completed videos
  const handleSelectCompletedVideo = async (video: CompletedVideo) => {
    setDownloadingVideo(true);
    setError(null);
    try {
      const file = await downloadVideoFromUrl(video.url);
      setVideoFile(file);
      setSelectedVideoUrl(video.url);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải video';
      setError(errorMessage);
    } finally {
      setDownloadingVideo(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setSelectedVideoUrl(null); // Clear selected completed video
        setError(null);
      } else {
        setError('Vui lòng chọn file video');
      }
    }
  };

  const handlePost = async () => {
    if (selectedAccounts.size === 0) {
      setError('Vui lòng chọn ít nhất một tài khoản để đăng bài');
      return;
    }

    if (!videoFile) {
      setError('Vui lòng chọn file video để đăng bài');
      return;
    }

    if (!postContent.title.trim() && !postContent.description.trim()) {
      setError('Vui lòng nhập tiêu đề hoặc mô tả cho bài đăng');
      return;
    }

    setError(null);
    const accountsArray = Array.from(selectedAccounts.values());
    await onPost(accountsArray, videoFile, postContent);
  };

  if (!show) return null;

  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.platform]) {
      acc[account.platform] = [];
    }
    acc[account.platform].push(account);
    return acc;
  }, {} as Record<string, FacebookAccount[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            Đăng video lên mạng xã hội
          </h2>
          <button
            onClick={onClose}
            disabled={isPosting}
            className="text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Video Upload & Content */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn video để đăng
                </label>
                
                {/* Completed Videos List */}
                {completedVideos.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Video đã tạo từ AI:</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                      {completedVideos.map((video) => (
                        <button
                          key={video.index}
                          onClick={() => handleSelectCompletedVideo(video)}
                          disabled={isPosting || downloadingVideo}
                          className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                            selectedVideoUrl === video.url
                              ? 'bg-blue-50 border-2 border-blue-500'
                              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                          } disabled:opacity-50`}
                        >
                          <Film size={16} className="text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              Video {video.index}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              Task: {video.taskId.substring(0, 8)}...
                            </p>
                          </div>
                          {selectedVideoUrl === video.url && (
                            <Check size={16} className="text-blue-600 flex-shrink-0" />
                          )}
                          {downloadingVideo && selectedVideoUrl === video.url && (
                            <Loader2 size={16} className="animate-spin text-blue-600 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload New Video */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    disabled={isPosting || downloadingVideo}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className={`flex flex-col items-center ${!isPosting && !downloadingVideo ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                  >
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {videoFile && !selectedVideoUrl ? videoFile.name : 'Hoặc upload video mới'}
                    </span>
                    {videoFile && !selectedVideoUrl && (
                      <span className="text-xs text-gray-500 mt-1">
                        {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                  </label>
                </div>

                {/* Selected Video Info */}
                {selectedVideoUrl && videoFile && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-blue-600" />
                      <span className="text-sm text-blue-900">
                        Đã chọn: {videoFile.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề (cho YouTube)
                </label>
                <input
                  type="text"
                  value={postContent.title}
                  onChange={(e) => setPostContent({ ...postContent, title: e.target.value })}
                  disabled={isPosting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Nhập tiêu đề..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={postContent.description}
                  onChange={(e) => setPostContent({ ...postContent, description: e.target.value })}
                  disabled={isPosting}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  placeholder="Nhập mô tả cho bài đăng..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hashtags
                </label>
                <input
                  type="text"
                  value={postContent.hashtags}
                  onChange={(e) => setPostContent({ ...postContent, hashtags: e.target.value })}
                  disabled={isPosting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="#hashtag1 #hashtag2"
                />
              </div>
            </div>

            {/* Right: Account Selection */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Đang tải danh sách tài khoản...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Facebook */}
                  {groupedAccounts.facebook && groupedAccounts.facebook.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        Facebook
                      </h3>
                      <div className="space-y-3">
                        {groupedAccounts.facebook.map((account) => (
                          <div key={account.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {account.thumbnail && (
                                  <img
                                    src={account.thumbnail}
                                    alt={account.account_name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                )}
                                <span className="font-medium text-gray-900 text-sm">{account.account_name}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {PLATFORM_TYPES.facebook.map((type) => (
                                <button
                                  key={type.value}
                                  onClick={() => toggleAccount(account, type.value)}
                                  disabled={isPosting}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    isAccountSelected(account, type.value)
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  } disabled:opacity-50`}
                                >
                                  {isAccountSelected(account, type.value) && (
                                    <Check size={12} className="inline mr-1" />
                                  )}
                                  {type.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instagram */}
                  {groupedAccounts.instagram && groupedAccounts.instagram.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-pink-600 rounded-full"></span>
                        Instagram
                      </h3>
                      <div className="space-y-3">
                        {groupedAccounts.instagram.map((account) => (
                          <div key={account.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {account.thumbnail && (
                                  <img
                                    src={account.thumbnail}
                                    alt={account.account_name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                )}
                                <span className="font-medium text-gray-900 text-sm">{account.account_name}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {PLATFORM_TYPES.instagram.map((type) => (
                                <button
                                  key={type.value}
                                  onClick={() => toggleAccount(account, type.value)}
                                  disabled={isPosting}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    isAccountSelected(account, type.value)
                                      ? 'bg-pink-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  } disabled:opacity-50`}
                                >
                                  {isAccountSelected(account, type.value) && (
                                    <Check size={12} className="inline mr-1" />
                                  )}
                                  {type.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* YouTube */}
                  {groupedAccounts.youtube && groupedAccounts.youtube.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                        YouTube
                      </h3>
                      <div className="space-y-3">
                        {groupedAccounts.youtube.map((account) => (
                          <div key={account.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {account.thumbnail && (
                                  <img
                                    src={account.thumbnail}
                                    alt={account.account_name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                )}
                                <span className="font-medium text-gray-900 text-sm">{account.account_name}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {PLATFORM_TYPES.youtube.map((type) => (
                                <button
                                  key={type.value}
                                  onClick={() => toggleAccount(account, type.value)}
                                  disabled={isPosting}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    isAccountSelected(account, type.value)
                                      ? 'bg-red-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  } disabled:opacity-50`}
                                >
                                  {isAccountSelected(account, type.value) && (
                                    <Check size={12} className="inline mr-1" />
                                  )}
                                  {type.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {accounts.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                      <p>Chưa có tài khoản nào được kết nối.</p>
                      <p className="text-sm mt-2">Vui lòng kết nối tài khoản mạng xã hội trước.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 md:p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isPosting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handlePost}
            disabled={isPosting || selectedAccounts.size === 0 || !videoFile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPosting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang đăng bài...
              </>
            ) : (
              <>
                <Send size={16} />
                Đăng bài ({selectedAccounts.size})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPostModal;

