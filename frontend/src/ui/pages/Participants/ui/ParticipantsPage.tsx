import React, { useMemo } from 'react';
import { useParticipantsPage } from '../hooks/useParticipantsPage';
import { Participant, ParticipantStatus, StudyGroup } from '../../../../types';
import {
  ParticipantDetailsModal,
  GenericTable,
  Column,
  Tag,
  Alert,
  Select,
  Pagination,
} from '../../../components';

export const ParticipantsPage: React.FC = () => {
  const {
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
    onRetry,
  } = useParticipantsPage();
  const formatDateString = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const year = parts[0];
        const month = months[parseInt(parts[1]) - 1] || 'Oct';
        const day = parts[2];
        return `${month} ${day}, ${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const columns = useMemo<Column<Participant>[]>(() => [
    {
      key: "subjectId",
      header: "Subject ID",
      render: (p) => (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            p.status === 'active' ? 'bg-primary' : p.status === 'completed' ? 'bg-outline' : 'bg-error'
          }`} />
          <span className="font-data-mono font-bold text-on-surface">{p.subjectId}</span>
        </div>
      ),
    },
    {
      key: "studyGroup",
      header: "Study Group",
      render: (p) => (
        <Tag color={p.studyGroup === 'treatment' ? 'blue' : 'slate'}>
          {p.studyGroup}
        </Tag>
      ),
    },
    {
      key: "enrollmentDate",
      header: "Enrollment Date",
      cellClassName: "text-on-surface-variant font-medium",
      render: (p) => formatDateString(p.enrollmentDate),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Tag
          color={
            p.status === 'active' 
              ? 'green' 
              : p.status === 'completed'
              ? 'purple'
              : 'red'
          }
        >
          {p.status}
        </Tag>
      ),
    },
    {
      key: "age",
      header: "Age",
      cellClassName: "text-on-surface-variant font-semibold",
    },
    {
      key: "gender",
      header: "Gender",
      cellClassName: "text-on-surface-variant font-medium",
      render: (p) => {
        if (p.gender === 'F') return 'Female';
        if (p.gender === 'M') return 'Male';
        return 'Other';
      },
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <button 
            onClick={() => setSelectedParticipantId(p.participantId)}
            className="text-slate-400 hover:text-primary p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            title="View participant details"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </button>
          <button 
            onClick={() => onDeleteParticipant(p.participantId)}
            className="text-slate-400 hover:text-red-500 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            title="Delete subject"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      ),
    },
  ], [setSelectedParticipantId, onDeleteParticipant]);

  return (
    <div className="space-y-lg">
      
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-2">
        <div className="flex items-center gap-sm">
          <div className="bg-surface-container-highest px-4 py-2 rounded-lg flex items-center gap-2 border border-outline-variant/10">
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Total Subjects</span>
            <span className="font-headline-md text-lg font-bold text-primary">{isLoading ? '...' : totalItems}</span>
          </div>
          <div className="bg-surface-container-highest px-4 py-2 rounded-lg flex items-center gap-2 border border-outline-variant/10">
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Active</span>
            <span className="font-headline-md text-lg font-bold text-tertiary">
              {isLoading ? '...' : activeCount}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status filter dropdown */}
          <Select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as ParticipantStatus | 'all');
              setCurrentPageIndex(1);
            }}
            className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-xs font-semibold text-on-surface hover:bg-slate-50 transition-colors focus:ring-1 focus:ring-primary focus:outline-none"
            options={[
              { value: "all", label: "Filter Status" },
              { value: "active", label: "Active" },
              { value: "completed", label: "Completed" },
              { value: "withdrawn", label: "Withdrawn" },
            ]}
          />

          {/* Group filter dropdown */}
          <Select
            value={groupFilter}
            onChange={e => {
              setGroupFilter(e.target.value as StudyGroup | 'all');
              setCurrentPageIndex(1);
            }}
            className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-xs font-semibold text-on-surface hover:bg-slate-50 transition-colors focus:ring-1 focus:ring-primary focus:outline-none"
            options={[
              { value: "all", label: "Filter Group" },
              { value: "treatment", label: "Treatment" },
              { value: "control", label: "Control" },
            ]}
          />

          {/* Register New Subject Button */}
          <button 
            onClick={onRegisterNew}
            className="bg-primary hover:brightness-115 text-on-primary text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Participant</span>
          </button>

        </div>
      </div>

      {error && (
        <Alert
          message={error.message || 'Failed to query trial participants.'}
          onRetry={onRetry}
        />
      )}

      {/* Main table container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <GenericTable
              data={filteredParticipants}
              columns={columns}
              isLoading={isLoading}
              loadingMessage="Querying database engine..."
              emptyMessage={
                <div className="text-center py-4 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">help_outline</span>
                  <p className="font-semibold text-base mt-1 text-slate-700">No matches found</p>
                  <p className="text-xs text-slate-500 mt-0.5">Try resetting the filter criteria or register a new subject</p>
                </div>
              }
              keyExtractor={(p) => p.participantId}
            />

        <Pagination
          currentPageIndex={currentPageIndex}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPageIndex}
        />

      </div>

      {/* Participant Details Modal */}
      <ParticipantDetailsModal 
        participantId={selectedParticipantId}
        onClose={() => setSelectedParticipantId(null)}
      />

    </div>
  );
};
