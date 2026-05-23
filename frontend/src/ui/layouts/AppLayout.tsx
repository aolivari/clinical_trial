import React from 'react';
import { Outlet, NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const searchTerm = searchParams.get('search') || '';

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Clinical Research Portal';
      case '/participants':
        return 'Participants List';
      case '/add-subject':
        return 'Clinical Research Portal';
      default:
        return 'Clinical Research Portal';
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  const showSearch = location.pathname === '/dashboard' || location.pathname === '/participants';

  return (
    <div className="flex h-screen bg-background text-on-surface overflow-hidden">
      
      {/* Side Navigation Bar */}
      <aside className="w-[240px] h-screen flex flex-col py-lg bg-surface-container-low border-r border-outline-variant/40 shrink-0">
        <div className="px-lg mb-xl">
          <h1 className="font-headline-md text-headline-md font-bold text-primary">ClinTrack Pro</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant/70">Trial Phase III</p>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 flex flex-col gap-xs">
          
          {/* Dashboard Tab */}
          <NavLink 
            to="/dashboard"
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-left transition-all ${
              isActive
                ? 'text-primary border-l-4 border-primary bg-secondary-container/20 font-semibold'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant'
            }`}
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
                <span className="font-body-md text-body-md">Dashboard</span>
              </>
            )}
          </NavLink>

          {/* Participants Tab */}
          <NavLink 
            to="/participants"
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-left transition-all ${
              isActive
                ? 'text-primary border-l-4 border-primary bg-secondary-container/20 font-semibold'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant'
            }`}
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>group</span>
                <span className="font-body-md text-body-md">Participants</span>
              </>
            )}
          </NavLink>

          {/* Add Subject Tab */}
          <NavLink 
            to="/add-subject"
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-left transition-all ${
              isActive
                ? 'text-primary border-l-4 border-primary bg-secondary-container/20 font-semibold'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant'
            }`}
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>person_add</span>
                <span className="font-body-md text-body-md">Add Subject</span>
              </>
            )}
          </NavLink>

        </nav>

        {/* Footer Area */}
        <div className="mt-auto px-lg pt-lg border-t border-outline-variant/60">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-on-surface-variant hover:text-error hover:bg-error-container/10 rounded-lg transition-colors font-body-md"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Sign Out</span>
          </button>

          <div className="mt-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold border border-primary/10">
              {user?.username.split(' ').map(n => n[0]).join('') || 'AT'}
            </div>
            <div className="overflow-hidden">
              <p className="font-label-sm text-label-sm text-on-surface font-bold truncate">{user?.username || 'Dr. Aris Thorne'}</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider truncate">{user?.role || 'Lead Investigator'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* Top Navbar */}
        <header className="w-full h-16 bg-surface border-b border-outline-variant/80 flex items-center justify-between px-gutter shrink-0">
          <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
            {getPageTitle()}
          </h2>

          <div className="flex items-center gap-md">
            {/* Search Bar - only shown in dashboard / list */}
            {showSearch && (
              <div className="relative w-64 hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant/80 rounded-lg pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                  placeholder={location.pathname === '/dashboard' ? "Search protocol ID..." : "Search Subject ID..."}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            )}

            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant relative transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content Grid */}
        <main className="flex-1 overflow-y-auto p-gutter bg-background">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
