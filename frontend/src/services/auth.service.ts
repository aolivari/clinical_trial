import { apiClient } from '../api/client';
import { LoginResponseDTO, LoginResponse } from '../types';
import { toLoginResponseModel } from '../types/mappers';

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponseDTO>('/api/v1/auth/login', {
      email,
      password,
    });
    return toLoginResponseModel(response.data);
  },
};
