import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.161:8000';
const NGROK_SKIP_HEADER = { 'ngrok-skip-browser-warning': 'true' };

interface ApiGetOptions extends RequestInit {
  responseType?: 'blob' | 'json';
}

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

export const getAuthToken = () => {
    return localStorage.getItem('auth_token');
};

// Cache for API key
let cachedApiKey: string | null = null;
let apiKeyPromise: Promise<string | null> | null = null;

// Get API key with caching
export const getApiKey = async (): Promise<string | null> => {
  // Return cached key if available
  if (cachedApiKey) {
    return cachedApiKey;
  }

  // If there's already a request in progress, return that promise
  if (apiKeyPromise) {
    return apiKeyPromise;
  }

  // Create new request
  apiKeyPromise = (async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/chatbot-subscriptions/my-api-key`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...NGROK_SKIP_HEADER,
        },
      });

      if (!response.ok) {
        // If 401, don't cache null - let it retry
        if (response.status === 401) {
          return null;
        }
        // For other errors, cache null to avoid repeated failed requests
        cachedApiKey = null;
        return null;
      }

      const data = await response.json();
      if (data.api_key && data.is_active) {
        cachedApiKey = data.api_key;
        return data.api_key;
      }

      cachedApiKey = null;
      return null;
    } catch (error) {
      console.error('Error fetching API key:', error);
      cachedApiKey = null;
      return null;
    } finally {
      apiKeyPromise = null;
    }
  })();

  return apiKeyPromise;
};

// Clear cached API key (useful when regenerating)
export const clearApiKeyCache = () => {
  cachedApiKey = null;
  apiKeyPromise = null;
};

// Helper function to handle token expiry
const handleTokenExpiry = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    window.location.href = '/login';
};

apiClient.interceptors.request.use(
    async (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add X-Api-Key header
        const apiKey = await getApiKey();
        if (apiKey) {
            config.headers['X-Api-Key'] = apiKey;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized - token expired
        if (error.response && error.response.status === 401) {
            handleTokenExpiry();
            return Promise.reject(new Error('Token đã hết hạn. Vui lòng đăng nhập lại.'));
        }
        
        // If there's a response with error details, pass them through
        if (error.response && error.response.data && error.response.data.detail) {
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);

export const getAuthHeader = async (isFormData = false): Promise<HeadersInit> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`,
    ...NGROK_SKIP_HEADER,
  };
  
  // Add X-Api-Key header if available
  const apiKey = await getApiKey();
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const apiGet = async <T>(endpoint: string, options: ApiGetOptions = {}): Promise<T> => {
    const token = getAuthToken();
    if (!token) throw new Error('Unauthorized');

    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    });

    if (!response.ok) {
        // Handle 401 Unauthorized - token expired
        if (response.status === 401) {
            handleTokenExpiry();
            throw new Error('Token đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        // Handle non-JSON responses for blob errors
        if (options.responseType === 'blob') {
            throw new Error(`Error: ${response.status}`);
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error: ${response.status}`);
    }
    
    if (options.responseType === 'blob') {
        return await response.blob() as T;
    }

    return await response.json();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiPost = async <T>(endpoint: string, data: any): Promise<T> => {
  const token = getAuthToken();
  if (!token) throw new Error('Unauthorized');

  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      handleTokenExpiry();
      throw new Error('Token đã hết hạn. Vui lòng đăng nhập lại.');
    }
    
    const errorData = await response.json();
    throw new Error(errorData.detail || `Error: ${response.status}`);
  }

  return await response.json();
};

export const apiPostForm = async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const token = getAuthToken();
    if (!token) throw new Error('Unauthorized');

    const headers = await getAuthHeader(true); // Pass true for FormData
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
        method: 'POST',
        headers,
        body: formData
    });

    if (!response.ok) {
        // Handle 401 Unauthorized - token expired
        if (response.status === 401) {
            handleTokenExpiry();
            throw new Error('Token đã hết hạn. Vui lòng đăng nhập lại.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.detail || `Error: ${response.status}`);
    }

    return await response.json();
};


export const apiPut = async <T>(endpoint: string, data: any): Promise<T> => {
  const token = getAuthToken();
  if (!token) throw new Error('Unauthorized');

  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      handleTokenExpiry();
      throw new Error('Token đã hết hạn. Vui lòng đăng nhập lại.');
    }
    
    const errorData = await response.json();
    throw new Error(errorData.detail || `Error: ${response.status}`);
  }

  return await response.json();
};

export const apiDelete = async <T>(endpoint: string, data?: any): Promise<T> => {
  const token = getAuthToken();
  if (!token) throw new Error('Unauthorized');

  const headers = await getAuthHeader();
  const config: RequestInit = {
    method: 'DELETE',
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, config);

  if (!response.ok) {
    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      handleTokenExpiry();
      throw new Error('Token đã hết hạn. Vui lòng đăng nhập lại.');
    }
    
    const errorData = await response.json();
    throw new Error(errorData.detail || `Error: ${response.status}`);
  }

  // Handle 204 No Content (successful deletion with no response body)
  if (response.status === 204) {
    return { success: true, message: 'Deleted successfully' } as T;
  }

  try {
    return await response.json();
  } catch (error) {
    // If response is empty or not JSON, return success
    return { success: true } as T;
  }
};

export const apiPostFormData = async <T>(endpoint: string, formData: FormData): Promise<T> => {
  const token = getAuthToken();
  if (!token) throw new Error('Unauthorized');

  const headers = await getAuthHeader(true);
  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      handleTokenExpiry();
      throw new Error('Token đã hết hạn. Vui lòng đăng nhập lại.');
    }
    
    const errorData = await response.json();
    throw new Error(errorData.detail || `Error: ${response.status}`);
  }

  return await response.json();
};

export const apiGetBlob = async (endpoint: string): Promise<Blob> => {
  const token = getAuthToken();
  if (!token) throw new Error('Unauthorized');

  console.log('🔍 apiGetBlob Debug:');
  console.log('📤 Endpoint:', endpoint);
  console.log('🌐 Full URL:', `${API_BASE_URL}/api/v1${endpoint}`);

  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    headers
  });

  console.log('📥 Response Status:', response.status);
  console.log('📥 Response OK:', response.ok);

  if (!response.ok) {
    // Đọc response body để xem lỗi chi tiết
    let errorDetail = '';
    try {
      const errorText = await response.text();
      console.log('❌ Error Response Body:', errorText);
      errorDetail = errorText;
      
      // Thử parse JSON
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.detail || errorJson.message || errorText;
      } catch {
        // Không phải JSON, giữ nguyên text
      }
    } catch (e) {
      console.log('❌ Cannot read error response body');
    }
    
    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      handleTokenExpiry();
      throw new Error('Token đã hết hạn. Vui lòng đăng nhập lại.');
    }
    
    throw new Error(`Error ${response.status}: ${response.statusText}. ${errorDetail}`);
  }

  const blob = await response.blob();
  console.log('✅ Blob received - Size:', blob.size, 'Type:', blob.type);
  
  return blob;
};

export const apiPostAndGetBlob = async (endpoint: string, data: any): Promise<Blob> => {
  const token = getAuthToken();
  if (!token) throw new Error('Unauthorized');

  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      handleTokenExpiry();
      throw new Error('Token đã hết hạn. Vui lòng đăng nhập lại.');
    }
    
    throw new Error(`Error: ${response.status}`);
  }

  return await response.blob();
};

export const chatbotStream = async (
  query: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void,
  extra?: { image_url?: string; image_base64?: string; thread_id?: string; llm_provider?: 'google_genai' | 'openai' }
) => {
  const token = getAuthToken();
  if (!token) {
    onError(new Error('Unauthorized'));
    return;
  }

  try {
    const body: any = {
      query,
      llm_provider: extra?.llm_provider ?? 'google_genai',
      stream: true,
    };
    if (extra?.image_url) body.image_url = extra.image_url;
    if (extra?.image_base64) body.image_base64 = extra.image_base64;
    if (extra?.thread_id) body.thread_id = extra.thread_id;

    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/api/v1/chatbot/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        handleTokenExpiry();
        throw new Error('Token đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      let errorText = `Error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorText = errorData.detail || errorText;
      } catch (e) {
        // Ignore if response is not JSON
      }
      throw new Error(errorText);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const read = async () => {
      try {
        const { done, value } = await reader.read();
        if (done) {
          onComplete();
          return;
        }
        const chunk = decoder.decode(value, { stream: true });
        onChunk(chunk);
        await read();
      } catch (streamError) {
        onError(streamError as Error);
      }
    };

    await read();
  } catch (error: any) {
    onError(error);
  }
};

export const chatbot = async (query: string) => {
    try {
        const response = await apiClient.post('/chatbot/chat', { 
            query,
            llm_provider: 'google_genai'
        });
        return response.data.data;
    } catch (error) {
        // Re-throw the error so it can be handled by the calling function
        throw error;
    }
};

export const resetChatbotHistory = async () => {
    try {
        const response = await apiClient.post('/chatbot/clear-history-chat', {});
        return response.data;
    } catch (error) {
        console.error("Error resetting chatbot history:", error);
        throw error;
    }
};

// --- Chatbot Subscription and API Key Services ---

export const getMyApiKey = async (): Promise<{ api_key: string; scopes: string[]; is_active: boolean }> => {
    try {
        const response = await apiClient.get<{ api_key: string; scopes: string[]; is_active: boolean }>('/chatbot-subscriptions/my-api-key');
        return response.data;
    } catch (error) {
        console.error("Error fetching API key:", error);
        throw error;
    }
};

export const regenerateMyApiKey = async (): Promise<{ api_key: string; scopes: string[]; is_active: boolean }> => {
    try {
        const response = await apiClient.post('/chatbot-subscriptions/my-api-key/regenerate');
        return response.data;
    } catch (error) {
        console.error("Error regenerating API key:", error);
        throw error;
    }
};
export const apiPatch = async <T>(endpoint: string, data: any): Promise<T> => {
  const token = getAuthToken();
  if (!token) throw new Error('Unauthorized');

  const headers = await getAuthHeader();
  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleTokenExpiry();
      throw new Error('Token đã hết hạn. Vui lòng đăng nhập lại.');
    }
    const errorData = await response.json();
    throw new Error(errorData.detail || `Error: ${response.status}`);
  }

  return await response.json();
};
