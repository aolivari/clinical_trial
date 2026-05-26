export type StudyGroup = 'treatment' | 'control';
export type ParticipantStatus = 'active' | 'completed' | 'withdrawn';
export type Gender = 'F' | 'M' | 'Other';

export interface Participant {
  participantId: string;
  subjectId: string;
  studyGroup: StudyGroup;
  enrollmentDate: string; // YYYY-MM-DD
  status: ParticipantStatus;
  age: number;
  gender: Gender;
}

export type ParticipantCreate = Omit<Participant, 'participantId'>;
export type ParticipantUpdate = Partial<ParticipantCreate>;
