import React from 'react';

interface LoginViewProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loginError: string | null;
  isAuthenticating: boolean;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  loginError,
  isAuthenticating,
  showPassword,
  setShowPassword,
  onSubmit,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-gutter relative overflow-hidden bg-background text-on-surface">
      {/* Background Atmospheric Elements */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-fixed blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-secondary-fixed blur-[100px]"></div>
      </div>

      {/* Main Login Card Container */}
      <main className="w-full max-w-[440px] z-10">
        {/* Logo Branding */}
        <div className="text-center mb-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary text-on-primary mb-md shadow-lg">
            <span className="material-symbols-outlined !text-[32px]">biotech</span>
          </div>
          <h1 className="font-headline-md text-3xl font-bold text-primary tracking-tight">ClinTrack Pro</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">Clinical Trials Management Portal</p>
        </div>

        {/* Form */}
        <div className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-lg shadow-black/5">
          <form className="space-y-lg" onSubmit={onSubmit}>
            {loginError && (
              <div className="bg-error-container text-on-error-container text-xs p-3 rounded-lg border border-error/20 flex gap-2">
                <span className="material-symbols-outlined text-[16px] text-error">error</span>
                <span>{loginError}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="font-label-sm text-label-sm text-on-surface-variant block px-xs" htmlFor="email">Work Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined !text-[20px]">mail</span>
                </div>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-3 pl-11 pr-md font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface"
                  id="email" 
                  type="email"
                  required
                  placeholder="researcher@clintrack.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center px-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="password">Security Password</label>
                <a className="font-label-sm text-label-sm text-primary hover:underline transition-all" href="#" onClick={e => e.preventDefault()}>Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined !text-[20px]">lock</span>
                </div>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-3 pl-11 pr-md font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface"
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button 
                  className="absolute inset-y-0 right-0 pr-md flex items-center text-outline hover:text-on-surface-variant transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined !text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Stay Signed In */}
            <div className="flex items-center gap-2 px-xs">
              <input 
                className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low" 
                id="remember" 
                type="checkbox"
                defaultChecked
              />
              <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer" htmlFor="remember">Stay authenticated for 12 hours</label>
            </div>

            {/* Submit */}
            <button 
              className="w-full bg-primary hover:bg-primary-container text-on-primary font-headline-md text-headline-md py-3.5 rounded-lg shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-lg" 
              id="signInBtn" 
              type="submit"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined !text-[20px]">login</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-xl pt-lg border-t border-outline-variant flex items-center justify-center gap-2">
            <span className="material-symbols-outlined !text-[16px] text-outline">verified_user</span>
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">HiPAA Compliant Environment</span>
          </div>
        </div>

        <div className="mt-lg flex justify-center gap-lg text-on-surface-variant font-body-md">
          <a className="hover:text-primary transition-colors" href="#" onClick={e => e.preventDefault()}>Technical Support</a>
          <span className="text-outline-variant">•</span>
          <a className="hover:text-primary transition-colors" href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
        </div>
      </main>
    </div>
  );
};
