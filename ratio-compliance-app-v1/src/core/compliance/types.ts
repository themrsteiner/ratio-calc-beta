import type { AgeSource } from '../age/ageBuckets';
import type { CanonicalAgeMix, RatioStandardSet } from '../standards/types';

export type StudentEntry = {
  id: string;
  label: string;
  count: number;
  arrivalTime: string;
  departureTime: string;
  ageSource: AgeSource;
  notes?: string;
};

export type StaffEntry = {
  id: string;
  label: string;
  count: number;
  startTime: string;
  endTime: string;
  countsTowardRatio: boolean;
  notes?: string;
};

export type ScheduleInput = {
  scheduleName: string;
  scheduleDate: string;
  openTime: string;
  closeTime: string;
  incrementMinutes: number;
  students: StudentEntry[];
  staff: StaffEntry[];
  standards: RatioStandardSet | null;
};

export type WeeklySchedule = {
  id: string;
  weekName: string;
  mondayDate: string; // YYYY-MM-DD
  days: ScheduleInput[]; // 5 days: Mon, Tue, Wed, Thu, Fri
};

export type Workspace = {
  weeks: WeeklySchedule[];
};

export type RequiredCaregiverResult =
  | {
      status: 'noChildren';
      requiredCaregivers: 0;
      ruleLevel: 'none';
      explanation: string;
    }
  | {
      status: 'compliantWithOne';
      requiredCaregivers: 1;
      ruleLevel: 'oneCaregiver';
      explanation: string;
    }
  | {
      status: 'compliantWithTwo';
      requiredCaregivers: 2;
      ruleLevel: 'twoCaregiver';
      explanation: string;
    }
  | {
      status: 'standardsNotConfigured';
      requiredCaregivers: null;
      ruleLevel: 'missingStandards';
      explanation: string;
    }
  | {
      status: 'needsMoreStandards';
      requiredCaregivers: null;
      ruleLevel: 'beyondLoadedStandards';
      explanation: string;
    };

export type ComplianceStatus =
  | 'compliant'
  | 'overstaffed'
  | 'gap'
  | 'noChildren'
  | 'noStandards'
  | 'needsReview';

export type ComplianceInterval = {
  startTime: string;
  endTime: string;
  ageMix: CanonicalAgeMix;
  totalChildren: number;
  scheduledCaregivers: number;
  required: RequiredCaregiverResult;
  staffGap: number | null;
  status: ComplianceStatus;
  warnings: string[];
};

export type ComplianceResult = {
  schedule: ScheduleInput;
  intervals: ComplianceInterval[];
  warnings: string[];
  summary: {
    compliantIntervals: number;
    gapIntervals: number;
    needsReviewIntervals: number;
    noStandardsIntervals: number;
    maxStaffGap: number;
    maxChildren: number;
  };
};

export type CollapsedComplianceBlock = {
  startTime: string;
  endTime: string;
  status: ComplianceStatus;
  scheduledCaregivers: number;
  requiredCaregivers: number | null;
  staffGap: number | null;
  totalChildren: number;
  ageMix: CanonicalAgeMix;
  ruleLevel: RequiredCaregiverResult['ruleLevel'];
  warnings: string[];
};
