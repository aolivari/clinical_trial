import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useParticipantsQuery } from '../../../../hooks/useParticipants';
import { useMetricsQuery } from '../../../../hooks/useMetrics';

export const useDashboardPage = () => {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  // Query participants (fetch the first page to get recent status)
  const { data, isLoading, error, refetch } = useParticipantsQuery(0, 10);
  const { data: metrics, isLoading: metricsLoading } = useMetricsQuery();
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

  return {
    filteredParticipants,
    totalItems,
    isLoading,
    metricsLoading,
    error,
    metrics,
    searchTerm,
    selectedParticipantId,
    setSelectedParticipantId,
    handleExportData,
    refetch,
  };
};
