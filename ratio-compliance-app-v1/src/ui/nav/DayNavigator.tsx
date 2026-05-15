import React from 'react';
import { Weekday, WEEKDAYS } from '../../core/week/types';

interface DayNavigatorProps {
  activeDay: Weekday;
  onSelectDay: (day: Weekday) => void;
  syncAcrossDays: boolean;
  onToggleSync: (sync: boolean) => void;
}

export const DayNavigator: React.FC<DayNavigatorProps> = ({
  activeDay,
  onSelectDay,
  syncAcrossDays,
  onToggleSync,
}) => {
  return (
    <nav className="dayNav">
      {WEEKDAYS.map((day) => (
        <button
          key={day}
          className={activeDay === day ? 'active' : ''}
          onClick={() => onSelectDay(day)}
        >
          {day.charAt(0).toUpperCase() + day.slice(1)}
        </button>
      ))}
      <div className="syncToggle">
        <label>
          <input 
            type="checkbox" 
            checked={syncAcrossDays} 
            onChange={e => onToggleSync(e.target.checked)} 
          />
          Sync changes across week
        </label>
      </div>
    </nav>
  );
};
