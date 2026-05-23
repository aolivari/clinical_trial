import { apiClient } from '../api/client';
import { LoginResponse } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', {
      email,
      password,
    });
    return response.data;
  },
};
