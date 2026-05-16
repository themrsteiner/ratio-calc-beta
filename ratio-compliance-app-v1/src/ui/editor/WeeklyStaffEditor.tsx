import React, { useState } from 'react';
import { StaffWeeklySchedule, Weekday, WEEKDAYS } from '../../core/week/types';
import { Modal } from '../components/Modal';
import wrenchIcon from '../../assets/icons/wrench.png';

interface WeeklyStaffEditorProps {
  staff: StaffWeeklySchedule[];
  onAddStaff: () => void;
  onUpdateStaff: (id: string, patch: Partial<StaffWeeklySchedule>) => void;
  onUpdateStaffDay: (staffId: string, day: Weekday, patch: any) => void;
  onRemoveStaff: (id: string) => void;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

export const WeeklyStaffEditor: React.FC<WeeklyStaffEditorProps> = ({
  staff,
  onAddStaff,
  onUpdateStaff,
  onUpdateStaffDay,
  onRemoveStaff,
  isOpen = true,
  onToggleOpen,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const editingStaff = staff.find(s => s.id === editingId);

  const activeStaff = staff.filter(s => s.isActive !== false);
  const inactiveStaff = staff.filter(s => s.isActive === false);

  return (
    <section className="panel wide">
      <div className="panelHeader">
        <div>
          <h2>Caregivers</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {onToggleOpen && (
            <button className="secondaryButton" type="button" onClick={onToggleOpen}>
              {isOpen ? '▾' : '▸'}
            </button>
          )}
        </div>
      </div>

      {isOpen && <div className="tableWrap">
        <table className="dataTable weeklyTable">
          <thead>
            <tr>
              <th>Caregiver / name</th>
              {WEEKDAYS.map(d => (
                <th key={d}>{d.charAt(0).toUpperCase() + d.slice(0, 3)}</th>
              ))}
              <th style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  className="primaryButton"
                  onClick={onAddStaff}
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  Add
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {[...activeStaff, ...inactiveStaff].map((s) => (
              <tr
                key={s.id}
                style={{
                  opacity: s.isActive === false ? 0.5 : 1,
                  background: openActionId === s.id ? '#eef4ff' : 'transparent',
                }}
              >
                <td>{s.label}</td>
                {WEEKDAYS.map(day => (
                  <td key={day} style={{ fontSize: '0.75rem' }}>
                    {s.days[day].map((sched, idx) => (
                      <div key={idx}>{sched.startTime} - {sched.endTime}</div>
                    ))}
                  </td>
                ))}
                <td style={{ position: 'relative', textAlign: 'right', overflow: 'visible' }}>
                  {openActionId === s.id && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '38px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        gap: '4px',
                        padding: '2px 4px',
                        border: '1px solid #dfe7f3',
                        borderRadius: '8px',
                        background: '#ffffff',
                        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
                        zIndex: 5,
                      }}
                    >
                      <button type="button" className="secondaryButton" style={{ padding: '5px 8px', fontSize: '0.76rem' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUpdateStaff(s.id, { isActive: s.isActive !== false ? false : true }); setOpenActionId(null); }}>
                        {s.isActive === false ? 'Activate' : 'Deactivate'}
                      </button>
                      <button type="button" className="dangerButton" style={{ padding: '5px 8px', fontSize: '0.76rem' }} onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to remove this caregiver?')) {
                          onRemoveStaff(s.id);
                        }
                        setOpenActionId(null);
                      }}>
                        Delete
                      </button>
                      <button type="button" className="secondaryButton" style={{ padding: '5px 8px', fontSize: '0.76rem' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingId(s.id); setOpenActionId(null); }}>
                        Edit
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    className="secondaryButton"
                    aria-label="Settings"
                    title="Settings"
                    onClick={() => setOpenActionId((current) => (current === s.id ? null : s.id))}
                    style={{
                      width: '30px',
                      height: '30px',
                      padding: 0,
                      borderRadius: '9999px',
                      border: '1px solid #3b82f6',
                      background: '#3b82f6',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.95rem',
                      lineHeight: 1,
                    }}
                  >
                    <img src={wrenchIcon} alt="" aria-hidden="true" style={{ width: '16px', height: '16px', display: 'block', filter: 'brightness(0) invert(1)' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}

      {isOpen && <Modal isOpen={!!editingId} onClose={() => setEditingId(null)} title="Edit Caregiver">
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
      </Modal>}
    </section>
  );
};
