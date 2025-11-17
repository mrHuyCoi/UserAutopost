// src/components/ChatBot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useApiKeys } from '../hooks/useApiKeys';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MessageSquare, X, Send, Bot, User as UserIcon, Loader2, Key, RefreshCw, Users, BrainCircuit } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MarkdownRenderer from './MarkdownRenderer';

interface Message {
  role: 'user' | 'model';
  text: string;
}

type ChatMode = 'ai' | 'live';

const ChatBot: React.FC = () => {
  const location = useLocation();
  
  // Kiểm tra location trước khi render
  if (location.pathname.startsWith('/chatbot-tabs')) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('ai');
  
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { savedApiKeys, reloadApiKeys, isLoadingKeys } = useApiKeys();
  const { user } = useAuth();

  const genAI = useRef<GoogleGenerativeAI | null>(null);
  const chat = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasApiKey = !!savedApiKeys.gemini_api_key;
  const liveChatHistoryKey = `live_chat_history_${user?.id || 'anonymous'}`;

  // Load live chat history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(liveChatHistoryKey);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          setLiveMessages(parsedHistory);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, [liveChatHistoryKey]);

  // Save live chat history to localStorage
  useEffect(() => {
    if (liveMessages.length > 0) {
      try {
        localStorage.setItem(liveChatHistoryKey, JSON.stringify(liveMessages));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [liveMessages, liveChatHistoryKey]);

  // Initialize AI chat
  useEffect(() => {
    if (hasApiKey && savedApiKeys.gemini_api_key) {
      try {
        genAI.current = new GoogleGenerativeAI(savedApiKeys.gemini_api_key);
        const SYSTEM_PROMPT = `Bạn là trợ lý AI nói tiếng Việt thân thiện. Hãy trả lời ngắn gọn, súc tích, kèm ví dụ khi cần.`;
        chat.current = genAI.current
          .getGenerativeModel({ model: "gemini-2.0-flash" })
          .startChat({
            systemInstruction: { 
              role: "system", 
              parts: [{ text: SYSTEM_PROMPT }] 
            }, 
            history: []
          });
        
        // Add welcome message for AI mode
        if (aiMessages.length === 0) {
          setAiMessages([{ 
            role: 'model', 
            text: 'Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?' 
          }]);
        }
      } catch (error) {
        console.error('Error initializing AI chat:', error);
        setAiMessages([{ 
          role: 'model', 
          text: 'Lỗi khởi tạo AI. Vui lòng kiểm tra API Key.' 
        }]);
      }
    }
  }, [hasApiKey, savedApiKeys.gemini_api_key]);

  // Add welcome message for live mode
  useEffect(() => {
    if (mode === 'live' && liveMessages.length === 0) {
      setLiveMessages([{ 
        role: 'model', 
        text: 'Chào bạn, vui lòng để lại lời nhắn, chúng tôi sẽ sớm phản hồi.' 
      }]);
    }
  }, [mode, liveMessages.length]);
  
  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, liveMessages]);

  // Listen for API key updates
  useEffect(() => {
    const handleApiKeyUpdate = () => {
      reloadApiKeys();
    };

    window.addEventListener('apiKeysUpdated', handleApiKeyUpdate);

    return () => {
      window.removeEventListener('apiKeysUpdated', handleApiKeyUpdate);
    };
  }, [reloadApiKeys]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userInput: Message = { role: 'user', text: input };
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    if (mode === 'ai') {
      if (!chat.current || !hasApiKey) {
        setAiMessages(prev => [...prev, userInput, { 
          role: 'model', 
          text: 'API Key chưa được cấu hình. Vui lòng thiết lập API Key trong phần Cấu hình.' 
        }]);
        setIsLoading(false);
        return;
      }
      
      setAiMessages(prev => [...prev, userInput]);
      
      try {
        const result = await chat.current.sendMessage(currentInput);
        const response = await result.response;
        const text = response.text();
        setAiMessages(prev => [...prev, { role: 'model', text: text }]);
      } catch (error) {
        console.error("AI Chatbot error:", error);
        setAiMessages(prev => [...prev, { 
          role: 'model', 
          text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng kiểm tra lại API Key và thử lại." 
        }]);
      }
    } else { 
      // Live chat mode
      setLiveMessages(prev => [...prev, userInput]);
      
      try {
        await fetch('https://workflow.doiquanai.vn/webhook/autopost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user?.email || 'Anonymous',
            message: currentInput,
            access_token: (user as any)?.token || ''
          })
        });
        // Thêm phản hồi mặc định cho live chat
        setLiveMessages(prev => [...prev, { 
          role: 'model', 
          text: "Cảm ơn bạn đã liên hệ! Đội ngũ hỗ trợ sẽ phản hồi bạn sớm nhất có thể." 
        }]);
      } catch (error) {
        console.error("Live Chat webhook error:", error);
        setLiveMessages(prev => [...prev, { 
          role: 'model', 
          text: "Tin nhắn của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ lại với bạn sớm." 
        }]);
      }
    }

    setIsLoading(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messagesToDisplay = mode === 'ai' ? aiMessages : liveMessages;

  return (
    <>
      <button 
        onClick={handleToggle} 
        className="hidden md:flex fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white w-16 h-16 rounded-full shadow-2xl items-center justify-center transform hover:scale-110 transition-transform z-50" 
        aria-label="Open chatbot"
      >
        <MessageSquare size={32} />
      </button>

      {isOpen && (
        <div className="hidden md:flex fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex-col z-50 border-2 border-gray-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-2xl border-b space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {mode === 'ai' ? (
                  <>
                    <BrainCircuit className="text-blue-600" size={20} />
                    Trợ lý AI
                  </>
                ) : (
                  <>
                    <Users className="text-green-600" size={20} />
                    Hỗ trợ trực tuyến
                  </>
                )}
              </h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex bg-gray-200 p-1 rounded-full w-full">
              <button 
                onClick={() => setMode('ai')} 
                className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-full transition-all flex items-center justify-center gap-2 ${
                  mode === 'ai' 
                    ? 'bg-white shadow text-blue-700' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BrainCircuit size={16} /> 
                AI
              </button>
              <button 
                onClick={() => setMode('live')} 
                className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-full transition-all flex items-center justify-center gap-2 ${
                  mode === 'live' 
                    ? 'bg-white shadow text-green-700' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Users size={16} /> 
                Trực tuyến
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {mode === 'ai' && !hasApiKey ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50">
                <Key className="text-yellow-500 mb-4" size={48} />
                <h4 className="font-bold text-lg text-gray-800 mb-2">Chưa cấu hình API Key</h4>
                <p className="text-gray-600 mb-6">Bạn cần thiết lập API Key của Gemini để sử dụng chức năng này.</p>
                <div className="flex items-center gap-4">
                  <Link 
                    to="/accounts" 
                    onClick={() => setIsOpen(false)} 
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                  >
                    Đi đến Cấu hình
                  </Link>
                  <button 
                    onClick={reloadApiKeys} 
                    disabled={isLoadingKeys} 
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50 text-sm"
                  >
                    {isLoadingKeys ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                    Tải lại
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  <div className="space-y-4">
                    {messagesToDisplay.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                      >
                        {msg.role === 'model' && (
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${
                              mode === 'ai' ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                          >
                            {mode === 'ai' ? <Bot size={20} /> : <Users size={20} />}
                          </div>
                        )}
                        <div 
                          className={`px-4 py-2 rounded-2xl break-words shadow-sm max-w-xs ${
                            msg.role === 'user' 
                              ? 'bg-blue-600 text-white rounded-br-none' 
                              : 'bg-white text-gray-800 border rounded-bl-none'
                          }`}
                        >
                          {msg.role === 'model' ? (
                            <MarkdownRenderer 
                              content={msg.text} 
                              className="text-gray-800 text-sm"
                            />
                          ) : (
                            <p className="text-white text-sm">{msg.text}</p>
                          )}
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 shrink-0">
                            <UserIcon size={20} />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${
                            mode === 'ai' ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                        >
                          {mode === 'ai' ? <Bot size={20} /> : <Users size={20} />}
                        </div>
                        <div className="px-4 py-2 rounded-2xl bg-white text-gray-800 border rounded-bl-none shadow-sm">
                          <Loader2 className="animate-spin" size={20} />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className="p-4 border-t bg-white rounded-b-2xl">
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={input} 
                      onChange={(e) => setInput(e.target.value)} 
                      onKeyPress={handleKeyPress} 
                      placeholder="Nhập câu hỏi..." 
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" 
                      disabled={isLoading} 
                    />
                    <button 
                      onClick={handleSend} 
                      disabled={isLoading || !input.trim()} 
                      className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-blue-700 transition-colors"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;