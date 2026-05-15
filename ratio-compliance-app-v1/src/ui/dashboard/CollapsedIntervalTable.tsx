import React from 'react';
import { ComplianceInterval, CollapsedComplianceBlock } from '../../core/compliance/types';
import { AGE_BUCKET_LABELS } from '../../core/standards/types';
import { formatTime } from '../../core/time/time';
import { humanizeRuleLevel, humanizeStatus } from '../../core/export/exporters';

interface CollapsedIntervalTableProps {
  blocks: CollapsedComplianceBlock[];
}

export const CollapsedIntervalTable: React.FC<CollapsedIntervalTableProps> = ({ blocks }) => {
  return (
    <div className="tableWrap">
      <table className="dataTable timelineTable">
        <thead>
          <tr>
            <th>Time</th>
            <th>{AGE_BUCKET_LABELS.birthTo17Months}</th>
            <th>{AGE_BUCKET_LABELS.eighteenMonthsToThreeYears}</th>
            <th>{AGE_BUCKET_LABELS.fourYearsAndOlder}</th>
            <th>Total</th>
            <th>Scheduled</th>
            <th>Required</th>
            <th>Rule</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr key={`${block.startTime}-${block.endTime}`} className={`statusRow ${block.status}`}>
              <td>{formatTime(block.startTime)} - {formatTime(block.endTime)}</td>
              <td>{block.ageMix.birthTo17Months}</td>
              <td>{block.ageMix.eighteenMonthsToThreeYears}</td>
              <td>{block.ageMix.fourYearsAndOlder}</td>
              <td>{block.totalChildren}</td>
              <td>{block.scheduledCaregivers}</td>
              <td>{block.requiredCaregivers ?? 'Review'}</td>
              <td>{humanizeRuleLevel(block.ruleLevel)}</td>
              <td>{humanizeStatus(block.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
