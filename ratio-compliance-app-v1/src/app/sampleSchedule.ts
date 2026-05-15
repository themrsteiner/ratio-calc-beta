import { TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS } from '../core/standards/builtInTexasLicensedChildCareHome';
import type { ScheduleInput } from '../core/compliance/types';

export const sampleSchedule: ScheduleInput = {
  scheduleName: 'Sample Licensed Child-Care Home Day',
  scheduleDate: new Date().toISOString().slice(0, 10),
  openTime: '07:00',
  closeTime: '18:00',
  incrementMinutes: 15,
  standards: TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS,
  students: [
    {
      id: crypto.randomUUID(),
      label: 'Infant A',
      count: 1,
      arrivalTime: '07:30',
      departureTime: '15:30',
      ageSource: { type: 'dateOfBirth', dateOfBirth: '2025-08-15' },
    },
    {
      id: crypto.randomUUID(),
      label: 'Toddler group',
      count: 4,
      arrivalTime: '08:00',
      departureTime: '16:00',
      ageSource: { type: 'manualAgeBucket', ageBucket: 'eighteenMonthsToThreeYears' },
      notes: 'Manual group entry for quick planning.',
    },
    {
      id: crypto.randomUUID(),
      label: 'Pre-K group',
      count: 6,
      arrivalTime: '08:30',
      departureTime: '17:00',
      ageSource: { type: 'manualAgeBucket', ageBucket: 'fourYearsAndOlder' },
    },
  ],
  staff: [
    {
      id: crypto.randomUUID(),
      label: 'Primary caregiver',
      count: 1,
      startTime: '07:00',
      endTime: '18:00',
      countsTowardRatio: true,
    },
    {
      id: crypto.randomUUID(),
      label: 'Assistant caregiver',
      count: 1,
      startTime: '08:30',
      endTime: '16:30',
      countsTowardRatio: true,
    },
  ],
};
