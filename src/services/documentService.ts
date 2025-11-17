import axios from 'axios';
import { getAuthToken } from './apiService'; // Giả định bạn có file này

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000';

const getHeaders = (isFormData = false) => {
  const token = getAuthToken();
  const headers: any = {
    'Authorization': `Bearer ${token}`,
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// Interface cho tài liệu trả về từ API
export interface ApiDocument {
  uuid: string;
  properties: {
    source: string;
    doc_type: string;
    // Thêm các properties khác nếu có
  };
}

/**
 * Lấy danh sách tài liệu
 * Gọi API: GET /api/v1/documents/list
 */
export const listDocuments = async (limit = 100, offset = 0) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/documents/list`, {
      params: { limit, offset },
      headers: getHeaders(),
    });
    
    // API document_router trả về kết quả thô từ Weaviate
    if (response.data && Array.isArray(response.data.objects)) {
      // Map dữ liệu về định dạng Document mà component đang dùng
      return response.data.objects.map((obj: ApiDocument) => ({
        id: obj.uuid,
        name: obj.properties.source || 'N/A',
        type: obj.properties.doc_type || 'Unknown'
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

/**
 * Tải lên văn bản thô
 * Gọi API: POST /api/v1/documents/upload-text
 */
export const uploadTextDocument = async (text: string, source: string) => {
  const payload = { text, source };
  const response = await axios.post(`${API_BASE_URL}/api/v1/documents/upload-text`, payload, {
    headers: getHeaders(),
  });
  return response.data;
};

/**
 * Tải lên tài liệu dạng file
 * Gọi API: POST /api/v1/documents/upload-file
 */
export const uploadFileDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_BASE_URL}/api/v1/documents/upload-file`, formData, {
    headers: getHeaders(true), // true = FormData
  });
  return response.data;
};

/**
 * Tải lên từ URL
 * Gọi API: POST /api/v1/documents/upload-url
 */
export const uploadUrlDocument = async (url: string, source: string) => {
   const payload = { url, source };
   const response = await axios.post(`${API_BASE_URL}/api/v1/documents/upload-url`, payload, {
    headers: getHeaders(),
  });
  return response.data;
};

/**
 * Tải lên toàn bộ website (Sitemap crawl)
 * Gọi API: POST /api/v1/documents/upload-website
 */
export const uploadWebsite = async (website_url: string, source?: string) => {
   const formData = new FormData();
   formData.append('website_url', website_url);
   if (source) {
     formData.append('source', source);
   }
   
   const response = await axios.post(`${API_BASE_URL}/api/v1/documents/upload-website`, formData, {
    headers: getHeaders(true), // true = FormData
  });
  return response.data; // Trả về task_id
};