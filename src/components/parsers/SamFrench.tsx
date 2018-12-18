import React, {
  Component,
  RefObject,
  createRef
} from 'react'
import { Document } from '../../logic/model/Document'
import { ParserProps } from './Parser'
import { Production, Script } from '../../logic/model'
import { stateNameToCode, parseDate, parseReviews } from './utils'
import { PersonInRole } from '../../logic/model/Summaries';
import { ScriptDetail } from '../../logic/model/Script';

export class SamFrenchParser extends Component<ParserProps, {}> {
  static parserName = 'samuelfrench.com'
  textareaList: RefObject<HTMLTextAreaElement>
  textareaDetail: RefObject<HTMLTextAreaElement>
  constructor(props: ParserProps) {
    super(props)
    this.textareaList = createRef()
    this.textareaDetail = createRef()
  }
  componentDidMount() {
    this.parse()
  }
  render() {
    return (<>
      <label>Samuel French Tabel Entry:</label><br/>
      <textarea
        className="list"
        ref={this.textareaList}
        onChange={this.parse.bind(this)}
        defaultValue={window.sessionStorage.SamFrenchList}
        placeholder=""
        ></textarea><br/>
      <label>Samuel French Detail Page:</label><br/>
      <textarea
        className="detail"
        ref={this.textareaDetail}
        onChange={this.parse.bind(this)}
        defaultValue={window.sessionStorage.SamFrenchDetail}
        placeholder=""
        ></textarea><br/>
    </>)
  }
  parse() {
    const textareaList = this.textareaList.current
    const textareaDetail = this.textareaDetail.current
    if (!textareaList || !textareaDetail) return
    window.sessionStorage.SamFrenchList = textareaList.value
    window.sessionStorage.SamFrenchDetail = textareaDetail.value
    const parsed: { [label: string]: Document<any, any> } = {}
    const production = samFrenchTableRow(textareaList.value)
    const script = samFrenchDetailPage(textareaDetail.value)
    if (production) parsed.Production = production
    if (script) parsed.Script = script
    this.props.onParse(parsed)
  }
  clear() {
    const textareaList = this.textareaList.current
    const textareaDetail = this.textareaDetail.current
    if (!textareaList || !textareaDetail) return
    window.sessionStorage.SamFrenchList = textareaList.value = ''
    window.sessionStorage.SamFrenchDetail = textareaDetail.value = ''
  }
}

/**
 * Parses a list of authors as a string, as is convenient for Samuel French.
 * - Example Raw Records:
 *    - Sarah DeLappe
 *    - Fred Ebb, Bob Fosse, John Kander, Maurine Dallas Watkins
 *    - George Orwell (novel), Duncan Macmillan, Robert Icke
 * 
 * - Notes:
 *    - The website does not distinguish in what way the author's contributed
 *      to the play.
 *    - The ' (novel)' syntax seemed the briefest way I could come up with that
 *      the person entering data could indicate that one contributor was a novellist
 *      as opposed to a playwright.
 */
function parserAuthors(raw: string): PersonInRole[] {
  return (raw || '').split(', ').map(author => {
    const [novelist] = author.match(/([\w ]+) \(novel\)/) || [,]
    return {
      person: { name: novelist || author },
      role: novelist ? 'novelist' : 'playwright'
    } as PersonInRole
  })
}

/**
 * Parses a table row from Samuel French's now playing list.
 * - Example URL: https://www.samuelfrench.com/now-playing
 * - Example Raw Record:
 * 
 *  1|The Wolves 	Roosevelt High School Theatre 	Sarah DeLappe 	Seattle 	Washington 	3/6/2019 	3/9/2019
 * 
 * - Notes:
 *    - This can be copied and pasted in one go.
 *    - If there are multiple authors, commas must be added between author names.
 */
function samFrenchTableRow(raw: string): Production|null {
  if (!raw.trim()) return null
  const [name, organizationName, authorList, city, state, opening, closing] = raw.trim().split(/\s*\t\s*/)
  const stateCode = stateNameToCode[(state || '').toLowerCase()]
  const authors = parserAuthors(authorList)
  return new Production({
    name,
    organization: {
      name: organizationName || ''
    },
    location: {
      city,
      state: stateCode
    },
    script: {
      name,
      authors
    },
    schedule: {
      openingDate: parseDate(opening || ''),
      closingDate: parseDate(closing || '')
    }
  })
}

/**
 * Parses a detail page from Samuel French.
 * - Example URL: https://www.samuelfrench.com/s/62099/the-wolves
 * - Example Raw Record:
 * 
 *  1|The Wolves
 *   |by: Sarah DeLappe
 *   |ISBN: 9780573705977
 *  2|Left quad. Right quad. Lunge. A girls indoor soccer team warms up. From the safety of their suburban stretch circle, the team navigates big questions and wages tiny battles with all the vim and vigor of a pack of adolescent warriors. A portrait of life, liberty, and the pursuit of happiness for nine American girls who just want to score some goals. 
 *  3|"The scary, exhilarating brightness of raw adolescence emanates from every scene of this uncannily assured first play by Sarah DeLappe." - The New York Times
 *  
 * - Notes:
 *    - The first paste requires a newline be removed.
 *    - Swapped the order of 2 and 3 from the page order, to keep consistent with DPS order
 *      and also because I'm not sure if reviews will always be there.
 *    - There are additional "Cautions" and "Details" sections but they seem a little 
 *      higher level meta-data. Not sure about capturing it at this time.
 */
function samFrenchDetailPage(raw: string): Script|null {
  if (!raw.trim()) return null
  const lines = raw.trim().split(/\r|\n|\r\n/)
  const authors = parserAuthors((lines[1] || '').replace('by: ', ''))
  const document: ScriptDetail = {
    name: lines[0],
    authors
  }
  if (lines[2]) document.isbn = lines[2]
  if (lines[3]) document.synopsis = lines[3]
  const reviews = parseReviews(lines[4] || '')
  if (reviews.length) document.reviews = reviews
  return new Script(document)
}