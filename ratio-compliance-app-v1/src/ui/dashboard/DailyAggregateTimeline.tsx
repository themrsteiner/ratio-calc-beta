import React from 'react';
import { ComplianceInterval } from '../../core/compliance/types';
import { formatTime } from '../../core/time/time';

interface DailyAggregateTimelineProps {
  intervals: ComplianceInterval[];
}

export const DailyAggregateTimeline: React.FC<DailyAggregateTimelineProps> = ({ intervals }) => {
  return (
    <div className="aggregateTimeline">
      <div className="timelineGrid">
        {intervals.map((interval, idx) => (
          <div key={idx} className="timelineInterval">
            <div className="barStack">
              {Array.from({ length: interval.totalChildren }).map((_, i) => {
                const isCompliant = interval.status === 'compliant' || interval.status === 'overstaffed';
                const coveredCount = isCompliant ? interval.totalChildren : interval.scheduledCaregivers * 5;
                const isCovered = i < coveredCount;
                
                return (
                  <div 
                    key={i} 
                    className={`dot student ${isCovered ? 'active' : ''}`}
                  />
                );
              })}

              {Array.from({ length: interval.required.requiredCaregivers ?? 0 }).map((_, i) => {
                const isScheduled = i < interval.scheduledCaregivers;
                return (
                  <div 
                    key={i} 
                    className={`dot staff ${isScheduled ? 'active' : ''}`}
                  />
                );
              })}
            </div>
            {idx % 4 === 0 && <span className="timeLabel">{formatTime(interval.startTime)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
