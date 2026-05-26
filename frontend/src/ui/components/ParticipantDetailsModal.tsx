import React, { useState, useEffect } from 'react';
import { useParticipantQuery, useUpdateParticipantMutation } from '../../hooks/useParticipants';
import { ParticipantCreate, StudyGroup, ParticipantStatus, Gender } from '../../types';
import { Alert, InputField, Select } from '.';

interface ParticipantDetailsModalProps {
  participantId: string | null;
  onClose: () => void;
}

export const ParticipantDetailsModal: React.FC<ParticipantDetailsModalProps> = ({
  participantId,
  onClose,
}) => {
  const { data: participant, isLoading, error: detailsError } = useParticipantQuery(participantId);
  const updateMutation = useUpdateParticipantMutation();

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editFormData, setEditFormData] = useState<ParticipantCreate>({
    subjectId: '',
    studyGroup: 'treatment',
    enrollmentDate: '',
    status: 'active',
    age: 35,
    gender: 'F',
  });

  // Sync form data when participant is fetched
  useEffect(() => {
    if (participant) {
      setEditFormData({
        subjectId: participant.subjectId,
        studyGroup: participant.studyGroup,
        enrollmentDate: participant.enrollmentDate,
        status: participant.status,
        age: participant.age,
        gender: participant.gender,
      });
      setIsEditingDetails(false);
    }
  }, [participant]);

  if (!participantId) return null;

  const handleSaveParticipant = async () => {
    try {
      await updateMutation.mutateAsync({
        id: participantId,
        data: editFormData,
      });
      setIsEditingDetails(false);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

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

  const isSaving = updateMutation.isPending;
  const saveError = updateMutation.error?.message || null;

  return (
    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform scale-100 transition-transform duration-300 border border-outline-variant/30">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-outline-variant/30 px-xl py-lg flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">account_box</span>
            <span className="font-headline-md text-sm font-bold text-on-surface">Participant Details</span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-on-surface p-1 rounded-full hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-xl space-y-lg">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl">rotate_right</span>
              <p className="text-xs text-on-surface-variant font-medium">Fetching participant record from database...</p>
            </div>
          ) : detailsError || saveError ? (
            <Alert
              message={detailsError?.message || saveError || ""}
              title="Error occurred"
            />
          ) : participant ? (
            isEditingDetails ? (
              <div className="space-y-lg">
                {/* Subject ID Input */}
                <InputField
                  id="edit_subject_id"
                  label="Subject ID"
                  required
                  value={editFormData.subjectId}
                  onChange={e => setEditFormData(prev => ({ ...prev, subjectId: e.target.value }))}
                  labelClassName="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"
                  className="py-2"
                />

                {/* Age and Gender */}
                <div className="grid grid-cols-2 gap-md">
                  <InputField
                    id="edit_age"
                    label="Age"
                    type="number"
                    required
                    min="18"
                    max="120"
                    value={editFormData.age}
                    onChange={e => setEditFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    labelClassName="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"
                    className="py-2"
                  />

                  <Select
                    id="edit_gender"
                    label="Gender"
                    required
                    value={editFormData.gender}
                    onChange={e => setEditFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
                    options={[
                      { value: "M", label: "Male (M)" },
                      { value: "F", label: "Female (F)" },
                      { value: "Other", label: "Other" },
                    ]}
                    labelClassName="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"
                    className="w-full py-2"
                  />
                </div>

                {/* Group and Status */}
                <div className="grid grid-cols-2 gap-md">
                  <Select
                    id="edit_study_group"
                    label="Study Group"
                    required
                    value={editFormData.studyGroup}
                    onChange={e => setEditFormData(prev => ({ ...prev, studyGroup: e.target.value as StudyGroup }))}
                    options={[
                      { value: "treatment", label: "Treatment" },
                      { value: "control", label: "Control" },
                    ]}
                    labelClassName="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"
                    className="w-full py-2"
                  />

                  <Select
                    id="edit_status"
                    label="Status"
                    required
                    value={editFormData.status}
                    onChange={e => setEditFormData(prev => ({ ...prev, status: e.target.value as ParticipantStatus }))}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "completed", label: "Completed" },
                      { value: "withdrawn", label: "Withdrawn" },
                    ]}
                    labelClassName="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"
                    className="w-full py-2"
                  />
                </div>

                {/* Enrollment Date */}
                <InputField
                  id="edit_enrollment_date"
                  label="Enrollment Date"
                  type="date"
                  required
                  value={editFormData.enrollmentDate}
                  onChange={e => setEditFormData(prev => ({ ...prev, enrollmentDate: e.target.value }))}
                  labelClassName="font-label-sm text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"
                  className="py-2"
                />
              </div>
            ) : (
              <div className="space-y-lg">
                {/* Subject Identification & Primary Key */}
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-md">
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Subject Identifier</p>
                    <h3 className="font-display-lg text-lg font-bold text-primary font-data-mono">{participant.subjectId}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    participant.status === 'active' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : participant.status === 'completed'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {participant.status}
                  </span>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-md">
                  <div className="bg-slate-50 p-md rounded-lg border border-slate-100">
                    <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Study Group</p>
                    <p className="text-xs font-semibold text-on-surface capitalize mt-0.5">{participant.studyGroup}</p>
                  </div>

                  <div className="bg-slate-50 p-md rounded-lg border border-slate-100">
                    <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Enrollment Date</p>
                    <p className="text-xs font-semibold text-on-surface mt-0.5">{formatDateString(participant.enrollmentDate)}</p>
                  </div>

                  <div className="bg-slate-50 p-md rounded-lg border border-slate-100">
                    <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Age Profile</p>
                    <p className="text-xs font-semibold text-on-surface mt-0.5">{participant.age} years old</p>
                  </div>

                  <div className="bg-slate-50 p-md rounded-lg border border-slate-100">
                    <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Gender</p>
                    <p className="text-xs font-semibold text-on-surface mt-0.5">
                      {participant.gender === 'F' && 'Female (F)'}
                      {participant.gender === 'M' && 'Male (M)'}
                      {participant.gender === 'Other' && 'Other'}
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
                  if (participant) {
                    setEditFormData({
                      subjectId: participant.subjectId,
                      studyGroup: participant.studyGroup,
                      enrollmentDate: participant.enrollmentDate,
                      status: participant.status,
                      age: participant.age,
                      gender: participant.gender,
                    });
                  }
                }}
                disabled={isSaving}
                className="text-on-surface-variant hover:text-primary font-bold text-xs px-md py-2 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveParticipant}
                disabled={isSaving}
                className="bg-primary hover:bg-primary-container text-on-primary px-xl py-2 rounded-lg font-semibold text-xs transition-colors shadow-md flex items-center gap-1 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[14px]">rotate_right</span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">save</span>
                    <span>Save Changes</span>
                  </>
                )}
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
                onClick={onClose}
                className="bg-slate-200 hover:bg-slate-300 text-on-surface-variant px-lg py-2 rounded-lg font-semibold text-xs transition-colors"
              >
                Close View
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
