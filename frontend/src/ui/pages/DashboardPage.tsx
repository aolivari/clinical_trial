import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useParticipantsQuery } from '../../hooks/useParticipants';
import { DashboardView } from '../views/DashboardView';

export const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  // Query participants (fetch the first page to get recent status)
  const { data, isLoading, error, refetch } = useParticipantsQuery(0, 10);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const handleExportData = () => {
    alert('Mock CSV Export Completed');
  };

  const participants = data?.items || [];
  const totalItems = data?.total || 0;

  // Filter participants based on search query parameter (client-side)
  const filteredParticipants = participants.filter(p => {
    return p.subject_id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <DashboardView
      filteredParticipants={filteredParticipants}
      totalItems={totalItems}
      isLoading={isLoading}
      error={error}
      searchTerm={searchTerm}
      selectedParticipantId={selectedParticipantId}
      setSelectedParticipantId={setSelectedParticipantId}
      onExportData={handleExportData}
      onRetry={refetch}
    />
  );
};
