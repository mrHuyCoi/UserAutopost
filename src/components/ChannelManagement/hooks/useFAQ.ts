import { useState } from 'react';
import { FAQItem, Message } from '../types/channel';

export const useFAQ = () => {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const addFAQItem = (question: string, answer: string, category: string, source: string) => {
    const newFAQ: FAQItem = {
      id: Date.now().toString(),
      question,
      answer,
      category,
      source,
      created: new Date().toLocaleDateString('vi-VN')
    };

    setFaqItems(prev => [...prev, newFAQ]);
    return newFAQ;
  };

  return {
    faqItems,
    selectedMessage,
    setSelectedMessage,
    addFAQItem
  };
};