import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Image as ImageIcon, Loader, Trash2, Filter, X, Settings, Eye, EyeOff } from 'lucide-react';

interface Message {
    user: string;
    bot: string;
    timestamp?: string;
    images?: Array<{
        product_name: string;
        image_url: string;
        product_link: string;
    }>;
}

interface ChatResponse {
    reply: string;
    history: Message[];
    images?: Array<{
        product_name: string;
        image_url: string;
        product_link: string;
    }>;
    has_images?: boolean;
    customer_info?: any;
    has_purchase?: boolean;
    human_handover_required?: boolean;
    has_negativity?: boolean;
    type?: string;
    message?: string;
}

// Interface for display settings
interface DisplaySettings {
    showTimestamps: boolean;
    showUserAvatars: boolean;
    showBotAvatars: boolean;
    showProductLinks: boolean;
    compactMode: boolean;
}

const ChatbotLinhKienTab: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
        showTimestamps: true,
        showUserAvatars: true,
        showBotAvatars: true,
        showProductLinks: true,
        compactMode: false
    });
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load messages và settings từ localStorage
    useEffect(() => {
        const savedMessages = localStorage.getItem('chatbot_linhkien_messages');
        const savedSettings = localStorage.getItem('chatbot_display_settings');
        
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (error) {
                console.error('Lỗi khi load messages từ localStorage:', error);
                localStorage.removeItem('chatbot_linhkien_messages');
            }
        }
        
        if (savedSettings) {
            try {
                setDisplaySettings(JSON.parse(savedSettings));
            } catch (error) {
                console.error('Lỗi khi load settings từ localStorage:', error);
            }
        }
    }, []);

    // Lưu messages và settings vào localStorage
    useEffect(() => {
        localStorage.setItem('chatbot_linhkien_messages', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        localStorage.setItem('chatbot_display_settings', JSON.stringify(displaySettings));
    }, [displaySettings]);

    // Tự động scroll xuống tin nhắn mới nhất
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Clear chat history
    const clearChatHistory = () => {
        if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
            setMessages([]);
            localStorage.removeItem('chatbot_linhkien_messages');
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() && !selectedImage) return;

        setIsLoading(true);
        const userMessage = inputMessage || '[Đã gửi hình ảnh]';
        const timestamp = new Date().toLocaleTimeString();

        // Thêm tin nhắn user ngay lập tức
        const newUserMessage: Message = {
            user: userMessage,
            bot: '',
            timestamp
        };
        
        setMessages(prev => [...prev, newUserMessage]);

        try {
            const token = localStorage.getItem('auth_token');
            const formData = new FormData();
            
            formData.append('message', inputMessage);
            formData.append('model_choice', 'gemini');
            
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/chatbot-linhkien/chat`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ChatResponse = await response.json();
            
            if (data.type === 'api_key_required') {
                setMessages(prev => {
                    const updatedMessages = [...prev];
                    const lastMessageIndex = updatedMessages.length - 1;
                    if (lastMessageIndex >= 0) {
                        updatedMessages[lastMessageIndex] = {
                            ...updatedMessages[lastMessageIndex],
                            bot: data.message || 'Vui lòng nhập Gemini API key ở trang cấu hình để sử dụng chatbot'
                        };
                    }
                    return updatedMessages;
                });
                return;
            }
            
            if (data.reply) {
                setMessages(prev => {
                    const updatedMessages = [...prev];
                    const lastMessageIndex = updatedMessages.length - 1;
                    if (lastMessageIndex >= 0) {
                        updatedMessages[lastMessageIndex] = {
                            ...updatedMessages[lastMessageIndex],
                            bot: data.reply,
                            images: data.images || []
                        };
                    }
                    return updatedMessages;
                });
                
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 100);
            }
            
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            setMessages(prev => {
                const updatedMessages = [...prev];
                const lastMessageIndex = updatedMessages.length - 1;
                if (lastMessageIndex >= 0) {
                    updatedMessages[lastMessageIndex] = {
                        ...updatedMessages[lastMessageIndex],
                        bot: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.'
                    };
                }
                return updatedMessages;
            });
        } finally {
            setInputMessage('');
            setSelectedImage(null);
            setImagePreview(null);
            setIsLoading(false);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const toggleFilterPanel = () => {
        setShowFilterPanel(!showFilterPanel);
    };

    const handleSettingChange = (key: keyof DisplaySettings) => {
        setDisplaySettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const resetSettings = () => {
        setDisplaySettings({
            showTimestamps: true,
            showUserAvatars: true,
            showBotAvatars: true,
            showProductLinks: true,
            compactMode: false
        });
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-gray-50 to-gray-100 relative">
            {/* Header với gradient hiện đại */}
            <div className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Chatbot Linh Kiện</h3>
                            <p className="text-sm opacity-90">Hỗ trợ tư vấn linh kiện chuyên nghiệp</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleFilterPanel}
                            className={`p-2.5 rounded-xl transition-all duration-200 ${
                                showFilterPanel 
                                ? 'bg-white/30 text-white' 
                                : 'text-white hover:bg-white/20'
                            }`}
                            title="Cài đặt hiển thị"
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                        <button
                            onClick={clearChatHistory}
                            className="p-2.5 text-white hover:bg-white/20 rounded-xl transition-colors"
                            title="Xóa lịch sử chat"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilterPanel && (
                <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Cài đặt hiển thị
                        </h4>
                        <div className="flex gap-2">
                            <button
                                onClick={resetSettings}
                                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                            >
                                Mặc định
                            </button>
                            <button
                                onClick={toggleFilterPanel}
                                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="showTimestamps"
                                checked={displaySettings.showTimestamps}
                                onChange={() => handleSettingChange('showTimestamps')}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="showTimestamps" className="text-sm text-gray-700 cursor-pointer">
                                Hiện thời gian
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="showUserAvatars"
                                checked={displaySettings.showUserAvatars}
                                onChange={() => handleSettingChange('showUserAvatars')}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="showUserAvatars" className="text-sm text-gray-700 cursor-pointer">
                                Avatar người dùng
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="showBotAvatars"
                                checked={displaySettings.showBotAvatars}
                                onChange={() => handleSettingChange('showBotAvatars')}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="showBotAvatars" className="text-sm text-gray-700 cursor-pointer">
                                Avatar bot
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="showProductLinks"
                                checked={displaySettings.showProductLinks}
                                onChange={() => handleSettingChange('showProductLinks')}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="showProductLinks" className="text-sm text-gray-700 cursor-pointer">
                                Link sản phẩm
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="compactMode"
                                checked={displaySettings.compactMode}
                                onChange={() => handleSettingChange('compactMode')}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="compactMode" className="text-sm text-gray-700 cursor-pointer">
                                Chế độ compact
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Messages area với hiệu ứng glass morphism */}
                <div className={`flex-1 overflow-y-auto p-4 space-y-4 pb-24 ${
                    displaySettings.compactMode ? 'space-y-2' : 'space-y-4'
                }`}>
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 mt-12">
                            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-white/50 max-w-md mx-auto">
                                <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-semibold mb-2 text-gray-700">Xin chào! 👋</p>
                                <p className="text-sm text-gray-600 mb-4">
                                    Tôi là chatbot hỗ trợ tư vấn linh kiện điện thoại chuyên nghiệp.
                                </p>
                                <p className="text-xs text-gray-500">
                                    Bạn có thể hỏi về linh kiện hoặc gửi hình ảnh để tôi hỗ trợ tốt hơn.
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div key={index} className="space-y-3">
                            {/* User message */}
                            {message.user && (
                                <div className="flex justify-end">
                                    <div className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl ${
                                        displaySettings.compactMode ? 'p-2 max-w-[80%]' : 'p-4 max-w-[75%]'
                                    } shadow-lg flex items-start gap-3`}>
                                        {displaySettings.showUserAvatars && (
                                            <div className="bg-white/20 p-1.5 rounded-full flex-shrink-0">
                                                <User className="w-4 h-4" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="whitespace-pre-wrap break-words">{message.user}</div>
                                            {displaySettings.showTimestamps && message.timestamp && (
                                                <div className="text-xs opacity-70 mt-2 text-blue-100">
                                                    {message.timestamp}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bot message */}
                            {message.bot && (
                                <div className="flex justify-start">
                                    <div className={`bg-white rounded-2xl ${
                                        displaySettings.compactMode ? 'p-2 max-w-[80%]' : 'p-4 max-w-[75%]'
                                    } shadow-lg border border-gray-100 flex items-start gap-3`}>
                                        {displaySettings.showBotAvatars && (
                                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-1.5 rounded-full flex-shrink-0">
                                                <Bot className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="whitespace-pre-wrap break-words text-gray-700 mb-3">
                                                {message.bot}
                                            </div>
                                            
                                            {/* Hiển thị ảnh từ response */}
                                            {message.images && message.images.length > 0 && (
                                                <div className="space-y-3 mt-4">
                                                    <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                        <ImageIcon className="w-4 h-4" />
                                                        Hình ảnh sản phẩm:
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {message.images.map((img, imgIndex) => (
                                                            <div key={imgIndex} className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                                                <img 
                                                                    src={img.image_url} 
                                                                    alt={img.product_name}
                                                                    className="w-full h-32 object-cover rounded-lg mb-2 shadow-sm"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTEwQzExMC41IDExMCAxMTkgMTAxLjUgMTE5IDkxQzExOSA4MC41IDExMC41IDcyIDEwMCA3MkM4OS41IDcyIDgxIDgwLjUgODEgOTFDODEgMTAxLjUgODkuNSAxMTAgMTAwIDExMHoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEwMCAxMzBDMTEwLjUgMTMwIDExOSAxMjEuNSAxMTkgMTExQzExOSAxMDAuNSAxMTAuNSA5MiAxMDAgOTJDODkuNSA5MiA4MSAxMDAuNSA4MSAxMTFDODEgMTIxLjUgODkuNSAxMzAgMTAwIDEzMHoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K';
                                                                    }}
                                                                />
                                                                <div className="text-sm font-semibold text-gray-800 mb-1 truncate">
                                                                    {img.product_name}
                                                                </div>
                                                                {displaySettings.showProductLinks && img.product_link && (
                                                                    <a 
                                                                        href={img.product_link} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1 transition-colors"
                                                                    >
                                                                        Xem chi tiết
                                                                        <Eye className="w-3 h-3" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {displaySettings.showTimestamps && message.timestamp && (
                                                <div className="text-xs text-gray-500 mt-3">
                                                    {message.timestamp}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 flex items-center gap-3">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-1.5 rounded-full">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Loader className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Đang xử lý...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
                <div className="shrink-0 p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Ảnh đã chọn:</span>
                        <div className="relative inline-block">
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="max-w-20 max-h-20 rounded-xl border-2 border-blue-200 shadow-sm object-cover"
                            />
                            <button
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Input area với glass morphism effect */}
            <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white/90 backdrop-blur-sm shadow-2xl z-10">
                <div className="flex gap-3 items-end">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-gray-500 hover:text-blue-500 transition-all duration-200 rounded-xl hover:bg-blue-50 border border-gray-300 hover:border-blue-300 flex-shrink-0"
                        title="Chọn hình ảnh"
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                    />
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập tin nhắn của bạn..."
                            className="w-full p-4 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm pr-12"
                            disabled={isLoading}
                        />
                        {inputMessage && (
                            <button
                                onClick={() => setInputMessage('')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
                        className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex-shrink-0"
                    >
                        {isLoading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatbotLinhKienTab;