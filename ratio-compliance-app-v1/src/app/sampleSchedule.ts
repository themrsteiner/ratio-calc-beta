import { TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS } from '../core/standards/builtInTexasLicensedChildCareHome';
import { RatioScheduleWeek } from '../core/week/types';
import { createEmptyWeek } from '../core/week/weekHelpers';

export function createSampleWeek(mondayDate: string, label: string): RatioScheduleWeek {
  const week = createEmptyWeek(mondayDate, label);
  week.standards = TEXAS_LICENSED_CHILD_CARE_HOME_STANDARDS;
  return week;
}
