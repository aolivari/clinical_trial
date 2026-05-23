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

export interface PaginatedResponse<T> {
  total: number;
  skip: number;
  limit: number;
  items: T[];
}

export interface User {
  username: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  username: string;
  role: string;
}

export interface TrialMetrics {
  total_participants: number;
  active_count: number;
  completed_count: number;
  withdrawn_count: number;
  treatment_count: number;
  control_count: number;
  male_count: number;
  female_count: number;
  other_gender_count: number;
  retention_rate: number;
  completion_rate: number;
  avg_age: number;
}
