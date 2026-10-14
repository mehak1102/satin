// Kept in step with client/src/lib/cycle.js so reminders match what the tracker page shows.
const DAY = 24 * 60 * 60 * 1000;
const MIN_CYCLE = 15;
const MAX_CYCLE = 60;
const RECENT = 6;

export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toTime(date) {
  return Date.parse(`${date}T00:00:00Z`);
}

export function toDate(time) {
  return new Date(time).toISOString().slice(0, 10);
}

export function addDays(date, count) {
  return toDate(toTime(date) + count * DAY);
}

export function daysBetween(from, to) {
  return Math.round((toTime(to) - toTime(from)) / DAY);
}

export function isRealDate(date) {
  return DATE_PATTERN.test(date) && toDate(toTime(date)) === date;
}

export function todayIn(timeZone = 'Asia/Kolkata', now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

// Logged days a day or two apart belong to the same period, so one missed tap does not split it.
export function periodsFrom(dates) {
  const sorted = [...new Set(dates)].filter(isRealDate).sort();
  const periods = [];
  for (const date of sorted) {
    const current = periods[periods.length - 1];
    if (current && daysBetween(current.end, date) <= 2) current.end = date;
    else periods.push({ start: date, end: date });
  }
  return periods.map((period) => ({ ...period, length: daysBetween(period.start, period.end) + 1 }));
}

function average(values) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
}

export function cycleSummary(dates, today) {
  const periods = periodsFrom(dates);
  const cycles = [];
  for (let index = 1; index < periods.length; index += 1) {
    const length = daysBetween(periods[index - 1].start, periods[index].start);
    if (length >= MIN_CYCLE && length <= MAX_CYCLE) cycles.push({ start: periods[index - 1].start, length });
  }
  const recentCycles = cycles.slice(-RECENT);
  const avgCycle = average(recentCycles.map((cycle) => cycle.length));
  const avgPeriod = average(periods.slice(-RECENT).map((period) => period.length));
  const last = periods[periods.length - 1] || null;
  const inPeriod = Boolean(last && daysBetween(last.end, today) <= 1 && daysBetween(last.start, today) >= 0);

  let nextStart = null;
  if (avgCycle && last) {
    nextStart = addDays(last.start, avgCycle);
    while (daysBetween(addDays(nextStart, (avgPeriod || 1) - 1), today) > 0) nextStart = addDays(nextStart, avgCycle);
  }

  return {
    periods,
    cycles: recentCycles,
    avgCycle,
    avgPeriod,
    last,
    inPeriod,
    periodDay: inPeriod ? daysBetween(last.start, today) + 1 : null,
    nextStart,
    daysUntil: nextStart ? daysBetween(today, nextStart) : null,
  };
}
