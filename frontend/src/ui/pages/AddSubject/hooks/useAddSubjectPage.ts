import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateParticipantMutation } from '../../../../hooks/useParticipants';
import { ParticipantCreate } from '../../../../types';

export const useAddSubjectPage = () => {
  const [formData, setFormData] = useState<ParticipantCreate>({
    subject_id: '',
    study_group: 'treatment',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'active',
    age: 35,
    gender: 'M',
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastRegisteredId, setLastRegisteredId] = useState('');

  const createMutation = useCreateParticipantMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      await createMutation.mutateAsync(formData);
      setLastRegisteredId(formData.subject_id);
      setShowSuccessModal(true);
    } catch (err) {
      setFormError("Failed to register participant. Subject ID may already exist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onNavigateDashboard = () => {
    navigate('/dashboard');
  };

  return {
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
  };
};
