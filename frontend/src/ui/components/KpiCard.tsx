import React from 'react';

interface KpiCardProps {
  title: string;
  iconName: string;
  iconColorClass?: string;
  isLoading?: boolean;
  value?: React.ReactNode;
  children?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  iconName,
  iconColorClass = 'text-primary',
  isLoading = false,
  value,
  children,
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 p-lg flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className={`material-symbols-outlined ${iconColorClass} text-[20px]`}>
          {iconName}
        </span>
        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
          {title}
        </p>
      </div>

      {value !== undefined && (
        <p className="text-2xl font-bold text-on-surface">
          {isLoading ? '—' : value}
        </p>
      )}

      {children && (
        <div className="mt-auto">
          {children}
        </div>
      )}
    </div>
  );
};
