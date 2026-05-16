import type { AgeSource } from '../age/ageBuckets';
import type { RatioStandardSet } from '../standards/types';
import type { ScheduleInput } from '../compliance/types';

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export const WEEKDAYS: Weekday[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export type DayTimeRange = {
  arrivalTime: string;
  departureTime: string;
};

export type StudentDaySchedule = DayTimeRange & {
  isActive: boolean;
  note?: string;
};

export type StudentSchedule = Record<Weekday, StudentDaySchedule[]>;

export type StudentWeeklySchedule = {
  id: string;
  label: string;
  count: number;
  ageSource: AgeSource;
  schedules: Record<string, StudentSchedule>;
  activeScheduleId: string;
  notes?: string;
  isActive?: boolean;
};

export type StaffDaySchedule = {
  isActive: boolean;
  startTime: string;
  endTime: string;
  countsTowardRatio: boolean;
  note?: string;
};

export type StaffWeeklySchedule = {
  id: string;
  label: string;
  days: Record<Weekday, StaffDaySchedule[]>;
  notes?: string;
  isActive?: boolean;
};

export type RatioScheduleWeek = {
  id: string;
  weekLabel: string;
  weekStartDate: string; // YYYY-MM-DD
  openTime: string;
  closeTime: string;
  incrementMinutes: number;
  students: StudentWeeklySchedule[];
  staff: StaffWeeklySchedule[];
  standards: RatioStandardSet | null;
  notes?: string;
  verifiedStudentIds?: string[];
};

export type LoadedWeekCollection = {
  weeks: RatioScheduleWeek[];
  timeFormat?: '12h' | '24h';
};
