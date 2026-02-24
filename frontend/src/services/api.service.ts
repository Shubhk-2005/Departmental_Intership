import axios, { AxiosInstance, AxiosError } from 'axios';
import { auth } from '@/lib/firebase';

const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || '/api');

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased to 30 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For FormData, remove Content-Type header so axios can set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
      // Don't log 404s as errors, as they are often expected (e.g., profile not found)
      if (error.response.status !== 404) {
        console.error('API Error:', error.response.data);
      }
      
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
    lookupStudent: (collegeEmail: string) => apiClient.get(`/auth/lookup-student?collegeEmail=${encodeURIComponent(collegeEmail)}`),
    updateProfile: (data: any) => apiClient.put('/auth/profile', data),
    transitionToAlumni: (data: { newEmail: string; company: string; role: string }) => apiClient.post('/auth/transition-to-alumni', data),
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
    getPublic: (search?: string) => apiClient.get('/alumni', { params: { search } }),
    getAll: () => apiClient.get('/alumni/all'), // Admin only
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

  // Competitive exams endpoints
  exams: {
    getMyExams: () => apiClient.get('/exams'),
    getStudentExams: () => apiClient.get('/exams/students'), // Admin only
    getById: (id: string) => apiClient.get(`/exams/${id}`),
    create: (data: any) => apiClient.post('/exams', data),
    update: (id: string, data: any) => apiClient.put(`/exams/${id}`, data),
    delete: (id: string) => apiClient.delete(`/exams/${id}`),
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

  // Off-Campus Placements endpoints
  offCampusPlacements: {
    getAll: () => apiClient.get('/off-campus-placements'),
    getMyPlacements: () => apiClient.get('/off-campus-placements/my-placements'),
    create: (data: FormData) => apiClient.post('/off-campus-placements', data),
    update: (id: string, data: any) => apiClient.put(`/off-campus-placements/${id}`, data),
    delete: (id: string) => apiClient.delete(`/off-campus-placements/${id}`),
    exportCSV: () => apiClient.get('/off-campus-placements/export-csv', { 
      responseType: 'blob' 
    }),
  },
};

export default apiClient;
