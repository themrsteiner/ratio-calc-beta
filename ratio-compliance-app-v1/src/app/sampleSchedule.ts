import { TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS } from '../core/standards/builtInTexasLicensedChildCareHome';
import { RatioScheduleWeek, StudentSchedule, Weekday, WEEKDAYS } from '../core/week/types';
import { createEmptyWeek } from '../core/week/weekHelpers';

const createSchedule = (days: Partial<Record<Weekday, { in: string, out: string }[]>>): StudentSchedule => {
  return WEEKDAYS.reduce((acc, day) => {
    const times = days[day] || [];
    acc[day] = times.map(t => ({ isActive: true, arrivalTime: t.in, departureTime: t.out }));
    return acc;
  }, {} as StudentSchedule);
};

export function createSampleWeek(mondayDate: string, label: string): RatioScheduleWeek {
  const week = createEmptyWeek(mondayDate, label);
  week.standards = TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS;

  const mf730430 = createSchedule({
    monday: [{ in: '07:30', out: '16:30' }],
    tuesday: [{ in: '07:30', out: '16:30' }],
    wednesday: [{ in: '07:30', out: '16:30' }],
    thursday: [{ in: '07:30', out: '16:30' }],
    friday: [{ in: '07:30', out: '16:30' }],
  });

  const students = [
    { label: 'Elliott', dob: '2022-01-01', schedule: mf730430 },
    { label: 'Reese', dob: '2024-01-01', schedule: mf730430 },
    { label: 'Kaia', dob: '2023-01-01', schedule: mf730430 },
    { label: 'Cameron', dob: '2023-01-01', schedule: mf730430 },
    { label: 'Noah', dob: '2023-01-01', schedule: mf730430 },
    { label: 'McCoy', dob: '2024-01-01', schedule: createSchedule({ monday: [{ in: '09:00', out: '16:00' }], tuesday: [{ in: '09:00', out: '16:00' }], thursday: [{ in: '09:00', out: '16:00' }] }) },
    { label: 'Andres', dob: '2024-01-01', schedule: createSchedule({ monday: [{ in: '08:30', out: '12:30' }], tuesday: [{ in: '08:30', out: '12:30' }], wednesday: [{ in: '08:30', out: '12:30' }], thursday: [{ in: '08:30', out: '12:30' }], friday: [{ in: '08:30', out: '12:30' }] }) },
    { label: 'Nora', dob: '2025-01-01', schedule: createSchedule({ wednesday: [{ in: '07:30', out: '16:30' }] }) },
    { label: 'Carol', dob: '2025-01-01', schedule: createSchedule({ tuesday: [{ in: '07:30', out: '16:30' }], thursday: [{ in: '07:30', out: '16:30' }] }) }
  ];

  students.forEach(s => {
    week.students.push({
      id: crypto.randomUUID(),
      label: s.label,
      count: 1,
      ageSource: { type: 'dateOfBirth', dateOfBirth: s.dob },
      schedules: { default: s.schedule },
      activeScheduleId: 'default'
    });
  });

  week.students.push({
    id: crypto.randomUUID(),
    label: 'Rylie',
    count: 1,
    ageSource: { type: 'dateOfBirth', dateOfBirth: '2025-01-01' },
    schedules: {
      'Schedule A': createSchedule({ monday: [{ in: '07:30', out: '16:30' }], tuesday: [{ in: '07:30', out: '16:30' }], thursday: [{ in: '07:30', out: '16:30' }] }),
      'Schedule B': createSchedule({ monday: [{ in: '07:30', out: '16:30' }], wednesday: [{ in: '07:30', out: '16:30' }], friday: [{ in: '07:30', out: '16:30' }] })
    },
    activeScheduleId: 'Schedule A'
  });

  week.staff.push({
    id: crypto.randomUUID(),
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
