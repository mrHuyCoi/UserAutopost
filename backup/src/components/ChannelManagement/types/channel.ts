export interface Channel {
  id: string;
  name: string;
  type: 'zalo' | 'zalo-oa' | 'messenger';
  status: 'connected' | 'disconnected';
  phone?: string;
}

export interface Message {
  id: string;
  text: string;
  time: string;
  sender: 'user' | 'bot';
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  preview: string;
  time: string;
  unread: number;
  channel: string;
  messages: Message[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  source: string;
  created: string;
}

export type TabType = 'zalo' | 'zalo-oa' | 'messenger' | 'conversations' | 'settings';





