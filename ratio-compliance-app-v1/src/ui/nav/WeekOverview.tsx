import React from 'react';
import { Weekday, WEEKDAYS } from '../../core/week/types';
import { DaySummary } from '../../core/week/summarizeDay';

interface WeekOverviewProps {
  daySummaries: Record<Weekday, DaySummary>;
  activeDay: Weekday;
  onSelectDay: (day: Weekday) => void;
}

export const WeekOverview: React.FC<WeekOverviewProps> = ({
  daySummaries,
  activeDay,
  onSelectDay,
}) => {
  return (
    <section className="panel wide weekOverview">
      <div className="panelHeader">
        <h2>Weekly Overview</h2>
      </div>
      <div className="weekSummaryGrid">
        {WEEKDAYS.map((day) => {
          const summary = daySummaries[day];
          return (
            <div 
              key={day} 
              className={`daySummaryCard ${activeDay === day ? 'active' : ''} ${summary.hasGaps ? 'hasGaps' : ''}`}
              onClick={() => onSelectDay(day)}
            >
              <span className="dayName">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
              <div className="dayMetrics">
                <span>Peak: <strong>{summary.peakChildren} children</strong></span>
                <span>Req: <strong>{summary.peakRequiredCaregivers} caregivers</strong></span>
              </div>
              <span className="dayStatus">
                {summary.hasGaps ? 'Alert' : 'OK'}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
