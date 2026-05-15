export type TimeString = `${number}:${number}` | string;

export function timeToMinutes(time: TimeString): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) {
    throw new Error(`Invalid time. Expected HH:MM, received: ${time}`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time value: ${time}`);
  }

  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function formatTime(time: string): string {
  const minutes = timeToMinutes(time);
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(mins).padStart(2, '0')} ${suffix}`;
}

export type TimeInterval = {
  startTime: string;
  endTime: string;
};

export function buildTimeIntervals(
  openTime: string,
  closeTime: string,
  incrementMinutes: number,
): TimeInterval[] {
  if (!Number.isFinite(incrementMinutes) || incrementMinutes <= 0) {
    throw new Error('Increment minutes must be greater than zero.');
  }

  const open = timeToMinutes(openTime);
  const close = timeToMinutes(closeTime);

  if (close <= open) {
    throw new Error('Close time must be after open time. Overnight schedules are not supported yet.');
  }

  const intervals: TimeInterval[] = [];
  for (let cursor = open; cursor < close; cursor += incrementMinutes) {
    intervals.push({
      startTime: minutesToTime(cursor),
      endTime: minutesToTime(Math.min(cursor + incrementMinutes, close)),
    });
  }

  return intervals;
}

export function timeRangeOverlapsInterval(
  rangeStartTime: string,
  rangeEndTime: string,
  interval: TimeInterval,
): boolean {
  const rangeStart = timeToMinutes(rangeStartTime);
  const rangeEnd = timeToMinutes(rangeEndTime);
  const intervalStart = timeToMinutes(interval.startTime);
  const intervalEnd = timeToMinutes(interval.endTime);

  return rangeStart < intervalEnd && rangeEnd > intervalStart;
}
