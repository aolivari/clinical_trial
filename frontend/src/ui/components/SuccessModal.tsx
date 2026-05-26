import React from "react";

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  actionText: string;
  onAction: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  title,
  description,
  actionText,
  onAction,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
      data-testid="success-modal-overlay"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-xl text-center transform scale-100 transition-transform duration-300 border border-outline-variant/30">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-lg text-primary">
          <span
            className="material-symbols-outlined text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
        </div>

        <h2 className="font-display-lg text-lg font-bold text-on-surface mb-2">
          {title}
        </h2>
        <div className="font-body-md text-xs text-on-surface-variant mb-6 leading-relaxed">
          {description}
        </div>

        <button
          className="w-full bg-primary hover:bg-primary-container text-on-primary py-2.5 rounded-lg font-semibold text-xs shadow-md transition-colors"
          onClick={onAction}
        >
          {actionText}
        </button>
      </div>
    </div>
  );
};
