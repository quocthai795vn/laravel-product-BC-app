// Common API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
  errors?: Record<string, string[]>; // Validation errors
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
  };
}

export interface UserResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
  };
}
