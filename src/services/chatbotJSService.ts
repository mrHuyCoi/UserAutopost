import axios from 'axios';
import { getAuthToken } from './apiService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000';

// Cập nhật interface để bao gồm các trường từ component
export interface ChatbotSettings {
  chatbot_icon_url?: string;
  chatbot_message_default?: string;
  chatbot_callout?: string;
  chatbot_name?: string;
  
  // Các trường được thêm vào
  chatbot_role?: string;
  enable_service_consulting?: boolean;
  enable_accessory_consulting?: boolean;
}

export const getChatbotSettings = async (): Promise<ChatbotSettings> => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/api/v1/chatbot-js-agent/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    // Giả định API trả về tất cả các trường trong interface
    return response.data;
  } catch (error) {
    console.error('Error fetching chatbot settings:', error);
    throw error;
  }
};

export const updateChatbotSettings = async (settings: ChatbotSettings): Promise<ChatbotSettings> => {
  try {
    const token = getAuthToken();
    
    // Gửi toàn bộ payload
    // Đảm bảo backend (chatbot_js_agent_router.py và service nó gọi)
    // chấp nhận các trường mới này
    const payload: ChatbotSettings = {
      chatbot_icon_url: settings.chatbot_icon_url,
      chatbot_message_default: settings.chatbot_message_default,
      chatbot_callout: settings.chatbot_callout,
      chatbot_name: settings.chatbot_name,
      chatbot_role: settings.chatbot_role, // Trường mới
      enable_service_consulting: settings.enable_service_consulting, // Trường mới
      enable_accessory_consulting: settings.enable_accessory_consulting, // Trường mới
    };

    const response = await axios.put(
      `${API_BASE_URL}/api/v1/chatbot-js-agent/settings`,
      payload, // Gửi payload đã cập nhật
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating chatbot settings:', error);
    throw error;
  }
};