/**
 * API Client Utility
 * 
 * Axios-based HTTP client with authentication, error handling,
 * and request/response interceptors.
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiError, StandardApiResponse } from '@dashin/shared-types';

/**
 * Create API client instance
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - Add auth token
  client.interceptors.request.use(
    (config) => {
      // Get token from localStorage or cookie
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('access_token') 
        : null;
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle errors
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      const apiError: ApiError = {
        message: 'An unexpected error occurred',
        status: error.response?.status,
        code: error.code,
      };

      // Try to extract error from response
      if (error.response?.data && typeof error.response.data === 'object') {
        const responseData = error.response.data as { error?: ApiError };
        if (responseData.error) {
          apiError.message = responseData.error.message || apiError.message;
          apiError.code = responseData.error.code || apiError.code;
          apiError.details = responseData.error.details;
        }
      } else if (error.message) {
        apiError.message = error.message;
      }

      // Handle specific error codes
      if (error.response?.status === 401) {
        // Unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      } else if (error.response?.status === 403) {
        apiError.message = 'You do not have permission to perform this action';
      } else if (error.response?.status === 404) {
        apiError.message = 'The requested resource was not found';
      } else if (error.response?.status === 429) {
        apiError.message = 'Too many requests. Please try again later.';
      } else if (error.response?.status && error.response.status >= 500) {
        apiError.message = 'Server error. Please try again later.';
      }

      return Promise.reject(apiError);
    }
  );

  return client;
};

// Export singleton instance
export const apiClient = createApiClient();

/**
 * Generic GET request
 */
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<StandardApiResponse<T>>(url, config);
  const apiResponse = response.data as StandardApiResponse<T>;
  
  if (apiResponse.success && apiResponse.data) {
    return apiResponse.data;
  }
  
  const errorMessage = apiResponse.error?.message || 'Request failed';
  throw new Error(errorMessage);
}

/**
 * Generic POST request
 */
export async function post<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<StandardApiResponse<T>>(url, data, config);
  const apiResponse = response.data as StandardApiResponse<T>;
  
  if (apiResponse.success && apiResponse.data) {
    return apiResponse.data;
  }
  
  const errorMessage = apiResponse.error?.message || 'Request failed';
  throw new Error(errorMessage);
}

/**
 * Generic PUT request
 */
export async function put<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.put<StandardApiResponse<T>>(url, data, config);
  const apiResponse = response.data as StandardApiResponse<T>;
  
  if (apiResponse.success && apiResponse.data) {
    return apiResponse.data;
  }
  
  const errorMessage = apiResponse.error?.message || 'Request failed';
  throw new Error(errorMessage);
}

/**
 * Generic PATCH request
 */
export async function patch<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.patch<StandardApiResponse<T>>(url, data, config);
  const apiResponse = response.data as StandardApiResponse<T>;
  
  if (apiResponse.success && apiResponse.data) {
    return apiResponse.data;
  }
  
  const errorMessage = apiResponse.error?.message || 'Request failed';
  throw new Error(errorMessage);
}

/**
 * Generic DELETE request
 */
export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<StandardApiResponse<T>>(url, config);
  const apiResponse = response.data as StandardApiResponse<T>;
  
  if (apiResponse.success && apiResponse.data) {
    return apiResponse.data;
  }
  
  const errorMessage = apiResponse.error?.message || 'Request failed';
  throw new Error(errorMessage);
}

/**
 * Build query string from params object
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else if (typeof value === 'object') {
        searchParams.append(key, JSON.stringify(value));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Set authentication token
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
}

/**
 * Clear authentication token
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('access_token');
  }
  return false;
}
