import { apiClient } from '../api/client';
import {
  ParticipantDTO,
  PaginatedResponseDTO,
  Participant,
  ParticipantCreate,
  ParticipantUpdate,
  PaginatedResponse,
} from '../types';
import {
  toParticipantModel,
  toParticipantCreateDTO,
  toParticipantUpdateDTO,
} from '../types/mappers';

export const participantService = {
  getParticipants: async (skip = 0, limit = 50): Promise<PaginatedResponse<Participant>> => {
    const response = await apiClient.get<PaginatedResponseDTO<ParticipantDTO>>(
      `/api/v1/participants?skip=${skip}&limit=${limit}`
    );
    return {
      total: response.data.total,
      skip: response.data.skip,
      limit: response.data.limit,
      items: response.data.items.map(toParticipantModel),
    };
  },

  getParticipantById: async (id: string): Promise<Participant> => {
    const response = await apiClient.get<ParticipantDTO>(`/api/v1/participants/${id}`);
    return toParticipantModel(response.data);
  },

  createParticipant: async (data: ParticipantCreate): Promise<Participant> => {
    const dtoData = toParticipantCreateDTO(data);
    const response = await apiClient.post<ParticipantDTO>('/api/v1/participants', dtoData);
    return toParticipantModel(response.data);
  },

  updateParticipant: async (id: string, data: ParticipantUpdate): Promise<Participant> => {
    const dtoData = toParticipantUpdateDTO(data);
    const response = await apiClient.patch<ParticipantDTO>(`/api/v1/participants/${id}`, dtoData);
    return toParticipantModel(response.data);
  },

  deleteParticipant: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/participants/${id}`);
  },
};
