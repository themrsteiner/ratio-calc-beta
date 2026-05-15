import type { CanonicalAgeMix, OneCaregiverRow, RatioStandardSet, TwoCaregiverRow } from '../standards/types';
import { getTotalChildren } from '../standards/types';
import type { RequiredCaregiverResult } from './types';

export function fitsOneCaregiverTable(
  mix: CanonicalAgeMix,
  rows: OneCaregiverRow[],
): boolean {
  const total = getTotalChildren(mix);

  return rows.some((row) => {
    return (
      mix.birthTo17Months <= row.birthTo17Months &&
      mix.eighteenMonthsToThreeYears <= row.eighteenMonthsToThreeYears &&
      mix.fourYearsAndOlder <= row.fourYearsAndOlder &&
      total <= row.maxChildren
    );
  });
}

export function fitsTwoCaregiverTable(
  mix: CanonicalAgeMix,
  rows: TwoCaregiverRow[],
): boolean {
  const zeroTo17Months = mix.birthTo17Months;
  const eighteenMonthsAndOlder =
    mix.eighteenMonthsToThreeYears + mix.fourYearsAndOlder;
  const total = zeroTo17Months + eighteenMonthsAndOlder;

  return rows.some((row) => {
    return (
      zeroTo17Months <= row.zeroTo17Months &&
      eighteenMonthsAndOlder <= row.eighteenMonthsAndOlder &&
      total <= row.maxChildren
    );
  });
}

export function determineRequiredCaregivers(
  mix: CanonicalAgeMix,
  standards: RatioStandardSet | null,
): RequiredCaregiverResult {
  const total = getTotalChildren(mix);

  if (total === 0) {
    return {
      status: 'noChildren',
      requiredCaregivers: 0,
      ruleLevel: 'none',
      explanation: 'No children are present in this interval.',
    };
  }

  if (!standards) {
    return {
      status: 'standardsNotConfigured',
      requiredCaregivers: null,
      ruleLevel: 'missingStandards',
      explanation:
        'No ratio standard set is configured. Enter or load standards before relying on compliance output.',
    };
  }

  if (fitsOneCaregiverTable(mix, standards.oneCaregiverRows)) {
    return {
      status: 'compliantWithOne',
      requiredCaregivers: 1,
      ruleLevel: 'oneCaregiver',
      explanation: 'This age mix fits the loaded one-caregiver standards.',
    };
  }

  if (fitsTwoCaregiverTable(mix, standards.twoCaregiverRows)) {
    return {
      status: 'compliantWithTwo',
      requiredCaregivers: 2,
      ruleLevel: 'twoCaregiver',
      explanation: 'This age mix exceeds one-caregiver standards but fits the loaded two-caregiver standards.',
    };
  }

  return {
    status: 'needsMoreStandards',
    requiredCaregivers: null,
    ruleLevel: 'beyondLoadedStandards',
    explanation:
      'This age mix does not fit the loaded one- or two-caregiver standards. The app will not extrapolate beyond loaded standards.',
  };
}
