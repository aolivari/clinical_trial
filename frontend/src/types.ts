export type StudyGroup = 'treatment' | 'control';
export type ParticipantStatus = 'active' | 'completed' | 'withdrawn';
export type Gender = 'F' | 'M' | 'Other';

export interface Participant {
  participant_id: string;
  subject_id: string;
  study_group: StudyGroup;
  enrollment_date: string; // YYYY-MM-DD
  status: ParticipantStatus;
  age: number;
  gender: Gender;
}

export type ParticipantCreate = Omit<Participant, 'participant_id'>;
export type ParticipantUpdate = Partial<ParticipantCreate>;

/** Matches backend ParticipantListResponse */
export interface PaginatedResponse<T> {
  total: number;
  skip: number;
  limit: number;
  items: T[];
}
