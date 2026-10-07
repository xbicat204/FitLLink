export const isValidInterval = (iv) =>
  !!iv && typeof iv.start === 'string' && typeof iv.end === 'string' &&
  iv.start.trim() && iv.end.trim()

export const cleanWorkingHours = (wh = []) =>
  wh
    .map(d => ({
      dayOfWeek: Number(d?.dayOfWeek),
      intervals: Array.isArray(d?.intervals)
        ? d.intervals
            .map(iv => ({ start: String(iv?.start || '').slice(0,5), end: String(iv?.end || '').slice(0,5) }))
            .filter(isValidInterval)
        : []
    }))
    .filter(d =>
      Number.isFinite(d.dayOfWeek) && d.dayOfWeek >= 0 && d.dayOfWeek <= 6 &&
      d.intervals.length > 0
    )
