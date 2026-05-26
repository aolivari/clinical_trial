import React from 'react';

export type TagColor = 'blue' | 'slate' | 'emerald' | 'green' | 'purple' | 'red';
export type TagVariant = 'rounded' | 'pill';

interface TagProps {
  color: TagColor;
  variant?: TagVariant;
  className?: string;
  children: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({
  color,
  variant = 'rounded',
  className = '',
  children,
}) => {
  const baseClasses = 'inline-flex items-center px-2 py-0.5 font-bold uppercase tracking-wider border';
  
  const variantClasses = {
    rounded: 'rounded text-[10px]',
    pill: 'rounded-full text-[9px]',
  }[variant];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    green: 'bg-green-50 text-green-800 border-green-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    red: 'bg-red-50 text-red-800 border-red-200',
  }[color] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`${baseClasses} ${variantClasses} ${colorClasses} ${className}`}>
      {children}
    </span>
  );
};
