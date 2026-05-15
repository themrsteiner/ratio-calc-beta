import React from 'react';
import { ComplianceInterval } from '../../core/compliance/types';
import { formatTime } from '../../core/time/time';

interface DailyAggregateTimelineProps {
  intervals: ComplianceInterval[];
}

export const DailyAggregateTimeline: React.FC<DailyAggregateTimelineProps> = ({ intervals }) => {
  // Find max values for scaling
  const maxChildren = Math.max(...intervals.map(i => i.totalChildren), 1);
  const maxCaregivers = Math.max(...intervals.map(i => Math.max(i.scheduledCaregivers, i.required.requiredCaregivers ?? 0)), 1);

  return (
    <div className="aggregateTimeline">
      <div className="timelineGrid">
        {intervals.map((interval, idx) => (
          <div key={idx} className={`timelineInterval status-${interval.status}`}>
            <div className="barStack">
              <div 
                className="bar childrenBar" 
                style={{ height: `${(interval.totalChildren / maxChildren) * 100}%` }}
                title={`${interval.totalChildren} children at ${formatTime(interval.startTime)}`}
              />
              <div 
                className="bar staffBar" 
                style={{ height: `${(interval.scheduledCaregivers / maxCaregivers) * 100}%` }}
                title={`${interval.scheduledCaregivers} staff at ${formatTime(interval.startTime)}`}
              />
            </div>
            {idx % 4 === 0 && <span className="timeLabel">{formatTime(interval.startTime)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
