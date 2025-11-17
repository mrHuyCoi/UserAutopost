import axios from 'axios';
import { getAuthToken } from './apiService'; // Giả định bạn có file này

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000';

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Lấy System Prompt tùy chỉnh
 * Gọi API: GET /api/v1/chatbot-linhkien/system-prompt
 */
export const getSystemPrompt = async (): Promise<{ prompt_content: string }> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/chatbot-linhkien/system-prompt`, {
      headers: getHeaders(),
    });
    // API trả về: { "prompt_content": "..." } hoặc lỗi 404 nếu chưa có
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return { prompt_content: '' }; // Trả về rỗng nếu chưa set
    }
    console.error('Error fetching system prompt:', error);
    throw error;
  }
};

/**
 * Cập nhật System Prompt tùy chỉnh
 * Gọi API: PUT /api/v1/chatbot-linhkien/system-prompt
 */
export const updateSystemPrompt = async (prompt_content: string): Promise<any> => {
   const payload = { prompt_content };
   const response = await axios.put(`${API_BASE_URL}/api/v1/chatbot-linhkien/system-prompt`, payload, {
    headers: getHeaders(),
  });
  return response.data;
};