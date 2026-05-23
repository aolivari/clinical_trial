import React, { useEffect, useState } from 'react';
import { apiClient } from './api/client';
import { Participant, ParticipantCreate, PaginatedResponse, StudyGroup, ParticipantStatus, Gender } from './types';

type Page = 'login' | 'dashboard' | 'participants' | 'add_subject';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<{ username: string; role: string } | null>(
    localStorage.getItem('username') 
      ? { 
          username: localStorage.getItem('username')!, 
          role: localStorage.getItem('role')! 
        } 
      : null
  );

  const [currentPage, setCurrentPage] = useState<Page>(token ? 'dashboard' : 'login');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication form state
  const [email, setEmail] = useState('researcher@clintrack.com');
  const [password, setPassword] = useState('password123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination state (server-side)
  const PAGE_SIZE = 10;
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // New Participant form state
  const [formData, setFormData] = useState<ParticipantCreate>({
    subject_id: '',
    study_group: 'treatment',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'active',
    age: 35,
    gender: 'F',
  });
  const [notes, setNotes] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastRegisteredId, setLastRegisteredId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Single Participant Retrieve state
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [isEditingDetails, setIsEditingDetails] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<ParticipantCreate>({
    subject_id: '',
    study_group: 'treatment',
    enrollment_date: '',
    status: 'active',
    age: 35,
    gender: 'F',
  });

  const handleViewParticipant = async (id: string) => {
    try {
      setDetailsLoading(true);
      setDetailsError(null);
      setIsEditingDetails(false); // Reset edit mode on view new
      setShowDetailsModal(true);
      
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.get<Participant>(`/api/v1/participants/${id}`, { headers });
      setSelectedParticipant(response.data);
      setEditFormData({
        subject_id: response.data.subject_id,
        study_group: response.data.study_group,
        enrollment_date: response.data.enrollment_date,
        status: response.data.status,
        age: response.data.age,
        gender: response.data.gender,
      });
    } catch (err: any) {
      setDetailsError(err.message || 'Failed to retrieve participant details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSaveParticipant = async () => {
    if (!selectedParticipant) return;
    try {
      setDetailsLoading(true);
      setDetailsError(null);
      
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.put<Participant>(
        `/api/v1/participants/${selectedParticipant.participant_id}`, 
        editFormData, 
        { headers }
      );
      
      setSelectedParticipant(response.data);
      setParticipants(prev => prev.map(p => p.participant_id === selectedParticipant.participant_id ? response.data : p));
      setIsEditingDetails(false);
    } catch (err: any) {
      setDetailsError(err.message || 'Failed to update participant details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Fetch participants (server-side pagination)
  const fetchParticipants = async (page: number = currentPageIndex) => {
    try {
      setLoading(true);
      setError(null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const skip = (page - 1) * PAGE_SIZE;
      const response = await apiClient.get<PaginatedResponse<Participant>>(
        `/api/v1/participants?skip=${skip}&limit=${PAGE_SIZE}`,
        { headers }
      );
      setParticipants(response.data.items ?? []);
      setTotalItems(response.data.total ?? 0);
    } catch (err: any) {
      setError(err.message || 'Failed to query trial participants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchParticipants(1);
    }
  }, [token]);

  // Auth Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAuthenticating(true);
      setLoginError(null);

      const response = await apiClient.post('/api/v1/auth/login', { email, password });
      const { access_token, username, role } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);

      setToken(access_token);
      setUser({ username, role });
      setCurrentPage('dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setCurrentPage('login');
  };

  // Delete Handler
  const handleDeleteParticipant = async (id: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) return;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await apiClient.delete(`/api/v1/participants/${id}`, { headers });
      // Refresh current page (item count may have changed)
      fetchParticipants(currentPageIndex);
    } catch (err: any) {
      alert(err.message || 'Delete operation failed.');
    }
  };

  // Add Participant Form Submit
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setFormError(null);

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.post<Participant>('/api/v1/participants', formData, { headers });

      setLastRegisteredId(response.data.subject_id);
      setShowSuccessModal(true);
      // Go back to page 1 to see the new entry
      setCurrentPageIndex(1);
      fetchParticipants(1);

      // Reset form
      setFormData({
        subject_id: '',
        study_group: 'treatment',
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active',
        age: 35,
        gender: 'F',
      });
      setNotes('');
    } catch (err: any) {
      setFormError(err.message || 'Could not register trial participant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derived pagination
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;

  // Client-side search filter (applied to the current page only)
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.subject_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = groupFilter === 'all' || p.study_group === groupFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  // Helper date formatter
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

  // --- LOGIN VIEW ---
  if (currentPage === 'login') {
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
            <form className="space-y-lg" onSubmit={handleLoginSubmit}>
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
  }

  // --- INTERNAL VIEW SHELL (Dashboard, List, Form) ---
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
          <button 
            onClick={() => { setCurrentPage('dashboard'); setError(null); }}
            className={`flex items-center gap-3 px-4 py-3 text-left transition-all ${
              currentPage === 'dashboard'
                ? 'text-primary border-l-4 border-primary bg-secondary-container/20 font-semibold'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: currentPage === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
            <span className="font-body-md text-body-md">Dashboard</span>
          </button>

          {/* Participants Tab */}
          <button 
            onClick={() => { setCurrentPage('participants'); setError(null); }}
            className={`flex items-center gap-3 px-4 py-3 text-left transition-all ${
              currentPage === 'participants'
                ? 'text-primary border-l-4 border-primary bg-secondary-container/20 font-semibold'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: currentPage === 'participants' ? "'FILL' 1" : "'FILL' 0" }}>group</span>
            <span className="font-body-md text-body-md">Participants</span>
          </button>

          {/* Add Subject Tab */}
          <button 
            onClick={() => { setCurrentPage('add_subject'); setError(null); }}
            className={`flex items-center gap-3 px-4 py-3 text-left transition-all ${
              currentPage === 'add_subject'
                ? 'text-primary border-l-4 border-primary bg-secondary-container/20 font-semibold'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: currentPage === 'add_subject' ? "'FILL' 1" : "'FILL' 0" }}>person_add</span>
            <span className="font-body-md text-body-md">Add Subject</span>
          </button>

        </nav>

        {/* Footer Area */}
        <div className="mt-auto px-lg pt-lg border-t border-outline-variant/60">
          <button 
            onClick={handleSignOut}
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
            {currentPage === 'dashboard' && 'Clinical Research Portal'}
            {currentPage === 'participants' && 'Participants List'}
            {currentPage === 'add_subject' && 'Clinical Research Portal'}
          </h2>

          <div className="flex items-center gap-md">
            {/* Search Bar - only shown in dashboard / list */}
            {currentPage !== 'add_subject' && (
              <div className="relative w-64 hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant/80 rounded-lg pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                  placeholder={currentPage === 'dashboard' ? "Search protocol ID..." : "Search Subject ID..."}
                  type="text"
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPageIndex(1);
                    fetchParticipants(1);
                  }}
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
          
          {error && (
            <div className="bg-red-50 text-red-800 text-xs p-4 rounded-xl border border-red-200/60 mb-xl flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <span className="material-symbols-outlined text-[20px]">warning</span>
                <span>{error}</span>
              </div>
              <button 
                onClick={() => fetchParticipants(currentPageIndex)}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded border border-red-300 font-semibold"
              >
                Retry Query
              </button>
            </div>
          )}

          {/* ======================================= */}
          {/* 1. DASHBOARD VIEW                       */}
          {/* ======================================= */}
          {currentPage === 'dashboard' && (
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
                    onClick={() => alert('Mock CSV Export Completed')}
                    className="bg-primary hover:brightness-110 text-on-primary font-label-sm text-label-sm px-lg py-2.5 rounded-lg shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>EXPORT DATA</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards removed — stats require a dedicated backend endpoint */}

              {/* Main grids details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                
                {/* Recent Enrollments Table */}
                <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center">
                      <h5 className="font-headline-md text-headline-md font-bold text-on-surface">Recent Participant Status</h5>
                      <button 
                        onClick={() => setCurrentPage('participants')}
                        className="text-primary font-label-sm text-xs font-semibold hover:underline"
                      >
                        View All Records
                      </button>
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
                          {loading ? (
                            <tr>
                              <td colSpan={5} className="text-center py-8 text-on-surface-variant">Querying database...</td>
                            </tr>
                          ) : participants.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-8 text-on-surface-variant">No participants registered yet.</td>
                            </tr>
                          ) : (
                            participants.slice(0, 3).map((p) => (
                              <tr key={p.participant_id} className="hover:bg-surface-variant/10 transition-colors">
                                <td className="px-lg py-4 font-data-mono font-bold">
                                  <button 
                                    onClick={() => handleViewParticipant(p.participant_id)}
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
                          {loading ? '...' : totalItems}
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

            </div>
          )}

          {/* ======================================= */}
          {/* 2. PARTICIPANTS LIST VIEW               */}
          {/* ======================================= */}
          {currentPage === 'participants' && (
            <div className="space-y-lg">
              
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-2">
                <div className="flex items-center gap-sm">
                  <div className="bg-surface-container-highest px-4 py-2 rounded-lg flex items-center gap-2 border border-outline-variant/10">
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Total Subjects</span>
                    <span className="font-headline-md text-lg font-bold text-primary">{loading ? '...' : totalItems}</span>
                  </div>
                  <div className="bg-surface-container-highest px-4 py-2 rounded-lg flex items-center gap-2 border border-outline-variant/10">
                    <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Active</span>
                    <span className="font-headline-md text-lg font-bold text-tertiary">
                      {loading ? '...' : participants.filter(p => p.status === 'active').length}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* Status filter dropdown */}
                  <select 
                    value={statusFilter}
                    onChange={e => {
                      setStatusFilter(e.target.value);
                      setCurrentPageIndex(1);
                    }}
                    className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-xs font-semibold text-on-surface hover:bg-slate-50 transition-colors focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="all">Filter Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>

                  {/* Group filter dropdown */}
                  <select 
                    value={groupFilter}
                    onChange={e => {
                      setGroupFilter(e.target.value);
                      setCurrentPageIndex(1);
                    }}
                    className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-xs font-semibold text-on-surface hover:bg-slate-50 transition-colors focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="all">Filter Group</option>
                    <option value="treatment">Treatment</option>
                    <option value="control">Control</option>
                  </select>

                  {/* Register New Subject Button */}
                  <button 
                    onClick={() => setCurrentPage('add_subject')}
                    className="bg-primary hover:brightness-115 text-on-primary text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>New Participant</span>
                  </button>

                </div>
              </div>

              {/* Main table container */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant/50 text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                        <th className="px-lg py-4">Subject ID</th>
                        <th className="px-lg py-4">Study Group</th>
                        <th className="px-lg py-4">Enrollment Date</th>
                        <th className="px-lg py-4">Status</th>
                        <th className="px-lg py-4">Age</th>
                        <th className="px-lg py-4">Gender</th>
                        <th className="px-lg py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30 text-xs">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-16 text-on-surface-variant font-medium">Querying database engine...</td>
                        </tr>
                      ) : filteredParticipants.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-16 text-on-surface-variant">
                            <span className="material-symbols-outlined text-4xl text-outline mb-2">help_outline</span>
                            <p className="font-semibold text-base mt-1 text-slate-700">No matches found</p>
                            <p className="text-xs text-slate-500 mt-0.5">Try resetting the filter criteria or register a new subject</p>
                          </td>
                        </tr>
                      ) : (
                        filteredParticipants.map((p) => (
                          <tr key={p.participant_id} className="hover:bg-surface-container-low transition-colors group">
                            
                            {/* Subject ID */}
                            <td className="px-lg py-4">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${
                                  p.status === 'active' ? 'bg-primary' : p.status === 'completed' ? 'bg-outline' : 'bg-error'
                                }`} />
                                <span className="font-data-mono font-bold text-on-surface">{p.subject_id}</span>
                              </div>
                            </td>

                            {/* Study Group */}
                            <td className="px-lg py-4">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                p.study_group === 'treatment' 
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {p.study_group}
                              </span>
                            </td>

                            {/* Enrollment date */}
                            <td className="px-lg py-4 text-on-surface-variant font-medium">
                              {formatDateString(p.enrollment_date)}
                            </td>

                            {/* Status */}
                            <td className="px-lg py-4">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                p.status === 'active' 
                                  ? 'bg-green-50 text-green-800 border border-green-200' 
                                  : p.status === 'completed'
                                  ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}>
                                {p.status}
                              </span>
                            </td>

                            {/* Age */}
                            <td className="px-lg py-4 text-on-surface-variant font-semibold">
                              {p.age}
                            </td>

                            {/* Gender */}
                            <td className="px-lg py-4 text-on-surface-variant font-medium">
                              {p.gender === 'F' && 'Female'}
                              {p.gender === 'M' && 'Male'}
                              {p.gender === 'Other' && 'Other'}
                            </td>

                            {/* Actions */}
                            <td className="px-lg py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => handleViewParticipant(p.participant_id)}
                                  className="text-slate-400 hover:text-primary p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                                  title="View participant details"
                                >
                                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </button>
                                <button 
                                  onClick={() => handleDeleteParticipant(p.participant_id)}
                                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                                  title="Delete subject"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-lg py-4 flex items-center justify-between bg-surface-container-low border-t border-outline-variant/30 text-xs">
                  <span className="font-body-md text-on-surface-variant">
                    Page {currentPageIndex} of {totalPages} — {totalItems} total entries
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => {
                        const prev = Math.max(currentPageIndex - 1, 1);
                        setCurrentPageIndex(prev);
                        fetchParticipants(prev);
                      }}
                      disabled={currentPageIndex === 1}
                      className="p-1.5 rounded hover:bg-surface-variant text-outline disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentPageIndex(i + 1);
                          fetchParticipants(i + 1);
                        }}
                        className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                          currentPageIndex === i + 1
                            ? 'bg-primary text-on-primary'
                            : 'hover:bg-surface-variant text-on-surface'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => {
                        const next = Math.min(currentPageIndex + 1, totalPages);
                        setCurrentPageIndex(next);
                        fetchParticipants(next);
                      }}
                      disabled={currentPageIndex === totalPages}
                      className="p-1.5 rounded hover:bg-surface-variant text-outline disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Contextual Insights Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mt-8">
                
                <div className="bg-white/80 backdrop-blur-md p-lg rounded-xl flex flex-col gap-sm shadow-sm border border-outline-variant/20 border-l-4 border-l-primary">
                  <span className="font-label-sm text-[10px] text-primary uppercase font-bold tracking-wider">Enrollment Trend</span>
                  <div className="h-14 w-full flex items-end gap-1.5 mt-2">
                    <div className="bg-primary/20 w-full h-[30%] rounded-t-sm"></div>
                    <div className="bg-primary/30 w-full h-[50%] rounded-t-sm"></div>
                    <div className="bg-primary/40 w-full h-[40%] rounded-t-sm"></div>
                    <div className="bg-primary/60 w-full h-[70%] rounded-t-sm"></div>
                    <div className="bg-primary/80 w-full h-[60%] rounded-t-sm"></div>
                    <div className="bg-primary w-full h-[90%] rounded-t-sm"></div>
                  </div>
                  <p className="font-body-md text-xs text-on-surface-variant mt-2 font-medium">12% increase since last month.</p>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-lg rounded-xl flex flex-col gap-sm shadow-sm border border-outline-variant/20 border-l-4 border-l-tertiary justify-between">
                  <span className="font-label-sm text-[10px] text-tertiary uppercase font-bold tracking-wider">Diversity Index</span>
                  <div className="flex items-center gap-lg mt-2">
                    <div className="relative w-12 h-12 rounded-full border-4 border-tertiary-container/30 flex items-center justify-center">
                      <span className="font-headline-md text-sm text-tertiary font-bold">0.8</span>
                    </div>
                    <p className="font-body-md text-xs text-on-surface-variant font-medium leading-relaxed">Meeting demographic targets for Phase III trial representation.</p>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-lg rounded-xl flex flex-col gap-sm shadow-sm border border-outline-variant/20 border-l-4 border-l-slate-600">
                  <span className="font-label-sm text-[10px] text-slate-600 uppercase font-bold tracking-wider">Retention Rate</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-display-lg text-2xl font-bold text-on-surface">94.2%</span>
                    <span className="material-symbols-outlined text-green-600 text-sm">trending_up</span>
                  </div>
                  <p className="font-body-md text-xs text-on-surface-variant mt-2 font-medium">Protocol Benchmark limit: 88%</p>
                </div>

              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* 3. ADD SUBJECT VIEW                     */}
          {/* ======================================= */}
          {currentPage === 'add_subject' && (
            <div className="space-y-xl">
              
              {/* Header */}
              <div>
                <div className="flex items-center gap-1.5 mb-xs text-primary">
                  <span className="material-symbols-outlined text-[18px]">clinical_notes</span>
                  <span className="font-label-sm text-xs font-bold uppercase tracking-wider">New Enrollment</span>
                </div>
                <h1 className="font-display-lg text-2xl font-bold text-on-surface mb-xs">Register New Participant</h1>
                <p className="font-body-md text-xs text-on-surface-variant max-w-2xl leading-relaxed">
                  Enter the participant details accurately to ensure protocol compliance and data integrity for Phase III clinical trial data points.
                </p>
              </div>

              {/* Grid Form layout */}
              <div className="grid grid-cols-12 gap-lg items-start">
                
                {/* Form card */}
                <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest shadow-sm rounded-xl p-xl border border-outline-variant/20">
                  <form className="space-y-lg" onSubmit={handleAddParticipant}>
                    
                    {formError && (
                      <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-lg">
                        {formError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                      
                      {/* Subject ID */}
                      <div className="space-y-1">
                        <label className="font-label-sm text-xs font-semibold text-on-surface-variant" htmlFor="subject_id">
                          Subject ID <span className="text-error">*</span>
                        </label>
                        <input 
                          className="w-full bg-white border border-outline-variant rounded-lg px-md py-2.5 text-xs text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          id="subject_id"
                          type="text"
                          required
                          placeholder="e.g. P007"
                          value={formData.subject_id}
                          onChange={e => setFormData(prev => ({ ...prev, subject_id: e.target.value }))}
                        />
                        <p className="text-[10px] text-on-surface-variant/60">Unique identifier as per trial protocol.</p>
                      </div>

                      {/* Enrollment Date */}
                      <div className="space-y-1">
                        <label className="font-label-sm text-xs font-semibold text-on-surface-variant" htmlFor="enrollment_date">
                          Enrollment Date <span className="text-error">*</span>
                        </label>
                        <input 
                          className="w-full bg-white border border-outline-variant rounded-lg px-md py-2.5 text-xs text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          id="enrollment_date"
                          type="date"
                          required
                          value={formData.enrollment_date}
                          onChange={e => setFormData(prev => ({ ...prev, enrollment_date: e.target.value }))}
                        />
                      </div>

                      {/* Study Group */}
                      <div className="space-y-1">
                        <label className="font-label-sm text-xs font-semibold text-on-surface-variant" htmlFor="study_group">
                          Study Group <span className="text-error">*</span>
                        </label>
                        <select 
                          className="w-full bg-white border border-outline-variant rounded-lg px-md py-2.5 text-xs text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          id="study_group"
                          required
                          value={formData.study_group}
                          onChange={e => setFormData(prev => ({ ...prev, study_group: e.target.value as StudyGroup }))}
                        >
                          <option value="treatment">Treatment</option>
                          <option value="control">Control</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div className="space-y-1">
                        <label className="font-label-sm text-xs font-semibold text-on-surface-variant" htmlFor="status">
                          Status <span className="text-error">*</span>
                        </label>
                        <select 
                          className="w-full bg-white border border-outline-variant rounded-lg px-md py-2.5 text-xs text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          id="status"
                          required
                          value={formData.status}
                          onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as ParticipantStatus }))}
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="withdrawn">Withdrawn</option>
                        </select>
                      </div>

                      {/* Age */}
                      <div className="space-y-1">
                        <label className="font-label-sm text-xs font-semibold text-on-surface-variant" htmlFor="age">
                          Age <span className="text-error">*</span>
                        </label>
                        <input 
                          className="w-full bg-white border border-outline-variant rounded-lg px-md py-2.5 text-xs text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          id="age"
                          type="number"
                          required
                          min="18"
                          max="120"
                          placeholder="Min 18"
                          value={formData.age}
                          onChange={e => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                        />
                      </div>

                      {/* Gender */}
                      <div className="space-y-1">
                        <label className="font-label-sm text-xs font-semibold text-on-surface-variant" htmlFor="gender">
                          Gender <span className="text-error">*</span>
                        </label>
                        <select 
                          className="w-full bg-white border border-outline-variant rounded-lg px-md py-2.5 text-xs text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          id="gender"
                          required
                          value={formData.gender}
                          onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
                        >
                          <option value="M">Male (M)</option>
                          <option value="F">Female (F)</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                    </div>

                    {/* Notes */}
                    <div className="space-y-1 pt-2">
                      <label className="font-label-sm text-xs font-semibold text-on-surface-variant" htmlFor="notes">
                        Internal Researcher Notes
                      </label>
                      <textarea 
                        className="w-full bg-white border border-outline-variant rounded-lg px-md py-2 text-xs text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        id="notes"
                        rows={3}
                        placeholder="Initial screening observations..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-md border-t border-outline-variant/30 mt-xl">
                      <button 
                        className="px-lg py-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
                        type="button"
                        onClick={() => {
                          setFormData({
                            subject_id: '',
                            study_group: 'treatment',
                            enrollment_date: new Date().toISOString().split('T')[0],
                            status: 'active',
                            age: 35,
                            gender: 'F',
                          });
                          setNotes('');
                        }}
                      >
                        CLEAR FORM
                      </button>
                      
                      <button 
                        className="bg-primary hover:bg-primary-container text-on-primary px-xl py-2.5 rounded-lg font-semibold text-xs transition-all shadow-md active:scale-[0.98] flex items-center gap-1.5"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="material-symbols-outlined animate-spin text-[16px]">rotate_right</span>
                            <span>Registering...</span>
                          </>
                        ) : (
                          <>
                            <span>Register Participant</span>
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </div>

                {/* Sidebar Guidance card */}
                <div className="col-span-12 lg:col-span-4 space-y-lg">
                  <div className="bg-secondary-container/20 border border-secondary-container/40 p-lg rounded-xl">
                    <div className="flex items-center gap-sm mb-md text-primary">
                      <span className="material-symbols-outlined text-[18px]">info</span>
                      <h3 className="font-headline-md text-xs font-bold uppercase tracking-wider text-on-secondary-container">Trial Guidelines</h3>
                    </div>
                    <ul className="space-y-sm text-xs text-on-secondary-container/80 leading-relaxed font-medium">
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-[14px] mt-0.5">check_circle</span>
                        <span>Participants must be aged 18-75.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-[14px] mt-0.5">check_circle</span>
                        <span>Informed consent form must be uploaded post-registration.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-primary text-[14px] mt-0.5">check_circle</span>
                        <span>Randomization is handled automatically based on Group selection.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-surface-container-lowest shadow-sm rounded-xl overflow-hidden border border-outline-variant/25">
                    <img 
                      alt="Clinical Lab Environment" 
                      className="w-full h-40 object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMOkAkmI5z7F6XEBMYo8Sf4U29Ixxx_lVBF0OuEXP6URUk2I1ptSIax2ECJxeyeDoCme-4z0yVb0NJ3ZrXdOpg4wTiNlqXUdtUVo4g3fWitww5-ytCUAMIVcqSvoPA0P6pOUI2OfKt0J-fEME2K-t8AatcXqZ85k_AKnKkF_IFEapOl9ARz-35o4srcrnJoxv8z8VWtqOn20bF9Y9K44RHWWsmuSCSbyUlRTAnaALU8eZpOsDHAbPVb88aXJS7u49kv_LKTIt4x2Y"
                    />
                    <div className="p-lg">
                      <h4 className="font-headline-md text-sm font-bold mb-1 text-on-surface">Protocol Compliance</h4>
                      <p className="font-body-md text-[11px] text-on-surface-variant leading-relaxed">
                        All subject entries are logged and timestamped for GxP auditing requirements. Ensure double-verification of Subject ID.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* Success Modal Overlay (Add Subject confirmation) */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-xl text-center transform scale-100 transition-transform duration-300 border border-outline-variant/30">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-lg text-primary">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            
            <h2 className="font-display-lg text-lg font-bold text-on-surface mb-2">Registration Successful</h2>
            <p className="font-body-md text-xs text-on-surface-variant mb-6 leading-relaxed">
              Subject <span className="font-bold text-primary">{lastRegisteredId}</span> has been successfully enrolled in the Phase III trial.
            </p>
            
            <button 
              className="w-full bg-primary hover:bg-primary-container text-on-primary py-2.5 rounded-lg font-semibold text-xs shadow-md transition-colors"
              onClick={() => {
                setShowSuccessModal(false);
                setCurrentPage('dashboard');
              }}
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Participant Details Modal Overlay */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform scale-100 transition-transform duration-300 border border-outline-variant/30">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-outline-variant/30 px-xl py-lg flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">account_box</span>
                <span className="font-headline-md text-sm font-bold text-on-surface">Participant Details</span>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-on-surface p-1 rounded-full hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-xl space-y-lg">
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <span className="material-symbols-outlined animate-spin text-primary text-3xl">rotate_right</span>
                  <p className="text-xs text-on-surface-variant font-medium">Fetching participant record from database...</p>
                </div>
              ) : detailsError ? (
                <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-lg flex items-start gap-2">
                  <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                  <div>
                    <p className="font-bold">Error retrieving details</p>
                    <p className="opacity-90">{detailsError}</p>
                  </div>
                </div>
              ) : selectedParticipant ? (
                isEditingDetails ? (
                  <div className="space-y-lg">
                    {/* Subject ID Input */}
                    <div className="space-y-1">
                      <label className="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="edit_subject_id">
                        Subject ID <span className="text-error">*</span>
                      </label>
                      <input 
                        className="w-full bg-white border border-outline-variant rounded-lg px-md py-2 text-xs text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        id="edit_subject_id"
                        type="text"
                        required
                        value={editFormData.subject_id}
                        onChange={e => setEditFormData(prev => ({ ...prev, subject_id: e.target.value }))}
                      />
                    </div>

                    {/* Age and Gender */}
                    <div className="grid grid-cols-2 gap-md">
                      <div className="space-y-1">
                        <label className="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="edit_age">
                          Age <span className="text-error">*</span>
                        </label>
                        <input 
                          className="w-full bg-white border border-outline-variant rounded-lg px-md py-2 text-xs text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          id="edit_age"
                          type="number"
                          required
                          min="18"
                          max="120"
                          value={editFormData.age}
                          onChange={e => setEditFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="edit_gender">
                          Gender <span className="text-error">*</span>
                        </label>
                        <select 
                          className="w-full bg-white border border-outline-variant rounded-lg px-md py-2 text-xs text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          id="edit_gender"
                          required
                          value={editFormData.gender}
                          onChange={e => setEditFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
                        >
                          <option value="M">Male (M)</option>
                          <option value="F">Female (F)</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Group and Status */}
                    <div className="grid grid-cols-2 gap-md">
                      <div className="space-y-1">
                        <label className="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="edit_study_group">
                          Study Group <span className="text-error">*</span>
                        </label>
                        <select 
                          className="w-full bg-white border border-outline-variant rounded-lg px-md py-2 text-xs text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          id="edit_study_group"
                          required
                          value={editFormData.study_group}
                          onChange={e => setEditFormData(prev => ({ ...prev, study_group: e.target.value as StudyGroup }))}
                        >
                          <option value="treatment">Treatment</option>
                          <option value="control">Control</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="edit_status">
                          Status <span className="text-error">*</span>
                        </label>
                        <select 
                          className="w-full bg-white border border-outline-variant rounded-lg px-md py-2 text-xs text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          id="edit_status"
                          required
                          value={editFormData.status}
                          onChange={e => setEditFormData(prev => ({ ...prev, status: e.target.value as ParticipantStatus }))}
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="withdrawn">Withdrawn</option>
                        </select>
                      </div>
                    </div>

                    {/* Enrollment Date */}
                    <div className="space-y-1">
                      <label className="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" htmlFor="edit_enrollment_date">
                        Enrollment Date <span className="text-error">*</span>
                      </label>
                      <input 
                        className="w-full bg-white border border-outline-variant rounded-lg px-md py-2 text-xs text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        id="edit_enrollment_date"
                        type="date"
                        required
                        value={editFormData.enrollment_date}
                        onChange={e => setEditFormData(prev => ({ ...prev, enrollment_date: e.target.value }))}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-lg">
                    {/* Subject Identification & Primary Key */}
                    <div className="flex items-center justify-between border-b border-outline-variant/20 pb-md">
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Subject Identifier</p>
                        <h3 className="font-display-lg text-lg font-bold text-primary font-data-mono">{selectedParticipant.subject_id}</h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedParticipant.status === 'active' 
                          ? 'bg-green-50 text-green-800 border border-green-200' 
                          : selectedParticipant.status === 'completed'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {selectedParticipant.status}
                      </span>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-md">
                      <div className="bg-slate-50 p-md rounded-lg border border-slate-100">
                        <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Study Group</p>
                        <p className="text-xs font-semibold text-on-surface capitalize mt-0.5">{selectedParticipant.study_group}</p>
                      </div>

                      <div className="bg-slate-50 p-md rounded-lg border border-slate-100">
                        <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Enrollment Date</p>
                        <p className="text-xs font-semibold text-on-surface mt-0.5">{formatDateString(selectedParticipant.enrollment_date)}</p>
                      </div>

                      <div className="bg-slate-50 p-md rounded-lg border border-slate-100">
                        <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Age Profile</p>
                        <p className="text-xs font-semibold text-on-surface mt-0.5">{selectedParticipant.age} years old</p>
                      </div>

                      <div className="bg-slate-50 p-md rounded-lg border border-slate-100">
                        <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Gender</p>
                        <p className="text-xs font-semibold text-on-surface mt-0.5">
                          {selectedParticipant.gender === 'F' && 'Female (F)'}
                          {selectedParticipant.gender === 'M' && 'Male (M)'}
                          {selectedParticipant.gender === 'Other' && 'Other'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-xs text-on-surface-variant text-center py-6">No participant selected.</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-outline-variant/30 px-xl py-md flex justify-between items-center">
              {isEditingDetails ? (
                <>
                  <button 
                    onClick={() => {
                      setIsEditingDetails(false);
                      if (selectedParticipant) {
                        setEditFormData({
                          subject_id: selectedParticipant.subject_id,
                          study_group: selectedParticipant.study_group,
                          enrollment_date: selectedParticipant.enrollment_date,
                          status: selectedParticipant.status,
                          age: selectedParticipant.age,
                          gender: selectedParticipant.gender,
                        });
                      }
                    }}
                    className="text-on-surface-variant hover:text-primary font-bold text-xs px-md py-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveParticipant}
                    className="bg-primary hover:bg-primary-container text-on-primary px-xl py-2 rounded-lg font-semibold text-xs transition-colors shadow-md flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">save</span>
                    <span>Save Changes</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsEditingDetails(true)}
                    className="text-primary hover:text-primary-container font-bold text-xs flex items-center gap-1 hover:underline transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Edit Record</span>
                  </button>
                  <button 
                    onClick={() => setShowDetailsModal(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-on-surface-variant px-lg py-2 rounded-lg font-semibold text-xs transition-colors"
                  >
                    Close View
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
