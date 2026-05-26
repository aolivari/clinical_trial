import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParticipantsQuery, useDeleteParticipantMutation } from '../../../../hooks/useParticipants';
import { Participant, ParticipantStatus, StudyGroup } from '../../../../types';

export interface UseParticipantsPageResult {
  filteredParticipants: Participant[];
  totalItems: number;
  isLoading: boolean;
  error: Error | null;
  statusFilter: ParticipantStatus | 'all';
  setStatusFilter: React.Dispatch<React.SetStateAction<ParticipantStatus | 'all'>>;
  groupFilter: StudyGroup | 'all';
  setGroupFilter: React.Dispatch<React.SetStateAction<StudyGroup | 'all'>>;
  currentPageIndex: number;
  setCurrentPageIndex: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  activeCount: number;
  selectedParticipantId: string | null;
  setSelectedParticipantId: React.Dispatch<React.SetStateAction<string | null>>;
  onDeleteParticipant: (id: string) => Promise<void>;
  onRegisterNew: () => void;
  onRetry: () => void;
}

export const useParticipantsPage = (): UseParticipantsPageResult => {
  const [statusFilter, setStatusFilter] = useState<ParticipantStatus | 'all'>('all');
  const [groupFilter, setGroupFilter] = useState<StudyGroup | 'all'>('all');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
  const PAGE_SIZE = 10;

  const navigate = useNavigate();
  const skip = (currentPageIndex - 1) * PAGE_SIZE;
  const { data, isLoading, error, refetch } = useParticipantsQuery(skip, PAGE_SIZE);
  const deleteMutation = useDeleteParticipantMutation();

  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const participants: Participant[] = data?.items || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;

  const filteredParticipants = participants.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (groupFilter !== 'all' && p.studyGroup !== groupFilter) return false;
    return true;
  });

  const activeCount = participants.filter(p => p.status === 'active').length;

  const onDeleteParticipant = async (id: string): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this participant?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        window.alert("Failed to delete participant.");
      }
    }
  };

  const onRegisterNew = (): void => {
    navigate('/add-subject');
  };

  return {
    filteredParticipants,
    totalItems,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    groupFilter,
    setGroupFilter,
    currentPageIndex,
    setCurrentPageIndex,
    totalPages,
    activeCount,
    selectedParticipantId,
    setSelectedParticipantId,
    onDeleteParticipant,
    onRegisterNew,
    onRetry: () => {
      refetch();
    },
  };
};
