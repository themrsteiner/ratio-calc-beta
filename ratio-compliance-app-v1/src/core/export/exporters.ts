import { collapseComplianceIntervals } from '../compliance/collapseIntervals';
import type { ComplianceResult, ScheduleInput } from '../compliance/types';
import { AGE_BUCKET_LABELS } from '../standards/types';
import { formatTime } from '../time/time';

export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function exportScheduleJson(schedule: ScheduleInput): string {
  return JSON.stringify(
    {
      schema: 'ratio-compliance-schedule/v1',
      exportedAt: new Date().toISOString(),
      schedule,
    },
    null,
    2,
  );
}

export function importScheduleJson(json: string): ScheduleInput {
  const parsed = JSON.parse(json) as { schedule?: ScheduleInput } | ScheduleInput;

  if ('schedule' in parsed && parsed.schedule) {
    return parsed.schedule;
  }

  return parsed as ScheduleInput;
}

export function exportComplianceCsv(result: ComplianceResult): string {
  const rows = [
    [
      'start_time',
      'end_time',
      'birth_to_17_months',
      'eighteen_months_to_three_years',
      'four_years_and_older',
      'total_children',
      'scheduled_caregivers',
      'required_caregivers',
      'rule_level',
      'staff_gap',
      'status',
      'warnings',
    ],
    ...result.intervals.map((interval) => [
      interval.startTime,
      interval.endTime,
      String(interval.ageMix.birthTo17Months),
      String(interval.ageMix.eighteenMonthsToThreeYears),
      String(interval.ageMix.fourYearsAndOlder),
      String(interval.totalChildren),
      String(interval.scheduledCaregivers),
      interval.required.requiredCaregivers === null ? '' : String(interval.required.requiredCaregivers),
      interval.required.ruleLevel,
      interval.staffGap === null ? '' : String(interval.staffGap),
      interval.status,
      interval.warnings.join(' | '),
    ]),
  ];

  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
}

export function exportReadableScript(result: ComplianceResult): string {
  const blocks = collapseComplianceIntervals(result.intervals);
  const lines: string[] = [];

  lines.push('Ratio Compliance Staffing Script');
  lines.push(`Schedule: ${result.schedule.scheduleName}`);
  lines.push(`Date: ${result.schedule.scheduleDate}`);
  lines.push(`Standards: ${result.schedule.standards?.label ?? 'Not configured'}`);
  lines.push('');

  if (result.warnings.length > 0) {
    lines.push('Warnings / assumptions:');
    for (const warning of [...new Set(result.warnings)]) {
      lines.push(`- ${warning}`);
    }
    lines.push('');
  }

  for (const block of blocks) {
    lines.push(`${formatTime(block.startTime)} - ${formatTime(block.endTime)}`);
    lines.push(`Children present: ${block.totalChildren}`);
    lines.push(`  ${AGE_BUCKET_LABELS.birthTo17Months}: ${block.ageMix.birthTo17Months}`);
    lines.push(`  ${AGE_BUCKET_LABELS.eighteenMonthsToThreeYears}: ${block.ageMix.eighteenMonthsToThreeYears}`);
    lines.push(`  ${AGE_BUCKET_LABELS.fourYearsAndOlder}: ${block.ageMix.fourYearsAndOlder}`);
    lines.push(`Scheduled caregivers: ${block.scheduledCaregivers}`);
    lines.push(
      `Required caregivers: ${block.requiredCaregivers === null ? 'Needs review' : block.requiredCaregivers}`,
    );
    lines.push(`Rule level: ${humanizeRuleLevel(block.ruleLevel)}`);
    lines.push(`Status: ${humanizeStatus(block.status)}`);

    if (block.staffGap && block.staffGap > 0) {
      lines.push(`Action needed: Add ${block.staffGap} caregiver${block.staffGap === 1 ? '' : 's'}.`);
    } else if (block.status === 'needsReview') {
      lines.push('Action needed: Review additional standards before relying on this result.');
    } else if (block.status === 'noStandards') {
      lines.push('Action needed: Configure ratio standards.');
    } else {
      lines.push('Action needed: None identified by loaded standards.');
    }

    if (block.warnings.length > 0) {
      lines.push('Interval warnings:');
      for (const warning of block.warnings) lines.push(`- ${warning}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

export function exportPrintableHtml(result: ComplianceResult): string {
  const blocks = collapseComplianceIntervals(result.intervals);
  const standardsLabel = result.schedule.standards?.label ?? 'Not configured';

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${htmlEscape(result.schedule.scheduleName)} Ratio Compliance Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #172033; }
    h1 { margin-bottom: 4px; }
    .meta { color: #556070; margin-bottom: 24px; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #c9d2e3; padding: 8px; text-align: left; font-size: 13px; }
    th { background: #eef3fb; }
    .status-compliant, .status-overstaffed { background: #e7f8ed; }
    .status-gap { background: #ffe8e8; }
    .status-needsReview, .status-noStandards { background: #fff4d7; }
    .status-noChildren { background: #f2f4f8; }
    .warning { background: #fff4d7; border: 1px solid #e8c567; padding: 10px; margin: 8px 0; }
  </style>
</head>
<body>
  <h1>${htmlEscape(result.schedule.scheduleName)}</h1>
  <div class="meta">Date: ${htmlEscape(result.schedule.scheduleDate)} · Standards: ${htmlEscape(standardsLabel)}</div>
  ${result.warnings.length ? `<div class="warning"><strong>Warnings:</strong><ul>${[...new Set(result.warnings)].map((w) => `<li>${htmlEscape(w)}</li>`).join('')}</ul></div>` : ''}
  <h2>Collapsed staffing blocks</h2>
  <table>
    <thead>
      <tr>
        <th>Time</th>
        <th>0-17mo</th>
        <th>18mo-3yr</th>
        <th>4yr+</th>
        <th>Total</th>
        <th>Scheduled</th>
        <th>Required</th>
        <th>Rule</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${blocks
        .map(
          (block) => `<tr class="status-${block.status}">
            <td>${htmlEscape(formatTime(block.startTime))} - ${htmlEscape(formatTime(block.endTime))}</td>
            <td>${block.ageMix.birthTo17Months}</td>
            <td>${block.ageMix.eighteenMonthsToThreeYears}</td>
            <td>${block.ageMix.fourYearsAndOlder}</td>
            <td>${block.totalChildren}</td>
            <td>${block.scheduledCaregivers}</td>
            <td>${block.requiredCaregivers ?? 'Needs review'}</td>
            <td>${htmlEscape(humanizeRuleLevel(block.ruleLevel))}</td>
            <td>${htmlEscape(humanizeStatus(block.status))}</td>
          </tr>`,
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function htmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function humanizeStatus(status: string): string {
  switch (status) {
    case 'compliant':
      return 'Compliant';
    case 'overstaffed':
      return 'Compliant / overstaffed';
    case 'gap':
      return 'Staffing gap';
    case 'noChildren':
      return 'No children';
    case 'noStandards':
      return 'Standards required';
    case 'needsReview':
      return 'Needs standards review';
    default:
      return status;
  }
}

export function humanizeRuleLevel(ruleLevel: string): string {
  switch (ruleLevel) {
    case 'oneCaregiver':
      return 'One-caregiver table';
    case 'twoCaregiver':
      return 'Two-caregiver table';
    case 'missingStandards':
      return 'Missing standards';
    case 'beyondLoadedStandards':
      return 'Beyond loaded standards';
    case 'none':
      return 'No children';
    default:
      return ruleLevel;
  }
}
