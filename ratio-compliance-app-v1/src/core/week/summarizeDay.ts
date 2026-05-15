import type { ComplianceResult } from '../compliance/types';

export type DaySummary = {
  peakChildren: number;
  peakRequiredCaregivers: number;
  peakScheduledCaregivers: number;
  hasGaps: boolean;
  gapIntervals: number;
  needsReviewIntervals: number;
  manualAgeCount: number;
};

export function summarizeDay(result: ComplianceResult): DaySummary {
  let peakChildren = 0;
  let peakRequired = 0;
  let peakScheduled = 0;
  let gapIntervals = 0;
  let needsReviewIntervals = 0;

  for (const interval of result.intervals) {
    if (interval.totalChildren > peakChildren) peakChildren = interval.totalChildren;
    if ((interval.required.requiredCaregivers ?? 0) > peakRequired) {
      peakRequired = interval.required.requiredCaregivers ?? 0;
    }
    if (interval.scheduledCaregivers > peakScheduled) {
      peakScheduled = interval.scheduledCaregivers;
    }
    if (interval.status === 'gap') gapIntervals++;
    if (interval.status === 'needsReview' || interval.status === 'noStandards') {
      needsReviewIntervals++;
    }
  }

  const manualAgeCount = result.schedule.students.filter(
    (s) => s.ageSource.type !== 'dateOfBirth'
  ).length;

  return {
    peakChildren,
    peakRequiredCaregivers: peakRequired,
    peakScheduledCaregivers: peakScheduled,
    hasGaps: gapIntervals > 0,
    gapIntervals,
    needsReviewIntervals,
    manualAgeCount,
  };
}
