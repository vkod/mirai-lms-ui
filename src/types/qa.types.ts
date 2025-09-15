export type SessionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type LeadClassification = 'hot' | 'warm' | 'cold';

export interface PersonaInfo {
  lead_id: string;
  full_name: string;
  lead_classification: LeadClassification;
}

export interface SessionResponse {
  persona: PersonaInfo;
  answer: string;
  answered_at: string;
  confidence_score?: number;
}

export interface SessionSummary {
  summary_text: string;
  key_insights: string[];
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative?: number;
  };
}

export interface CreateSessionRequest {
  question: string;
  prospect_ids: string[];
  image_base64?: string;
  image_mime_type?: string;
}

export interface CreateSessionResponse {
  session_id: string;
  status: SessionStatus;
  message: string;
  created_at: string;
  total_prospects: number;
  estimated_completion_time: number;
}

export interface SessionListResponse {
  sessions: QASession[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  active_sessions_count: number;
  completed_sessions_count: number;
}

export interface QASession {
  session_id: string;
  question: string;
  status: SessionStatus;
  created_at: string;
  completed_at?: string;
  responses: SessionResponse[];
  summary?: SessionSummary;
  total_expected: number;
  total_responded: number;
  image_url?: string;
}

export interface SessionDetailResponse extends QASession {
  prospect_ids?: string[];
}

export interface CancelSessionResponse {
  session_id: string;
  status: SessionStatus;
  message: string;
  cancelled_at: string;
}

export interface SSEEventData {
  new_response?: SessionResponse;
  progress?: {
    total_expected: number;
    total_responded: number;
    percentage: number;
  };
  summary?: SessionSummary;
  status?: SessionStatus;
  error?: string;
}

export interface SessionFilters {
  status_filter?: SessionStatus[];
  prospect_id?: string;
  date_from?: string;
  date_to?: string;
  search_query?: string;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: 'created_at' | 'completed_at' | 'status';
  sort_order?: 'asc' | 'desc';
}