import React, { useState } from 'react';
import { Weekday, WEEKDAYS, RatioScheduleWeek } from '../../core/week/types';
import { DaySummary } from '../../core/week/summarizeDay';

interface WeekOverviewProps {
  daySummaries: Record<Weekday, DaySummary>;
  activeDay: Weekday;
  onSelectDay: (day: Weekday) => void;
  activeWeek: RatioScheduleWeek;
  onUpdateWeekLabel: (label: string) => void;
  onEditSettings: () => void;
}

function formatIsoDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function addDaysIso(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const WeekOverview: React.FC<WeekOverviewProps> = ({
  daySummaries,
  activeDay,
  onSelectDay,
  activeWeek,
  onUpdateWeekLabel,
  onEditSettings,
}) => {
  const weekStartLabel = formatIsoDate(activeWeek.weekStartDate);
  const weekEndLabel = formatIsoDate(addDaysIso(activeWeek.weekStartDate, 4));

  return (
    <section className="panel wide weekOverview">
      <div className="hero" style={{ padding: '16px', borderRadius: '18px', marginBottom: '12px', position: 'relative', background: 'var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: '#fff', width: '100%' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 0, lineHeight: 1.1, color: '#fff' }}>{activeWeek.weekLabel}</h1>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#eef3ff', fontWeight: 600, marginBottom: '4px' }}>
              {weekStartLabel} - {weekEndLabel}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#adc8ff', fontWeight: 500 }}>
              Standards: {activeWeek.standards ? `${activeWeek.standards.jurisdiction} — ${activeWeek.standards.facilityType}` : 'None'}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="secondaryButton"
          onClick={onEditSettings}
          style={{ 
            position: 'absolute', 
            top: '16px', 
            right: '16px', 
            padding: '6px 12px', 
            fontSize: '0.75rem',
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          Settings
        </button>
      </div>
      <div className="weekSummaryGrid">
        {WEEKDAYS.map((day) => {
          const summary = daySummaries[day];
          return (
            <div 
              key={day} 
              className={`daySummaryCard ${activeDay === day ? 'active' : ''} ${summary.hasGaps ? 'hasGaps' : 'hasCoverage'}`}
              onClick={() => onSelectDay(day)}
            >
              <span className="dayName">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
              <div className="dayMetrics">
                <span><strong>{summary.peakChildren}</strong> children peak</span>
                <span><strong>{summary.peakRequiredCaregivers}</strong> caregivers required</span>
              </div>
              <span className="dayStatus">
                {summary.hasGaps ? 'Needs Coverage' : ''}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
