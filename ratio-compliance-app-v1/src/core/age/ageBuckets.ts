import type { AgeBucket } from '../standards/types';

export type AgeSource =
  | { type: 'dateOfBirth'; dateOfBirth: string }
  | { type: 'ageInMonths'; ageInMonths: number }
  | { type: 'manualAgeBucket'; ageBucket: AgeBucket };

export function getAgeBucketFromAgeInMonths(ageInMonths: number): AgeBucket {
  if (!Number.isFinite(ageInMonths) || ageInMonths < 0) {
    throw new Error(`Invalid age in months: ${ageInMonths}`);
  }

  if (ageInMonths <= 17) return 'birthTo17Months';
  if (ageInMonths <= 47) return 'eighteenMonthsToThreeYears';
  return 'fourYearsAndOlder';
}

export function getAgeBucketFromDateOfBirth(
  dateOfBirth: string,
  scheduleDate: string,
): AgeBucket {
  const dob = parseDateOnly(dateOfBirth);
  const date = parseDateOnly(scheduleDate);

  if (date.getTime() < dob.getTime()) {
    throw new Error('Date of birth cannot be after the schedule date.');
  }

  let months =
    (date.getUTCFullYear() - dob.getUTCFullYear()) * 12 +
    (date.getUTCMonth() - dob.getUTCMonth());

  if (date.getUTCDate() < dob.getUTCDate()) {
    months -= 1;
  }

  return getAgeBucketFromAgeInMonths(months);
}

export function resolveAgeBucket(source: AgeSource, scheduleDate: string): AgeBucket {
  if (source.type === 'dateOfBirth') {
    return getAgeBucketFromDateOfBirth(source.dateOfBirth, scheduleDate);
  }

  if (source.type === 'ageInMonths') {
    return getAgeBucketFromAgeInMonths(source.ageInMonths);
  }

  return source.ageBucket;
}

export function getAgeSourceWarning(source: AgeSource, count: number): string | null {
  if (source.type === 'dateOfBirth') {
    if (count > 1) {
      return 'A date of birth should normally represent one child. Split grouped birthday entries into individual rows for best compliance records.';
    }
    return null;
  }

  if (source.type === 'ageInMonths') {
    return 'Static age warning: this row uses an entered age, not a birthday. The ratio category will not automatically update as time passes.';
  }

  return 'Manual category warning: this row was assigned directly to an age category. The ratio category will not automatically update when a child ages into a new category.';
}

export function parseDateOnly(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Invalid date. Expected YYYY-MM-DD, received: ${value}`);
  }

  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}
