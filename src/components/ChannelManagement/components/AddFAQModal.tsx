// src/components/AddFAQModal.tsx
import React, { useState } from 'react';
import { Message, Conversation } from '../types/channel';
import { faqMobileService } from '../../../services/faqMobileService';

interface AddFAQModalProps {
  isOpen: boolean;
  message: Message | null;
  conversation: Conversation | undefined;
  onClose: () => void;
  onSave: (question: string, answer: string, category: string) => void;
}

export const AddFAQModal: React.FC<AddFAQModalProps> = ({
  isOpen,
  message,
  conversation,
  onClose,
  onSave
}) => {
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = async () => {
    if (!message || !answer.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      // gọi backend
      await faqMobileService.addFaq({
        classification: category,
        question: message.text,
        answer: answer.trim(),
        images: undefined,
      });
      onSave(message.text, answer.trim(), category);
      setAnswer('');
      setCategory('');
      onClose();
    } catch (e: any) {
      setErr(e?.message || 'Lưu FAQ thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Thêm câu hỏi vào FAQ</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Đóng"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Câu hỏi từ khách hàng</label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700">{message.text}</p>
                <div className="text-xs text-gray-500 mt-2">
                  Tin nhắn từ: {conversation?.name} • {message.time}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phân loại</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập phân loại..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Câu trả lời mẫu <span className="text-red-500">*</span>
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                placeholder="Nhập câu trả lời mẫu cho câu hỏi này..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Câu trả lời này sẽ được sử dụng khi chatbot gặp câu hỏi tương tự
              </p>
              {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!answer.trim() || saving}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {saving ? 'Đang lưu...' : 'Lưu vào FAQ'}
          </button>
        </div>
      </div>
    </div>
  );
};
