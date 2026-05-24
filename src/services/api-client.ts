import Cookies from 'js-cookie';
import type { ApiResponse, ApiError, PaginatedResponse } from '@/types';

// ============================================
// API Client — Typed Fetch Wrapper
// ============================================

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();

/** Custom error class for typed API error handling */
export class ApiException extends Error {
  public status: number;
  public code?: string;
  public details?: Record<string, string[]>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
  }
}

/** Generic query parameter type for GET requests */
export type QueryParams = Record<string, string | number | boolean | undefined | null>;

/** Request configuration options */
interface RequestConfig extends Omit<RequestInit, 'body'> {
  /** Query parameters appended to the URL */
  params?: QueryParams;
  /** Request body (will be JSON-stringified) */
  body?: unknown;
  /** Skip adding the Authorization header */
  skipAuth?: boolean;
  /** Custom timeout in milliseconds */
  timeout?: number;
}

/** Build a URL with query parameters */
function buildUrl(endpoint: string, params?: QueryParams): string {
  const url = new URL(endpoint, BASE_URL ? `${BASE_URL}/` : window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // When BASE_URL is empty, return just the path + query
  if (!BASE_URL) {
    const query = url.search.toString();
    return `${endpoint}${query ? `?${query}` : ''}`;
  }

  return url.toString();
}

/** Read the access token from localStorage or cookies */
function getAccessToken(): string | undefined {
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem('access_token');
    if (localToken) return localToken;
  }
  return Cookies.get('access_token');
}

/** Request interceptor — adds auth headers and content type */
function requestInterceptor(config: RequestInit & { skipAuth?: boolean }): RequestInit {
  const headers = new Headers(config.headers);

  // Set Content-Type for requests with body (skip for FormData)
  if (config.body && !(config.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  // Attach Authorization Bearer token
  const token = getAccessToken();
  if (token && !(config as RequestConfig).skipAuth) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return { ...config, headers };
}

/** Response interceptor — parses JSON and handles errors */
async function responseInterceptor<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiError = {
      status: response.status,
      message: response.statusText || 'Неизвестная ошибка',
    };

    try {
      const body = await response.json();
      if (body.message) errorData.message = body.message;
      if (body.code) errorData.code = body.code;
      if (body.details) errorData.details = body.details;
    } catch {
      // Response body is not JSON — keep default error
    }

    throw new ApiException(errorData);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const json = await response.json();
  return json as T;
}

/** Logging interceptor for request debugging (dev only) */
function logRequest(method: string, url: string, config: RequestInit): void {
  if (process.env.NODE_ENV === 'development') {
    console.groupCollapsed(`[API] ${method} ${url}`);
    console.log('Headers:', Object.fromEntries(new Headers(config.headers).entries()));
    if (config.body) {
      try {
        console.log('Body:', JSON.parse(config.body as string));
      } catch {
        console.log('Body:', config.body);
      }
    }
    console.groupEnd();
  }
}

/** Logging interceptor for response debugging (dev only) */
function logResponse(method: string, url: string, status: number): void {
  if (process.env.NODE_ENV === 'development') {
    const color = status >= 200 && status < 300 ? '#4ade80' : '#f87171';
    console.log(`%c[API] ${method} ${url} — ${status}`, `color: ${color}`);
  }
}

/** Create an abort signal with a timeout */
function createTimeoutSignal(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

// ============================================
// API Client Class
// ============================================

class ApiClient {
  private readonly defaultTimeout: number;

  constructor(timeout = 30_000) {
    this.defaultTimeout = timeout;
  }

  /** Perform a GET request */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = buildUrl(endpoint, config?.params);
    const requestInit = requestInterceptor({
      ...config,
      method: 'GET',
      signal: createTimeoutSignal(config?.timeout ?? this.defaultTimeout),
    });

    logRequest('GET', url, requestInit);

    const response = await fetch(url, requestInit);
    logResponse('GET', url, response.status);

    return responseInterceptor<T>(response);
  }

  /** Perform a POST request */
  async post<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = buildUrl(endpoint, config?.params);
    const body = config?.body instanceof FormData
      ? config.body
      : config?.body
        ? JSON.stringify(config.body)
        : undefined;

    const requestInit = requestInterceptor({
      ...config,
      method: 'POST',
      body,
      signal: createTimeoutSignal(config?.timeout ?? this.defaultTimeout),
    });

    logRequest('POST', url, requestInit);

    const response = await fetch(url, requestInit);
    logResponse('POST', url, response.status);

    return responseInterceptor<T>(response);
  }

  /** Perform a PUT request */
  async put<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = buildUrl(endpoint, config?.params);
    const body = config?.body instanceof FormData
      ? config.body
      : config?.body
        ? JSON.stringify(config.body)
        : undefined;

    const requestInit = requestInterceptor({
      ...config,
      method: 'PUT',
      body,
      signal: createTimeoutSignal(config?.timeout ?? this.defaultTimeout),
    });

    logRequest('PUT', url, requestInit);

    const response = await fetch(url, requestInit);
    logResponse('PUT', url, response.status);

    return responseInterceptor<T>(response);
  }

  /** Perform a PATCH request */
  async patch<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = buildUrl(endpoint, config?.params);
    const body = config?.body instanceof FormData
      ? config.body
      : config?.body
        ? JSON.stringify(config.body)
        : undefined;

    const requestInit = requestInterceptor({
      ...config,
      method: 'PATCH',
      body,
      signal: createTimeoutSignal(config?.timeout ?? this.defaultTimeout),
    });

    logRequest('PATCH', url, requestInit);

    const response = await fetch(url, requestInit);
    logResponse('PATCH', url, response.status);

    return responseInterceptor<T>(response);
  }

  /** Perform a DELETE request */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = buildUrl(endpoint, config?.params);
    const requestInit = requestInterceptor({
      ...config,
      method: 'DELETE',
      signal: createTimeoutSignal(config?.timeout ?? this.defaultTimeout),
    });

    logRequest('DELETE', url, requestInit);

    const response = await fetch(url, requestInit);
    logResponse('DELETE', url, response.status);

    return responseInterceptor<T>(response);
  }
}

/** Singleton API client instance */
export const apiClient = new ApiClient();

export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  QueryParams,
  RequestConfig,
};
