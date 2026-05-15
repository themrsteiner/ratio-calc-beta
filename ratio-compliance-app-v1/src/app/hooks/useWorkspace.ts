import { useState, useEffect, useCallback } from 'react';
import { 
  RatioScheduleWeek, 
  LoadedWeekCollection, 
  Weekday, 
  WEEKDAYS,
  StudentWeeklySchedule,
  StaffWeeklySchedule
} from '../../core/week/types';
import { createEmptyWeek, createInitialStudentDaySchedule, createInitialStaffDaySchedule } from '../../core/week/weekHelpers';
import { createSampleWeek } from '../sampleSchedule';

const STORAGE_KEY = 'happyBabyRatioSchedule.loadedWeeks.v1';

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<LoadedWeekCollection>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
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
  const [syncAcrossDays, setSyncAcrossDays] = useState(true);

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
      students: week.students.map(s => ({ ...s, days: { ...s.days } })),
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

  const addStudent = useCallback(() => {
    const newStudent: StudentWeeklySchedule = {
      id: crypto.randomUUID(),
      label: 'New child/group',
      count: 1,
      ageSource: { type: 'manualAgeBucket', ageBucket: 'fourYearsAndOlder' },
      days: {
        monday: createInitialStudentDaySchedule(),
        tuesday: createInitialStudentDaySchedule(),
        wednesday: createInitialStudentDaySchedule(),
        thursday: createInitialStudentDaySchedule(),
        friday: createInitialStudentDaySchedule(),
      }
    };
    updateActiveWeek({
      students: [...activeWeek.students, newStudent]
    });
  }, [activeWeek, updateActiveWeek]);

  const addBatchStudents = useCallback((names: string[], config: { ageSource: any, arrivalTime: string, departureTime: string }) => {
    const newStudents: StudentWeeklySchedule[] = names.map(name => ({
      id: crypto.randomUUID(),
      label: name.trim(),
      count: 1,
      ageSource: config.ageSource,
      days: {
        monday: [{ isActive: true, arrivalTime: config.arrivalTime, departureTime: config.departureTime }],
        tuesday: [{ isActive: true, arrivalTime: config.arrivalTime, departureTime: config.departureTime }],
        wednesday: [{ isActive: true, arrivalTime: config.arrivalTime, departureTime: config.departureTime }],
        thursday: [{ isActive: true, arrivalTime: config.arrivalTime, departureTime: config.departureTime }],
        friday: [{ isActive: true, arrivalTime: config.arrivalTime, departureTime: config.departureTime }],
      }
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
        const newDays = { ...s.days };
        if (syncAcrossDays) {
          WEEKDAYS.forEach(d => {
            newDays[d] = { ...newDays[d], ...patch };
          });
        } else {
          newDays[day] = { ...newDays[day], ...patch };
        }
        return { ...s, days: newDays };
      });
      newWeeks[weekIdx] = week;
      return { ...current, weeks: newWeeks };
    });
  }, [activeWeekId, syncAcrossDays]);

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
        if (syncAcrossDays) {
          WEEKDAYS.forEach(d => {
            newDays[d] = { ...newDays[d], ...patch };
          });
        } else {
          newDays[day] = { ...newDays[day], ...patch };
        }
        return { ...s, days: newDays };
      });
      newWeeks[weekIdx] = week;
      return { ...current, weeks: newWeeks };
    });
  }, [activeWeekId, syncAcrossDays]);

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
    syncAcrossDays,
    setSyncAcrossDays,
    addWeek,
    duplicateWeek,
    removeWeek,
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
