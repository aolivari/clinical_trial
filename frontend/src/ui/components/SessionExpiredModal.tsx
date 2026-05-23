import React, { useState } from 'react';

interface SessionExpiredModalProps {
  email?: string;
  onRelogin: (password: string) => Promise<void>;
  onCancel: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ email, onRelogin, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onRelogin(password);
    } catch (err) {
      setError('Contraseña incorrecta. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-md w-full p-xl border border-outline-variant/30">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-error text-3xl">lock_clock</span>
          </div>
        </div>
        <h2 className="font-display-md text-xl font-bold text-on-surface text-center mb-2">
          Your session has expired
        </h2>
        <p className="text-sm text-on-surface-variant text-center mb-8">
          Please enter your password for <strong>{email}</strong> to resume your session securely without losing your progress.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-800 text-xs p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-on-surface bg-surface-variant/30 hover:bg-surface-variant/50 transition-colors"
            >
              Sign out
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold text-on-primary bg-primary hover:brightness-110 shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                  Verifying...
                </>
              ) : (
                'Resume Session'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
