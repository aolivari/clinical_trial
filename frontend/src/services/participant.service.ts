import { apiClient } from '../api/client';
import { Participant, ParticipantCreate, ParticipantUpdate, PaginatedResponse } from '../types';

export const participantService = {
  getParticipants: async (skip = 0, limit = 50): Promise<PaginatedResponse<Participant>> => {
    const response = await apiClient.get<PaginatedResponse<Participant>>(
      `/api/v1/participants?skip=${skip}&limit=${limit}`
    );
    return response.data;
  },

  getParticipantById: async (id: string): Promise<Participant> => {
    const response = await apiClient.get<Participant>(`/api/v1/participants/${id}`);
    return response.data;
  },

  createParticipant: async (data: ParticipantCreate): Promise<Participant> => {
    const response = await apiClient.post<Participant>('/api/v1/participants', data);
    return response.data;
  },

  updateParticipant: async (id: string, data: ParticipantUpdate): Promise<Participant> => {
    const response = await apiClient.put<Participant>(`/api/v1/participants/${id}`, data);
    return response.data;
  },

  deleteParticipant: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/participants/${id}`);
  },
};
