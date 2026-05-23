import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { participantService } from '../services/participant.service';
import { ParticipantCreate, ParticipantUpdate } from '../types';

export const useParticipantsQuery = (skip = 0, limit = 50) => {
  return useQuery({
    queryKey: ['participants', skip, limit],
    queryFn: () => participantService.getParticipants(skip, limit),
  });
};

export const useParticipantQuery = (id: string | null) => {
  return useQuery({
    queryKey: ['participant', id],
    queryFn: () => participantService.getParticipantById(id!),
    enabled: !!id,
  });
};

export const useCreateParticipantMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ParticipantCreate) => participantService.createParticipant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
  });
};

export const useUpdateParticipantMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ParticipantUpdate }) =>
      participantService.updateParticipant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      queryClient.invalidateQueries({ queryKey: ['participant', variables.id] });
    },
  });
};

export const useDeleteParticipantMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => participantService.deleteParticipant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
  });
};
