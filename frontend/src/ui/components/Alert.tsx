import React from "react";

interface AlertProps {
  message: string;
  title?: string;
  type?: "error" | "warning" | "success" | "info";
  onRetry?: () => void;
  retryText?: string;
}

export const Alert: React.FC<AlertProps> = ({
  message,
  title,
  type = "error",
  onRetry,
  retryText = "Retry Query",
}) => {
  const config = {
    error: {
      bg: "bg-red-50 border-red-200 text-red-800",
      btnBg: "bg-red-100 hover:bg-red-200 border-red-300",
      icon: "warning",
      iconColor: "text-red-500",
    },
    warning: {
      bg: "bg-amber-50 border-amber-200 text-amber-800",
      btnBg: "bg-amber-100 hover:bg-amber-200 border-amber-300",
      icon: "warning",
      iconColor: "text-amber-500",
    },
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
      btnBg: "bg-emerald-100 hover:bg-emerald-200 border-emerald-300",
      icon: "check_circle",
      iconColor: "text-emerald-500",
    },
    info: {
      bg: "bg-blue-50 border-blue-200 text-blue-800",
      btnBg: "bg-blue-100 hover:bg-blue-200 border-blue-300",
      icon: "info",
      iconColor: "text-blue-500",
    },
  }[type];

  return (
    <div
      className={`border text-xs p-4 rounded-xl flex items-center justify-between gap-4 transition-all ${config.bg}`}
      data-testid="alert-container"
    >
      <div className="flex gap-2.5 items-start">
        <span className={`material-symbols-outlined text-[20px] shrink-0 ${config.iconColor}`}>
          {config.icon}
        </span>
        <div>
          {title && <p className="font-bold mb-0.5">{title}</p>}
          <p className="leading-relaxed opacity-95">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className={`px-3 py-1.5 rounded border font-semibold whitespace-nowrap transition-colors select-none ${config.btnBg}`}
        >
          {retryText}
        </button>
      )}
    </div>
  );
};
