import React from 'react';
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
      <div className="hero weekHero">
        <div className="weekHeroMain">
          <h1 className="weekHeroTitle">{activeWeek.weekLabel}</h1>
          <div className="weekHeroMeta">
            <p>
              {weekStartLabel} - {weekEndLabel}
            </p>
            <p>
              Standards: {activeWeek.standards ? `${activeWeek.standards.jurisdiction} — ${activeWeek.standards.facilityType}` : 'None'}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="secondaryButton weekHeroSettingsButton"
          onClick={onEditSettings}
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
