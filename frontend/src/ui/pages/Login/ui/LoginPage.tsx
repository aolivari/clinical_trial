import React from 'react';
import { Navigate } from 'react-router-dom';
import { useLoginPage } from '../hooks/useLoginPage';

export const LoginPage: React.FC = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    isAuthenticated,
    handleLogin,
  } = useLoginPage();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-primary rounded-2xl shadow-sm flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform">
            <span className="material-symbols-outlined text-on-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              biotech
            </span>
          </div>
        </div>
        <h2 className="mt-6 text-center font-display-lg text-display-lg font-bold text-on-surface">
          Stitch Clinical Trials
        </h2>
        <p className="mt-2 text-center text-sm text-on-surface-variant font-medium">
          Investigator Portal Access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-container-lowest py-8 px-4 shadow-md sm:rounded-2xl sm:px-10 border border-outline-variant/30">
          
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-l-4 border-error p-4 rounded-md flex items-start gap-3">
                <span className="material-symbols-outlined text-error text-xl">error</span>
                <p className="text-sm text-error-container-text font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2">
                Investigator Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-xl">mail</span>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-surface-container-lowest text-on-surface transition-shadow"
                  placeholder="dr.smith@hospital.org"
                />
              </div>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-xl">lock</span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm bg-surface-container-lowest text-on-surface transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-on-surface-variant">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-semibold text-primary hover:text-primary-container">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-on-primary bg-primary hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'wght' 300" }}>refresh</span>
                    Authenticating...
                  </span>
                ) : (
                  'Sign in securely'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-container-lowest text-outline text-xs uppercase tracking-wider font-bold">
                  Secure SSO
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button className="w-full inline-flex justify-center items-center gap-3 py-2.5 px-4 border border-outline-variant/60 rounded-xl shadow-sm bg-surface-container-lowest text-sm font-medium text-on-surface hover:bg-surface-variant/30 transition-colors">
                <img className="h-5 w-5" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
                <span>Continue with Google Workspace</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
