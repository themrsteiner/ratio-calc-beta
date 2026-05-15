import React from 'react';
import { RatioScheduleWeek, LoadedWeekCollection } from '../../core/week/types';

interface WeekManagerProps {
  workspace: LoadedWeekCollection;
  activeWeekId: string;
  onSelectWeek: (id: string) => void;
  onAddWeek: (mondayDate: string, label: string) => void;
  onDuplicateWeek: (id: string) => void;
  onRemoveWeek: (id: string) => void;
  onExportWorkspace: () => void;
  onImportWorkspace: () => void;
}

export const WeekManager: React.FC<WeekManagerProps> = ({
  workspace,
  activeWeekId,
  onSelectWeek,
  onAddWeek,
  onDuplicateWeek,
  onRemoveWeek,
  onExportWorkspace,
  onImportWorkspace,
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebarHeader">
        <h3>Weekly schedules</h3>
        <button 
          className="secondaryButton" 
          onClick={() => {
            const nextMon = new Date();
            nextMon.setDate(nextMon.getDate() + (1 + 7 - nextMon.getDay()) % 7);
            onAddWeek(nextMon.toISOString().slice(0, 10), `Week ${workspace.weeks.length + 1}`);
          }}
        >
          + Week
        </button>
      </div>
      <ul className="weekList">
        {workspace.weeks.map(week => (
          <li 
            key={week.id} 
            className={activeWeekId === week.id ? 'active' : ''}
            onClick={() => onSelectWeek(week.id)}
          >
            <div className="weekItemInfo">
              <span className="weekName">{week.weekLabel}</span>
              <span className="weekDate">{week.weekStartDate}</span>
            </div>
            <div className="weekItemActions">
              <button 
                title="Duplicate" 
                onClick={(e) => { e.stopPropagation(); onDuplicateWeek(week.id); }}
              >
                D
              </button>
              <button 
                title="Remove" 
                className="danger"
                onClick={(e) => { e.stopPropagation(); onRemoveWeek(week.id); }}
              >
                &times;
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="sidebarFooter">
        <button className="secondaryButton fullWidth" onClick={onExportWorkspace}>
          Export Workspace
        </button>
        <button className="secondaryButton fullWidth" onClick={onImportWorkspace}>
          Import Workspace
        </button>
      </div>
    </aside>
  );
};
