import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api.service';

export const useOffCampusPlacements = () => {
  return useQuery({
    queryKey: ['off-campus-placements'],
    queryFn: async () => {
      const response = await api.offCampusPlacements.getAll();
      return response.data.placements;
    },
  });
};

export const useMyOffCampusPlacements = () => {
  return useQuery({
    queryKey: ['off-campus-placements', 'my-placements'],
    queryFn: async () => {
      try {
        const response = await api.offCampusPlacements.getMyPlacements();
        return response.data.placements;
      } catch (error: any) {
        // If no placements exist, return empty array
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    retry: false,
  });
};

export const useCreateOffCampusPlacement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => api.offCampusPlacements.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['off-campus-placements'] });
      queryClient.invalidateQueries({ queryKey: ['off-campus-placements', 'my-placements'] });
    },
  });
};

export const useUpdateOffCampusPlacement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.offCampusPlacements.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['off-campus-placements'] });
      queryClient.invalidateQueries({ queryKey: ['off-campus-placements', 'my-placements'] });
    },
  });
};

export const useDeleteOffCampusPlacement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.offCampusPlacements.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['off-campus-placements'] });
      queryClient.invalidateQueries({ queryKey: ['off-campus-placements', 'my-placements'] });
    },
  });
};
