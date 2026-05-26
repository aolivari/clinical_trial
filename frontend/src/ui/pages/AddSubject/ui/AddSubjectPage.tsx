import React from 'react';
import { StudyGroup, ParticipantStatus, Gender } from '../../../../types';
import { useAddSubjectPage } from '../hooks/useAddSubjectPage';
import { Alert, InputField, Select, SuccessModal } from '../../../components';

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
              <Alert message={formError} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              
              {/* Subject ID */}
              <InputField
                id="subject_id"
                label="Subject ID"
                required
                placeholder="e.g. P007"
                value={formData.subjectId}
                onChange={e => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
                helperText="Unique identifier as per trial protocol."
              />

              {/* Enrollment Date */}
              <InputField
                id="enrollment_date"
                label="Enrollment Date"
                type="date"
                required
                value={formData.enrollmentDate}
                onChange={e => setFormData(prev => ({ ...prev, enrollmentDate: e.target.value }))}
              />

              {/* Study Group */}
              <Select
                id="study_group"
                label="Study Group"
                required
                value={formData.studyGroup}
                onChange={e => setFormData(prev => ({ ...prev, studyGroup: e.target.value as StudyGroup }))}
                options={[
                  { value: "treatment", label: "Treatment" },
                  { value: "control", label: "Control" },
                ]}
                className="w-full"
              />

              {/* Status */}
              <Select
                id="status"
                label="Status"
                required
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as ParticipantStatus }))}
                options={[
                  { value: "active", label: "Active" },
                  { value: "completed", label: "Completed" },
                  { value: "withdrawn", label: "Withdrawn" },
                ]}
                className="w-full"
              />

              {/* Age */}
              <InputField
                id="age"
                label="Age"
                type="number"
                required
                min="18"
                max="120"
                placeholder="Min 18"
                value={formData.age}
                onChange={e => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
              />

              {/* Gender */}
              <Select
                id="gender"
                label="Gender"
                required
                value={formData.gender}
                onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
                options={[
                  { value: "M", label: "Male (M)" },
                  { value: "F", label: "Female (F)" },
                  { value: "Other", label: "Other" },
                ]}
                className="w-full"
              />

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
                    subjectId: '',
                    studyGroup: 'treatment',
                    enrollmentDate: new Date().toISOString().split('T')[0],
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
      <SuccessModal
        isOpen={showSuccessModal}
        title="Registration Successful"
        description={
          <>
            Subject <span className="font-bold text-primary">{lastRegisteredId}</span> has been successfully enrolled in the Phase III trial.
          </>
        }
        actionText="Continue to Dashboard"
        onAction={onNavigateDashboard}
      />

    </div>
  );
};
