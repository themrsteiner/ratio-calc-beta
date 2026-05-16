import { useState, useEffect, useCallback } from 'react';
import { 
  RatioScheduleWeek, 
  LoadedWeekCollection, 
  Weekday, 
  WEEKDAYS,
  StudentWeeklySchedule,
  StaffWeeklySchedule,
  type StudentSchedule
} from '../../core/week/types';
import { createEmptyWeek, getInitialStudentSchedule, createInitialStaffDaySchedule } from '../../core/week/weekHelpers';

import { createSampleWeek } from '../sampleSchedule';

import { TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS } from '../../core/standards/builtInTexasLicensedChildCareHome';

const STORAGE_KEY = 'happyBabyRatioSchedule.loadedWeeks.v1';

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<LoadedWeekCollection>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Migration: Ensure all weeks have standards if they were previously null
        if (parsed.weeks) {
          parsed.weeks = parsed.weeks.map((w: RatioScheduleWeek) => ({
            ...w,
            standards: w.standards || TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS
          }));
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse stored workspace', e);
      }
    }
    return {
      weeks: [createSampleWeek(new Date().toISOString().slice(0, 10), 'Week 1')],
    };
  });

  const [activeWeekId, setActiveWeekId] = useState<string>(workspace.weeks[0]?.id || '');
  const [activeDay, setActiveDay] = useState<Weekday>('monday');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [workspace]);

  const activeWeek = workspace.weeks.find(w => w.id === activeWeekId) || workspace.weeks[0];

  const updateActiveWeek = useCallback((patch: Partial<RatioScheduleWeek>) => {
    setWorkspace(current => ({
      ...current,
      weeks: current.weeks.map(w => w.id === activeWeekId ? { ...w, ...patch } : w)
    }));
  }, [activeWeekId]);

  const addWeek = useCallback((mondayDate: string, label: string) => {
    const newWeek = createEmptyWeek(mondayDate, label);
    setWorkspace(current => ({
      ...current,
      weeks: [...current.weeks, newWeek]
    }));
    setActiveWeekId(newWeek.id);
  }, []);

  const duplicateWeek = useCallback((weekId: string) => {
    const week = workspace.weeks.find(w => w.id === weekId);
    if (!week) return;
    const newWeek = {
      ...week,
      id: crypto.randomUUID(),
      weekLabel: `${week.weekLabel} (Copy)`,
      students: week.students.map(s => ({ ...s, schedules: { ...s.schedules } })),
      staff: week.staff.map(s => ({ ...s, days: { ...s.days } }))
    };
    setWorkspace(current => ({
      ...current,
      weeks: [...current.weeks, newWeek]
    }));
    setActiveWeekId(newWeek.id);
  }, [workspace.weeks]);

  const removeWeek = useCallback((weekId: string) => {
    setWorkspace(current => {
      if (current.weeks.length <= 1) return current;
      const newWeeks = current.weeks.filter(w => w.id !== weekId);
      return { ...current, weeks: newWeeks };
    });
    if (activeWeekId === weekId) {
      setActiveWeekId(workspace.weeks.find(w => w.id !== weekId)?.id || '');
    }
  }, [activeWeekId, workspace.weeks]);

  const toggleWeekArchived = useCallback((weekId: string) => {
    setWorkspace((current) => ({
      ...current,
      weeks: current.weeks.map((w) =>
        w.id === weekId ? { ...w, isArchived: !w.isArchived } : w
      ),
    }));
  }, []);

  const addStudent = useCallback(() => {
    const defaultSchedule = getInitialStudentSchedule();
    const defaultId = 'default';
    const newStudent: StudentWeeklySchedule = {
      id: crypto.randomUUID(),
      label: 'New child/group',
      count: 1,
      ageSource: { type: 'manualAgeBucket', ageBucket: 'fourYearsAndOlder' },
      schedules: { [defaultId]: defaultSchedule },
      activeScheduleId: defaultId
    };
    updateActiveWeek({
      students: [...activeWeek.students, newStudent]
    });
  }, [activeWeek, updateActiveWeek]);

  const addBatchStudents = useCallback((names: string[], config: { ageSource: any, arrivalTime: string, departureTime: string }) => {
    const defaultId = 'default';
    const newStudents: StudentWeeklySchedule[] = names.map(name => ({
      id: crypto.randomUUID(),
      label: name.trim(),
      count: 1,
      ageSource: config.ageSource,
      schedules: {
        [defaultId]: WEEKDAYS.reduce((acc, day) => {
          acc[day] = [{ isActive: true, arrivalTime: config.arrivalTime, departureTime: config.departureTime }];
          return acc;
        }, {} as StudentSchedule)
      },
      activeScheduleId: defaultId
    }));
    updateActiveWeek({
      students: [...activeWeek.students, ...newStudents]
    });
  }, [activeWeek, updateActiveWeek]);

  const updateStudent = useCallback((studentId: string, patch: Partial<StudentWeeklySchedule>) => {
    updateActiveWeek({
      students: activeWeek.students.map(s => s.id === studentId ? { ...s, ...patch } : s)
    });
  }, [activeWeek, updateActiveWeek]);

  const updateStudentDay = useCallback((studentId: string, day: Weekday, patch: any) => {
    setWorkspace(current => {
      const weekIdx = current.weeks.findIndex(w => w.id === activeWeekId);
      if (weekIdx === -1) return current;
      const newWeeks = [...current.weeks];
      const week = { ...newWeeks[weekIdx] };
      week.students = week.students.map(s => {
        if (s.id !== studentId) return s;
        const newSchedules = { ...s.schedules };
        const activeSchedule = { ...newSchedules[s.activeScheduleId] };
        activeSchedule[day] = activeSchedule[day].map(sched => ({ ...sched, ...patch }));
        newSchedules[s.activeScheduleId] = activeSchedule;
        return { ...s, schedules: newSchedules };
      });
      newWeeks[weekIdx] = week;
      return { ...current, weeks: newWeeks };
    });
  }, [activeWeekId]);

  const removeStudent = useCallback((studentId: string) => {
    updateActiveWeek({
      students: activeWeek.students.filter(s => s.id !== studentId)
    });
  }, [activeWeek, updateActiveWeek]);

  const addStaff = useCallback(() => {
    const newStaff: StaffWeeklySchedule = {
      id: crypto.randomUUID(),
      label: 'New caregiver',
      days: {
        monday: createInitialStaffDaySchedule(),
        tuesday: createInitialStaffDaySchedule(),
        wednesday: createInitialStaffDaySchedule(),
        thursday: createInitialStaffDaySchedule(),
        friday: createInitialStaffDaySchedule(),
      }
    };
    updateActiveWeek({
      staff: [...activeWeek.staff, newStaff]
    });
  }, [activeWeek, updateActiveWeek]);

  const updateStaff = useCallback((staffId: string, patch: Partial<StaffWeeklySchedule>) => {
    updateActiveWeek({
      staff: activeWeek.staff.map(s => s.id === staffId ? { ...s, ...patch } : s)
    });
  }, [activeWeek, updateActiveWeek]);

  const updateStaffDay = useCallback((staffId: string, day: Weekday, patch: any) => {
    setWorkspace(current => {
      const weekIdx = current.weeks.findIndex(w => w.id === activeWeekId);
      if (weekIdx === -1) return current;
      const newWeeks = [...current.weeks];
      const week = { ...newWeeks[weekIdx] };
      week.staff = week.staff.map(s => {
        if (s.id !== staffId) return s;
        const newDays = { ...s.days };
        newDays[day] = newDays[day].map(sched => ({ ...sched, ...patch }));
        return { ...s, days: newDays };
      });
      newWeeks[weekIdx] = week;
      return { ...current, weeks: newWeeks };
    });
  }, [activeWeekId]);

  const removeStaff = useCallback((staffId: string) => {
    updateActiveWeek({
      staff: activeWeek.staff.filter(s => s.id !== staffId)
    });
  }, [activeWeek, updateActiveWeek]);

  return {
    workspace,
    setWorkspace,
    activeWeek,
    activeWeekId,
    setActiveWeekId,
    activeDay,
    setActiveDay,
    addWeek,
    duplicateWeek,
    removeWeek,
    toggleWeekArchived,
    updateActiveWeek,
    addStudent,
    addBatchStudents,
    updateStudent,
    updateStudentDay,
    removeStudent,
    addStaff,
    updateStaff,
    updateStaffDay,
    removeStaff,
  };
}
