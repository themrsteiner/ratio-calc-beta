import { useMemo, useState } from 'react';
import { calculateCompliance } from '../core/compliance/calculateCompliance';
import { collapseComplianceIntervals } from '../core/compliance/collapseIntervals';
import { buildDailyScheduleFromWeek } from '../core/week/buildDailyScheduleFromWeek';
import { summarizeDay } from '../core/week/summarizeDay';
import { summarizeWeek } from '../core/week/summarizeWeek';
import { Weekday, WEEKDAYS } from '../core/week/types';
import {
  downloadTextFile,
} from '../core/export/exporters';
import { exportWorkspaceJson, importWorkspaceJson } from '../core/export/workspaceExporters';
import { TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS } from '../core/standards/builtInTexasLicensedChildCareHome';

import { useWorkspace } from './hooks/useWorkspace';
import { WeekManager } from '../ui/sidebar/WeekManager';
import { DayNavigator } from '../ui/nav/DayNavigator';
import { SummaryCards } from '../ui/dashboard/SummaryCards';
import { WeekOverview } from '../ui/nav/WeekOverview';
import { WeeklyStudentEditor } from '../ui/editor/WeeklyStudentEditor';
import { WeeklyStaffEditor } from '../ui/editor/WeeklyStaffEditor';
import { TexasStandardsTable } from '../ui/dashboard/TexasStandardsTable';
import { AgeVerificationModal } from '../ui/dashboard/AgeVerificationModal';
import { DailyAggregateTimeline } from '../ui/dashboard/DailyAggregateTimeline';
import { CollapsedIntervalTable } from '../ui/dashboard/CollapsedIntervalTable';

import { createSampleWeek } from './sampleSchedule';

export function RatioComplianceApp() {
  const {
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
  } = useWorkspace();

  const unverifiedStudents = useMemo(() => 
    activeWeek.students.filter(s => 
      s.ageSource.type === 'manualAgeBucket' && 
      !(activeWeek.verifiedStudentIds || []).includes(s.id)
    ),
    [activeWeek]
  );

  const handleVerify = (updates: { id: string, dob?: string, bucket?: string }[]) => {
    const verifiedIds = [...(activeWeek.verifiedStudentIds || [])];
    updates.forEach(u => {
      verifiedIds.push(u.id);
      if (u.dob) {
        updateStudent(u.id, { ageSource: { type: 'dateOfBirth', dateOfBirth: u.dob } });
      } else if (u.bucket) {
        updateStudent(u.id, { ageSource: { type: 'manualAgeBucket', ageBucket: u.bucket as any } });
      }
    });
    updateActiveWeek({ verifiedStudentIds: verifiedIds });
  };

  const [verifiedWarnings, setVerifiedWarnings] = useState<boolean>(false);

  const handleResetSample = () => {
    const sample = createSampleWeek(new Date().toISOString().slice(0, 10), 'Sample Week');
    setWorkspace(current => ({
      ...current,
      weeks: current.weeks.map(w => w.id === activeWeekId ? sample : w)
    }));
  };

  const dailyResults = useMemo(() => {
    const results: Record<string, any> = {};
    WEEKDAYS.forEach(day => {
      const schedule = buildDailyScheduleFromWeek(activeWeek, day);
      results[day] = calculateCompliance(schedule);
    });
    return results;
  }, [activeWeek]);

  const daySummaries = useMemo(() => {
    const summaries: Record<string, any> = {};
    WEEKDAYS.forEach(day => {
      summaries[day] = summarizeDay(dailyResults[day]);
    });
    return summaries;
  }, [dailyResults]);

  const activeDayResult = dailyResults[activeDay];
  console.log('Daily Warnings:', activeDayResult.warnings);
  const activeDaySummary = daySummaries[activeDay];
  const weekSummary = useMemo(() => summarizeWeek(daySummaries), [daySummaries]);

  const collapsedBlocks = useMemo(
    () => collapseComplianceIntervals(activeDayResult.intervals),
    [activeDayResult.intervals],
  );
  
  const manualAgeWarnings = useMemo(() => 
    activeDayResult.warnings.filter((w: string) => w.startsWith('Manual Age: ')), 
    [activeDayResult.warnings]
  );
  const otherWarnings = useMemo(() => 
    activeDayResult.warnings.filter((w: string) => !w.startsWith('Manual Age: ')), 
    [activeDayResult.warnings]
  );

  const manualAgeStudentNames = useMemo(() => 
    [...new Set(manualAgeWarnings.map((w: string) => w.replace('Manual Age: ', '')))],
    [manualAgeWarnings]
  );

  const handleExportWorkspace = () => {
    const json = exportWorkspaceJson(workspace);
    downloadTextFile(`workspace-${new Date().toISOString().slice(0, 10)}.json`, json, 'application/json');
  };

  const handleImportWorkspace = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          const imported = importWorkspaceJson(text);
          setWorkspace(imported);
          if (imported.weeks.length > 0) {
            setActiveWeekId(imported.weeks[0].id);
          }
        } catch (err) {
          alert('Failed to import workspace: ' + err);
        }
      }
    };
    input.click();
  };

  return (
    <div className="appLayout">
      <AgeVerificationModal 
        isOpen={unverifiedStudents.length > 0} 
        students={unverifiedStudents}
        onVerify={handleVerify}
      />
      <WeekManager 
        workspace={workspace}
        activeWeekId={activeWeekId}
        onSelectWeek={setActiveWeekId}
        onAddWeek={addWeek}
        onDuplicateWeek={duplicateWeek}
        onRemoveWeek={removeWeek}
        onExportWorkspace={handleExportWorkspace}
        onImportWorkspace={handleImportWorkspace}
      />

      <div className="appShell">
        <header className="hero">
          <div>
            <p className="eyebrow">Ratio Compliance Planner · Week-at-a-Time</p>
            <h1>{activeWeek.weekLabel}</h1>
            <p className="heroText">
              Planning for week of {activeWeek.weekStartDate}. 
              Compliance is calculated using {activeWeek.standards?.label || 'no standards'}.
            </p>
          </div>
          <SummaryCards daySummary={activeDaySummary} weekSummary={weekSummary} />
        </header>

        <DayNavigator 
          activeDay={activeDay}
          onSelectDay={setActiveDay}
          syncAcrossDays={syncAcrossDays}
          onToggleSync={setSyncAcrossDays}
        />

        <main className="contentGrid">
          <WeekOverview 
            daySummaries={daySummaries}
            activeDay={activeDay}
            onSelectDay={setActiveDay}
          />

          <section className="panel wide">
            <div className="panelHeader">
              <div>
                <h2>Compliance Dashboard: {activeDay.charAt(0).toUpperCase() + activeDay.slice(1)}</h2>
                <p>Aggregate view of child counts and caregiver requirements.</p>
              </div>
            </div>
            
            <DailyAggregateTimeline intervals={activeDayResult.intervals} />
            
            {manualAgeStudentNames.length > 0 && !verifiedWarnings && (
              <div className="warningBox strong" style={{ marginBottom: '14px' }}>
                <p>The following students have not had an age set by birthday: <strong>{manualAgeStudentNames.join(', ')}</strong>. Please verify their category is correct for each day this week. Note: you will have to repeat this verification every week. Add a specific birthdate to avoid this.</p>
                <button className="primaryButton" onClick={() => setVerifiedWarnings(true)}>Verified</button>
              </div>
            )}
            
            {otherWarnings.length > 0 && (
              <div className="warningStack">
                {[...new Set(otherWarnings)].map((warning, i) => (
                  <div className="warningBox" key={i}>{warning as string}</div>
                ))}
              </div>
            )}

            <CollapsedIntervalTable blocks={collapsedBlocks} />
          </section>

          <WeeklyStudentEditor 
            students={activeWeek.students}
            onAddStudent={addStudent}
            onAddBatchStudents={addBatchStudents}
            onUpdateStudent={updateStudent}
            onUpdateStudentDay={updateStudentDay}
            onRemoveStudent={removeStudent}
          />

          <WeeklyStaffEditor 
            staff={activeWeek.staff}
            onAddStaff={addStaff}
            onUpdateStaff={updateStaff}
            onUpdateStaffDay={updateStaffDay}
            onRemoveStaff={removeStaff}
          />

          <TexasStandardsTable />

          <section className="panel wide">
            <div className="panelHeader">
              <h2>Settings & Standards</h2>
            </div>
            <div className="formGrid fiveCols">
               <label>
                Week Label
                <input
                  value={activeWeek.weekLabel}
                  onChange={(e) => updateActiveWeek({ weekLabel: e.target.value })}
                />
              </label>
              <label>
                Start Date (Mon)
                <input
                  type="date"
                  value={activeWeek.weekStartDate}
                  onChange={(e) => updateActiveWeek({ weekStartDate: e.target.value })}
                />
              </label>
              <label>
                Open Time
                <input
                  type="time"
                  value={activeWeek.openTime}
                  onChange={(e) => updateActiveWeek({ openTime: e.target.value })}
                />
              </label>
              <label>
                Close Time
                <input
                  type="time"
                  value={activeWeek.closeTime}
                  onChange={(e) => updateActiveWeek({ closeTime: e.target.value })}
                />
              </label>
              <button 
                className="primaryButton"
                onClick={() => updateActiveWeek({ standards: TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS })}
              >
                Load Texas Standards
              </button>
              <button 
                className="secondaryButton"
                onClick={handleResetSample}
              >
                Reset to Sample
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
