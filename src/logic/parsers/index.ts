import { Production, Script } from '../model'
import { PersonInRole } from '../model/Summaries'
import { ScriptDetail } from '../model/Script'

/**
 * Parses a display formatted date into a Date object 
 * using the current locale's timezone offset.
 * 
 * Example Raw Record: 3/9/2019
 */
function parseDate(raw: string): Date|undefined {
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
 * Parses a list of authors into an array of Person objects.
 * 
 * Example Raw Records:
 *  - David Henry Hwang
 *  - Lauren Gunderson and Margot Melcon
 *  - Charles Dickens, adapted to the stage by Romulus Linney
 *  - based on the novel by Man Ray, adapted by Abraham Lincoln
 *  - adapted by Jeffrey Hatcher from the original by Nikolai Gogol
 *  - Molière, translated into English verse by Richard Wilbur
 */
function parseAuthors(raw: string): PersonInRole[] {
  if (!raw.trim()) return []
  const authors: PersonInRole[] = []
  let adaptor, novelist
  if (raw.includes(', translated into English verse by')) {
    [, novelist, adaptor] = /([\wè ]+), translated into English verse by ([\w ]+)/.exec(raw) || [,,,]
  } else if (raw.includes('from the original by')) {
    [, adaptor, novelist] = /adapted by ([\w ]+) from the original by ([\w ]+)/.exec(raw) || [,,,]
  } else if (raw.search(/, adapted (to|for) the stage by /) !== -1) {
    [, novelist,, adaptor] = /([\w ]+), adapted (:?to|for) the stage by ([\w ]+)/.exec(raw) || [,,,,]
  } else if (raw.includes('based on the novel')) {
    [, novelist, adaptor] = /based on the novel by ([\w ]+), adapted by ([\w ]+)/.exec(raw) || [,,,]
  } else {
    raw.trim().split(' and ').forEach(name => {
      authors.push({ person: { name: name.trim() }, role: 'playwright' })
    })
  }
  if (novelist) authors.push({ person: { name: novelist.trim() }, role: 'novelist' })
  if (adaptor) authors.push({ person: { name: adaptor.trim() }, role: 'playwright' })
  return authors
}

/**
 * Parses a list entry from Dramatist's Play Service's current productions list.
 * - Example URL: https://www.dramatists.com/dps/productions.aspx
 * - Example Raw Record:
 * 
 *   The Call
 *   Tanya Barfield
 *   Seattle Public Theatre  | Seattle,  WA  Professional production,  Opening: 5/10/2019 thru  6/9/2019)
 */
export function entryFromDPSList(raw: string): Production|null {
  if (!raw.trim()) return null
  
  const lines = raw.trim().split(/[\r\n]+/)
  const scriptName = lines[0].trim()
  const authors = parseAuthors(lines[1] || '')

  let [orgName, rest] = (lines[2] || '').split('|')
  rest = (rest || '').trim()
  const splits = rest.split(/\s+/)
  const city = splits[0].replace(',', '')
  const state = splits[1] || ''
  const isProfessional = splits[2] === 'Professional'
  const openingIndex = splits.indexOf('Opening:')
  const openingRaw = openingIndex === -1 ? '' : splits[openingIndex + 1]
  const closingIndex = splits.indexOf('thru')
  const closingRaw = closingIndex === -1 ? '' : splits[closingIndex + 1].replace(')', '')

  const production = {
    name: scriptName,
    organization: { name: orgName.trim() },
    script: {
      name: scriptName,
      authors
    },
    isProfessional,
    location: {
      city: city.trim(),
      state: state.trim()
    },
    schedule: {
      openingDate: parseDate(openingRaw),
      closingDate: parseDate(closingRaw)
    }
  }

  return new Production(production)
}

/**
 * Parses a script detail page from Dramatist's Play Service.
 * - Example Url: http://www.dramatists.com/cgi-bin/db/single.asp?key=3971
 * - Example Record:
 * 
 *   M. Butterfly
 *   David Henry Hwang
 *   ISBN: 978-0-8222-0712-2
 *   Full Length, Drama
 *   7 men, 3 women (3 of the 7 men are nonspeaking roles)
 *   Total Cast: 10, Flexible Set
 *   $80 per performance.
 *   Bored with his routine posting in Beijing, and awkward with women, Rene Gallimard, a French diplomat, is easy prey for the subtle, delicate charms of Song Liling, a Chinese opera star who personifies Gallimard's fantasy vision of submissive, exotic oriental sexuality. He begins an affair with "her" that lasts for twenty years, during which time he passes along diplomatic secrets, an act that, eventually, brings on his downfall and imprisonment. Interspersed with scenes between the two lovers are others with Gallimard's wife and colleagues that underscore the irony of Gallimard's delusion and its curious parallel to the events of Puccini's famous opera Madame Butterfly. Combining realism and ritual with vivid theatricality, the play reaches its astonishing climax when Song Liling, before our very eyes, strips off his female attire and assumes his true masculinity—a revelation that the deluded Gallimard can neither credit nor accept and which drives him finally—and fatally—deep within the fantasy with which, over the years, he has held the truth at bay.
 *   "With M. BUTTERFLY David Henry Hwang joins the first string of American playwrights. This is an audaciously imaginative play, big in conception and theme, and a satisfying instance of a talented writer hitting full stride." —Variety. "Of all the young dramatists at work in America today, none is more audacious, imaginative, or gifted than David Henry Hwang…" —The New Yorker. "It will move you, it will thrill you, it may even surprise you. It is a play not to be missed, and it is a play once caught that will never be forgotten." —NY Post.
 *   Winner of the Tony Award, the Drama Desk Award and the Outer Critics Circle Award as Best Broadway Play.
 */
export function entryFromDPSDetail(raw: string): Script|null {
  if (!raw.trim()) return null

  const lines = raw.trim().split(/\r|\n|\r\n/)
  const scriptName = lines[0].trim()
  const authors = parseAuthors(lines[1] || '')
  const isbn = (lines[2] || '').trim().replace('ISBN: ', '')

  const [, licenseFeePerPerformanceStr] = (lines[6] || '').match(/\$([\d\.]+)/) || [,,]
  const [, menCount] = (lines[4] || '').match(/(\d+) m[ae]n/) || [,,]
  const [, womenCount] = (lines[4] || '').match(/(\d+) wom[ae]n/) || [,,]
  const [, totalCastCount] = (lines[5] || '').match(/^Total Cast: (\d+)/) || [,,]

  let reviewsRaw = lines[8] ? lines[8].trim() : ''
  const reviews = []
  let safety = 0
  while(reviewsRaw.length) {
    safety += 1
    if (safety > 100) throw new Error('too much')
    const reviewStart = reviewsRaw.search(/[“"]/)
    if (reviewStart === -1) break
    reviewsRaw = reviewsRaw.slice(reviewStart + 1)
    const reviewEnd = reviewsRaw.search(/[”"]/)
    if (reviewEnd === -1) break
    const review = reviewsRaw.slice(0, reviewEnd)
    const [, source] = reviewsRaw.match(/\s+—([^\.“"]+)/) || [,,]
    if (review && source) {
      reviews.push({ review, source })
    }
    reviewsRaw = reviewsRaw.slice(reviewEnd + 1)
  }

  const roles: ScriptDetail["roles"] = {
    total: parseInt(totalCastCount || '-1')
  }
  const script: ScriptDetail = {
    name: scriptName,
    isbn,
    authors,
    roles
  }

  if (licenseFeePerPerformanceStr) {
    script.licenseFeePerPerformance = parseFloat(licenseFeePerPerformanceStr)
  }

  if (lines[7]) script.synopsis = lines[7].trim()

  if (menCount) roles.men = parseInt(menCount || '-1')
  if (womenCount) roles.women = parseInt(womenCount || '-1')

  if (reviews.length) {
    script.reviews = reviews
  }

  if (lines[9]) {
    script.awards = lines[9].trim()
  }

  return new Script(script)
}
