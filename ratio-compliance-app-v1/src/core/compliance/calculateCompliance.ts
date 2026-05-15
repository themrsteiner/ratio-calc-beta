import { resolveAgeBucket, getAgeSourceWarning } from '../age/ageBuckets';
import type { CanonicalAgeMix } from '../standards/types';
import { EMPTY_AGE_MIX, getTotalChildren } from '../standards/types';
import { buildTimeIntervals, timeRangeOverlapsInterval } from '../time/time';
import { determineRequiredCaregivers } from './standardsEvaluation';
import type {
  ComplianceInterval,
  ComplianceResult,
  ComplianceStatus,
  ScheduleInput,
  StaffEntry,
  StudentEntry,
} from './types';

export function calculateCompliance(schedule: ScheduleInput): ComplianceResult {
  const warnings = validateSchedule(schedule);
  const intervals = buildTimeIntervals(
    schedule.openTime,
    schedule.closeTime,
    schedule.incrementMinutes,
  ).map((interval): ComplianceInterval => {
    const intervalWarnings: string[] = [];
    const ageMix = calculateAgeMixForInterval(schedule.students, schedule.scheduleDate, interval, intervalWarnings);
    const totalChildren = getTotalChildren(ageMix);
    const scheduledCaregivers = calculateScheduledCaregivers(schedule.staff, interval);
    const required = determineRequiredCaregivers(ageMix, schedule.standards);

    const staffGap =
      required.requiredCaregivers === null
        ? null
        : Math.max(0, required.requiredCaregivers - scheduledCaregivers);

    const status = determineComplianceStatus({
      totalChildren,
      scheduledCaregivers,
      requiredCaregivers: required.requiredCaregivers,
      staffGap,
      standardsConfigured: schedule.standards !== null,
    });

    return {
      startTime: interval.startTime,
      endTime: interval.endTime,
      ageMix,
      totalChildren,
      scheduledCaregivers,
      required,
      staffGap,
      status,
      warnings: intervalWarnings,
    };
  });

  return {
    schedule,
    intervals,
    warnings,
    summary: summarizeIntervals(intervals),
  };
}

function calculateAgeMixForInterval(
  students: StudentEntry[],
  scheduleDate: string,
  interval: { startTime: string; endTime: string },
  warnings: string[],
): CanonicalAgeMix {
  const mix: CanonicalAgeMix = { ...EMPTY_AGE_MIX };

  for (const student of students) {
    if (!timeRangeOverlapsInterval(student.arrivalTime, student.departureTime, interval)) {
      continue;
    }

    try {
      const ageBucket = resolveAgeBucket(student.ageSource, scheduleDate);
      mix[ageBucket] += sanitizeCount(student.count);

      const warning = getAgeSourceWarning(student.ageSource, sanitizeCount(student.count));
      if (warning) warnings.push(`${student.label}: ${warning}`);
    } catch (error) {
      warnings.push(
        `${student.label}: ${error instanceof Error ? error.message : 'Could not resolve age bucket.'}`,
      );
    }
  }

  return mix;
}

function calculateScheduledCaregivers(
  staff: StaffEntry[],
  interval: { startTime: string; endTime: string },
): number {
  return staff.reduce((sum, staffEntry) => {
    if (!staffEntry.countsTowardRatio) return sum;
    if (!timeRangeOverlapsInterval(staffEntry.startTime, staffEntry.endTime, interval)) return sum;
    return sum + sanitizeCount(staffEntry.count);
  }, 0);
}

function sanitizeCount(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function determineComplianceStatus(input: {
  totalChildren: number;
  scheduledCaregivers: number;
  requiredCaregivers: number | null;
  staffGap: number | null;
  standardsConfigured: boolean;
}): ComplianceStatus {
  if (input.totalChildren === 0) return 'noChildren';
  if (!input.standardsConfigured) return 'noStandards';
  if (input.requiredCaregivers === null) return 'needsReview';
  if ((input.staffGap ?? 0) > 0) return 'gap';
  if (input.scheduledCaregivers > input.requiredCaregivers) return 'overstaffed';
  return 'compliant';
}

function validateSchedule(schedule: ScheduleInput): string[] {
  const warnings: string[] = [];

  if (!schedule.standards) {
    warnings.push('No ratio standards are configured. Compliance cannot be determined until standards are loaded or entered.');
  }

  if (!schedule.scheduleDate) {
    warnings.push('A schedule date is required for birthday-based age calculation.');
  }

  for (const entry of schedule.students) {
    if (entry.ageSource.type !== 'dateOfBirth') {
      warnings.push(`${entry.label}: age category is static/manual and will not update automatically in future schedules.`);
    }
  }

  return warnings;
}

function summarizeIntervals(intervals: ComplianceInterval[]): ComplianceResult['summary'] {
  return {
    compliantIntervals: intervals.filter((interval) => interval.status === 'compliant' || interval.status === 'overstaffed').length,
    gapIntervals: intervals.filter((interval) => interval.status === 'gap').length,
    needsReviewIntervals: intervals.filter((interval) => interval.status === 'needsReview').length,
    noStandardsIntervals: intervals.filter((interval) => interval.status === 'noStandards').length,
    maxStaffGap: Math.max(0, ...intervals.map((interval) => interval.staffGap ?? 0)),
    maxChildren: Math.max(0, ...intervals.map((interval) => interval.totalChildren)),
  };
}
