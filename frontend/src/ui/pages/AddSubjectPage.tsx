import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateParticipantMutation } from '../../hooks/useParticipants';
import { ParticipantCreate } from '../../types';
import { AddSubjectView } from '../views/AddSubjectView';

export const AddSubjectPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateParticipantMutation();

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

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createMutation.mutateAsync(formData);
      setLastRegisteredId(response.subject_id);
      setShowSuccessModal(true);

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
      console.error('Registration failed:', err);
    }
  };

  const isSubmitting = createMutation.isPending;
  const formError = createMutation.error?.message || null;

  return (
    <AddSubjectView
      formData={formData}
      setFormData={setFormData}
      notes={notes}
      setNotes={setNotes}
      isSubmitting={isSubmitting}
      formError={formError}
      showSuccessModal={showSuccessModal}
      lastRegisteredId={lastRegisteredId}
      onSubmit={handleAddParticipant}
      onNavigateDashboard={() => {
        setShowSuccessModal(false);
        navigate('/dashboard');
      }}
    />
  );
};

