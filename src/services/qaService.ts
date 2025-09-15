import axios, { AxiosError } from 'axios';
import { getApiEndpoint, API_ENDPOINTS } from '../config/api.config';
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  SessionListResponse,
  SessionDetailResponse,
  CancelSessionResponse,
  SessionFilters,
  PaginationParams,
  SSEEventData
} from '../types/qa.types';

class QAService {
  private eventSources: Map<string, EventSource> = new Map();

  async createSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
    try {
      const response = await axios.post<CreateSessionResponse>(
        getApiEndpoint(API_ENDPOINTS.QA_SESSIONS),
        request
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'Failed to create Q&A session');
      throw error;
    }
  }

  async listSessions(
    filters?: SessionFilters,
    pagination?: PaginationParams
  ): Promise<SessionListResponse> {
    try {
      const params = new URLSearchParams();

      if (pagination?.page) params.append('page', pagination.page.toString());
      if (pagination?.page_size) params.append('page_size', pagination.page_size.toString());
      if (pagination?.sort_by) params.append('sort_by', pagination.sort_by);
      if (pagination?.sort_order) params.append('sort_order', pagination.sort_order);

      if (filters?.status_filter && filters.status_filter.length > 0) {
        params.append('status_filter', filters.status_filter.join(','));
      }
      if (filters?.prospect_id) params.append('prospect_id', filters.prospect_id);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.search_query) params.append('search_query', filters.search_query);

      const response = await axios.get<SessionListResponse>(
        `${getApiEndpoint(API_ENDPOINTS.QA_SESSIONS)}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'Failed to fetch Q&A sessions');
      throw error;
    }
  }

  async getSessionDetail(sessionId: string): Promise<SessionDetailResponse> {
    try {
      const response = await axios.get<SessionDetailResponse>(
        getApiEndpoint(API_ENDPOINTS.QA_SESSION_DETAIL(sessionId))
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, `Failed to fetch session ${sessionId}`);
      throw error;
    }
  }

  async cancelSession(sessionId: string): Promise<CancelSessionResponse> {
    try {
      const response = await axios.post<CancelSessionResponse>(
        getApiEndpoint(API_ENDPOINTS.QA_SESSION_CANCEL(sessionId))
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, `Failed to cancel session ${sessionId}`);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await axios.delete(
        getApiEndpoint(API_ENDPOINTS.QA_SESSION_DETAIL(sessionId))
      );
    } catch (error) {
      this.handleError(error as AxiosError, `Failed to delete session ${sessionId}`);
      throw error;
    }
  }

  subscribeToSession(
    sessionId: string,
    onMessage: (data: SSEEventData) => void,
    onError?: (error: Event) => void,
    onComplete?: () => void
  ): () => void {
    this.unsubscribeFromSession(sessionId);

    const eventSource = new EventSource(
      getApiEndpoint(API_ENDPOINTS.QA_SESSION_STREAM(sessionId))
    );

    this.eventSources.set(sessionId, eventSource);

    eventSource.addEventListener('response_received', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        onMessage({
          new_response: data.new_response,
          progress: data.progress
        });
      } catch (error) {
        console.error('Error parsing response_received event:', error);
      }
    });

    eventSource.addEventListener('session_completed', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        onMessage({
          summary: data.summary,
          status: 'completed'
        });
        if (onComplete) {
          onComplete();
        }
        this.unsubscribeFromSession(sessionId);
      } catch (error) {
        console.error('Error parsing session_completed event:', error);
      }
    });

    eventSource.addEventListener('error', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        onMessage({
          error: data.error,
          status: 'failed'
        });
      } catch (error) {
        console.error('Error parsing error event:', error);
      }
    });

    eventSource.onerror = (error: Event) => {
      console.error('SSE connection error:', error);
      if (onError) {
        onError(error);
      }
      this.unsubscribeFromSession(sessionId);
    };

    return () => this.unsubscribeFromSession(sessionId);
  }

  unsubscribeFromSession(sessionId: string): void {
    const eventSource = this.eventSources.get(sessionId);
    if (eventSource) {
      eventSource.close();
      this.eventSources.delete(sessionId);
    }
  }

  unsubscribeFromAllSessions(): void {
    this.eventSources.forEach((eventSource) => {
      eventSource.close();
    });
    this.eventSources.clear();
  }

  async convertImageToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve({
          base64: base64Data,
          mimeType: file.type
        });
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  private handleError(error: AxiosError, defaultMessage: string): void {
    if (error.response) {
      const errorData = error.response.data as any;
      const message = errorData?.detail || errorData?.message || defaultMessage;
      console.error(`API Error (${error.response.status}):`, message);
    } else if (error.request) {
      console.error('Network Error:', 'No response from server');
    } else {
      console.error('Error:', error.message);
    }
  }
}

export const qaService = new QAService();