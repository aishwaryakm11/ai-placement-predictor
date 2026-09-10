import axios from 'axios';

/**
 * Global Axios client configured per Section 5 / Part C specification.
 * Reads base URL from import.meta.env.VITE_API_BASE_URL (defaults to http://localhost:8000).
 * Features a response interceptor that normalizes all server, network, and validation
 * errors into a single readable message string for the ErrorBanner component.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let normalizedMessage = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      // Server responded with an error status code (4xx, 5xx)
      const data = error.response.data;
      if (typeof data === 'string') {
        normalizedMessage = data;
      } else if (data && typeof data === 'object') {
        if (data.detail) {
          // FastAPI default error format
          if (Array.isArray(data.detail)) {
            normalizedMessage = data.detail.map((d) => d.msg || d.message).join('; ');
          } else {
            normalizedMessage = String(data.detail);
          }
        } else if (data.message) {
          normalizedMessage = data.message;
        } else if (data.error) {
          normalizedMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        } else {
          normalizedMessage = `Server error (${error.response.status}): ${error.response.statusText}`;
        }
      } else {
        normalizedMessage = `HTTP error ${error.response.status}: ${error.response.statusText}`;
      }
    } else if (error.request) {
      // Request was made but no response received (Backend offline / network down)
      normalizedMessage = `Cannot reach backend at ${API_BASE_URL}. Ensure your API server is running.`;
    } else {
      normalizedMessage = error.message || 'Request configuration error.';
    }

    // Attach normalized error message
    error.normalizedMessage = normalizedMessage;
    return Promise.reject(error);
  }
);

export default apiClient;
