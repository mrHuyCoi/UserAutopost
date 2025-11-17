import { Conversation, Message } from '../types/channel';
import { ZaloConversation, ZaloMessage } from '../../../services/zaloService';
import { OaConversationItem, OaMessageItem } from '../../../services/zaloOAService';
import { FBConversationItem, FBMessageItem } from '../../../services/facebookService';

/**
 * Tạo avatar từ tên (2 chữ cái đầu)
 */
const getAvatarFromName = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Format thời gian từ ISO string hoặc timestamp
 */
const formatTime = (timeStr?: string | number | null): string => {
  if (!timeStr) return '';
  
  let date: Date;
  if (typeof timeStr === 'number') {
    date = new Date(timeStr);
  } else {
    date = new Date(timeStr);
  }
  
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format ngày giờ để hiển thị preview
 */
const formatPreviewTime = (timeStr?: string | number | null): string => {
  if (!timeStr) return '';
  
  let date: Date;
  if (typeof timeStr === 'number') {
    date = new Date(timeStr);
  } else {
    date = new Date(timeStr);
  }
  
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Hôm qua';
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  }
};

/**
 * Map Zalo Conversation sang Conversation format
 */
export const mapZaloConversationToConversation = (
  zaloConv: ZaloConversation,
  messages: ZaloMessage[] = []
): Conversation => {
  const name = zaloConv.d_name || zaloConv.group_name || 'Người dùng';
  const lastMessage = messages[messages.length - 1];
  const preview = lastMessage?.content || zaloConv.last_content || '';
  
  return {
    id: zaloConv.conversation_id || zaloConv.thread_id || zaloConv.peer_id || '',
    name,
    avatar: getAvatarFromName(name),
    preview,
    time: formatPreviewTime(zaloConv.last_ts || zaloConv.last_created_at),
    unread: 0, // Zalo API không trả về unread count
    channel: 'zalo',
    messages: messages.map(mapZaloMessageToMessage),
  };
};

/**
 * Map Zalo Message sang Message format
 */
export const mapZaloMessageToMessage = (zaloMsg: ZaloMessage): Message => {
  return {
    id: zaloMsg.id,
    text: zaloMsg.content || '',
    time: formatTime(zaloMsg.ts || zaloMsg.created_at),
    sender: zaloMsg.is_self ? 'user' : 'bot',
  };
};

/**
 * Map Zalo OA Conversation sang Conversation format
 */
export const mapZaloOAConversationToConversation = (
  oaConv: OaConversationItem,
  messages: OaMessageItem[] = []
): Conversation => {
  const name = oaConv.display_name || 'Người dùng';
  const lastMessage = messages[messages.length - 1];
  const preview = lastMessage?.text || '';
  
  return {
    id: oaConv.conversation_id || oaConv.id,
    name,
    avatar: getAvatarFromName(name),
    preview,
    time: formatPreviewTime(oaConv.last_message_at),
    unread: 0, // Zalo OA API không trả về unread count
    channel: 'zalo-oa',
    messages: messages.map(mapZaloOAMessageToMessage),
  };
};

/**
 * Map Zalo OA Message sang Message format
 */
export const mapZaloOAMessageToMessage = (oaMsg: OaMessageItem): Message => {
  let text = oaMsg.text || '';
  
  // Nếu có attachment, thêm thông tin vào text
  if (oaMsg.attachments) {
    if (oaMsg.attachments.type === 'photo') {
      text = text ? `${text} [Ảnh]` : '[Ảnh]';
    }
  }
  
  return {
    id: oaMsg.id,
    text,
    time: formatTime(oaMsg.timestamp),
    sender: oaMsg.direction === 'in' ? 'user' : 'bot',
  };
};

/**
 * Map Facebook Conversation sang Conversation format
 */
export const mapFBConversationToConversation = (
  fbConv: FBConversationItem,
  messages: FBMessageItem[] = [],
  pageId?: string
): Conversation => {
  // Lấy tên từ participants (người không phải page)
  const participants = fbConv.participants?.data || [];
  const participant = participants[0]; // Lấy participant đầu tiên
  const name = participant?.name || 'Người dùng';
  
  const lastMessage = messages[messages.length - 1];
  const preview = lastMessage?.message || fbConv.snippet || '';
  
  return {
    id: fbConv.id,
    name,
    avatar: getAvatarFromName(name),
    preview,
    time: formatPreviewTime(fbConv.updated_time),
    unread: fbConv.unread_count || 0,
    channel: 'messenger',
    messages: messages.map(msg => mapFBMessageToMessage(msg, pageId)),
  };
};

/**
 * Map Facebook Message sang Message format
 */
export const mapFBMessageToMessage = (fbMsg: FBMessageItem, pageId?: string): Message => {
  // Xác định sender: nếu from.id === pageId thì là bot, ngược lại là user
  const isFromPage = fbMsg.from?.id === pageId;
  
  return {
    id: fbMsg.id,
    text: fbMsg.message || '',
    time: formatTime(fbMsg.created_time),
    sender: isFromPage ? 'bot' : 'user',
  };
};

