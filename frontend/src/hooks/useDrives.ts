import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api.service';

export const useDrives = () => {
  return useQuery({
    queryKey: ['drives'],
    queryFn: async () => {
      const response = await api.drives.getAll();
      return response.data.drives;
    },
  });
};

export const useDrivesAdmin = () => {
  return useQuery({
    queryKey: ['drives', 'admin'],
    queryFn: async () => {
      const response = await api.drives.getAllAdmin();
      return response.data.drives;
    },
  });
};

export const useCreateDrive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.drives.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drives'] });
    },
  });
};

export const useUpdateDrive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      api.drives.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drives'] });
    },
  });
};

export const useDeleteDrive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.drives.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drives'] });
    },
  });
};
