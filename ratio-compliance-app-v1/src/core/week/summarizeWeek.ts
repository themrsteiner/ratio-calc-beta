import type { DaySummary } from './summarizeDay';

export type WeekSummary = {
  weeklyPeakChildren: number;
  weeklyPeakRequiredCaregivers: number;
  daysWithAlerts: number;
  manualAgeRiskCount: number;
};

export function summarizeWeek(daySummaries: Record<string, DaySummary>): WeekSummary {
  let weeklyPeakChildren = 0;
  let weeklyPeakRequired = 0;
  let daysWithAlerts = 0;
  let manualAgeRiskCount = 0;

  for (const day in daySummaries) {
    const summary = daySummaries[day];
    if (summary.peakChildren > weeklyPeakChildren) {
      weeklyPeakChildren = summary.peakChildren;
    }
    if (summary.peakRequiredCaregivers > weeklyPeakRequired) {
      weeklyPeakRequired = summary.peakRequiredCaregivers;
    }
    if (summary.hasGaps || summary.needsReviewIntervals > 0) {
      daysWithAlerts++;
    }
    // This is a bit tricky as the same student might be counted multiple times across days
    // but the spec asks for "Manual Age Risk - Number of student/group entries not using DOB"
    // We'll take the max across days or just assume it's stable.
    if (summary.manualAgeCount > manualAgeRiskCount) {
      manualAgeRiskCount = summary.manualAgeCount;
    }
  }

  return {
    weeklyPeakChildren,
    weeklyPeakRequiredCaregivers: weeklyPeakRequired,
    daysWithAlerts,
    manualAgeRiskCount,
  };
}
