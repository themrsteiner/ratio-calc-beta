export type AgeBucket =
  | 'birthTo17Months'
  | 'eighteenMonthsToThreeYears'
  | 'fourYearsAndOlder';

export type CanonicalAgeMix = Record<AgeBucket, number>;

export type OneCaregiverRow = CanonicalAgeMix & {
  maxChildren: number;
};

export type TwoCaregiverRow = {
  zeroTo17Months: number;
  eighteenMonthsAndOlder: number;
  maxChildren: number;
};

export type RatioStandardSet = {
  id: string;
  label: string;
  jurisdiction?: string;
  facilityType?: string;
  sourceSections?: string[];
  revisedDate?: string;
  effectiveNote?: string;
  oneCaregiverRows: OneCaregiverRow[];
  twoCaregiverRows: TwoCaregiverRow[];
  notes: string[];
};

export const AGE_BUCKET_LABELS: Record<AgeBucket, string> = {
  birthTo17Months: 'Birth-17mo',
  eighteenMonthsToThreeYears: '18mo-3yr',
  fourYearsAndOlder: '4yr+',
};

export const EMPTY_AGE_MIX: CanonicalAgeMix = {
  birthTo17Months: 0,
  eighteenMonthsToThreeYears: 0,
  fourYearsAndOlder: 0,
};

export function getTotalChildren(mix: CanonicalAgeMix): number {
  return (
    mix.birthTo17Months +
    mix.eighteenMonthsToThreeYears +
    mix.fourYearsAndOlder
  );
}

export function addAgeMix(a: CanonicalAgeMix, b: CanonicalAgeMix): CanonicalAgeMix {
  return {
    birthTo17Months: a.birthTo17Months + b.birthTo17Months,
    eighteenMonthsToThreeYears:
      a.eighteenMonthsToThreeYears + b.eighteenMonthsToThreeYears,
    fourYearsAndOlder: a.fourYearsAndOlder + b.fourYearsAndOlder,
  };
}
