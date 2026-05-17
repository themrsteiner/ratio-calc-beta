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
import { PanelToggle } from '../ui/components/PanelToggle';

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
        <div className="headerActions">
          <PanelToggle isOpen={isOpen} onToggle={onToggle} />
        </div>
      </div>
      <div className={`panelBody ${isOpen ? 'open' : 'closed'}`} aria-hidden={!isOpen}>
        {children}
      </div>
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
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [pendingStandards, setPendingStandards] = useState<any>(null);
  const [isStandardsConfirmModalOpen, setIsStandardsConfirmModalOpen] = useState(false);
  const [hasConfirmedStandards, setHasConfirmedStandards] = useState(false);

  const initiateStandardSelection = (standards: any) => {
    if (!standards) {
      updateActiveWeek({ standards: null });
      return;
    }
    // If clicking what's already active, toggle it off
    if (activeWeek.standards?.id === standards.id) {
      updateActiveWeek({ standards: null });
      return;
    }
    setPendingStandards(standards);
    setHasConfirmedStandards(false);
    setIsStandardsConfirmModalOpen(true);
  };

  const handleConfirmStandards = () => {
    if (hasConfirmedStandards && pendingStandards) {
      updateActiveWeek({ standards: pendingStandards });
      setIsStandardsConfirmModalOpen(false);
      setPendingStandards(null);
    }
  };

  const [openSections, setOpenSections] = useState({
    complianceDashboard: true,
    students: true,
    caregivers: true,
    standards: true,
    settingsSecondary: true,
  });
  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));

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

      <Modal 
        isOpen={isStandardsConfirmModalOpen} 
        onClose={() => setIsStandardsConfirmModalOpen(false)} 
        title="Standards Disclaimer & Confirmation"
      >
        <div className="warningBox" style={{ fontSize: '0.88rem', marginBottom: '24px' }}>
          <p><strong>Please Read Carefully:</strong></p>
          <p>This application is a planning and tracking utility intended for informational purposes only. While we strive for accuracy, regulatory data may be outdated, incomplete, or incorrectly interpreted. This tool does not provide legal advice and is not an official government service.</p>
          <p>You are solely responsible for ensuring your facility complies with all applicable local, state, and federal laws and licensing requirements. Always consult your licensing representative or official government documentation for final compliance decisions.</p>
        </div>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #dfe7f3' }}>
          <input 
            type="checkbox" 
            checked={hasConfirmedStandards} 
            onChange={(e) => setHasConfirmedStandards(e.target.checked)} 
            style={{ width: '20px', height: '20px' }}
          />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#172033' }}>
            I have read and understand this disclaimer and I am responsible for my own compliance.
          </span>
        </label>

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button 
            className="primaryButton" 
            disabled={!hasConfirmedStandards}
            onClick={handleConfirmStandards}
            style={{ opacity: hasConfirmedStandards ? 1 : 0.5 }}
          >
            Accept & Apply Standards
          </button>
        </div>
      </Modal>

      <button className="globalFab" onClick={() => setIsDrawerOpen(true)} title="Settings & Actions">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ width: '20px', height: '2px', background: '#fff', borderRadius: '1px' }} />
          <div style={{ width: '20px', height: '2px', background: '#fff', borderRadius: '1px' }} />
          <div style={{ width: '20px', height: '2px', background: '#fff', borderRadius: '1px' }} />
        </div>
      </button>

      <div className={`drawerOverlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)} />
      
      <aside className={`sideDrawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawerHeader" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Menu</h3>
          <button 
            className="secondaryButton drawerCloseButton" 
            onClick={() => setIsDrawerOpen(false)}
            style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            &times;
          </button>
        </div>
        <div className="drawerContent">
          <div className="drawerSection navigator">
            <div className="drawerSectionHeader">
              <h4>Weekly Schedules</h4>
              <button
                className="secondaryButton"
                style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%', fontSize: '1.2rem', lineHeight: 1 }}
                onClick={() => {
                  const nextMon = new Date();
                  nextMon.setDate(nextMon.getDate() + ((1 + 7 - nextMon.getDay()) % 7));
                  addWeek(nextMon.toISOString().slice(0, 10), `Week ${workspace.weeks.length + 1}`);
                }}
              >
                +
              </button>
            </div>
            <ul className="drawerWeekList">
              {[
                ...workspace.weeks.filter((w) => !w.isArchived),
                ...workspace.weeks.filter((w) => w.isArchived),
              ].map((week) => (
                <li
                  key={week.id}
                  className={`drawerWeekItem ${activeWeekId === week.id ? 'active' : ''} ${week.isArchived ? 'archived' : ''}`}
                  onClick={() => {
                    setActiveWeekId(week.id);
                    setIsDrawerOpen(false);
                  }}
                >
                  <div className="drawerWeekInfo">
                    <span className="drawerWeekName">{week.weekLabel}</span>
                    <span className="drawerWeekDate">{week.weekStartDate}</span>
                  </div>
                  <div className="drawerWeekActions">
                    <button
                      title={week.isArchived ? 'Unarchive' : 'Archive'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWeekArchived(week.id);
                      }}
                    >
                      {week.isArchived ? 'U' : 'A'}
                    </button>
                    <button
                      title="Duplicate"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateWeek(week.id);
                      }}
                    >
                      D
                    </button>
                    <button
                      title="Remove"
                      className="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to remove this week?')) {
                          removeWeek(week.id);
                        }
                      }}
                    >
                      &times;
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="drawerSection">
            <h4>App Settings</h4>
            <div className="formGrid">
              <label>Time Format</label>
              <div className="toggleGroup">
                <div 
                  className={`toggleOption ${(!workspace.timeFormat || workspace.timeFormat === '12h') ? 'active' : ''}`}
                  onClick={() => setWorkspace({ ...workspace, timeFormat: '12h' })}
                >
                  AM/PM
                </div>
                <div 
                  className={`toggleOption ${workspace.timeFormat === '24h' ? 'active' : ''}`}
                  onClick={() => setWorkspace({ ...workspace, timeFormat: '24h' })}
                >
                  Military
                </div>
              </div>
            </div>
          </div>

          <div className="drawerSection">
            <h4>Data Management</h4>
            <div className="formGrid">
              <button 
                className="secondaryButton fullWidth"
                onClick={() => {
                  handleExportWorkspace();
                  setIsDrawerOpen(false);
                }}
              >
                Export Workspace
              </button>
              <button 
                className="secondaryButton fullWidth"
                onClick={() => {
                  handleImportWorkspace();
                  setIsDrawerOpen(false);
                }}
              >
                Import Workspace
              </button>
            </div>
          </div>
        </div>
        <div className="drawerFooter">
          Happy Baby Ratio Tracker v1.0
        </div>
      </aside>

      <div className="appShell">
        <main className="contentGrid">
          <WeekOverview 
            daySummaries={daySummaries}
            activeDay={activeDay}
            onSelectDay={setActiveDay}
            activeWeek={activeWeek}
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

            <div className="miniTimelineContainer">
              <table className="miniTimelineTable">
                <tbody>
                  <tr>
                    <td className="miniTimelineLabelCell">
                      <div className="miniTimelineLabel">Students</div>
                    </td>
                    <td style={{ height: `${studentsRowHeight}px` }}>
                      <div className="miniTimelineBarContainer">
                        {activeDayResult.intervals.map((interval: ComplianceInterval, idx: number) => (
                          <div
                            key={idx}
                            className={`miniTimelineInterval ${isHourInterval(interval.startTime) ? 'hourMarker' : ''}`}
                            style={{ animationDelay: `${idx * 10}ms` }}
                          >
                            <div className="miniTimelineDotStack">
                              {Array.from({ length: interval.totalChildren }).map((_, i) => {
                                const requiredCaregivers = interval.required.requiredCaregivers ?? 0;
                                const isCompliant = !activeWeek.standards || interval.status === 'compliant' || interval.status === 'overstaffed';
                                const coveredCount = isCompliant
                                  ? interval.totalChildren
                                  : requiredCaregivers > 0
                                    ? Math.floor(interval.totalChildren * Math.min(1, interval.scheduledCaregivers / requiredCaregivers))
                                    : 0;
                                const isCovered = i < coveredCount;
                                return (
                                  <div
                                    key={i}
                                    className={`dot student ${isCovered ? 'active' : 'alert'}`}
                                    style={{ animationDelay: `${idx * 10 + i * 6}ms` }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="miniTimelineLabelCell">
                      <div className="miniTimelineLabel">Staff</div>
                    </td>
                    <td style={{ height: `${caregiversRowHeight}px` }}>
                      <div className="miniTimelineBarContainer">
                        {activeDayResult.intervals.map((interval: ComplianceInterval, idx: number) => (
                          <div
                            key={idx}
                            className={`miniTimelineInterval ${isHourInterval(interval.startTime) ? 'hourMarker' : ''}`}
                            style={{ animationDelay: `${idx * 10}ms` }}
                          >
                            <div className="miniTimelineDotStack">
                              {Array.from({ length: activeWeek.standards ? (interval.required.requiredCaregivers ?? 0) : interval.scheduledCaregivers }).map((_, i) => {
                                const isScheduled = i < interval.scheduledCaregivers;
                                return (
                                  <div
                                    key={i}
                                    className={`dot staff ${isScheduled ? 'active' : 'alert'}`}
                                    style={{ animationDelay: `${idx * 10 + i * 6}ms` }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>&nbsp;</td>
                    <td style={{ height: '20px' }}>
                      <div className="miniTimelineBarContainer">
                        {activeDayResult.intervals.map((interval: ComplianceInterval, idx: number) => {
                          const isAlert = !!activeWeek.standards && interval.status === 'gap';
                          return (
                            <div
                              key={idx}
                              className={`miniTimelineInterval ${isAlert ? 'alertShade' : ''}`}
                              style={{ animationDelay: `${idx * 10}ms` }}
                            >
                              <div
                                style={{
                                  width: '1px',
                                  height: isHourInterval(interval.startTime) ? '14px' : '8px',
                                  background: '#94a3b8',
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>&nbsp;</td>
                    <td style={{ height: '20px' }}>
                      <div className="miniTimelineBarContainer">
                        {activeDayResult.intervals.map((interval: ComplianceInterval, idx: number) => (
                          <div key={idx} className="miniTimelineInterval" style={{ animationDelay: `${idx * 10}ms` }}>
                            {isHourInterval(interval.startTime) && (
                              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
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
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '0.82rem', color: '#8a1e1e', fontWeight: 600, background: '#fff0f0', padding: '8px 12px', borderRadius: '10px', marginBottom: '16px' }}>
                ⚠️ Always verify ratio requirements with your official licensing or government agency. Regulations change frequently.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', display: 'block' }}>
                  Step 1: Select State
                </label>
                <div className="toggleGroup" style={{ maxWidth: '600px' }}>
                  <div 
                    className={`toggleOption ${!activeWeek.standards ? 'active' : ''}`}
                    onClick={() => initiateStandardSelection(null)}
                  >
                    None
                  </div>
                  <div 
                    className={`toggleOption ${activeWeek.standards?.jurisdiction === 'Texas' ? 'active' : ''}`}
                    onClick={() => initiateStandardSelection(TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS)}
                  >
                    Texas
                  </div>
                  <div className="toggleOption disabled">
                    California <span className="comingSoonBadge">Soon</span>
                  </div>
                  <div className="toggleOption disabled">
                    Florida <span className="comingSoonBadge">Soon</span>
                  </div>
                </div>
              </div>

              {activeWeek.standards?.jurisdiction === 'Texas' && (
                <div style={{ marginBottom: '16px', paddingLeft: '12px', borderLeft: '3px solid #eef3ff' }}>
                  <label style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', display: 'block' }}>
                    Step 2: Select Facility Type in Texas
                  </label>
                  <div className="toggleGroup" style={{ maxWidth: '600px' }}>
                    <div 
                      className={`toggleOption ${activeWeek.standards?.id === TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS.id ? 'active' : ''}`}
                      onClick={() => initiateStandardSelection(TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS)}
                    >
                      Licensed Home
                    </div>
                    <div className="toggleOption disabled">
                      Child Care Center <span className="comingSoonBadge">Soon</span>
                    </div>
                    <div className="toggleOption disabled">
                      School-Age Program <span className="comingSoonBadge">Soon</span>
                    </div>
                  </div>
                </div>
              )}

              {!activeWeek.standards ? (
                <div style={{ marginTop: '16px', color: '#64748b', fontSize: '0.85rem', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  No standards selected. Automated compliance alerts are disabled. Select a state and facility type above to start tracking ratios.
                </div>
              ) : (
                <div style={{ marginTop: '16px', color: '#264ed8', fontWeight: 600, fontSize: '0.85rem', padding: '0 4px' }}>
                  ✓ Currently applying: {activeWeek.standards.jurisdiction} — {activeWeek.standards.facilityType}
                </div>
              )}
            </div>
            {activeWeek.standards?.id === TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS.id && <TexasStandardsTable />}
          </CollapsibleSection>

          <div className="warningBox" style={{ gridColumn: '1 / -1', marginTop: '32px', fontSize: '0.8rem', opacity: 0.85 }}>
            <p style={{ margin: 0 }}>
              <strong>Disclaimer:</strong> This application is a planning and tracking utility intended for informational purposes only. While we strive for accuracy, regulatory data may be outdated, incomplete, or incorrectly interpreted. This tool does not provide legal advice and is not an official government service. You are solely responsible for ensuring your facility complies with all applicable local, state, and federal laws and licensing requirements. Always consult your licensing representative or official government documentation for final compliance decisions.
            </p>
          </div>
          </main>
          </div>
    </div>
  );
}
