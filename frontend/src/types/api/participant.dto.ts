import { StudyGroup, ParticipantStatus, Gender } from '../models/participant';

export interface ParticipantDTO {
  participant_id: string;
  subject_id: string;
  study_group: StudyGroup;
  enrollment_date: string; // YYYY-MM-DD
  status: ParticipantStatus;
  age: number;
  gender: Gender;
}

export type ParticipantCreateDTO = Omit<ParticipantDTO, 'participant_id'>;
export type ParticipantUpdateDTO = Partial<ParticipantCreateDTO>;
