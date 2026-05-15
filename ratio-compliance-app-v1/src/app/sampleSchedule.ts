import { TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS } from '../core/standards/builtInTexasLicensedChildCareHome';
import { RatioScheduleWeek } from '../core/week/types';
import { createEmptyWeek, createInitialStudentDaySchedule, createInitialStaffDaySchedule } from '../core/week/weekHelpers';

export function createSampleWeek(mondayDate: string, label: string): RatioScheduleWeek {
  const week = createEmptyWeek(mondayDate, label);
  week.standards = TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS;
  
  const student1Id = crypto.randomUUID();
  week.students.push({
    id: student1Id,
    label: 'Infant A',
    count: 1,
    ageSource: { type: 'dateOfBirth', dateOfBirth: '2025-08-15' },
    days: {
      monday: [{ isActive: true, arrivalTime: '07:30', departureTime: '15:30' }],
      tuesday: [{ isActive: true, arrivalTime: '07:30', departureTime: '15:30' }],
      wednesday: [{ isActive: true, arrivalTime: '07:30', departureTime: '15:30' }],
      thursday: [{ isActive: true, arrivalTime: '07:30', departureTime: '15:30' }],
      friday: [{ isActive: true, arrivalTime: '07:30', departureTime: '15:30' }],
    }
  });

  const staff1Id = crypto.randomUUID();
  week.staff.push({
    id: staff1Id,
    label: 'Primary Caregiver',
    days: {
      monday: [{ isActive: true, startTime: '07:00', endTime: '18:00', countsTowardRatio: true }],
      tuesday: [{ isActive: true, startTime: '07:00', endTime: '18:00', countsTowardRatio: true }],
      wednesday: [{ isActive: true, startTime: '07:00', endTime: '18:00', countsTowardRatio: true }],
      thursday: [{ isActive: true, startTime: '07:00', endTime: '18:00', countsTowardRatio: true }],
      friday: [{ isActive: true, startTime: '07:00', endTime: '18:00', countsTowardRatio: true }],
    }
  });

  return week;
}
