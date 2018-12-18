
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

/**
 * Parses a list of reviews into an array of objects.
 * 
 * Example Raw Records:
 *  - "With M. BUTTERFLY David Henry Hwang joins the first string of American playwrights. This is an audaciously imaginative play, big in conception and theme, and a satisfying instance of a talented writer hitting full stride." —Variety. "Of all the young dramatists at work in America today, none is more audacious, imaginative, or gifted than David Henry Hwang…" —The New Yorker. "It will move you, it will thrill you, it may even surprise you. It is a play not to be missed, and it is a play once caught that will never be forgotten." —NY Post.
 *  - "The scary, exhilarating brightness of raw adolescence emanates from every scene of this uncannily assured first play by Sarah DeLappe." - The New York Times
 */
export function parseReviews(raw: string): Array<{ review: string, source: string }> {
  const reviews = []
  while(raw.length) {
    const reviewStart = raw.search(/[“"]/)
    if (reviewStart === -1) break
    raw = raw.slice(reviewStart + 1)
    const reviewEnd = raw.search(/[”"]/)
    if (reviewEnd === -1) break
    const review = raw.slice(0, reviewEnd)
    const [, source] = raw.match(/\s+[—-]([^\.“"]+)/) || [,,]
    if (review && source) {
      reviews.push({ review, source })
    }
    raw = raw.slice(reviewEnd + 1)
  }
  return reviews
}

export const stateNameToCode: { [stateName: string]: string|undefined } = {
  'alabama': 'AL',
  'alaska': 'AK',
  'arizona': 'AZ',
  'arkansas': 'AR',
  'california': 'CA',
  'colorado': 'CO',
  'connecticut': 'CT',
  'delaware': 'DE',
  'florida': 'FL',
  'georgia': 'GA',
  'hawaii': 'HI',
  'idaho': 'ID',
  'illinois': 'IL',
  'indiana': 'IN',
  'iowa': 'IA',
  'kansas': 'KS',
  'kentucky': 'KY',
  'louisiana': 'LA',
  'maine': 'ME',
  'maryland': 'MD',
  'massachusetts': 'MA',
  'michigan': 'MI',
  'minnesota': 'MN',
  'mississippi': 'MS',
  'missouri': 'MO',
  'montana': 'MT',
  'nebraska': 'NE',
  'nevada': 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  'ohio': 'OH',
  'oklahoma': 'OK',
  'oregon': 'OR',
  'pennsylvania': 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  'tennessee': 'TN',
  'texas': 'TX',
  'utah': 'UT',
  'vermont': 'VT',
  'virginia': 'VA',
  'washington': 'WA',
  'west virginia': 'WV',
  'wisconsin': 'WI',
  'wyoming': 'WY'
}