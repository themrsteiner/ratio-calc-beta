import React, { useState } from 'react';
import { StudentWeeklySchedule, Weekday, WEEKDAYS } from '../../core/week/types';
import { AGE_BUCKET_LABELS, AgeBucket } from '../../core/standards/types';
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
                <td>{student.ageSource.type}</td>
                {WEEKDAYS.map(day => (
                  <td key={day} style={{ fontSize: '0.75rem' }}>
                    {student.days[day].map((sched, idx) => (
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
            <hr />
            {WEEKDAYS.map(day => (
              <div key={day}>
                <h4>{day.toUpperCase()}</h4>
                {editingStudent.days[day].map((sched, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    <input type="time" value={sched.arrivalTime} onChange={e => {
                      const newDays = [...editingStudent.days[day]];
                      newDays[idx] = { ...newDays[idx], arrivalTime: e.target.value };
                      onUpdateStudentDay(editingStudent.id, day, newDays);
                    }} />
                    <input type="time" value={sched.departureTime} onChange={e => {
                      const newDays = [...editingStudent.days[day]];
                      newDays[idx] = { ...newDays[idx], departureTime: e.target.value };
                      onUpdateStudentDay(editingStudent.id, day, newDays);
                    }} />
                    <button onClick={() => {
                      const newDays = editingStudent.days[day].filter((_, i) => i !== idx);
                      onUpdateStudentDay(editingStudent.id, day, newDays);
                    }}>&times;</button>
                  </div>
                ))}
                <button className="secondaryButton" onClick={() => {
                  const newDays = [...editingStudent.days[day], { isActive: true, arrivalTime: '08:00', departureTime: '16:00' }];
                  onUpdateStudentDay(editingStudent.id, day, newDays);
                }}>+ Time</button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </section>
  );
};
