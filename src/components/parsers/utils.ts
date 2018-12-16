
/**
 * Parses a display formatted date into a Date object 
 * using the current locale's timezone offset.
 * 
 * Example Raw Record: 3/9/2019
 */
export function parseDate(raw: string): Date|undefined {
  const trimmed = raw.trim()
  if (!trimmed) return
  let [month, day, year] = trimmed.split('/')
  month = month.padStart(2, '0')
  day = day.padStart(2, '0')
  const offset = Math.floor(new Date().getTimezoneOffset() / 60).toString().padStart(2, '0')
  const date = new Date(`${year}-${month}-${day}T19:00:00-${offset}00`)
  const dateFormatting = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  console.log('parsedDate', date.toLocaleString('en-US', dateFormatting))
  return date
}
