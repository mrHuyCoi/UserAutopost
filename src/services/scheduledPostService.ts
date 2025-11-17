import {
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiPostFormData,
} from './apiService';

const BASE = '/scheduled';

export type AiPlatform = 'gemini' | 'openai' | string;

export interface GenerateReviewRequest {
  prompt: string;
  platform_type: string[];
  hashtags?: string[];
  brand_name?: string;
  call_to_action?: string;
  posting_purpose?: string;
  ai_platform?: AiPlatform;
}

export interface GenerateReviewResponse {
  [key: string]: any;
}

export interface SchedulePostForm {
  prompt: string;
  preview_content: string;
  scheduled_at: string;
  platform_specific_data: Record<string, any> | string;
  media_files?: File[];
  brand_name?: string | null;
  posting_purpose?: string | null;
  publish_immediately?: boolean;
}

export interface PlatformPost {
  id: string;
  status: string;
  platform?: string;
  prompt?: string;
  preview_content?: string;
  scheduled_at?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

function buildScheduleFormData(payload: SchedulePostForm): FormData {
  const fd = new FormData();
  fd.append('prompt', payload.prompt);
  fd.append('preview_content', payload.preview_content);
  fd.append('scheduled_at', payload.scheduled_at);

  const psd =
    typeof payload.platform_specific_data === 'string'
      ? payload.platform_specific_data
      : JSON.stringify(payload.platform_specific_data);
  fd.append('platform_specific_data', psd);

  if (payload.brand_name) fd.append('brand_name', payload.brand_name);
  if (payload.posting_purpose) fd.append('posting_purpose', payload.posting_purpose);
  fd.append('publish_immediately', String(!!payload.publish_immediately));

  if (payload.media_files?.length) {
    payload.media_files.forEach((file) => fd.append('media_files', file));
  }
  return fd;
}

export const generateReviewContent = async (
  data: GenerateReviewRequest
): Promise<GenerateReviewResponse> => {
  const body = {
    prompt: data.prompt,
    platform_type: data.platform_type,
    hashtags: data.hashtags,
    brand_name: data.brand_name,
    call_to_action: data.call_to_action,
    posting_purpose: data.posting_purpose,
    ai_platform: data.ai_platform ?? 'gemini',
  };
  return apiPost(`${BASE}/generate-review`, body);
};

/** 2️⃣ Lên lịch hoặc đăng ngay */
export const schedulePost = async (
  payload: SchedulePostForm
): Promise<Record<string, any>> => {
  const fd = buildScheduleFormData(payload);
  return apiPostFormData(`${BASE}/schedule-post`, fd);
};

/** 3️⃣ Lấy toàn bộ bài đăng */
export const getPlatformPosts = async (
  skip = 0,
  limit = 100
): Promise<PlatformPost[]> => {
  return apiGet(`${BASE}/platform-posts?skip=${skip}&limit=${limit}`);
};

/** 4️⃣ Lấy bài đã đăng (published) */
export const getPublishedPlatformPosts = async (
  skip = 0,
  limit = 100
): Promise<PlatformPost[]> => {
  return apiGet(`${BASE}/platform-posts/published?skip=${skip}&limit=${limit}`);
};

export const getUnpublishedPlatformPosts = async (
  skip = 0,
  limit = 100
): Promise<PlatformPost[]> => {
  return apiGet(`${BASE}/platform-posts/unpublished?skip=${skip}&limit=${limit}`);
};

export const updateScheduledPost = async (
  postId: string,
  data: { preview_content?: string | null; scheduled_at?: string | null }
): Promise<Record<string, any>> => {
  const fd = new FormData();
  if (data.preview_content != null) fd.append('preview_content', data.preview_content);
  if (data.scheduled_at != null) fd.append('scheduled_at', data.scheduled_at);
  return apiPut(`${BASE}/platform-posts/${postId}`, fd);
};

export const retryFailedPost = async (
  postId: string
): Promise<{ message: string; post_id: string }> => {
  return apiPatch(`${BASE}/platform-posts/${postId}/retry`, {});
};

export const publishPost = async (
  postId: string
): Promise<{ message: string; post_id: string }> => {
  return apiPost(`${BASE}/platform-posts/${postId}/publish`, {});
};

export const deleteScheduledPost = async (
  postId: string
): Promise<Record<string, any>> => {
  return apiDelete(`${BASE}/platform-posts/${postId}`);
};


export const makeSchedulePayload = (args: {
  prompt: string;
  preview: any;
  isoTime: string;
  platforms: string[];
  media?: File[];
  brand?: string;
  purpose?: string;
  publishNow?: boolean;
}): SchedulePostForm => ({
  prompt: args.prompt,
  preview_content:
    typeof args.preview === 'string' ? args.preview : JSON.stringify(args.preview),
  scheduled_at: args.isoTime,
  platform_specific_data: { platforms: args.platforms },
  media_files: args.media,
  brand_name: args.brand ?? null,
  posting_purpose: args.purpose ?? null,
  publish_immediately: !!args.publishNow,
});
