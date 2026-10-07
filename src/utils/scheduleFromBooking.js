// utils/scheduleFromBooking.js
const addMinutes = (d, m) => new Date(d.getTime() + m * 60000);

// Generate dates from startDate in calendar order for pattern weekdays (0..6, 0=Sunday).
function generateDatesByPatternFromDate(startDate, pattern, total) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const days = new Set(pattern);
  const out = [];
  const cursor = new Date(start);

  if (days.size === 0 || total <= 0) return out;

  while (out.length < total) {
    if (days.has(cursor.getDay())) out.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export { generateDatesByPatternFromDate, addMinutes };
