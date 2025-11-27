import axios from "axios";
import { getAuthToken } from "./apiService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://192.168.1.161:8000";

const authHeaders = () => ({
  Authorization: `Bearer ${getAuthToken()}`,
  "Content-Type": "application/json",
});

export interface PersonaConfigPayload {
  role: string;
  name: string;
  tone?: string;
  ai_role?: string;
  ai_name?: string;
}

export interface PromptConfigPayload {
  system_prompt: string;
  custom_prompt: string;
  language?: string;
}

export interface FeatureTogglePayload {
  enabled: boolean;
}

export interface PersonaConfigResponse {
  ai_name: string;
  ai_role: string;
  tone?: string;
}

export interface PromptConfigResponse {
  custom_prompt: string;
}

export interface FeatureToggleResponse {
  enabled: boolean;
}

export const getPersonaConfig = async (): Promise<PersonaConfigResponse | null> => {
  try {
    const resp = await axios.get(
      `${API_BASE_URL}/api/v1/user-config/persona`,
      { headers: authHeaders() }
    );
    return resp.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // Chưa có config
    }
    throw error;
  }
};

export const getPromptConfig = async (): Promise<PromptConfigResponse | null> => {
  try {
    const resp = await axios.get(
      `${API_BASE_URL}/api/v1/user-config/prompt`,
      { headers: authHeaders() }
    );
    return resp.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // Chưa có config
    }
    throw error;
  }
};

export const getServiceFeatureConfig = async (): Promise<FeatureToggleResponse | null> => {
  try {
    const resp = await axios.get(
      `${API_BASE_URL}/api/v1/user-config/service-feature`,
      { headers: authHeaders() }
    );
    return resp.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // Chưa có config
    }
    throw error;
  }
};

export const getAccessoryFeatureConfig = async (): Promise<FeatureToggleResponse | null> => {
  try {
    const resp = await axios.get(
      `${API_BASE_URL}/api/v1/user-config/accessory-feature`,
      { headers: authHeaders() }
    );
    return resp.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // Chưa có config
    }
    throw error;
  }
};

export const updatePersonaConfig = async (payload: PersonaConfigPayload) => {
  const body = {
    ai_role: payload.ai_role ?? payload.role,
    ai_name: payload.ai_name ?? payload.name,
    role: payload.role,
    name: payload.name,
    tone: payload.tone,
  };
  const resp = await axios.put(
    `${API_BASE_URL}/api/v1/user-config/persona`,
    body,
    { headers: authHeaders() }
  );
  return resp.data;
};

export const updatePromptConfig = async (payload: PromptConfigPayload) => {
  const body = {
    system_prompt: payload.system_prompt,
    custom_prompt: payload.custom_prompt,
    language: payload.language,
  };
  const resp = await axios.put(
    `${API_BASE_URL}/api/v1/user-config/prompt`,
    body,
    { headers: authHeaders() }
  );
  return resp.data;
};

export const updateServiceFeatureConfig = async (
  payload: FeatureTogglePayload
) => {
  const resp = await axios.put(
    `${API_BASE_URL}/api/v1/user-config/service-feature`,
    payload,
    { headers: authHeaders() }
  );
  return resp.data;
};

export const updateAccessoryFeatureConfig = async (
  payload: FeatureTogglePayload
) => {
  const resp = await axios.put(
    `${API_BASE_URL}/api/v1/user-config/accessory-feature`,
    payload,
    { headers: authHeaders() }
  );
  return resp.data;
};


