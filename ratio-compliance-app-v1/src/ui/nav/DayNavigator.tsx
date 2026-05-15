import React from 'react';
import { Weekday, WEEKDAYS } from '../../core/week/types';

interface DayNavigatorProps {
  activeDay: Weekday;
  onSelectDay: (day: Weekday) => void;
}

export const DayNavigator: React.FC<DayNavigatorProps> = ({ activeDay, onSelectDay }) => {
  return (
    <div className="dayNavigator" style={{ display: 'flex', gap: '8px', padding: '16px 0' }}>
      {WEEKDAYS.map((day) => (
        <button
          key={day}
          className={activeDay === day ? 'primaryButton' : 'secondaryButton'}
          onClick={() => onSelectDay(day)}
        >
          {day.charAt(0).toUpperCase() + day.slice(1)}
        </button>
      ))}
    </div>
  );
};
