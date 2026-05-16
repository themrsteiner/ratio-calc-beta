import React from 'react';
import { ComplianceInterval } from '../../core/compliance/types';
import { formatTime } from '../../core/time/time';

interface DailyAggregateTimelineProps {
  intervals: ComplianceInterval[];
}

export const DailyAggregateTimeline: React.FC<DailyAggregateTimelineProps> = ({ intervals }) => {
  return (
    <div className="aggregateTimeline" style={{ height: 'auto', minHeight: '150px' }}>
      <div className="timelineGrid" style={{ display: 'flex' }}>
        {intervals.map((interval, idx) => (
          <div key={idx} style={{ flex: 1, padding: '2px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', minHeight: '120px' }}>
              {Array.from({ length: interval.totalChildren }).map((_, i) => {
                // Determine if compliant
                const isCompliant = interval.status === 'compliant' || interval.status === 'overstaffed';
                
                // If compliant, fill all. If not, fill based on how many kids per staff.
                // Assuming standard 1:5 ratio for this logic.
                const coveredCount = isCompliant ? interval.totalChildren : interval.scheduledCaregivers * 5;
                const isCovered = i < coveredCount;
                
                return (
                  <div 
                    key={i} 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      border: '1.5px solid #3b82f6', 
                      background: isCovered ? '#10b981' : 'transparent',
                      borderRadius: '3px' 
                    }} 
                    title={`Student ${i + 1}`} 
                  />
                );
              })}

              {Array.from({ length: interval.required.requiredCaregivers ?? 0 }).map((_, i) => {
                const isScheduled = i < interval.scheduledCaregivers;
                return (
                  <div 
                    key={i} 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      border: '1.5px solid #10b981', 
                      background: isScheduled ? '#10b981' : 'transparent',
                      borderRadius: '2px' 
                    }} 
                    title={`Required Caregiver ${i + 1}`} 
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '4px' }}>
        {intervals.map((interval, idx) => (
          <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
            {idx % 4 === 0 && <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{formatTime(interval.startTime)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
