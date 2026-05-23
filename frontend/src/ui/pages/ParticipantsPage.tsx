import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useParticipantsQuery, useDeleteParticipantMutation } from '../../hooks/useParticipants';
import { ParticipantsView } from '../views/ParticipantsView';

export const ParticipantsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  const PAGE_SIZE = 10;
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const skip = (currentPageIndex - 1) * PAGE_SIZE;

  // Use TanStack Query
  const { data, isLoading, error, refetch } = useParticipantsQuery(skip, PAGE_SIZE);
  const deleteMutation = useDeleteParticipantMutation();

  const participants = data?.items || [];
  const totalItems = data?.total || 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;

  const handleDeleteParticipant = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this participant?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err.message || 'Delete operation failed.');
    }
  };

  // Client-side search and status/group filter (matching the original code logic)
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.subject_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = groupFilter === 'all' || p.study_group === groupFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  const activeCount = participants.filter(p => p.status === 'active').length;

  return (
    <ParticipantsView
      filteredParticipants={filteredParticipants}
      totalItems={totalItems}
      isLoading={isLoading}
      error={error}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      groupFilter={groupFilter}
      setGroupFilter={setGroupFilter}
      currentPageIndex={currentPageIndex}
      setCurrentPageIndex={setCurrentPageIndex}
      totalPages={totalPages}
      activeCount={activeCount}
      selectedParticipantId={selectedParticipantId}
      setSelectedParticipantId={setSelectedParticipantId}
      onDeleteParticipant={handleDeleteParticipant}
      onRegisterNew={() => navigate('/add-subject')}
      onRetry={refetch}
    />
  );
};
