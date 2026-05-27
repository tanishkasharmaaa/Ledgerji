const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

/** ── Lazy token access (avoids circular import between api.ts ↔ auth.store.ts) ── */
let _getToken: (() => string | null) | null = null;

/**
 * Register a callback that returns the current Bearer token.
 * Call this once from your auth store (or app bootstrap) after the store is created.
 *
 * @example
 *   import { setTokenGetter } from '@/lib/api';
 *   import { useAuthStore } from '@/stores/auth.store';
 *   setTokenGetter(() => useAuthStore.getState().accessToken);
 */
export function setTokenGetter(fn: () => string | null) {
  _getToken = fn;
}

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

  /** Build headers, injecting the Bearer token when available */
  private buildHeaders(extra?: RequestInit['headers']): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(extra as Record<string, string>),
    };

    // Attach Bearer token so cross-origin cookie-less auth works on Render
    const token = _getToken?.();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: this.buildHeaders(options.headers),
      credentials: 'include', // forwards HttpOnly cookies (refresh token, etc.)
    };

    let response = await fetch(url, config);

    // ── 401 → try silent refresh, then retry once ──
    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Re-attach headers after refresh (the token getter may now return a fresh token)
        const retryConfig: RequestInit = {
          ...options,
          headers: this.buildHeaders(options.headers),
          credentials: 'include',
        };
        response = await fetch(url, retryConfig);
      }
    }

    // Parse body (even for error responses we need the message)
    const data = await response.json();

    // ── Still 401 after refresh → redirect to login (but not from public pages) ──
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const isPublicPage = path === '/login' || path === '/register' || path === '/';
        if (!isPublicPage) {
          window.location.href = '/login';
        }
      }
      throw new ApiError(data.message || 'Session expired', 401, data.errors);
    }

    if (!response.ok) {
      throw new ApiError(data.message || 'Something went wrong', response.status, data.errors);
    }

    // Return the full parsed JSON object — React Query expects the data shape directly
    return data;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return false;

      // If the backend returns a new accessToken in the body, stash it
      const body = await res.json().catch(() => null);
      if (body?.accessToken && _getToken) {
        // Dynamically import the store and update it
        const { useAuthStore } = await import('@/stores/auth.store');
        const current = useAuthStore.getState();
        current.setUser({ ...current.user!, accessToken: body.accessToken } as any);
        useAuthStore.setState({ accessToken: body.accessToken });
      }
      return true;
    } catch {
      return false;
    }
  }

  get<T>(endpoint: string, params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`${endpoint}${query}`);
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
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