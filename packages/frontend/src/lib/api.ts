const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  errors?: { field: string; message: string }[];
  [key: string]: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
      // Try refresh
      const refreshed = await this.refreshToken();
      if (refreshed) {
        const retry = await fetch(url, config);
        return retry.json();
      }
      // Only hard-redirect if NOT already on a public page (avoids reload loop)
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const isPublicPage = path === '/login' || path === '/register' || path === '/';
        if (!isPublicPage) {
          window.location.href = '/login';
        }
      }
      throw new Error('Session expired');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(data.message || 'Something went wrong', response.status, data.errors);
    }
    return data;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  get<T>(endpoint: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`${endpoint}${query}`);
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  }

  patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export class ApiError extends Error {
  statusCode: number;
  errors?: { field: string; message: string }[];

  constructor(message: string, statusCode: number, errors?: { field: string; message: string }[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const api = new ApiClient(API_BASE);
export default api;