import React from 'react';
import { useDashboardPage } from '../hooks/useDashboardPage';
import { ParticipantDetailsModal } from '../../../components/ParticipantDetailsModal';

export const DashboardPage: React.FC = () => {
  const {
    filteredParticipants,
    totalItems,
    isLoading,
    error,
    selectedParticipantId,
    setSelectedParticipantId,
    handleExportData,
    refetch,
  } = useDashboardPage();

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
    <div className="space-y-xl">
      
      {/* Header row */}
      <div className="flex justify-between items-end">
        <div>
          <p className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-xs">Performance Metrics</p>
          <h3 className="font-display-lg text-display-lg text-on-surface">Phase III Global Dashboard</h3>
        </div>
        <div className="flex gap-md">
          <div className="bg-surface-container-lowest shadow-sm rounded-lg px-md py-2 flex items-center gap-sm border border-outline-variant/30 text-xs text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
            <span>Last 30 Days</span>
          </div>
          <button 
            onClick={handleExportData}
            className="bg-primary hover:brightness-110 text-on-primary font-label-sm text-label-sm px-lg py-2.5 rounded-lg shadow-md transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>EXPORT DATA</span>
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
            onClick={refetch}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded border border-red-300 font-semibold"
          >
            Retry Query
          </button>
        </div>
      )}

      {/* Main grids details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        
        {/* Recent Enrollments Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center">
              <h5 className="font-headline-md text-headline-md font-bold text-on-surface">Recent Participant Status</h5>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-[10px] text-on-surface-variant font-bold uppercase tracking-wider border-b border-outline-variant/20">
                  <tr>
                    <th className="px-lg py-3">Subject ID</th>
                    <th className="px-lg py-3">Date</th>
                    <th className="px-lg py-3">Group</th>
                    <th className="px-lg py-3">Age / Gender</th>
                    <th className="px-lg py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-on-surface-variant">Querying database...</td>
                    </tr>
                  ) : filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-on-surface-variant">No participants registered yet.</td>
                    </tr>
                  ) : (
                    filteredParticipants.slice(0, 3).map((p) => (
                      <tr key={p.participant_id} className="hover:bg-surface-variant/10 transition-colors">
                        <td className="px-lg py-4 font-data-mono font-bold">
                          <button 
                            onClick={() => setSelectedParticipantId(p.participant_id)}
                            className="text-primary hover:text-primary-container font-bold hover:underline transition-all text-left"
                            title="View participant details"
                          >
                            {p.subject_id}
                          </button>
                        </td>
                        <td className="px-lg py-4 text-on-surface-variant">{formatDateString(p.enrollment_date)}</td>
                        <td className="px-lg py-4 text-on-surface-variant capitalize">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.study_group === 'treatment' 
                              ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {p.study_group}
                          </span>
                        </td>
                        <td className="px-lg py-4 font-semibold text-on-surface-variant">{p.age} yrs • {p.gender}</td>
                        <td className="px-lg py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            p.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                              : p.status === 'completed'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-4 border-t border-outline-variant/20 bg-slate-50/50 text-center text-xs text-on-surface-variant/80">
            {isLoading ? '...' : totalItems} Total Subjects
          </div>
        </div>

        {/* Bento Card Side Info */}
        <div className="flex flex-col gap-lg">
          {/* Study Health */}
          <div className="bg-primary p-lg rounded-xl shadow-lg text-on-primary flex flex-col justify-between h-48">
            <div>
              <h5 className="font-headline-md text-headline-md font-bold mb-xs">Study Health</h5>
              <p className="font-body-md text-xs opacity-80 leading-normal">
                Protocols are performing 14% above baseline regulatory and safety thresholds.
              </p>
            </div>
            
            <div className="flex justify-between items-center bg-white/10 p-md rounded-lg mt-3 text-center">
              <div className="flex-1">
                <p className="text-[9px] uppercase font-bold tracking-widest opacity-70">Efficiency</p>
                <p className="text-lg font-bold">92.4%</p>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="flex-1">
                <p className="text-[9px] uppercase font-bold tracking-widest opacity-70">Regulatory</p>
                <p className="text-lg font-bold">CLEAR</p>
              </div>
            </div>
          </div>

          {/* Countries */}
          <div className="bg-surface-container-highest p-lg rounded-xl border border-outline-variant/10 flex-1 flex flex-col justify-between min-h-48 relative overflow-hidden group">
            <div className="relative z-10">
              <h5 className="font-headline-md text-headline-md font-bold text-on-surface mb-xs">Global Impact</h5>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                Active clinical collection centers deployed across 12 countries.
              </p>
              <div className="mt-4 flex gap-2">
                <div className="h-10 w-10 rounded bg-white shadow-sm flex items-center justify-center font-bold text-xs border border-outline-variant/20">US</div>
                <div className="h-10 w-10 rounded bg-white shadow-sm flex items-center justify-center font-bold text-xs border border-outline-variant/20">EU</div>
                <div className="h-10 w-10 rounded bg-white shadow-sm flex items-center justify-center font-bold text-xs border border-outline-variant/20">JP</div>
                <div className="h-10 w-10 rounded bg-white shadow-sm flex items-center justify-center font-bold text-xs border border-outline-variant/20 text-slate-500">+9</div>
              </div>
            </div>

            {/* Decorative World Icon */}
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <span className="material-symbols-outlined text-[140px]" style={{ fontVariationSettings: "'FILL' 0" }}>public</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-outline-variant/20 text-xs text-on-surface-variant opacity-60">
        System Last Updated: October 25, 2023 14:32 UTC | Data synchronization with central lab is active.
      </footer>

      {/* Participant Details Modal */}
      <ParticipantDetailsModal 
        participantId={selectedParticipantId}
        onClose={() => setSelectedParticipantId(null)}
      />

    </div>
  );
};
