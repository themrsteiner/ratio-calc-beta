import React, { useState } from 'react';
import { StaffWeeklySchedule, Weekday, WEEKDAYS } from '../../core/week/types';
import { Modal } from '../components/Modal';

interface WeeklyStaffEditorProps {
  staff: StaffWeeklySchedule[];
  onAddStaff: () => void;
  onUpdateStaff: (id: string, patch: Partial<StaffWeeklySchedule>) => void;
  onUpdateStaffDay: (staffId: string, day: Weekday, patch: any) => void;
  onRemoveStaff: (id: string) => void;
}

export const WeeklyStaffEditor: React.FC<WeeklyStaffEditorProps> = ({
  staff,
  onAddStaff,
  onUpdateStaff,
  onUpdateStaffDay,
  onRemoveStaff,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingStaff = staff.find(s => s.id === editingId);

  const activeStaff = staff.filter(s => s.isActive !== false);
  const inactiveStaff = staff.filter(s => s.isActive === false);

  return (
    <section className="panel wide">
      <div className="panelHeader">
        <div>
          <h2>Caregiver schedule (Weekly)</h2>
          <p>Manage caregiver hours across the entire week.</p>
        </div>
        <button type="button" className="primaryButton" onClick={onAddStaff}>+</button>
      </div>

      <div className="tableWrap">
        <table className="dataTable weeklyTable">
          <thead>
            <tr>
              <th>Caregiver / name</th>
              {WEEKDAYS.map(d => (
                <th key={d}>{d.charAt(0).toUpperCase() + d.slice(0, 3)}</th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {[...activeStaff, ...inactiveStaff].map((s) => (
              <tr key={s.id} style={{ opacity: s.isActive === false ? 0.5 : 1 }}>
                <td>{s.label}</td>
                {WEEKDAYS.map(day => (
                  <td key={day} style={{ fontSize: '0.75rem' }}>
                    {s.days[day].map((sched, idx) => (
                      <div key={idx}>{sched.startTime} - {sched.endTime}</div>
                    ))}
                  </td>
                ))}
                <td>
                  <button type="button" className="secondaryButton" onClick={() => onUpdateStaff(s.id, { isActive: s.isActive !== false ? false : true })}>
                    {s.isActive === false ? 'Activate' : 'Deactivate'}
                  </button>
                  <button type="button" className="secondaryButton" onClick={() => setEditingId(s.id)}>Edit</button>
                  <button type="button" className="dangerButton" onClick={() => {
                    if (window.confirm('Are you sure you want to remove this caregiver?')) {
                      onRemoveStaff(s.id);
                    }
                  }}>&times;</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!editingId} onClose={() => setEditingId(null)} title="Edit Caregiver">
        {editingStaff && (
          <div className="formGrid">
            <label>Name: <input value={editingStaff.label} onChange={e => onUpdateStaff(editingStaff.id, { label: e.target.value })} /></label>
            <hr />
            {WEEKDAYS.map(day => (
              <div key={day}>
                <h4>{day.toUpperCase()}</h4>
                {editingStaff.days[day].map((sched, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input type="time" value={sched.startTime} onChange={e => {
                        const newDays = [...editingStaff.days[day]];
                        newDays[idx] = { ...newDays[idx], startTime: e.target.value };
                        onUpdateStaffDay(editingStaff.id, day, newDays);
                      }} />
                      <input type="time" value={sched.endTime} onChange={e => {
                        const newDays = [...editingStaff.days[day]];
                        newDays[idx] = { ...newDays[idx], endTime: e.target.value };
                        onUpdateStaffDay(editingStaff.id, day, newDays);
                      }} />
                      <button onClick={() => {
                        const newDays = editingStaff.days[day].filter((_, i) => i !== idx);
                        onUpdateStaffDay(editingStaff.id, day, newDays);
                      }}>&times;</button>
                    </div>
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
