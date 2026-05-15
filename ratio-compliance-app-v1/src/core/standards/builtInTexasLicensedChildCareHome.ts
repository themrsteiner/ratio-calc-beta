import type { OneCaregiverRow, RatioStandardSet, TwoCaregiverRow } from './types';

export const TEXAS_LICENSED_CHILD_CARE_HOME_ONE_CAREGIVER_ROWS: OneCaregiverRow[] = [
  { birthTo17Months: 0, eighteenMonthsToThreeYears: 8, fourYearsAndOlder: 4, maxChildren: 12 },
  { birthTo17Months: 0, eighteenMonthsToThreeYears: 7, fourYearsAndOlder: 5, maxChildren: 12 },
  { birthTo17Months: 0, eighteenMonthsToThreeYears: 6, fourYearsAndOlder: 6, maxChildren: 12 },
  { birthTo17Months: 0, eighteenMonthsToThreeYears: 5, fourYearsAndOlder: 7, maxChildren: 12 },
  { birthTo17Months: 0, eighteenMonthsToThreeYears: 4, fourYearsAndOlder: 8, maxChildren: 12 },
  { birthTo17Months: 0, eighteenMonthsToThreeYears: 3, fourYearsAndOlder: 9, maxChildren: 12 },
  { birthTo17Months: 0, eighteenMonthsToThreeYears: 2, fourYearsAndOlder: 10, maxChildren: 12 },
  { birthTo17Months: 0, eighteenMonthsToThreeYears: 1, fourYearsAndOlder: 11, maxChildren: 12 },
  { birthTo17Months: 0, eighteenMonthsToThreeYears: 0, fourYearsAndOlder: 12, maxChildren: 12 },

  { birthTo17Months: 1, eighteenMonthsToThreeYears: 6, fourYearsAndOlder: 4, maxChildren: 11 },
  { birthTo17Months: 1, eighteenMonthsToThreeYears: 5, fourYearsAndOlder: 5, maxChildren: 11 },
  { birthTo17Months: 1, eighteenMonthsToThreeYears: 4, fourYearsAndOlder: 6, maxChildren: 11 },
  { birthTo17Months: 1, eighteenMonthsToThreeYears: 3, fourYearsAndOlder: 7, maxChildren: 11 },
  { birthTo17Months: 1, eighteenMonthsToThreeYears: 2, fourYearsAndOlder: 8, maxChildren: 11 },
  { birthTo17Months: 1, eighteenMonthsToThreeYears: 1, fourYearsAndOlder: 9, maxChildren: 11 },
  { birthTo17Months: 1, eighteenMonthsToThreeYears: 0, fourYearsAndOlder: 10, maxChildren: 11 },

  { birthTo17Months: 2, eighteenMonthsToThreeYears: 5, fourYearsAndOlder: 3, maxChildren: 10 },
  { birthTo17Months: 2, eighteenMonthsToThreeYears: 4, fourYearsAndOlder: 4, maxChildren: 10 },
  { birthTo17Months: 2, eighteenMonthsToThreeYears: 3, fourYearsAndOlder: 5, maxChildren: 10 },
  { birthTo17Months: 2, eighteenMonthsToThreeYears: 2, fourYearsAndOlder: 6, maxChildren: 10 },
  { birthTo17Months: 2, eighteenMonthsToThreeYears: 1, fourYearsAndOlder: 7, maxChildren: 10 },
  { birthTo17Months: 2, eighteenMonthsToThreeYears: 0, fourYearsAndOlder: 8, maxChildren: 10 },

  { birthTo17Months: 3, eighteenMonthsToThreeYears: 3, fourYearsAndOlder: 1, maxChildren: 7 },
  { birthTo17Months: 3, eighteenMonthsToThreeYears: 2, fourYearsAndOlder: 2, maxChildren: 7 },
  { birthTo17Months: 3, eighteenMonthsToThreeYears: 1, fourYearsAndOlder: 3, maxChildren: 7 },
  { birthTo17Months: 3, eighteenMonthsToThreeYears: 0, fourYearsAndOlder: 4, maxChildren: 7 },

  { birthTo17Months: 4, eighteenMonthsToThreeYears: 2, fourYearsAndOlder: 0, maxChildren: 6 },
  { birthTo17Months: 4, eighteenMonthsToThreeYears: 1, fourYearsAndOlder: 1, maxChildren: 6 },
  { birthTo17Months: 4, eighteenMonthsToThreeYears: 0, fourYearsAndOlder: 2, maxChildren: 6 },
];

export const TEXAS_LICENSED_CHILD_CARE_HOME_TWO_CAREGIVER_ROWS: TwoCaregiverRow[] = [
  { zeroTo17Months: 0, eighteenMonthsAndOlder: 12, maxChildren: 12 },
  { zeroTo17Months: 1, eighteenMonthsAndOlder: 11, maxChildren: 12 },
  { zeroTo17Months: 2, eighteenMonthsAndOlder: 10, maxChildren: 12 },
  { zeroTo17Months: 3, eighteenMonthsAndOlder: 9, maxChildren: 12 },
  { zeroTo17Months: 4, eighteenMonthsAndOlder: 8, maxChildren: 12 },
  { zeroTo17Months: 5, eighteenMonthsAndOlder: 7, maxChildren: 12 },
  { zeroTo17Months: 6, eighteenMonthsAndOlder: 6, maxChildren: 12 },
  { zeroTo17Months: 7, eighteenMonthsAndOlder: 5, maxChildren: 12 },
  { zeroTo17Months: 8, eighteenMonthsAndOlder: 4, maxChildren: 12 },
  { zeroTo17Months: 9, eighteenMonthsAndOlder: 3, maxChildren: 12 },
  { zeroTo17Months: 10, eighteenMonthsAndOlder: 0, maxChildren: 10 },
];

export const TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS: RatioStandardSet = {
  id: 'texas-licensed-child-care-home-747-1801-1803',
  label: 'Texas Licensed Child-Care Home — Regular Ratios and Group Sizes',
  jurisdiction: 'Texas',
  facilityType: 'Licensed Child-Care Home',
  sourceSections: ['26 TAC §747.1801', '26 TAC §747.1803'],
  revisedDate: 'December 2025 per provided pages',
  effectiveNote:
    'Built from user-provided standards pages and intended for planning support, not legal advice.',
  oneCaregiverRows: TEXAS_LICENSED_CHILD_CARE_HOME_ONE_CAREGIVER_ROWS,
  twoCaregiverRows: TEXAS_LICENSED_CHILD_CARE_HOME_TWO_CAREGIVER_ROWS,
  notes: [
    'One-caregiver rules use three age buckets: birth-17 months, 18 months through 3 years, and 4 years and older.',
    'Two-caregiver rules use two age buckets: 0-17 months and 18 months and older.',
    'The app does not extrapolate beyond the loaded one- and two-caregiver standards.',
  ],
};
