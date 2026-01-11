import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api.service';

export const usePlacementStats = () => {
  return useQuery({
    queryKey: ['placements', 'stats'],
    queryFn: async () => {
      const response = await api.placements.getAllStats();
      return response.data.stats;
    },
  });
};

export const useLatestPlacementStats = () => {
  return useQuery({
    queryKey: ['placements', 'stats', 'latest'],
    queryFn: async () => {
      const response = await api.placements.getLatestStats();
      return response.data.stats;
    },
  });
};

export const useCreatePlacementStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.placements.createStats(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placements', 'stats'] });
    },
  });
};
