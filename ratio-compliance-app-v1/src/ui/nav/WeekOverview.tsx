import React, { useState } from 'react';
import { Weekday, WEEKDAYS } from '../../core/week/types';
import { DaySummary } from '../../core/week/summarizeDay';

interface WeekOverviewProps {
  daySummaries: Record<Weekday, DaySummary>;
  activeDay: Weekday;
  onSelectDay: (day: Weekday) => void;
  weekLabel: string;
  weekStartDate: string;
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
  weekLabel,
  weekStartDate,
  onUpdateWeekLabel,
  onEditSettings,
}) => {
  const weekStartLabel = formatIsoDate(weekStartDate);
  const weekEndLabel = formatIsoDate(addDaysIso(weekStartDate, 4));

  return (
    <section className="panel wide weekOverview">
      <div className="hero" style={{ padding: '14px 16px', borderRadius: '18px', marginBottom: '12px', position: 'relative', display: 'block' }}>
        <div>
          <button
            type="button"
            className="secondaryButton"
            onClick={onEditSettings}
            style={{ position: 'absolute', top: 0, right: 0, padding: '4px 8px', fontSize: '0.75rem' }}
          >
            Edit
          </button>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>{weekLabel}</h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#c9d8ff', fontWeight: 600 }}>
            {weekStartLabel} - {weekEndLabel}
          </p>
        </div>
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
