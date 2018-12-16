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

export class DataEntry extends Component {
  textareaDPSList: RefObject<HTMLTextAreaElement>
  textareaDPSDetail: RefObject<HTMLTextAreaElement>
  state: {
    production: Production|null,
    script: Script|null
  }
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
              ref={this.textareaDPSList}
              onChange={this.showPreview.bind(this)}
              defaultValue={window.sessionStorage.DPSList}></textarea><br/>
            <label>DPS Detail Entry:</label><br/>
            <textarea
              ref={this.textareaDPSDetail}
              onChange={this.showPreview.bind(this)}
              defaultValue={window.sessionStorage.DPSDetail}></textarea><br/>
            <button onClick={this.saveToDatabase.bind(this)}>Save</button>
          </div>
          <div className="preview">
          Data Preview:{'\n'}
          ---{'\n'}
          {JSON.stringify(
            this.state.production && this.state.production.document,
            null,
            2
          )}{'\n'}
          ---{'\n'}
          {JSON.stringify(
            this.state.script && this.state.script.document,
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
    const production = entryFromDPSList(textareaDPSList.value)
    const script = entryFromDPSDetail(textareaDPSDetail.value)
    window.sessionStorage.DPSList = textareaDPSList.value
    window.sessionStorage.DPSDetail = textareaDPSDetail.value
    this.setState({ production, script })
  }
  async saveToDatabase(): Promise<undefined> {
    if (this.state.production) {
      await this.state.production.upsert()
    }
    if (this.state.script) {
      await this.state.script.upsert()
    }
    const textareaDPSList = this.textareaDPSList.current
    const textareaDPSDetail = this.textareaDPSDetail.current
    if (!textareaDPSList || !textareaDPSDetail) return
    window.sessionStorage.DPSList = textareaDPSList.value = ''
    window.sessionStorage.DPSDetail = textareaDPSDetail.value = ''
    this.setState({ production: null, script: null })
  }
}