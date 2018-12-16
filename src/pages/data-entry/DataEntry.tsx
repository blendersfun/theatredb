import './DataEntry.css'

import React, {
  Component, RefObject, createRef
} from 'react'

import {
  entryFromDPSList,
  entryFromDPSDetail
} from '../../logic/parsers'
import {
  Production, Script
} from '../../logic/model'

type DataEntryState = {
  production: Production|null,
  script: Script|null
}

export class DataEntry extends Component<{}, DataEntryState> {
  showPreview(textareaDPSList: string, textareaDPSDetail: string) {
    const production = entryFromDPSList(textareaDPSList)
    const script = entryFromDPSDetail(textareaDPSDetail)
    window.sessionStorage.DPSList = textareaDPSList
    window.sessionStorage.DPSDetail = textareaDPSDetail
    this.setState({ production, script })
  }
  async saveToDatabase() {
    if (this.state.production) {
      await this.state.production.upsert()
    }
    if (this.state.script) {
      await this.state.script.upsert()
    }
  }
  async find() {
    try {
      if (this.state.production) {
        await this.state.production.find()
      }
      if (this.state.script) {
        await this.state.script.find()
      }
      this.forceUpdate()
    } catch (err) {
      this.setState({ production: new Production({ name: err.message, organization: { name: 'Error' }}) })
    }
  }
  clear() {
    this.setState({ production: null, script: null })
  }
  render() {
    return (
      <DataEntryUI {...this.state}
        showPreview={this.showPreview.bind(this)}
        saveToDatabase={this.saveToDatabase.bind(this)}
        clear={this.clear.bind(this)}
        find={this.find.bind(this)}
        />
    )
  }
}

type DataEntryProps = DataEntryState & {
  showPreview: (textareaDPSList: string, textareaDPSDetail: string) => void,
  saveToDatabase: () => void,
  clear: () => void,
  find: () => void
}

export class DataEntryUI extends Component<DataEntryProps> {
  textareaDPSList: RefObject<HTMLTextAreaElement>
  textareaDPSDetail: RefObject<HTMLTextAreaElement>
  constructor(props: any) {
    super(props)
    this.textareaDPSList = createRef()
    this.textareaDPSDetail = createRef()
    this.state = {
      production: null,
      script: null
    }
  }
  componentDidMount() {
    this.showPreview()
  }
  render() {
    return (
      <div className="page data-entry">
        <h1>Data Entry</h1>
        <div className="container horizontal">
          <div>
            <label>DPS List Entry:</label><br/>
            <textarea
              className="list"
              ref={this.textareaDPSList}
              onChange={this.showPreview.bind(this)}
              defaultValue={window.sessionStorage.DPSList}
              placeholder="M. Butterfly
David Henry Hwang
Artswest Playhouse and Gallery  | Seattle,  WA  Professional production,  Opening: 1/24/2019 thru  2/17/2019)"
              ></textarea><br/>
            <label>DPS Detail Entry:</label><br/>
            <textarea
              className="detail"
              ref={this.textareaDPSDetail}
              onChange={this.showPreview.bind(this)}
              defaultValue={window.sessionStorage.DPSDetail}
              placeholder="M. Butterfly
David Henry Hwang
ISBN: 978-0-8222-0712-2
Full Length, Drama
7 men, 3 women (3 of the 7 men are nonspeaking roles)
Total Cast: 10, Flexible Set
$80 per performance.
Bored with his routine posting in Beijing, and awkward with women, Rene Gallimard, a French diplomat, is easy prey for the subtle, delicate charms of Song Liling, a Chinese opera star who personifies Gallimard's fantasy vision of submissive, exotic oriental sexuality.
&quot;With M. BUTTERFLY David Henry Hwang joins the first string of American playwrights.&quot; —Variety. &quot;Of all the young dramatists at work in America today, none is more audacious, imaginative, or gifted than David Henry Hwang…&quot; —The New Yorker. &quot;It will move you, it will thrill you, it may even surprise you.&quot; —NY Post.
Winner of the Tony Award, the Drama Desk Award and the Outer Critics Circle Award as Best Broadway Play."></textarea><br/>
            <button onClick={this.find.bind(this)}>Find</button>
            <button onClick={this.saveToDatabase.bind(this)}>Save</button>
            <button onClick={this.clear.bind(this)}>Clear</button>
          </div>
          <div className="preview">
          Data Preview:{'\n'}
          ---{'\n'}
          {JSON.stringify(
            this.props.production && this.props.production.document,
            null,
            2
          )}{'\n'}
          ---{'\n'}
          {JSON.stringify(
            this.props.script && this.props.script.document,
            null,
            2
          )}
          </div>
        </div>
      </div>
    )
  }
  showPreview() {
    const textareaDPSList = this.textareaDPSList.current
    const textareaDPSDetail = this.textareaDPSDetail.current
    if (!textareaDPSList || !textareaDPSDetail) return
    this.props.showPreview(textareaDPSList.value, textareaDPSDetail.value)
  }
  find() {
    this.props.find()
  }
  async saveToDatabase(): Promise<void> {
    await this.props.saveToDatabase()
    this.clear()
  }
  clear() {
    this.props.clear()
    const textareaDPSList = this.textareaDPSList.current
    const textareaDPSDetail = this.textareaDPSDetail.current
    if (!textareaDPSList || !textareaDPSDetail) return
    window.sessionStorage.DPSList = textareaDPSList.value = ''
    window.sessionStorage.DPSDetail = textareaDPSDetail.value = ''
  }
}