import { useState } from 'react';
import { Conversation, Message } from '../types/channel';
import { generateBotResponse } from '../utils/channelHelpers';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      name: 'Nguyễn Văn A',
      avatar: 'NA',
      preview: 'Xin chào, tôi muốn hỏi về giá thay màn hình iPhone 13',
      time: '10:30',
      unread: 3,
      channel: 'zalo',
      messages: [
        {
          id: '1',
          text: 'Xin chào, tôi muốn hỏi về giá thay màn hình iPhone 13',
          time: '10:28',
          sender: 'user'
        },
        {
          id: '2',
          text: 'Dạ chào anh! Bên em có dịch vụ thay màn hình iPhone 13 chính hãng với giá 2.500.000 VNĐ ạ. Anh có muốn đặt lịch không ạ?',
          time: '10:29',
          sender: 'bot'
        }
      ]
    }
  ]);

  const [activeConversation, setActiveConversation] = useState<string>('conv-1');

  const getActiveConversation = () => {
    return conversations.find(conv => conv.id === activeConversation);
  };

  const sendMessage = (conversationId: string, messageText: string) => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      sender: 'user'
    };

    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, messages: [...conv.messages, newMessage] }
        : conv
    ));

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(messageText),
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        sender: 'bot'
      };

      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, messages: [...conv.messages, botResponse] }
          : conv
      ));
    }, 1000);
  };

  return {
    conversations,
    activeConversation,
    setActiveConversation,
    getActiveConversation,
    sendMessage
  };
};