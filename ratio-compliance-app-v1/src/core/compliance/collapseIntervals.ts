import type { CollapsedComplianceBlock, ComplianceInterval } from './types';

export function collapseComplianceIntervals(
  intervals: ComplianceInterval[],
): CollapsedComplianceBlock[] {
  const blocks: CollapsedComplianceBlock[] = [];

  for (const interval of intervals) {
    const latest = blocks.length > 0 ? blocks[blocks.length - 1] : undefined;
    const nextBlock: CollapsedComplianceBlock = {
      startTime: interval.startTime,
      endTime: interval.endTime,
      status: interval.status,
      scheduledCaregivers: interval.scheduledCaregivers,
      requiredCaregivers: interval.required.requiredCaregivers,
      staffGap: interval.staffGap,
      totalChildren: interval.totalChildren,
      ageMix: interval.ageMix,
      ruleLevel: interval.required.ruleLevel,
      warnings: [...new Set(interval.warnings)],
    };

    if (latest && canMerge(latest, nextBlock)) {
      latest.endTime = interval.endTime;
      latest.warnings = [...new Set([...latest.warnings, ...interval.warnings])];
    } else {
      blocks.push(nextBlock);
    }
  }

  return blocks;
}

function canMerge(a: CollapsedComplianceBlock, b: CollapsedComplianceBlock): boolean {
  return (
    a.status === b.status &&
    a.scheduledCaregivers === b.scheduledCaregivers &&
    a.requiredCaregivers === b.requiredCaregivers &&
    a.staffGap === b.staffGap &&
    a.totalChildren === b.totalChildren &&
    a.ruleLevel === b.ruleLevel &&
    a.ageMix.birthTo17Months === b.ageMix.birthTo17Months &&
    a.ageMix.eighteenMonthsToThreeYears === b.ageMix.eighteenMonthsToThreeYears &&
    a.ageMix.fourYearsAndOlder === b.ageMix.fourYearsAndOlder
  );
}
