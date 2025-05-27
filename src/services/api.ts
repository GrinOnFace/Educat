import axios from 'axios';

const API_URL = 'https://7a9c176f6674.vps.myjino.ru/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - access denied
          console.error('Access forbidden:', error.response.data?.message);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', error.response.data?.message);
          break;
        case 500:
          // Server error
          console.error('Server error:', error.response.data?.message);
          break;
        default:
          console.error('API Error:', error.response.data?.message);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - no response received');
    } else {
      // Other errors
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
