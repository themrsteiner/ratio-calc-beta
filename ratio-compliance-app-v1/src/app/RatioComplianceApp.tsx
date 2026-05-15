import { useMemo, useRef, useState } from 'react';
import { calculateCompliance } from '../core/compliance/calculateCompliance';
import { collapseComplianceIntervals } from '../core/compliance/collapseIntervals';
import type { ScheduleInput, StaffEntry, StudentEntry, Workspace, WeeklySchedule } from '../core/compliance/types';
import {
  downloadTextFile,
  exportComplianceCsv,
  exportPrintableHtml,
  exportReadableScript,
  exportScheduleJson,
  exportWorkspaceJson,
  humanizeRuleLevel,
  humanizeStatus,
  importScheduleJson,
  importWorkspaceJson,
} from '../core/export/exporters';
import { AGE_BUCKET_LABELS, type AgeBucket } from '../core/standards/types';
import { TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS } from '../core/standards/builtInTexasLicensedChildCareHome';
import { formatTime } from '../core/time/time';
import { createDefaultWeek, sampleSchedule } from './sampleSchedule';

const AGE_BUCKETS: AgeBucket[] = [
  'birthTo17Months',
  'eighteenMonthsToThreeYears',
  'fourYearsAndOlder',
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function RatioComplianceApp() {
  const [workspace, setWorkspace] = useState<Workspace>(() => ({
    weeks: [createDefaultWeek(new Date().toISOString().slice(0, 10), 'Week 1')],
  }));
  const [activeWeekId, setActiveWeekId] = useState<string>(workspace.weeks[0].id);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [syncAcrossDays, setSyncAcrossDays] = useState(true);

  const [showStandards, setShowStandards] = useState(false);
  const importRef = useRef<HTMLInputElement | null>(null);
  const standardsImportRef = useRef<HTMLInputElement | null>(null);
  const workspaceImportRef = useRef<HTMLInputElement | null>(null);

  const activeWeek = useMemo(() => 
    workspace.weeks.find(w => w.id === activeWeekId) || workspace.weeks[0]
  , [workspace.weeks, activeWeekId]);

  const schedule = activeWeek.days[activeDayIndex];

  const result = useMemo(() => calculateCompliance(schedule), [schedule]);
  const collapsedBlocks = useMemo(
    () => collapseComplianceIntervals(result.intervals),
    [result.intervals],
  );

  function patchSchedule(patch: Partial<ScheduleInput>, forceAllDays = false) {
    const shouldSync = syncAcrossDays || forceAllDays;
    setWorkspace((current) => {
      const weekIndex = current.weeks.findIndex((w) => w.id === activeWeekId);
      if (weekIndex === -1) return current;

      const newWeeks = [...current.weeks];
      const week = { ...newWeeks[weekIndex] };
      const newDays = [...week.days];

      if (shouldSync) {
        week.days = newDays.map((day, idx) => {
          // Don't sync date or name if they are day-specific
          const filteredPatch = { ...patch };
          if (idx !== activeDayIndex) {
            delete filteredPatch.scheduleDate;
            delete filteredPatch.scheduleName;
          }
          return { ...day, ...filteredPatch };
        });
      } else {
        newDays[activeDayIndex] = { ...newDays[activeDayIndex], ...patch };
        week.days = newDays;
      }

      newWeeks[weekIndex] = week;
      return { ...current, weeks: newWeeks };
    });
  }

  function addStudent() {
    const newStudent: StudentEntry = {
      id: crypto.randomUUID(),
      label: 'New child/group',
      count: 1,
      arrivalTime: schedule.openTime,
      departureTime: schedule.closeTime,
      ageSource: { type: 'manualAgeBucket', ageBucket: 'fourYearsAndOlder' },
    };

    setWorkspace((current) => {
      const weekIndex = current.weeks.findIndex((w) => w.id === activeWeekId);
      if (weekIndex === -1) return current;

      const newWeeks = [...current.weeks];
      const week = { ...newWeeks[weekIndex] };
      
      if (syncAcrossDays) {
        week.days = week.days.map(day => ({
          ...day,
          students: [...day.students, { ...newStudent }]
        }));
      } else {
        const newDays = [...week.days];
        newDays[activeDayIndex] = {
          ...newDays[activeDayIndex],
          students: [...newDays[activeDayIndex].students, newStudent]
        };
        week.days = newDays;
      }

      newWeeks[weekIndex] = week;
      return { ...current, weeks: newWeeks };
    });
  }

  function updateStudent(id: string, patch: Partial<StudentEntry>) {
    setWorkspace((current) => {
      const weekIndex = current.weeks.findIndex((w) => w.id === activeWeekId);
      if (weekIndex === -1) return current;

      const newWeeks = [...current.weeks];
      const week = { ...newWeeks[weekIndex] };
      
      if (syncAcrossDays) {
        week.days = week.days.map(day => ({
          ...day,
          students: day.students.map(s => s.id === id ? { ...s, ...patch } : s)
        }));
      } else {
        const newDays = [...week.days];
        newDays[activeDayIndex] = {
          ...newDays[activeDayIndex],
          students: newDays[activeDayIndex].students.map(s => s.id === id ? { ...s, ...patch } : s)
        };
        week.days = newDays;
      }

      newWeeks[weekIndex] = week;
      return { ...current, weeks: newWeeks };
    });
  }

  function removeStudent(id: string) {
    setWorkspace((current) => {
      const weekIndex = current.weeks.findIndex((w) => w.id === activeWeekId);
      if (weekIndex === -1) return current;

      const newWeeks = [...current.weeks];
      const week = { ...newWeeks[weekIndex] };
      
      if (syncAcrossDays) {
        week.days = week.days.map(day => ({
          ...day,
          students: day.students.filter(s => s.id !== id)
        }));
      } else {
        const newDays = [...week.days];
        newDays[activeDayIndex] = {
          ...newDays[activeDayIndex],
          students: newDays[activeDayIndex].students.filter(s => s.id !== id)
        };
        week.days = newDays;
      }

      newWeeks[weekIndex] = week;
      return { ...current, weeks: newWeeks };
    });
  }

  function addStaff() {
    const newStaff: StaffEntry = {
      id: crypto.randomUUID(),
      label: 'New caregiver',
      count: 1,
      startTime: schedule.openTime,
      endTime: schedule.closeTime,
      countsTowardRatio: true,
    };

    setWorkspace((current) => {
      const weekIndex = current.weeks.findIndex((w) => w.id === activeWeekId);
      if (weekIndex === -1) return current;

      const newWeeks = [...current.weeks];
      const week = { ...newWeeks[weekIndex] };
      
      if (syncAcrossDays) {
        week.days = week.days.map(day => ({
          ...day,
          staff: [...day.staff, { ...newStaff }]
        }));
      } else {
        const newDays = [...week.days];
        newDays[activeDayIndex] = {
          ...newDays[activeDayIndex],
          staff: [...newDays[activeDayIndex].staff, newStaff]
        };
        week.days = newDays;
      }

      newWeeks[weekIndex] = week;
      return { ...current, weeks: newWeeks };
    });
  }

  function updateStaff(id: string, patch: Partial<StaffEntry>) {
    setWorkspace((current) => {
      const weekIndex = current.weeks.findIndex((w) => w.id === activeWeekId);
      if (weekIndex === -1) return current;

      const newWeeks = [...current.weeks];
      const week = { ...newWeeks[weekIndex] };
      
      if (syncAcrossDays) {
        week.days = week.days.map(day => ({
          ...day,
          staff: day.staff.map(s => s.id === id ? { ...s, ...patch } : s)
        }));
      } else {
        const newDays = [...week.days];
        newDays[activeDayIndex] = {
          ...newDays[activeDayIndex],
          staff: newDays[activeDayIndex].staff.map(s => s.id === id ? { ...s, ...patch } : s)
        };
        week.days = newDays;
      }

      newWeeks[weekIndex] = week;
      return { ...current, weeks: newWeeks };
    });
  }

  function removeStaff(id: string) {
    setWorkspace((current) => {
      const weekIndex = current.weeks.findIndex((w) => w.id === activeWeekId);
      if (weekIndex === -1) return current;

      const newWeeks = [...current.weeks];
      const week = { ...newWeeks[weekIndex] };
      
      if (syncAcrossDays) {
        week.days = week.days.map(day => ({
          ...day,
          staff: day.staff.filter(s => s.id !== id)
        }));
      } else {
        const newDays = [...week.days];
        newDays[activeDayIndex] = {
          ...newDays[activeDayIndex],
          staff: newDays[activeDayIndex].staff.filter(s => s.id !== id)
        };
        week.days = newDays;
      }

      newWeeks[weekIndex] = week;
      return { ...current, weeks: newWeeks };
    });
  }

  function addWeek() {
    const lastWeek = workspace.weeks[workspace.weeks.length - 1];
    const lastDate = new Date(lastWeek.mondayDate);
    lastDate.setDate(lastDate.getDate() + 7);
    const newWeek = createDefaultWeek(
      lastDate.toISOString().slice(0, 10),
      `Week ${workspace.weeks.length + 1}`
    );
    setWorkspace(current => ({
      ...current,
      weeks: [...current.weeks, newWeek]
    }));
    setActiveWeekId(newWeek.id);
  }

  function duplicateWeek(weekId: string) {
    const week = workspace.weeks.find(w => w.id === weekId);
    if (!week) return;

    const newWeek = {
      ...week,
      id: crypto.randomUUID(),
      weekName: `${week.weekName} (Copy)`,
      days: week.days.map(day => ({
        ...day,
        students: day.students.map(s => ({ ...s })),
        staff: day.staff.map(s => ({ ...s }))
      }))
    };

    setWorkspace(current => ({
      ...current,
      weeks: [...current.weeks, newWeek]
    }));
    setActiveWeekId(newWeek.id);
  }

  function removeWeek(weekId: string) {
    if (workspace.weeks.length <= 1) return;
    setWorkspace(current => ({
      ...current,
      weeks: current.weeks.filter(w => w.id !== weekId)
    }));
    if (activeWeekId === weekId) {
      setActiveWeekId(workspace.weeks.find(w => w.id !== weekId)!.id);
    }
  }

  async function handleImportFile(file: File) {
    const text = await file.text();
    const imported = importScheduleJson(text);
    // For now, importing a single day replaces the active day
    patchSchedule(imported, false);
  }

  async function handleImportStandardsFile(file: File) {
    const text = await file.text();
    const standards = JSON.parse(text) as ScheduleInput['standards'];
    if (!standards || !Array.isArray(standards.oneCaregiverRows) || !Array.isArray(standards.twoCaregiverRows)) {
      window.alert('That file does not look like a RatioStandardSet JSON file.');
      return;
    }
    patchSchedule({ standards }, true);
  }

  async function handleImportWorkspace(file: File) {
    const text = await file.text();
    try {
      const imported = importWorkspaceJson(text);
      setWorkspace(imported);
      if (imported.weeks.length > 0) {
        setActiveWeekId(imported.weeks[0].id);
        setActiveDayIndex(0);
      }
    } catch (e) {
      window.alert('Failed to import workspace: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  return (
    <div className="appLayout">
      <aside className="sidebar">
        <div className="sidebarHeader">
          <h3>Weekly schedules</h3>
          <button className="secondaryButton" onClick={addWeek}>+ Week</button>
        </div>
        <ul className="weekList">
          {workspace.weeks.map(week => (
            <li 
              key={week.id} 
              className={activeWeekId === week.id ? 'active' : ''}
              onClick={() => setActiveWeekId(week.id)}
            >
              <div className="weekItemInfo">
                <span className="weekName">{week.weekName}</span>
                <span className="weekDate">{week.mondayDate}</span>
              </div>
              <div className="weekItemActions">
                <button 
                  title="Duplicate" 
                  onClick={(e) => { e.stopPropagation(); duplicateWeek(week.id); }}
                >
                  D
                </button>
                <button 
                  title="Remove" 
                  className="danger"
                  onClick={(e) => { e.stopPropagation(); removeWeek(week.id); }}
                >
                  &times;
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="sidebarFooter">
          <button 
            className="secondaryButton fullWidth"
            onClick={() => downloadTextFile('workspace.json', exportWorkspaceJson(workspace), 'application/json')}
          >
            Export Workspace
          </button>
          <button 
            className="secondaryButton fullWidth"
            onClick={() => workspaceImportRef.current?.click()}
          >
            Import Workspace
          </button>
          <input
            ref={workspaceImportRef}
            type="file"
            accept="application/json,.json"
            className="hiddenFile"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleImportWorkspace(file);
              event.currentTarget.value = '';
            }}
          />
        </div>
      </aside>

      <div className="appShell">
        <header className="hero">
          <div>
            <p className="eyebrow">Ratio Compliance Planner · MVP v0.1</p>
            <h1>Age-aware caregiver ratio planner</h1>
            <p className="heroText">
              Plan child attendance, caregiver schedules, and compliance against loaded
              standards. Birthday-based age calculation is preferred.
            </p>
          </div>
          <div className="heroCard">
            <div className="metric">
              <span>Max children</span>
              <strong>{result.summary.maxChildren}</strong>
            </div>
            <div className="metric">
              <span>Gap intervals</span>
              <strong>{result.summary.gapIntervals}</strong>
            </div>
            <div className="metric">
              <span>Max staff gap</span>
              <strong>{result.summary.maxStaffGap}</strong>
            </div>
          </div>
        </header>

        <nav className="dayNav">
          {WEEKDAYS.map((name, index) => (
            <button
              key={name}
              className={activeDayIndex === index ? 'active' : ''}
              onClick={() => setActiveDayIndex(index)}
            >
              {name}
            </button>
          ))}
          <div className="syncToggle">
            <label>
              <input 
                type="checkbox" 
                checked={syncAcrossDays} 
                onChange={e => setSyncAcrossDays(e.target.checked)} 
              />
              Sync changes across week
            </label>
          </div>
        </nav>

        <main className="contentGrid">
          <section className="panel wide">
            <div className="panelHeader">
              <div>
                <h2>Schedule setup: {WEEKDAYS[activeDayIndex]}</h2>
                <p>Schedule date is required for birthday-based age buckets.</p>
              </div>
              <div className="buttonRow">
                <button
                  type="button"
                  className="secondaryButton"
                  onClick={() => patchSchedule(sampleSchedule, true)}
                >
                  Reset sample
                </button>
                <button
                  type="button"
                  className="secondaryButton"
                  onClick={() => importRef.current?.click()}
                >
                  Import JSON
                </button>
                <input
                  ref={importRef}
                  type="file"
                  accept="application/json,.json"
                  className="hiddenFile"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleImportFile(file);
                    event.currentTarget.value = '';
                  }}
                />
              </div>
            </div>

            <div className="formGrid fiveCols">
              <label>
                Week name
                <input
                  value={activeWeek.weekName}
                  onChange={(event) => {
                    setWorkspace(current => {
                      const newWeeks = [...current.weeks];
                      const weekIdx = newWeeks.findIndex(w => w.id === activeWeekId);
                      if (weekIdx !== -1) {
                        newWeeks[weekIdx] = { ...newWeeks[weekIdx], weekName: event.target.value };
                      }
                      return { ...current, weeks: newWeeks };
                    });
                  }}
                />
              </label>
              <label>
                Schedule date
                <input
                  type="date"
                  value={schedule.scheduleDate}
                  onChange={(event) => patchSchedule({ scheduleDate: event.target.value })}
                />
              </label>
              <label>
                Open
                <input
                  type="time"
                  value={schedule.openTime}
                  onChange={(event) => patchSchedule({ openTime: event.target.value })}
                />
              </label>
              <label>
                Close
                <input
                  type="time"
                  value={schedule.closeTime}
                  onChange={(event) => patchSchedule({ closeTime: event.target.value })}
                />
              </label>
              <label>
                Increment
                <select
                  value={schedule.incrementMinutes}
                  onChange={(event) => patchSchedule({ incrementMinutes: Number(event.target.value) })}
                >
                  <option value={5}>5 min</option>
                  <option value={10}>10 min</option>
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                </select>
              </label>
            </div>
          </section>

        <section className="panel wide standardsPanel">
          <div className="panelHeader">
            <div>
              <h2>Standards</h2>
              <p>{schedule.standards?.label ?? 'No standards loaded'}</p>
            </div>
            <div className="buttonRow">
              <button
                type="button"
                className="secondaryButton"
                onClick={() => patchSchedule({ standards: null })}
              >
                Clear standards
              </button>
              <button
                type="button"
                className="primaryButton"
                onClick={() => patchSchedule({ standards: TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS })}
              >
                Load Texas home standards
              </button>
              <button
                type="button"
                className="secondaryButton"
                onClick={() => standardsImportRef.current?.click()}
              >
                Import standards JSON
              </button>
              <button
                type="button"
                className="secondaryButton"
                disabled={!schedule.standards}
                onClick={() => {
                  if (schedule.standards) {
                    downloadTextFile('ratio-standards.json', JSON.stringify(schedule.standards, null, 2), 'application/json');
                  }
                }}
              >
                Export standards JSON
              </button>
              <input
                ref={standardsImportRef}
                type="file"
                accept="application/json,.json"
                className="hiddenFile"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleImportStandardsFile(file);
                  event.currentTarget.value = '';
                }}
              />
              <button
                type="button"
                className="secondaryButton"
                onClick={() => setShowStandards((value) => !value)}
              >
                {showStandards ? 'Hide table' : 'Show table'}
              </button>
            </div>
          </div>

          {!schedule.standards && (
            <div className="warningBox strong">
              No ratio standards are configured. The app will accept schedule data,
              but it will not claim compliance until standards are loaded or imported as intake.
            </div>
          )}

          {showStandards && schedule.standards && <StandardsTables />}
        </section>

        <section className="panel wide">
          <div className="panelHeader">
            <div>
              <h2>Children / student groups</h2>
              <p>Use date of birth whenever possible. Manual age modes are planning shortcuts.</p>
            </div>
            <button type="button" className="primaryButton" onClick={addStudent}>
              Add child/group
            </button>
          </div>

          <div className="warningBox">
            Manual category and static age entries do not automatically roll forward.
            Example: if a child ages into a new category tomorrow, today’s manual output may not be true tomorrow.
          </div>

          <div className="tableWrap">
            <table className="dataTable">
              <thead>
                <tr>
                  <th>Name / group</th>
                  <th>Count</th>
                  <th>Age input</th>
                  <th>DOB / age / category</th>
                  <th>Arrival</th>
                  <th>Departure</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {schedule.students.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    onUpdate={(patch) => updateStudent(student.id, patch)}
                    onRemove={() => removeStudent(student.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel wide">
          <div className="panelHeader">
            <div>
              <h2>Caregiver schedule</h2>
              <p>Only rows marked as counting toward ratio are included in compliance.</p>
            </div>
            <button type="button" className="primaryButton" onClick={addStaff}>
              Add caregiver
            </button>
          </div>

          <div className="tableWrap">
            <table className="dataTable">
              <thead>
                <tr>
                  <th>Caregiver / group</th>
                  <th>Count</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Counts?</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {schedule.staff.map((staff) => (
                  <StaffRow
                    key={staff.id}
                    staff={staff}
                    onUpdate={(patch) => updateStaff(staff.id, patch)}
                    onRemove={() => removeStaff(staff.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel wide">
          <div className="panelHeader">
            <div>
              <h2>Compliance timeline</h2>
              <p>Collapsed blocks merge adjacent intervals with identical compliance results.</p>
            </div>
            <ExportButtons result={result} schedule={schedule} />
          </div>

          {result.warnings.length > 0 && (
            <div className="warningStack">
              {[...new Set(result.warnings)].map((warning) => (
                <div className="warningBox" key={warning}>{warning}</div>
              ))}
            </div>
          )}

          <div className="tableWrap">
            <table className="dataTable timelineTable">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>{AGE_BUCKET_LABELS.birthTo17Months}</th>
                  <th>{AGE_BUCKET_LABELS.eighteenMonthsToThreeYears}</th>
                  <th>{AGE_BUCKET_LABELS.fourYearsAndOlder}</th>
                  <th>Total</th>
                  <th>Scheduled</th>
                  <th>Required</th>
                  <th>Rule</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {collapsedBlocks.map((block) => (
                  <tr key={`${block.startTime}-${block.endTime}`} className={`statusRow ${block.status}`}>
                    <td>{formatTime(block.startTime)} - {formatTime(block.endTime)}</td>
                    <td>{block.ageMix.birthTo17Months}</td>
                    <td>{block.ageMix.eighteenMonthsToThreeYears}</td>
                    <td>{block.ageMix.fourYearsAndOlder}</td>
                    <td>{block.totalChildren}</td>
                    <td>{block.scheduledCaregivers}</td>
                    <td>{block.requiredCaregivers ?? 'Review'}</td>
                    <td>{humanizeRuleLevel(block.ruleLevel)}</td>
                    <td>{humanizeStatus(block.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  </div>
  );
}

function StudentRow({
  student,
  onUpdate,
  onRemove,
}: {
  student: StudentEntry;
  onUpdate: (patch: Partial<StudentEntry>) => void;
  onRemove: () => void;
}) {
  const source = student.ageSource;

  return (
    <tr>
      <td>
        <input
          value={student.label}
          onChange={(event) => onUpdate({ label: event.target.value })}
        />
      </td>
      <td>
        <input
          type="number"
          min={1}
          value={student.count}
          onChange={(event) => onUpdate({ count: Number(event.target.value) })}
        />
      </td>
      <td>
        <select
          value={source.type}
          onChange={(event) => {
            const nextType = event.target.value;
            if (nextType === 'dateOfBirth') {
              onUpdate({ count: 1, ageSource: { type: 'dateOfBirth', dateOfBirth: '2022-01-01' } });
            } else if (nextType === 'ageInMonths') {
              onUpdate({ ageSource: { type: 'ageInMonths', ageInMonths: 48 } });
            } else {
              onUpdate({ ageSource: { type: 'manualAgeBucket', ageBucket: 'fourYearsAndOlder' } });
            }
          }}
        >
          <option value="dateOfBirth">Date of birth</option>
          <option value="ageInMonths">Static age</option>
          <option value="manualAgeBucket">Manual bucket</option>
        </select>
      </td>
      <td>
        {source.type === 'dateOfBirth' && (
          <input
            type="date"
            value={source.dateOfBirth}
            onChange={(event) => onUpdate({ ageSource: { ...source, dateOfBirth: event.target.value } })}
          />
        )}
        {source.type === 'ageInMonths' && (
          <div className="inlineField">
            <input
              type="number"
              min={0}
              value={source.ageInMonths}
              onChange={(event) => onUpdate({ ageSource: { ...source, ageInMonths: Number(event.target.value) } })}
            />
            <span>months</span>
          </div>
        )}
        {source.type === 'manualAgeBucket' && (
          <select
            value={source.ageBucket}
            onChange={(event) => onUpdate({ ageSource: { ...source, ageBucket: event.target.value as AgeBucket } })}
          >
            {AGE_BUCKETS.map((bucket) => (
              <option key={bucket} value={bucket}>{AGE_BUCKET_LABELS[bucket]}</option>
            ))}
          </select>
        )}
      </td>
      <td>
        <input
          type="time"
          value={student.arrivalTime}
          onChange={(event) => onUpdate({ arrivalTime: event.target.value })}
        />
      </td>
      <td>
        <input
          type="time"
          value={student.departureTime}
          onChange={(event) => onUpdate({ departureTime: event.target.value })}
        />
      </td>
      <td>
        <button type="button" className="dangerButton" onClick={onRemove}>Remove</button>
      </td>
    </tr>
  );
}

function StaffRow({
  staff,
  onUpdate,
  onRemove,
}: {
  staff: StaffEntry;
  onUpdate: (patch: Partial<StaffEntry>) => void;
  onRemove: () => void;
}) {
  return (
    <tr>
      <td>
        <input
          value={staff.label}
          onChange={(event) => onUpdate({ label: event.target.value })}
        />
      </td>
      <td>
        <input
          type="number"
          min={1}
          value={staff.count}
          onChange={(event) => onUpdate({ count: Number(event.target.value) })}
        />
      </td>
      <td>
        <input
          type="time"
          value={staff.startTime}
          onChange={(event) => onUpdate({ startTime: event.target.value })}
        />
      </td>
      <td>
        <input
          type="time"
          value={staff.endTime}
          onChange={(event) => onUpdate({ endTime: event.target.value })}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={staff.countsTowardRatio}
          onChange={(event) => onUpdate({ countsTowardRatio: event.target.checked })}
          aria-label="Counts toward ratio"
        />
      </td>
      <td>
        <button type="button" className="dangerButton" onClick={onRemove}>Remove</button>
      </td>
    </tr>
  );
}

function ExportButtons({ result, schedule }: { result: ReturnType<typeof calculateCompliance>; schedule: ScheduleInput }) {
  const baseName = safeFilename(schedule.scheduleName || 'ratio-compliance');

  return (
    <div className="buttonRow exportButtons">
      <button
        type="button"
        className="secondaryButton"
        onClick={() => downloadTextFile(`${baseName}.json`, exportScheduleJson(schedule), 'application/json')}
      >
        Export JSON
      </button>
      <button
        type="button"
        className="secondaryButton"
        onClick={() => downloadTextFile(`${baseName}-compliance.csv`, exportComplianceCsv(result), 'text/csv')}
      >
        Export CSV
      </button>
      <button
        type="button"
        className="secondaryButton"
        onClick={() => downloadTextFile(`${baseName}-staffing-script.txt`, exportReadableScript(result), 'text/plain')}
      >
        Export script
      </button>
      <button
        type="button"
        className="secondaryButton"
        onClick={() => downloadTextFile(`${baseName}-printable-report.html`, exportPrintableHtml(result), 'text/html')}
      >
        Export HTML
      </button>
    </div>
  );
}

function StandardsTables() {
  const standards = TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS;

  return (
    <div className="standardsGrid">
      <div>
        <h3>One caregiver</h3>
        <table className="dataTable compactTable">
          <thead>
            <tr>
              <th>0-17mo</th>
              <th>18mo-3yr</th>
              <th>4yr+</th>
              <th>Max</th>
            </tr>
          </thead>
          <tbody>
            {standards.oneCaregiverRows.map((row, index) => (
              <tr key={index}>
                <td>{row.birthTo17Months}</td>
                <td>{row.eighteenMonthsToThreeYears}</td>
                <td>{row.fourYearsAndOlder}</td>
                <td>{row.maxChildren}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3>Two caregivers</h3>
        <table className="dataTable compactTable">
          <thead>
            <tr>
              <th>0-17mo</th>
              <th>18mo+</th>
              <th>Max</th>
            </tr>
          </thead>
          <tbody>
            {standards.twoCaregiverRows.map((row, index) => (
              <tr key={index}>
                <td>{row.zeroTo17Months}</td>
                <td>{row.eighteenMonthsAndOlder}</td>
                <td>{row.maxChildren}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function safeFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'ratio-compliance';
}
