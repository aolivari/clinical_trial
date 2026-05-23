import { StudyGroup, ParticipantStatus, Gender } from '../../../../types';

import { useAddSubjectPage } from '../hooks/useAddSubjectPage';

export const AddSubjectPage: React.FC = () => {
  const {
    formData,
    setFormData,
    notes,
    setNotes,
    isSubmitting,
    formError,
    showSuccessModal,
    lastRegisteredId,
    handleSubmit,
    onNavigateDashboard,
  } = useAddSubjectPage();
  return (
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
          <form className="space-y-lg" onSubmit={handleSubmit}>
            
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
              onClick={onNavigateDashboard}
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
