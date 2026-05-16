import { useMemo, useState } from 'react';
import { calculateCompliance } from '../core/compliance/calculateCompliance';
import { collapseComplianceIntervals } from '../core/compliance/collapseIntervals';
import { ComplianceInterval } from '../core/compliance/types';
import { buildDailyScheduleFromWeek } from '../core/week/buildDailyScheduleFromWeek';
import { summarizeDay } from '../core/week/summarizeDay';
import { summarizeWeek } from '../core/week/summarizeWeek';
import { Weekday, WEEKDAYS } from '../core/week/types';
import {
  downloadTextFile,
} from '../core/export/exporters';
import { exportWorkspaceJson, importWorkspaceJson } from '../core/export/workspaceExporters';
import { TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS } from '../core/standards/builtInTexasLicensedChildCareHome';
import { formatTime } from '../core/time/time';

import { useWorkspace } from './hooks/useWorkspace';
import { WeekManager } from '../ui/sidebar/WeekManager';
import { WeekOverview } from '../ui/nav/WeekOverview';
import { WeeklyStudentEditor } from '../ui/editor/WeeklyStudentEditor';
import { WeeklyStaffEditor } from '../ui/editor/WeeklyStaffEditor';
import { TexasStandardsTable } from '../ui/dashboard/TexasStandardsTable';
import { AgeVerificationModal } from '../ui/dashboard/AgeVerificationModal';
import { CollapsedIntervalTable } from '../ui/dashboard/CollapsedIntervalTable';
import { Modal } from '../ui/components/Modal';

import { createSampleWeek } from './sampleSchedule';

function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="panel wide">
      <div className="panelHeader" style={{ marginBottom: isOpen ? '16px' : 0 }}>
        <h2>{title}</h2>
        <button className="secondaryButton" type="button" onClick={onToggle}>
          {isOpen ? '▾' : '▸'}
        </button>
      </div>
      {isOpen && children}
    </section>
  );
}

export function RatioComplianceApp() {
  const {
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
  const [isHeaderEditModalOpen, setIsHeaderEditModalOpen] = useState<boolean>(false);
  const [openSections, setOpenSections] = useState({
    complianceDashboard: true,
    students: true,
    caregivers: true,
    standards: true,
    settingsSecondary: true,
  });
  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));

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
  const isHourInterval = (startTime: string) => Number(startTime.split(':')[1] ?? '0') === 0;
  const hourColumnSolidDark = 'rgba(148, 163, 184, 0.22)';
  const rowThreeAlertShade = 'rgba(249, 115, 22, 0.16)';
  console.log('Daily Warnings:', activeDayResult.warnings);
  const weekSummary = useMemo(() => summarizeWeek(daySummaries), [daySummaries]);
  const weeklyPeakHeights = useMemo(() => {
    let maxChildren = 0;
    let maxRequiredCaregivers = 0;
    WEEKDAYS.forEach((day) => {
      const intervals: ComplianceInterval[] = dailyResults[day]?.intervals ?? [];
      intervals.forEach((interval) => {
        if (interval.totalChildren > maxChildren) maxChildren = interval.totalChildren;
        const required = interval.required.requiredCaregivers ?? 0;
        if (required > maxRequiredCaregivers) maxRequiredCaregivers = required;
      });
    });
    return { maxChildren, maxRequiredCaregivers };
  }, [dailyResults]);

  const stackUnit = 14;
  const stackPadding = 6;
  const studentsRowHeight = Math.max(30, weeklyPeakHeights.maxChildren * stackUnit + stackPadding);
  const caregiversRowHeight = Math.max(30, weeklyPeakHeights.maxRequiredCaregivers * stackUnit + stackPadding);

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
        onToggleWeekArchived={toggleWeekArchived}
      />

      <div className="appShell">
        <main className="contentGrid">
          <WeekOverview 
            daySummaries={daySummaries}
            activeDay={activeDay}
            onSelectDay={setActiveDay}
            weekLabel={activeWeek.weekLabel}
            weekStartDate={activeWeek.weekStartDate}
            onUpdateWeekLabel={(label) => updateActiveWeek({ weekLabel: label })}
            onEditSettings={() => setIsHeaderEditModalOpen(true)}
          />
          <Modal isOpen={isHeaderEditModalOpen} onClose={() => setIsHeaderEditModalOpen(false)} title="Settings & Standards">
            <div className="formGrid" style={{ gridTemplateColumns: '1fr', gap: '10px' }}>
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
            </div>
          </Modal>

          <CollapsibleSection
            title={`Dashboard: ${activeDay.charAt(0).toUpperCase() + activeDay.slice(1)}`}
            isOpen={openSections.complianceDashboard}
            onToggle={() => toggleSection('complianceDashboard')}
          >
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

            <div className="tableWrap" style={{ position: 'relative', border: 'none' }}>
              <table className="dataTable miniTimelineTable" style={{ borderCollapse: 'collapse', borderSpacing: 0, background: 'transparent' }}>
                <tbody style={{ background: 'transparent' }}>
                  <tr style={{ background: 'transparent' }}>
                    <td style={{ width: '28px', verticalAlign: 'middle', textAlign: 'center', paddingTop: 0, background: 'transparent' }}>
                      <div style={{ fontSize: '0.6rem', lineHeight: 1.1, color: '#475569', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        <div>Students</div>
                      </div>
                    </td>
                    <td style={{ height: `${studentsRowHeight}px`, background: 'transparent' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                        {activeDayResult.intervals.map((interval: ComplianceInterval, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              flex: 1,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'flex-end',
                              height: '100%',
                              background: isHourInterval(interval.startTime) ? hourColumnSolidDark : 'transparent',
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '2px', alignItems: 'center', justifyContent: 'flex-end', padding: '2px 0' }}>
                              {Array.from({ length: interval.totalChildren }).map((_, i) => {
                                const isCompliant = interval.status === 'compliant' || interval.status === 'overstaffed';
                                const coveredCount = isCompliant ? interval.totalChildren : interval.scheduledCaregivers * 5;
                                const isCovered = i < coveredCount;
                                return (
                                  <div
                                    key={i}
                                    style={{
                                      width: '12px',
                                      height: '12px',
                                      border: isCovered ? '1.5px solid #60a5fa' : '1.5px solid #f97316',
                                      background: isCovered ? '#60a5fa' : 'transparent',
                                      borderRadius: '9999px',
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr style={{ background: 'transparent' }}>
                    <td style={{ width: '28px', verticalAlign: 'middle', textAlign: 'center', paddingTop: 0, background: 'transparent', borderBottomColor: '#94a3b8' }}>
                      <div style={{ fontSize: '0.6rem', lineHeight: 1.1, color: '#475569', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Caregivers</div>
                    </td>
                    <td style={{ height: `${caregiversRowHeight}px`, background: 'transparent', borderBottomColor: '#94a3b8' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}>
                        {activeDayResult.intervals.map((interval: ComplianceInterval, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              flex: 1,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'flex-end',
                              height: '100%',
                              background: isHourInterval(interval.startTime) ? hourColumnSolidDark : 'transparent',
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '2px', alignItems: 'center', justifyContent: 'flex-end', padding: '2px 0' }}>
                              {Array.from({ length: interval.required.requiredCaregivers ?? 0 }).map((_, i) => {
                                const isScheduled = i < interval.scheduledCaregivers;
                                return (
                                  <div
                                    key={i}
                                    style={{
                                      width: '12px',
                                      height: '12px',
                                      border: isScheduled ? '1.5px solid #16a34a' : '1.5px solid #f97316',
                                      background: isScheduled ? '#16a34a' : 'transparent',
                                      borderRadius: '2px',
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr style={{ background: 'transparent' }}>
                    <td style={{ width: '28px', borderBottom: 'none', paddingBottom: 0, background: 'transparent' }}>&nbsp;</td>
                    <td style={{ height: '30px', borderBottom: 'none', paddingBottom: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}>
                        {activeDayResult.intervals.map((interval: ComplianceInterval, idx: number) => {
                          const parts = interval.startTime.split(':');
                          const minute = Number(parts[1] ?? '0');
                          const isExactHour = minute === 0;
                          return (
                            <div
                              key={idx}
                              style={{
                                flex: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'flex-start',
                                height: '100%',
                                background:
                                  (interval.totalChildren > (interval.status === 'compliant' || interval.status === 'overstaffed' ? interval.totalChildren : interval.scheduledCaregivers * 5)) ||
                                  ((interval.required.requiredCaregivers ?? 0) > interval.scheduledCaregivers)
                                    ? rowThreeAlertShade
                                    : 'transparent',
                              }}
                            >
                              <div
                                style={{
                                  width: '1px',
                                  height: isExactHour ? '14px' : '8px',
                                  background: '#94a3b8',
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                  <tr style={{ background: 'transparent' }}>
                    <td style={{ width: '28px', borderTop: 'none', paddingTop: 0, background: 'transparent' }}>&nbsp;</td>
                    <td style={{ height: '30px', borderTop: 'none', paddingTop: 0, background: 'transparent' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}>
                        {activeDayResult.intervals.map((interval: ComplianceInterval, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              flex: 1,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'flex-start',
                              lineHeight: 1,
                              background: 'transparent',
                            }}
                          >
                            {isHourInterval(interval.startTime) && (
                              <span style={{ fontSize: '0.65rem', color: '#64748b', lineHeight: 1 }}>
                                {formatTime(interval.startTime)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '24px' }}>
              <CollapsedIntervalTable blocks={collapsedBlocks} />
            </div>
            </CollapsibleSection>

          <WeeklyStudentEditor
            students={activeWeek.students}
            onAddStudent={addStudent}
            onAddBatchStudents={addBatchStudents}
            onUpdateStudent={updateStudent}
            onUpdateStudentDay={updateStudentDay}
            onRemoveStudent={removeStudent}
            isOpen={openSections.students}
            onToggleOpen={() => toggleSection('students')}
          />

          <WeeklyStaffEditor 
            staff={activeWeek.staff}
            onAddStaff={addStaff}
            onUpdateStaff={updateStaff}
            onUpdateStaffDay={updateStaffDay}
            onRemoveStaff={removeStaff}
            isOpen={openSections.caregivers}
            onToggleOpen={() => toggleSection('caregivers')}
          />

          <CollapsibleSection
            title="Standards"
            isOpen={openSections.standards}
            onToggle={() => toggleSection('standards')}
          >
            <TexasStandardsTable />
          </CollapsibleSection>

          <CollapsibleSection
            title="Settings"
            isOpen={openSections.settingsSecondary}
            onToggle={() => toggleSection('settingsSecondary')}
          >
            <div className="formGrid" style={{ maxWidth: '360px' }}>
              <label>
                Time Format
                <select
                  value={workspace.timeFormat || '12h'}
                  onChange={(e) => setWorkspace({ ...workspace, timeFormat: e.target.value as '12h' | '24h' })}
                >
                  <option value="12h">AM/PM</option>
                  <option value="24h">Military (24h)</option>
                </select>
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
              <button 
                className="secondaryButton"
                onClick={handleExportWorkspace}
              >
                Export Workspace
              </button>
              <button 
                className="secondaryButton"
                onClick={handleImportWorkspace}
              >
                Import Workspace
              </button>
            </div>
          </CollapsibleSection>
        </main>
      </div>
    </div>
  );
}
