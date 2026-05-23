import React from 'react';
import { Participant } from '../../types';
import { ParticipantDetailsModal } from '../components/ParticipantDetailsModal';

interface ParticipantsViewProps {
  filteredParticipants: Participant[];
  totalItems: number;
  isLoading: boolean;
  error: Error | null;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  groupFilter: string;
  setGroupFilter: (val: string) => void;
  currentPageIndex: number;
  setCurrentPageIndex: (val: number) => void;
  totalPages: number;
  activeCount: number;
  selectedParticipantId: string | null;
  setSelectedParticipantId: (id: string | null) => void;
  onDeleteParticipant: (id: string) => void;
  onRegisterNew: () => void;
  onRetry: () => void;
}

export const ParticipantsView: React.FC<ParticipantsViewProps> = ({
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
}) => {
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
          <select 
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPageIndex(1);
            }}
            className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-xs font-semibold text-on-surface hover:bg-slate-50 transition-colors focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="all">Filter Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="withdrawn">Withdrawn</option>
          </select>

          {/* Group filter dropdown */}
          <select 
            value={groupFilter}
            onChange={e => {
              setGroupFilter(e.target.value);
              setCurrentPageIndex(1);
            }}
            className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-xs font-semibold text-on-surface hover:bg-slate-50 transition-colors focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="all">Filter Group</option>
            <option value="treatment">Treatment</option>
            <option value="control">Control</option>
          </select>

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
        <div className="bg-red-50 text-red-800 text-xs p-4 rounded-xl border border-red-200/60 flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            <span>{error.message || 'Failed to query trial participants.'}</span>
          </div>
          <button 
            onClick={onRetry}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded border border-red-300 font-semibold"
          >
            Retry Query
          </button>
        </div>
      )}

      {/* Main table container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/50 text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                <th className="px-lg py-4">Subject ID</th>
                <th className="px-lg py-4">Study Group</th>
                <th className="px-lg py-4">Enrollment Date</th>
                <th className="px-lg py-4">Status</th>
                <th className="px-lg py-4">Age</th>
                <th className="px-lg py-4">Gender</th>
                <th className="px-lg py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-on-surface-variant font-medium">Querying database engine...</td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">help_outline</span>
                    <p className="font-semibold text-base mt-1 text-slate-700">No matches found</p>
                    <p className="text-xs text-slate-500 mt-0.5">Try resetting the filter criteria or register a new subject</p>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => (
                  <tr key={p.participant_id} className="hover:bg-surface-container-low transition-colors group">
                    
                    {/* Subject ID */}
                    <td className="px-lg py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          p.status === 'active' ? 'bg-primary' : p.status === 'completed' ? 'bg-outline' : 'bg-error'
                        }`} />
                        <span className="font-data-mono font-bold text-on-surface">{p.subject_id}</span>
                      </div>
                    </td>

                    {/* Study Group */}
                    <td className="px-lg py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.study_group === 'treatment' 
                          ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {p.study_group}
                      </span>
                    </td>

                    {/* Enrollment date */}
                    <td className="px-lg py-4 text-on-surface-variant font-medium">
                      {formatDateString(p.enrollment_date)}
                    </td>

                    {/* Status */}
                    <td className="px-lg py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === 'active' 
                          ? 'bg-green-50 text-green-800 border border-green-200' 
                          : p.status === 'completed'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    {/* Age */}
                    <td className="px-lg py-4 text-on-surface-variant font-semibold">
                      {p.age}
                    </td>

                    {/* Gender */}
                    <td className="px-lg py-4 text-on-surface-variant font-medium">
                      {p.gender === 'F' && 'Female'}
                      {p.gender === 'M' && 'Male'}
                      {p.gender === 'Other' && 'Other'}
                    </td>

                    {/* Actions */}
                    <td className="px-lg py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setSelectedParticipantId(p.participant_id)}
                          className="text-slate-400 hover:text-primary p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                          title="View participant details"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button 
                          onClick={() => onDeleteParticipant(p.participant_id)}
                          className="text-slate-400 hover:text-red-500 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                          title="Delete subject"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-lg py-4 flex items-center justify-between bg-surface-container-low border-t border-outline-variant/30 text-xs">
          <span className="font-body-md text-on-surface-variant">
            Page {currentPageIndex} of {totalPages} — {totalItems} total entries
          </span>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => {
                const prev = Math.max(currentPageIndex - 1, 1);
                setCurrentPageIndex(prev);
              }}
              disabled={currentPageIndex === 1}
              className="p-1.5 rounded hover:bg-surface-variant text-outline disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentPageIndex(i + 1);
                }}
                className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                  currentPageIndex === i + 1
                    ? 'bg-primary text-on-primary'
                    : 'hover:bg-surface-variant text-on-surface'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              onClick={() => {
                const next = Math.min(currentPageIndex + 1, totalPages);
                setCurrentPageIndex(next);
              }}
              disabled={currentPageIndex === totalPages}
              className="p-1.5 rounded hover:bg-surface-variant text-outline disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>

      </div>

      {/* Contextual Insights Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mt-8">
        
        <div className="bg-white/80 backdrop-blur-md p-lg rounded-xl flex flex-col gap-sm shadow-sm border border-outline-variant/20 border-l-4 border-l-primary">
          <span className="font-label-sm text-[10px] text-primary uppercase font-bold tracking-wider">Enrollment Trend</span>
          <div className="h-14 w-full flex items-end gap-1.5 mt-2">
            <div className="bg-primary/20 w-full h-[30%] rounded-t-sm"></div>
            <div className="bg-primary/30 w-full h-[50%] rounded-t-sm"></div>
            <div className="bg-primary/40 w-full h-[40%] rounded-t-sm"></div>
            <div className="bg-primary/60 w-full h-[70%] rounded-t-sm"></div>
            <div className="bg-primary/80 w-full h-[60%] rounded-t-sm"></div>
            <div className="bg-primary w-full h-[90%] rounded-t-sm"></div>
          </div>
          <p className="font-body-md text-xs text-on-surface-variant mt-2 font-medium">12% increase since last month.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-lg rounded-xl flex flex-col gap-sm shadow-sm border border-outline-variant/20 border-l-4 border-l-tertiary justify-between">
          <span className="font-label-sm text-[10px] text-tertiary uppercase font-bold tracking-wider">Diversity Index</span>
          <div className="flex items-center gap-lg mt-2">
            <div className="relative w-12 h-12 rounded-full border-4 border-tertiary-container/30 flex items-center justify-center">
              <span className="font-headline-md text-sm text-tertiary font-bold">0.8</span>
            </div>
            <p className="font-body-md text-xs text-on-surface-variant font-medium leading-relaxed">Meeting demographic targets for Phase III trial representation.</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-lg rounded-xl flex flex-col gap-sm shadow-sm border border-outline-variant/20 border-l-4 border-l-slate-600">
          <span className="font-label-sm text-[10px] text-slate-600 uppercase font-bold tracking-wider">Retention Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-display-lg text-2xl font-bold text-on-surface">94.2%</span>
            <span className="material-symbols-outlined text-green-600 text-sm">trending_up</span>
          </div>
          <p className="font-body-md text-xs text-on-surface-variant mt-2 font-medium">Protocol Benchmark limit: 88%</p>
        </div>

      </div>

      {/* Participant Details Modal */}
      <ParticipantDetailsModal 
        participantId={selectedParticipantId}
        onClose={() => setSelectedParticipantId(null)}
      />

    </div>
  );
};
