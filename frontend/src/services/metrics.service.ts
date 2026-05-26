import { apiClient } from '../api/client';
import { TrialMetricsDTO, TrialMetrics } from '../types';
import { toMetricsModel } from '../types/mappers';

export const metricsService = {
  getMetrics: async (): Promise<TrialMetrics> => {
    const response = await apiClient.get<TrialMetricsDTO>('/api/v1/metrics');
    return toMetricsModel(response.data);
  },
};
