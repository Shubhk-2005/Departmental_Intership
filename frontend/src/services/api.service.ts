import axios, { AxiosInstance, AxiosError } from 'axios';
import { auth } from '@/lib/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      
      if (error.response.status === 401) {
        // Unauthorized - redirect to login
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API service methods
export const api = {
  // Auth endpoints
  auth: {
    signup: (data: any) => apiClient.post('/auth/signup', data),
    login: (data: any) => apiClient.post('/auth/login', data),
    getCurrentUser: () => apiClient.get('/auth/me'),
  },

  // Drives endpoints
  drives: {
    getAll: () => apiClient.get('/drives'),
    getAllAdmin: () => apiClient.get('/drives/all'),
    getById: (id: string) => apiClient.get(`/drives/${id}`),
    create: (data: any) => apiClient.post('/drives', data),
    update: (id: string, data: any) => apiClient.put(`/drives/${id}`, data),
    delete: (id: string) => apiClient.delete(`/drives/${id}`),
    deactivate: (id: string) => apiClient.patch(`/drives/${id}/deactivate`),
  },

  // Internships endpoints
  internships: {
    getAll: () => apiClient.get('/internships'),
    getById: (id: string) => apiClient.get(`/internships/${id}`),
    create: (data: any) => apiClient.post('/internships', data),
    update: (id: string, data: any) => apiClient.put(`/internships/${id}`, data),
    delete: (id: string) => apiClient.delete(`/internships/${id}`),
  },

  // Alumni endpoints
  alumni: {
    getAll: () => apiClient.get('/alumni'),
    getMyProfile: () => apiClient.get('/alumni/my-profile'),
    create: (data: any) => apiClient.post('/alumni', data),
    update: (id: string, data: any) => apiClient.put(`/alumni/${id}`, data),
    delete: (id: string) => apiClient.delete(`/alumni/${id}`),
  },

  // Placements endpoints
  placements: {
    getAllStats: () => apiClient.get('/placements/stats'),
    getLatestStats: () => apiClient.get('/placements/stats/latest'),
    getStatsByYear: (year: string) => apiClient.get(`/placements/stats/${year}`),
    createStats: (data: any) => apiClient.post('/placements/stats', data),
    deleteStats: (year: string) => apiClient.delete(`/placements/stats/${year}`),
  },

  // Upload endpoints (for Firebase Storage)
  upload: {
    uploadResume: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post('/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    uploadProfilePhoto: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post('/upload/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    uploadDocument: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post('/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    deleteFile: (path: string) => apiClient.delete(`/upload/${encodeURIComponent(path)}`),
  },
};

export default apiClient;
