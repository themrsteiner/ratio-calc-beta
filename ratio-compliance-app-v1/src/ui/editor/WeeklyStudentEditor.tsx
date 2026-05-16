import React, { useState } from 'react';
import { StudentWeeklySchedule, Weekday, WEEKDAYS } from '../../core/week/types';
import { AGE_BUCKET_LABELS, AgeBucket } from '../../core/standards/types';
import { getInitialStudentSchedule } from '../../core/week/weekHelpers';
import { Modal } from '../components/Modal';
import { PanelToggle } from '../components/PanelToggle';
import wrenchIcon from '../../assets/icons/wrench.png';

interface WeeklyStudentEditorProps {
  students: StudentWeeklySchedule[];
  onAddStudent: () => void;
  onAddBatchStudents: (names: string[], config: { ageSource: any, arrivalTime: string, departureTime: string }) => void;
  onUpdateStudent: (id: string, patch: Partial<StudentWeeklySchedule>) => void;
  onUpdateStudentDay: (studentId: string, day: Weekday, patch: any) => void;
  onRemoveStudent: (id: string) => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

const AGE_BUCKETS: AgeBucket[] = [
  'birthTo17Months',
  'eighteenMonthsToThreeYears',
  'fourYearsAndOlder',
];

export const WeeklyStudentEditor: React.FC<WeeklyStudentEditorProps> = ({
  students,
  onAddStudent,
  onAddBatchStudents,
  onUpdateStudent,
  onUpdateStudentDay,
  onRemoveStudent,
  isOpen = true,
  onToggleOpen,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchNames, setBatchNames] = useState('');
  const [singleName, setSingleName] = useState('');
  const [batchTimeIn, setBatchTimeIn] = useState('08:00');
  const [batchTimeOut, setBatchTimeOut] = useState('16:00');
  const [batchAgeBucket, setBatchAgeBucket] = useState<AgeBucket>('fourYearsAndOlder');
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const editingStudent = students.find(s => s.id === editingId);

  const handleCreate = () => {
    if (isBatchMode) {
      const names = batchNames.split('\n').filter(n => n.trim() !== '');
      if (names.length > 0) {
        onAddBatchStudents(names, {
          ageSource: { type: 'manualAgeBucket', ageBucket: batchAgeBucket },
          arrivalTime: batchTimeIn,
          departureTime: batchTimeOut
        });
      }
    } else {
      if (singleName.trim()) {
        onAddBatchStudents([singleName], {
          ageSource: { type: 'manualAgeBucket', ageBucket: batchAgeBucket },
          arrivalTime: batchTimeIn,
          departureTime: batchTimeOut
        });
      }
    }
    setBatchNames('');
    setSingleName('');
    setIsAdding(false);
  };

  const handleAddSchedule = () => {
    const newId = `Schedule ${Object.keys(editingStudent!.schedules).length + 1}`;
    const newSchedules = { ...editingStudent!.schedules, [newId]: getInitialStudentSchedule() };
    onUpdateStudent(editingStudent!.id, { schedules: newSchedules });
  };

  return (
    <section className="panel wide">
      <div className="panelHeader">
        <h2>Children</h2>
        <div className="headerActions">
          {onToggleOpen && (
            <PanelToggle isOpen={!!isOpen} onToggle={onToggleOpen} />
          )}
        </div>
      </div>

      {isOpen && <div className="tableWrap">
        <table className="dataTable weeklyTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age Source</th>
              {WEEKDAYS.map(d => (
                <th key={d}>{d.charAt(0).toUpperCase() + d.slice(0, 3)}</th>
              ))}
              <th style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  className="primaryButton"
                  onClick={() => setIsAdding(true)}
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    padding: 0, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1.4rem',
                    lineHeight: 1,
                    margin: '0 0 0 auto'
                  }}
                >
                  <span style={{ marginTop: '-2px' }}>+</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {[...students.filter(s => s.isActive !== false), ...students.filter(s => s.isActive === false)].map((student) => (
              <tr
                key={student.id}
                style={{
                  opacity: student.isActive === false ? 0.5 : 1,
                  background: openActionId === student.id ? '#eef4ff' : 'transparent',
                }}
              >
                <td>{student.label}</td>
                <td style={{ fontSize: '0.8rem' }}>
                  {student.ageSource.type === 'dateOfBirth' 
                    ? `DOB: ${student.ageSource.dateOfBirth}` 
                    : student.ageSource.type === 'manualAgeBucket' 
                      ? AGE_BUCKET_LABELS[student.ageSource.ageBucket as AgeBucket]
                      : student.ageSource.type}
                </td>
                {WEEKDAYS.map(day => (
                  <td key={day} style={{ fontSize: '0.75rem' }}>
                    {student.schedules[student.activeScheduleId][day].map((sched, idx) => (
                      <div key={idx}>{sched.arrivalTime} - {sched.departureTime}</div>
                    ))}
                  </td>
                ))}
                <td style={{ position: 'relative', textAlign: 'right' }}>
                  {openActionId === student.id && (
                    <div className="actionMenu">
                      <button type="button" className="secondaryButton" style={{ padding: '5px 8px', fontSize: '0.76rem' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUpdateStudent(student.id, { isActive: student.isActive !== false ? false : true }); setOpenActionId(null); }}>
                        {student.isActive === false ? 'Activate' : 'Deactivate'}
                      </button>
                      <button type="button" className="dangerButton" style={{ padding: '5px 8px', fontSize: '0.76rem' }} onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to remove this student?')) {
                          onRemoveStudent(student.id);
                        }
                        setOpenActionId(null);
                      }}>
                        Delete
                      </button>
                      <button type="button" className="secondaryButton" style={{ padding: '5px 8px', fontSize: '0.76rem' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingId(student.id); setOpenActionId(null); }}>
                        Edit
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    className="secondaryButton"
                    aria-label="Settings"
                    title="Settings"
                    onClick={() => setOpenActionId((current) => (current === student.id ? null : student.id))}
                    style={{
                      width: '30px',
                      height: '30px',
                      padding: 0,
                      borderRadius: '9999px',
                      border: 'none',
                      background: 'var(--color-secondary-button)',
                      color: 'var(--color-secondary-text)',
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                    }}
                  >
                    <div style={{ width: '12px', height: '2px', background: 'var(--color-secondary-text)', borderRadius: '1px' }} />
                    <div style={{ width: '12px', height: '2px', background: 'var(--color-secondary-text)', borderRadius: '1px' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}

      {isOpen && <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="Add Student">
        <div className="formGrid">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button 
              className={!isBatchMode ? "primaryButton" : "secondaryButton"} 
              onClick={() => setIsBatchMode(false)}
              style={{ flex: 1 }}
            >
              Single Entry
            </button>
            <button 
              className={isBatchMode ? "primaryButton" : "secondaryButton"} 
              onClick={() => setIsBatchMode(true)}
              style={{ flex: 1 }}
            >
              Batch Entry
            </button>
          </div>
          {isBatchMode ? (
            <>
              <p style={{ fontSize: '0.85rem', color: '#607086', marginTop: '8px' }}>
                Use batch entry to quickly add multiple students who follow the same schedule and belong to the same age category.
              </p>
              <label>Names (one per line)
                <textarea rows={5} value={batchNames} onChange={e => setBatchNames(e.target.value)} />
              </label>
            </>
          ) : (
            <label>Name: 
              <input value={singleName} onChange={e => setSingleName(e.target.value)} />
            </label>
          )}

          <label>Age Bucket: 
            <select value={batchAgeBucket} onChange={e => setBatchAgeBucket(e.target.value as AgeBucket)}>
              {AGE_BUCKETS.map(b => <option key={b} value={b}>{AGE_BUCKET_LABELS[b]}</option>)}
            </select>
          </label>
          <label>In: <input type="time" value={batchTimeIn} onChange={e => setBatchTimeIn(e.target.value)} /></label>
          <label>Out: <input type="time" value={batchTimeOut} onChange={e => setBatchTimeOut(e.target.value)} /></label>
          <button className="primaryButton" onClick={handleCreate}>Create</button>
        </div>
      </Modal>}

      {isOpen && <Modal isOpen={!!editingId} onClose={() => setEditingId(null)} title="Edit Student">
        {editingStudent && (
          <div className="formGrid">
            <label>Name: <input value={editingStudent.label} onChange={e => onUpdateStudent(editingStudent.id, { label: e.target.value })} /></label>
            <div style={{ margin: '8px 0', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <h4>Age Source</h4>
              <label style={{ marginBottom: '8px' }}>
                Type
                <select
                  value={editingStudent.ageSource.type}
                  onChange={(e) => {
                    const nextType = e.target.value as 'dateOfBirth' | 'manualAgeBucket';
                    if (nextType === 'dateOfBirth') {
                      onUpdateStudent(editingStudent.id, {
                        ageSource: { type: 'dateOfBirth', dateOfBirth: new Date().toISOString().slice(0, 10) } as any,
                      });
                    } else {
                      onUpdateStudent(editingStudent.id, {
                        ageSource: { type: 'manualAgeBucket', ageBucket: 'fourYearsAndOlder' } as any,
                      });
                    }
                  }}
                >
                  <option value="dateOfBirth">Date of Birth</option>
                  <option value="manualAgeBucket">Age Bucket</option>
                </select>
              </label>
              {editingStudent.ageSource.type === 'dateOfBirth' ? (
                <label>
                  Date of Birth
                  <input
                    type="date"
                    value={(editingStudent.ageSource as any).dateOfBirth || ''}
                    onChange={(e) =>
                      onUpdateStudent(editingStudent.id, {
                        ageSource: { type: 'dateOfBirth', dateOfBirth: e.target.value } as any,
                      })
                    }
                  />
                </label>
              ) : (
                <label>
                  Age Bucket
                  <select
                    value={(editingStudent.ageSource as any).ageBucket || 'fourYearsAndOlder'}
                    onChange={(e) =>
                      onUpdateStudent(editingStudent.id, {
                        ageSource: { type: 'manualAgeBucket', ageBucket: e.target.value as AgeBucket } as any,
                      })
                    }
                  >
                    {AGE_BUCKETS.map((b) => (
                      <option key={b} value={b}>
                        {AGE_BUCKET_LABELS[b]}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <div style={{ margin: '16px 0', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <h4>Schedules</h4>
              {Object.keys(editingStudent.schedules).map((id) => (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="radio" 
                    checked={editingStudent.activeScheduleId === id} 
                    onChange={() => onUpdateStudent(editingStudent.id, { activeScheduleId: id })} 
                  />
                  <span style={{ flex: 1 }}>{id}</span>
                </div>
              ))}
              <button className="secondaryButton" onClick={handleAddSchedule}>+ Add Schedule</button>
            </div>
            <hr />
            {WEEKDAYS.map(day => (
              <div key={day}>
                <h4>{day.toUpperCase()}</h4>
                {editingStudent.schedules[editingStudent.activeScheduleId][day].map((sched, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    <button 
                      className={sched.isActive ? "primaryButton" : "secondaryButton"}
                      style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                      onClick={() => {
                        const newSchedules = { ...editingStudent.schedules };
                        const newDays = [...newSchedules[editingStudent.activeScheduleId][day]];
                        newDays[idx] = { ...newDays[idx], isActive: !sched.isActive };
                        newSchedules[editingStudent.activeScheduleId] = { ...newSchedules[editingStudent.activeScheduleId], [day]: newDays };
                        onUpdateStudent(editingStudent.id, { schedules: newSchedules });
                      }}
                    >
                      {sched.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <input type="time" value={sched.arrivalTime} onChange={e => {
                      const newSchedules = { ...editingStudent.schedules };
                      const newDays = [...newSchedules[editingStudent.activeScheduleId][day]];
                      newDays[idx] = { ...newDays[idx], arrivalTime: e.target.value };
                      newSchedules[editingStudent.activeScheduleId] = { ...newSchedules[editingStudent.activeScheduleId], [day]: newDays };
                      onUpdateStudent(editingStudent.id, { schedules: newSchedules });
                    }} />
                    <input type="time" value={sched.departureTime} onChange={e => {
                      const newSchedules = { ...editingStudent.schedules };
                      const newDays = [...newSchedules[editingStudent.activeScheduleId][day]];
                      newDays[idx] = { ...newDays[idx], departureTime: e.target.value };
                      newSchedules[editingStudent.activeScheduleId] = { ...newSchedules[editingStudent.activeScheduleId], [day]: newDays };
                      onUpdateStudent(editingStudent.id, { schedules: newSchedules });
                    }} />
                  </div>
                ))}
              </div>
            ))}
            <button className="primaryButton" onClick={() => setEditingId(null)}>Done</button>
          </div>
        )}
      </Modal>}
    </section>
  );
};
