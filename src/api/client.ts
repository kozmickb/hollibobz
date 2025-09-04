import axios from 'axios';
import { API_BASE_URL } from '../config/env';
import { getAnonymousId } from '../utils/anonymousId';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add request interceptor to include anonymous ID
api.interceptors.request.use(async (config) => {
  try {
    const subjectId = await getAnonymousId();
    config.headers['x-subject-id'] = subjectId;
  } catch (error) {
    console.warn('Failed to get anonymous ID:', error);
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
