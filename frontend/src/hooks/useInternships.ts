import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api.service';

export const useInternships = () => {
  return useQuery({
    queryKey: ['internships'],
    queryFn: async () => {
      const response = await api.internships.getAll();
      return response.data.internships;
    },
  });
};

export const useCreateInternship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.internships.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
    },
  });
};

export const useUpdateInternship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      api.internships.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
    },
  });
};

export const useDeleteInternship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.internships.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internships'] });
    },
  });
};
