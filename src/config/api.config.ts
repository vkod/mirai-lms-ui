// API Configuration
// This file centralizes all API-related configuration

interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

const getApiUrl = (): string => {
  // Check for environment variable first (for production builds)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Default to localhost for development
  return 'http://localhost:8000';
};

export const apiConfig: ApiConfig = {
  baseUrl: getApiUrl(),
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to construct full API URLs
export const getApiEndpoint = (endpoint: string): string => {
  const base = apiConfig.baseUrl.endsWith('/') 
    ? apiConfig.baseUrl.slice(0, -1) 
    : apiConfig.baseUrl;
  const path = endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`;
  return `${base}${path}`;
};

// API Endpoints as constants for better maintainability
export const API_ENDPOINTS = {
  // Persona endpoints
  GET_SYNTHETIC_PERSONAS: '/get_synthetic_personas',
  GET_SYNTHETIC_PERSONA: (leadId: string) => `/get_synthetic_persona/${leadId}`,
  CHAT_WITH_PERSONA: (leadId: string) => `/chat_with_synthetic_persona/${leadId}`,
  PERSONA_IMAGE: (leadId: string) => `/persona_image/${leadId}`,
  PERSONA_IMAGE_MEDIUM: (leadId: string) => `/persona_image_medium/${leadId}`,
  PERSONA_IMAGE_THUMBNAIL: (leadId: string) => `/persona_image_thumbnail/${leadId}`,

  // Realtime voice endpoints
  REALTIME_SESSION: '/realtime/session',

  // Q&A Feature endpoints
  QA_SESSIONS: '/api/v1/qa/sessions',
  QA_SESSION_DETAIL: (sessionId: string) => `/api/v1/qa/sessions/${sessionId}`,
  QA_SESSION_STREAM: (sessionId: string) => `/api/v1/qa/sessions/${sessionId}/stream`,
  QA_SESSION_CANCEL: (sessionId: string) => `/api/v1/qa/sessions/${sessionId}/cancel`,

  // Add other endpoints here as needed
} as const;