import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParticipantsQuery, useDeleteParticipantMutation } from '../../../../hooks/useParticipants';

export const useParticipantsPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const PAGE_SIZE = 10;

  const navigate = useNavigate();
  const skip = (currentPageIndex - 1) * PAGE_SIZE;
  const { data, isLoading, error, refetch } = useParticipantsQuery(skip, PAGE_SIZE);
  const deleteMutation = useDeleteParticipantMutation();

  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const participants = data?.items || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;

  const filteredParticipants = participants.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (groupFilter !== 'all' && p.study_group !== groupFilter) return false;
    return true;
  });

  const activeCount = participants.filter(p => p.status === 'active').length;

  const onDeleteParticipant = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this participant?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        window.alert("Failed to delete participant.");
      }
    }
  };

  const onRegisterNew = () => {
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
    onRetry: () => refetch(),
  };
};
