import React, { useState } from 'react';
import { StudentWeeklySchedule, Weekday, WEEKDAYS } from '../../core/week/types';
import { AGE_BUCKET_LABELS, AgeBucket } from '../../core/standards/types';
import { getInitialStudentSchedule } from '../../core/week/weekHelpers';
import { Modal } from '../components/Modal';

interface WeeklyStudentEditorProps {
  students: StudentWeeklySchedule[];
  onAddStudent: () => void;
  onAddBatchStudents: (names: string[], config: { ageSource: any, arrivalTime: string, departureTime: string }) => void;
  onUpdateStudent: (id: string, patch: Partial<StudentWeeklySchedule>) => void;
  onUpdateStudentDay: (studentId: string, day: Weekday, patch: any) => void;
  onRemoveStudent: (id: string) => void;
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
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchNames, setBatchNames] = useState('');
  const [singleName, setSingleName] = useState('');
  const [batchTimeIn, setBatchTimeIn] = useState('08:00');
  const [batchTimeOut, setBatchTimeOut] = useState('16:00');
  const [batchAgeBucket, setBatchAgeBucket] = useState<AgeBucket>('fourYearsAndOlder');

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
        <div>
          <h2>Children (Weekly)</h2>
          <p>Manage student schedules across the entire week.</p>
        </div>
        <div className="buttonRow">
          <button type="button" className="primaryButton" onClick={() => setIsAdding(true)}>+</button>
        </div>
      </div>

      <div className="tableWrap">
        <table className="dataTable weeklyTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age Source</th>
              {WEEKDAYS.map(d => (
                <th key={d}>{d.charAt(0).toUpperCase() + d.slice(0, 3)}</th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {[...students.filter(s => s.isActive !== false), ...students.filter(s => s.isActive === false)].map((student) => (
              <tr key={student.id} style={{ opacity: student.isActive === false ? 0.5 : 1 }}>
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
                <td>
                  <button type="button" className="secondaryButton" onClick={() => onUpdateStudent(student.id, { isActive: student.isActive !== false ? false : true })}>
                    {student.isActive === false ? 'Activate' : 'Deactivate'}
                  </button>
                  <button type="button" className="secondaryButton" onClick={() => setEditingId(student.id)}>Edit</button>
                  <button type="button" className="dangerButton" onClick={() => {
                    if (window.confirm('Are you sure you want to remove this student?')) {
                      onRemoveStudent(student.id);
                    }
                  }}>&times;</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title="Add Student">
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
      </Modal>

      <Modal isOpen={!!editingId} onClose={() => setEditingId(null)} title="Edit Student">
        {editingStudent && (
          <div className="formGrid">
            <label>Name: <input value={editingStudent.label} onChange={e => onUpdateStudent(editingStudent.id, { label: e.target.value })} /></label>
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
      </Modal>
    </section>
  );
};
