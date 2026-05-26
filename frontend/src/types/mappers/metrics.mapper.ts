import { TrialMetricsDTO } from '../api';
import { TrialMetrics } from '../models';

export const toMetricsModel = (dto: TrialMetricsDTO): TrialMetrics => ({
  totalParticipants: dto.total_participants,
  activeCount: dto.active_count,
  completedCount: dto.completed_count,
  withdrawnCount: dto.withdrawn_count,
  treatmentCount: dto.treatment_count,
  controlCount: dto.control_count,
  maleCount: dto.male_count,
  femaleCount: dto.female_count,
  otherGenderCount: dto.other_gender_count,
  retentionRate: dto.retention_rate,
  completionRate: dto.completion_rate,
  avgAge: dto.avg_age,
});
