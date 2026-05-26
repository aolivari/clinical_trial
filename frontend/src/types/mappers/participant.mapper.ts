import { ParticipantDTO, ParticipantCreateDTO, ParticipantUpdateDTO } from '../api';
import { Participant, ParticipantCreate, ParticipantUpdate } from '../models';

export const toParticipantModel = (dto: ParticipantDTO): Participant => ({
  participantId: dto.participant_id,
  subjectId: dto.subject_id,
  studyGroup: dto.study_group,
  enrollmentDate: dto.enrollment_date,
  status: dto.status,
  age: dto.age,
  gender: dto.gender,
});

export const toParticipantDTO = (model: Participant): ParticipantDTO => ({
  participant_id: model.participantId,
  subject_id: model.subjectId,
  study_group: model.studyGroup,
  enrollment_date: model.enrollmentDate,
  status: model.status,
  age: model.age,
  gender: model.gender,
});

export const toParticipantCreateDTO = (model: ParticipantCreate): ParticipantCreateDTO => ({
  subject_id: model.subjectId,
  study_group: model.studyGroup,
  enrollment_date: model.enrollmentDate,
  status: model.status,
  age: model.age,
  gender: model.gender,
});

export const toParticipantUpdateDTO = (model: ParticipantUpdate): ParticipantUpdateDTO => {
  const dto: ParticipantUpdateDTO = {};
  if (model.subjectId !== undefined) dto.subject_id = model.subjectId;
  if (model.studyGroup !== undefined) dto.study_group = model.studyGroup;
  if (model.enrollmentDate !== undefined) dto.enrollment_date = model.enrollmentDate;
  if (model.status !== undefined) dto.status = model.status;
  if (model.age !== undefined) dto.age = model.age;
  if (model.gender !== undefined) dto.gender = model.gender;
  return dto;
};
