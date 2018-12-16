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
      authors.push({ person: { name }, role: 'playwright' })
    })
  }
  if (novelist) authors.push({ person: { name: novelist }, role: 'novelist' })
  if (adaptor) authors.push({ person: { name: adaptor }, role: 'playwright' })
  return authors
}

/**
 * Parses a list entry from Dramatist's Play Service's current productions list.
 * - Example URL: https://www.dramatists.com/dps/productions.aspx
 * - Example Raw Record:
 * 
 *   The Call (Barfield)
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
 *   A Doll's House, Part 2
 *   Lucas Hnath
 *   ISBN: 978-0-8222-3744-0
 *   Full Length, Drama
 *   1 man, 3 women
 *   Total Cast: 4, Flexible Set
 *   $100 per performance.
 *   In the final scene of Ibsen’s 1879 groundbreaking masterwork, Nora Helmer makes the shocking decision to leave her husband and children, and begin a life on her own. This climactic event—when Nora slams the door on everything in her life—instantly propelled world drama into the modern age. In A DOLL’S HOUSE, PART 2, many years have passed since Nora’s exit. Now, there’s a knock on that same door. Nora has returned. But why? And what will it mean for those she left behind?
 *   “[A] smart, funny and utterly engrossing play…Hnath approaches what might seem like a hubristic project with the humility and avidity of an engaged Everyreader. A DOLL'S HOUSE, PART 2 gives vibrant theatrical life to the conversations that many of us had after first reading or seeing its prototype…” —NY Times. “…lucid and absorbing…Modern in its language, mordant in its humor and suspenseful in its plotting…the play judiciously balances conflicting ideas about freedom, love and responsibility.” —Time Out NY. “Hnath’s inspired writing, which endows each character with an arsenal of fastballs, curveballs and spitballs, keep[s] us disarmingly off-balance. He’s an uncommonly gifted parodist. For all its seriousness, A DOLL'S HOUSE, PART 2 is suffused with a contagious bemusement.” —Deadline.com. “[A DOLL'S HOUSE, PART 2] delivers explosive laughs while also posing thoughtful questions about marriage, gender inequality and human rights…as much an ingenious elaboration and deconstruction of A Doll’s House as a sequel, and it stands perfectly well on its own…With unfussy eloquence, [the play] asks how much, in a century-plus, life has changed for Nora and women like her in a world that often still has firm ideas about where they belong.” —Hollywood Reporter.
 *   {awards text would go here}
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
