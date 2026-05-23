import { apiClient } from '../api/client';
import { TrialMetrics } from '../types';

export const metricsService = {
  getMetrics: async (): Promise<TrialMetrics> => {
    const response = await apiClient.get<TrialMetrics>('/api/v1/metrics');
    return response.data;
  },
};
