import React, { useMemo } from "react";
import { useDashboardPage } from "../hooks/useDashboardPage";
import { Participant } from "../../../../types";
import {
  ParticipantDetailsModal,
  KpiCard,
  GenericTable,
  Column,
  Tag,
  Alert,
} from "../../../components";

export const DashboardPage: React.FC = () => {
  const {
    filteredParticipants,
    totalItems,
    isLoading,
    metricsLoading,
    error,
    metrics,
    selectedParticipantId,
    setSelectedParticipantId,
    refetch,
  } = useDashboardPage();

  const formatDateString = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const year = parts[0];
        const month = months[parseInt(parts[1]) - 1] || "Oct";
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
      cellClassName: "font-data-mono font-bold",
      render: (p) => (
        <button
          onClick={() => setSelectedParticipantId(p.participantId)}
          className="text-primary hover:text-primary-container font-bold hover:underline transition-all text-left"
          title="View participant details"
        >
          {p.subjectId}
        </button>
      ),
    },
    {
      key: "enrollmentDate",
      header: "Date",
      cellClassName: "text-on-surface-variant",
      render: (p) => formatDateString(p.enrollmentDate),
    },
    {
      key: "studyGroup",
      header: "Group",
      cellClassName: "text-on-surface-variant capitalize",
      render: (p) => (
        <Tag color={p.studyGroup === "treatment" ? "blue" : "slate"}>
          {p.studyGroup}
        </Tag>
      ),
    },
    {
      key: "age_gender",
      header: "Age / Gender",
      cellClassName: "font-semibold text-on-surface-variant",
      render: (p) => `${p.age} yrs • ${p.gender}`,
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Tag
          variant="pill"
          color={
            p.status === "active"
              ? "emerald"
              : p.status === "completed"
                ? "purple"
                : "red"
          }
        >
          {p.status}
        </Tag>
      ),
    },
  ], [setSelectedParticipantId]);

  return (
    <div className="space-y-xl">
      {/* Header row */}
      <div className="flex justify-between items-end">
        <div>
          <p className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-xs">
            Performance Metrics
          </p>
          <h3 className="font-display-lg text-display-lg text-on-surface">
            Phase III Global Dashboard
          </h3>
        </div>
        <div className="flex gap-md">
          <div className="bg-surface-container-lowest shadow-sm rounded-lg px-md py-2 flex items-center gap-sm border border-outline-variant/30 text-xs text-on-surface-variant font-medium">
            <span className="material-symbols-outlined text-primary text-[18px]">
              calendar_today
            </span>
            <span>Last 30 Days</span>
          </div>
        </div>
      </div>

      {error && (
        <Alert
          message={error.message || "Failed to query trial participants."}
          onRetry={refetch}
        />
      )}

      {/* KPI Metric Cards — computed from live data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
        <KpiCard
          title="Total Enrolled"
          iconName="groups"
          iconColorClass="text-primary"
          isLoading={metricsLoading}
          value={metrics?.totalParticipants ?? 0}
        >
          <div className="flex gap-2 text-[10px]">
            <span className="text-emerald-700 font-semibold">
              {metrics?.activeCount ?? 0} active
            </span>
            <span className="text-on-surface-variant">•</span>
            <span className="text-purple-700 font-semibold">
              {metrics?.completedCount ?? 0} completed
            </span>
            <span className="text-on-surface-variant">•</span>
            <span className="text-red-700 font-semibold">
              {metrics?.withdrawnCount ?? 0} withdrawn
            </span>
          </div>
        </KpiCard>

        <KpiCard
          title="Retention Rate"
          iconName="shield"
          iconColorClass="text-emerald-600"
          isLoading={metricsLoading}
          value={`${metrics?.retentionRate ?? 0}%`}
        >
          <p className="text-[10px] text-on-surface-variant">
            Non-withdrawn participants
          </p>
        </KpiCard>

        <KpiCard
          title="Study Arms"
          iconName="science"
          iconColorClass="text-blue-600"
          isLoading={metricsLoading}
        >
          <div className="flex gap-3 items-baseline">
            <div>
              <p className="text-lg font-bold text-on-surface">
                {metricsLoading ? "—" : (metrics?.treatmentCount ?? 0)}
              </p>
              <p className="text-[9px] text-blue-700 font-semibold uppercase">
                Treatment
              </p>
            </div>
            <span className="text-outline text-sm">/</span>
            <div>
              <p className="text-lg font-bold text-on-surface">
                {metricsLoading ? "—" : (metrics?.controlCount ?? 0)}
              </p>
              <p className="text-[9px] text-slate-500 font-semibold uppercase">
                Control
              </p>
            </div>
          </div>
        </KpiCard>

        <KpiCard
          title="Demographics"
          iconName="monitoring"
          iconColorClass="text-tertiary"
          isLoading={metricsLoading}
          value={`${metrics?.avgAge ?? 0} yrs`}
        >
          <div className="flex gap-2 text-[10px]">
            <span className="text-blue-700 font-semibold">
              {metrics?.maleCount ?? 0}M
            </span>
            <span className="text-on-surface-variant">•</span>
            <span className="text-pink-700 font-semibold">
              {metrics?.femaleCount ?? 0}F
            </span>
            {(metrics?.otherGenderCount ?? 0) > 0 && (
              <>
                <span className="text-on-surface-variant">•</span>
                <span className="text-slate-600 font-semibold">
                  {metrics?.otherGenderCount}O
                </span>
              </>
            )}
          </div>
        </KpiCard>
      </div>

      {/* Main grids details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Recent Enrollments Table */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center">
              <h5 className="font-headline-md text-headline-md font-bold text-on-surface">
                Recent Participant Status
              </h5>
            </div>

            <GenericTable
              data={filteredParticipants.slice(0, 5)}
              columns={columns}
              isLoading={isLoading}
              loadingMessage="Querying database..."
              emptyMessage="No participants registered yet."
              keyExtractor={(p) => p.participantId}
            />
          </div>
          <div className="p-4 border-t border-outline-variant/20 bg-slate-50/50 text-center text-xs text-on-surface-variant/80">
            {isLoading ? "..." : totalItems} Total Subjects
          </div>
        </div>

        {/* Bento Card Side Info */}
        <div className="flex flex-col gap-lg">
          {/* Study Health */}
          <div className="bg-primary p-lg rounded-xl shadow-lg text-on-primary flex flex-col justify-between h-48">
            <div>
              <h5 className="font-headline-md text-headline-md font-bold mb-xs">
                Study Health
              </h5>
              <p className="font-body-md text-xs opacity-80 leading-normal">
                {metrics && metrics.retentionRate >= 80
                  ? `Retention is strong at ${metrics.retentionRate}%. Protocols are performing above baseline thresholds.`
                  : metrics
                    ? `Retention at ${metrics.retentionRate}% — monitoring closely for improvement opportunities.`
                    : "Loading study health indicators..."}
              </p>
            </div>

            <div className="flex justify-between items-center bg-white/10 p-md rounded-lg mt-3 text-center">
              <div className="flex-1">
                <p className="text-[9px] uppercase font-bold tracking-widest opacity-70">
                  Retention
                </p>
                <p className="text-lg font-bold">
                  {metricsLoading ? "—" : `${metrics?.retentionRate ?? 0}%`}
                </p>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="flex-1">
                <p className="text-[9px] uppercase font-bold tracking-widest opacity-70">
                  Completion
                </p>
                <p className="text-lg font-bold">
                  {metricsLoading ? "—" : `${metrics?.completionRate ?? 0}%`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-outline-variant/20 text-xs text-on-surface-variant opacity-60">
        System Last Updated: October 25, 2023 14:32 UTC | Data synchronization
        with central lab is active.
      </footer>

      {/* Participant Details Modal */}
      <ParticipantDetailsModal
        participantId={selectedParticipantId}
        onClose={() => setSelectedParticipantId(null)}
      />
    </div>
  );
};
