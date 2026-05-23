import { useQuery } from '@tanstack/react-query';
import { metricsService } from '../services/metrics.service';

export const useMetricsQuery = () => {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: () => metricsService.getMetrics(),
    // Metrics don't change frequently — refetch every 30 seconds
    staleTime: 30_000,
  });
};
