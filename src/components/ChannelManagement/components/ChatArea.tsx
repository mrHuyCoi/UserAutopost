import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message } from '../types/channel';
import { Send, BookmarkPlus, Paperclip, Smile } from 'lucide-react';

interface ChatAreaProps {
  conversation: Conversation;
  onSendMessage: (message: string) => void;
  onAddToFAQ: (message: Message) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  onSendMessage,
  onAddToFAQ
}) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden h-[500px] sm:h-[600px] flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white px-4 sm:px-6 py-3 border-b border-gray-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {conversation.avatar}
          </div>
          <div>
            <div className="font-semibold text-gray-800 text-sm sm:text-base">
              {conversation.name}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Đang hoạt động</span>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 hidden sm:block">
          Zalo - 0987654321
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-blue-50 to-white">
        <div className="space-y-4">
          {conversation.messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            const showAvatar = index === 0 || conversation.messages[index - 1]?.sender !== msg.sender;
            
            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar for received messages */}
                {!isUser && showAvatar && (
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                    {conversation.avatar}
                  </div>
                )}
                
                {!isUser && !showAvatar && (
                  <div className="w-8 flex-shrink-0"></div>
                )}

                {/* Message Bubble */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  {!isUser && showAvatar && (
                    <div className="text-xs text-gray-500 mb-1 ml-2">
                      {conversation.name}
                    </div>
                  )}
                  
                  <div
                    className={`relative group p-3 rounded-2xl ${
                      isUser
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                    } ${showAvatar ? (isUser ? 'rounded-tr-md' : 'rounded-tl-md') : 'rounded-t-md'}`}
                  >
                    <div className="text-sm sm:text-base leading-relaxed">
                      {msg.text}
                    </div>
                    
                    {/* Time */}
                    <div className={`text-xs mt-2 flex items-center gap-1 ${
                      isUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{formatTime(msg.time)}</span>
                      {isUser && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Add to FAQ Button for bot messages */}
                    {!isUser && (
                      <button
                        onClick={() => onAddToFAQ(msg)}
                        className="absolute -top-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md border border-white"
                        title="Thêm vào FAQ"
                      >
                        <BookmarkPlus size={12} />
                      </button>
                    )}
                  </div>

                  {/* Add to FAQ Action for user messages */}
                  {isUser && (
                    <button
                      onClick={() => onAddToFAQ(msg)}
                      className="mt-1 text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Thêm vào FAQ"
                    >
                      <BookmarkPlus size={12} />
                      <span>Thêm vào FAQ</span>
                    </button>
                  )}
                </div>

                {/* Spacer for user messages */}
                {isUser && <div className="w-2 flex-shrink-0"></div>}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input - Đã chỉnh thẳng hàng */}
      <div className="bg-white border-t border-gray-200 p-3">
        <div className="flex items-center gap-2">
          {/* Emoji/Attachment buttons - Cùng chiều cao với input */}
          <div className="flex items-center gap-1">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Smile size={20} />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Paperclip size={20} />
            </button>
          </div>

          {/* Message Input - Căn giữa thẳng hàng */}
          <div className="flex-1 flex items-center bg-gray-100 rounded-2xl border-2 border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all min-h-[44px]">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-sm placeholder-gray-400 max-h-[120px] min-h-[20px] leading-5"
              placeholder="Nhập tin nhắn..."
              rows={1}
              style={{
                height: 'auto',
                overflowY: message ? 'auto' : 'hidden'
              }}
            />
          </div>

          {/* Send Button - Cùng chiều cao */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors flex-shrink-0 ${
              message.trim() 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};