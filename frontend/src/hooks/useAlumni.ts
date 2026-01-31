import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api.service';

export const useAlumni = () => {
  return useQuery({
    queryKey: ['alumni'],
    queryFn: async () => {
      const response = await api.alumni.getPublic();
      return response.data.alumni;
    },
  });
};

export const useMyAlumniProfile = () => {
  return useQuery({
    queryKey: ['alumni', 'my-profile'],
    queryFn: async () => {
      try {
        const response = await api.alumni.getMyProfile();
        return response.data.profile;
      } catch (error: any) {
        // If profile doesn't exist (404), return null instead of throwing
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    retry: false, // Don't retry on 404
  });
};

export const useCreateAlumniProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.alumni.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni'] });
      queryClient.invalidateQueries({ queryKey: ['alumni', 'my-profile'] });
    },
  });
};

export const useUpdateAlumniProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      api.alumni.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni'] });
      queryClient.invalidateQueries({ queryKey: ['alumni', 'my-profile'] });
    },
  });
};
