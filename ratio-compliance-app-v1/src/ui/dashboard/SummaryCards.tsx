import React from 'react';
import { DaySummary } from '../../core/week/summarizeDay';
import { WeekSummary } from '../../core/week/summarizeWeek';

interface SummaryCardsProps {
  daySummary: DaySummary;
  weekSummary: WeekSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ daySummary, weekSummary }) => {
  return (
    <div className="summaryCardContainer">
      <section className="summaryGroup">
        <h4>Daily Peak (Active Day)</h4>
        <div className="heroCard">
          <div className="metric">
            <span>Peak Children</span>
            <strong>{daySummary.peakChildren}</strong>
          </div>
          <div className="metric">
            <span>Min Caregivers</span>
            <strong>{daySummary.peakRequiredCaregivers}</strong>
          </div>
          <div className="metric">
            <span>Staff Gaps</span>
            <strong className={daySummary.hasGaps ? 'alert' : ''}>{daySummary.gapIntervals}</strong>
          </div>
        </div>
      </section>

      <section className="summaryGroup">
        <h4>Weekly Peak</h4>
        <div className="heroCard">
          <div className="metric">
            <span>Weekly Peak Children</span>
            <strong>{weekSummary.weeklyPeakChildren}</strong>
          </div>
          <div className="metric">
            <span>Weekly Min Caregivers</span>
            <strong>{weekSummary.weeklyPeakRequiredCaregivers}</strong>
          </div>
          <div className="metric">
            <span>Days with Alerts</span>
            <strong className={weekSummary.daysWithAlerts > 0 ? 'alert' : ''}>{weekSummary.daysWithAlerts}</strong>
          </div>
        </div>
      </section>
    </div>
  );
};
