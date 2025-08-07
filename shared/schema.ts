export interface ProgressResponse {
  is_active: boolean;
  current: number;
  total: number;
  success_count: number;
  failure_count: number;
  logs: string[];
}

export interface StatusResponse {
  is_active: boolean;
  completed: boolean;
  total_processed: number;
  success_count: number;
  failure_count: number;
  logs: string[];
}

export interface SendResponse {
  message: string;
  total_recipients: number;
}

export interface ErrorResponse {
  error: string;
}
