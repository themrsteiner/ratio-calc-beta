import { TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS } from '../core/standards/builtInTexasLicensedChildCareHome';
import type { ScheduleInput, WeeklySchedule } from '../core/compliance/types';

export function createDefaultWeek(mondayDate: string, weekName: string): WeeklySchedule {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const studentIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
  const staffIds = [crypto.randomUUID(), crypto.randomUUID()];

  const days: ScheduleInput[] = dayNames.map((name, index) => {
    const date = new Date(mondayDate);
    date.setDate(date.getDate() + index);
    const dateStr = date.toISOString().slice(0, 10);

    return {
      scheduleName: `${weekName} - ${name}`,
      scheduleDate: dateStr,
      openTime: '07:00',
      closeTime: '18:00',
      incrementMinutes: 15,
      standards: TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS,
      students: [
        {
          id: studentIds[0],
          label: 'Infant A',
          count: 1,
          arrivalTime: '07:30',
          departureTime: '15:30',
          ageSource: { type: 'dateOfBirth', dateOfBirth: '2025-08-15' },
        },
        {
          id: studentIds[1],
          label: 'Toddler group',
          count: 4,
          arrivalTime: '08:00',
          departureTime: '16:00',
          ageSource: { type: 'manualAgeBucket', ageBucket: 'eighteenMonthsToThreeYears' },
          notes: 'Manual group entry for quick planning.',
        },
        {
          id: studentIds[2],
          label: 'Pre-K group',
          count: 6,
          arrivalTime: '08:30',
          departureTime: '17:00',
          ageSource: { type: 'manualAgeBucket', ageBucket: 'fourYearsAndOlder' },
        },
      ],
      staff: [
        {
          id: staffIds[0],
          label: 'Primary caregiver',
          count: 1,
          startTime: '07:00',
          endTime: '18:00',
          countsTowardRatio: true,
        },
        {
          id: staffIds[1],
          label: 'Assistant caregiver',
          count: 1,
          startTime: '08:30',
          endTime: '16:30',
          countsTowardRatio: true,
        },
      ],
    };
  });

  return {
    id: crypto.randomUUID(),
    weekName,
    mondayDate,
    days,
  };
}

export const sampleSchedule = createDefaultWeek(new Date().toISOString().slice(0, 10), 'Sample Week').days[0];
