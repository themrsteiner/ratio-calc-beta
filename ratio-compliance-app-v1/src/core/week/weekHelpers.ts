import { TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS } from '../standards/builtInTexasLicensedChildCareHome';
import { 
  type StudentSchedule, 
  type Weekday, 
  type RatioScheduleWeek, 
  WEEKDAYS, 
  type StudentWeeklySchedule, 
  type StudentDaySchedule, 
  type StaffWeeklySchedule, 
  type StaffDaySchedule 
} from './types';

export function getDayDate(mondayDate: string, day: Weekday): string {
  const dayIndex = WEEKDAYS.indexOf(day);
  const date = new Date(mondayDate);
  date.setDate(date.getDate() + dayIndex);
  return date.toISOString().slice(0, 10);
}

export function createEmptyWeek(mondayDate: string, label: string): RatioScheduleWeek {
  return {
    id: crypto.randomUUID(),
    weekLabel: label,
    weekStartDate: mondayDate,
    openTime: '07:00',
    closeTime: '18:00',
    incrementMinutes: 15,
    students: [],
    staff: [],
    standards: TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS,
  };
}

export function getInitialStudentSchedule(): StudentSchedule {
  return WEEKDAYS.reduce((acc, day) => {
    acc[day] = [{
      isActive: true,
      arrivalTime: '08:00',
      departureTime: '16:00',
    }];
    return acc;
  }, {} as StudentSchedule);
}

export function createInitialStaffDaySchedule(): StaffDaySchedule[] {
  return [{
    isActive: true,
    startTime: '07:00',
    endTime: '18:00',
    countsTowardRatio: true,
  }];
}
