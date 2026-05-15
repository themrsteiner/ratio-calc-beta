import type { ScheduleInput, StudentEntry, StaffEntry } from '../compliance/types';
import type { RatioScheduleWeek, Weekday, WEEKDAYS } from './types';

/**
 * Converts a weekly schedule model into a daily schedule input
 * suitable for the existing compliance engine.
 */
export function buildDailyScheduleFromWeek(
  week: RatioScheduleWeek,
  day: Weekday
): ScheduleInput {
  const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(day);
  
  // Calculate the actual date for this weekday
  const startDate = new Date(week.weekStartDate);
  const targetDate = new Date(startDate);
  targetDate.setDate(startDate.getDate() + dayIndex);
  const dateStr = targetDate.toISOString().slice(0, 10);

  // Filter and map students active on this day
  const dailyStudents: StudentEntry[] = [];
  week.students.filter(s => s.isActive !== false).forEach((s) => {
    const activeSchedule = s.schedules[s.activeScheduleId];
    if (!activeSchedule) return;

    activeSchedule[day].forEach((schedule: any) => {
      if (schedule.isActive) {
        dailyStudents.push({
          id: `${s.id}-${schedule.arrivalTime}`,
          label: s.label,
          count: s.count,
          arrivalTime: schedule.arrivalTime,
          departureTime: schedule.departureTime,
          ageSource: s.ageSource,
        });
      }
    });
  });

  // Filter and map staff active on this day
  const dailyStaff: StaffEntry[] = [];
  week.staff.filter(s => s.isActive !== false).forEach((s) => {
    s.days[day].forEach((schedule) => {
      if (schedule.isActive) {
        dailyStaff.push({
          id: `${s.id}-${schedule.startTime}`,
          label: s.label,
          count: 1, // Currently assuming count 1 per staff entry in weekly model
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          countsTowardRatio: schedule.countsTowardRatio,
        });
      }
    });
  });

  return {
    scheduleName: `${week.weekLabel} - ${day.charAt(0).toUpperCase() + day.slice(1)}`,
    scheduleDate: dateStr,
    openTime: week.openTime,
    closeTime: week.closeTime,
    incrementMinutes: week.incrementMinutes,
    standards: week.standards,
    students: dailyStudents,
    staff: dailyStaff,
  };
}
