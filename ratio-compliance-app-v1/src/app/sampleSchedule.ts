import { RatioScheduleWeek } from '../core/week/types';
import { createEmptyWeek } from '../core/week/weekHelpers';

export function createSampleWeek(mondayDate: string, label: string): RatioScheduleWeek {
  return createEmptyWeek(mondayDate, label);
}
