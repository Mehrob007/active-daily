import Cookies from 'js-cookie';
import type { ApiResponse, ApiError, PaginatedResponse } from '@/types';

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();

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

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

interface RequestConfig extends Omit<RequestInit, 'body'> {

  params?: QueryParams;

  body?: unknown;

  skipAuth?: boolean;

  timeout?: number;
}

function buildUrl(endpoint: string, params?: QueryParams): string {
  const url = new URL(endpoint, BASE_URL ? `${BASE_URL}/` : window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  if (!BASE_URL) {
    const query = url.search.toString();
    return `${endpoint}${query ? `?${query}` : ''}`;
  }

  return url.toString();
}

function getAccessToken(): string | undefined {
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem('access_token');
    if (localToken) return localToken;
  }
  return Cookies.get('access_token');
}

function requestInterceptor(config: RequestInit & { skipAuth?: boolean }): RequestInit {
  const headers = new Headers(config.headers);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (config.body && !(config.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const token = getAccessToken()?.trim();
  if (token && !(config as RequestConfig).skipAuth) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return { ...config, headers };
}

async function responseInterceptor<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiError = {
      status: response.status,
      message: response.statusText || 'Неизвестная ошибка',
    };

    try {
      const body = await response.json();
      const isV2TokenError = body?.error === 'the given token is already a JWT token V2';
      if (!isV2TokenError) {
        console.error(`[API Error] ${response.status} ${response.url}:`, body);
      }
      if (body.message) errorData.message = body.message;
      if (body.error) errorData.message = body.error; 
      if (body.code) errorData.code = body.code;
      if (body.details) errorData.details = body.details;
    } catch {

    }

    throw new ApiException(errorData);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const json = await response.json();
  return json as T;
}

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

function logResponse(method: string, url: string, status: number): void {
  if (process.env.NODE_ENV === 'development') {
    const color = status >= 200 && status < 300 ? '#4ade80' : '#f87171';
    console.log(`%c[API] ${method} ${url} — ${status}`, `color: ${color}`);
  }
}

function createTimeoutSignal(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

class ApiClient {
  private readonly defaultTimeout: number;

  constructor(timeout = 30_000) {
    this.defaultTimeout = timeout;
  }

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

export const apiClient = new ApiClient();

export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  QueryParams,
  RequestConfig,
};
