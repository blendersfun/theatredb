import './DataEntry.css'

import React, {
  Component, RefObject, createRef
} from 'react'

import { DramatistsCom } from '../../components/parsers/Dramatists.com'

import {
  Document
} from '../../logic/model/Document'

type DataEntryState = {
  parsed: { [label: string]: Document<any, any> }
}

export class DataEntry extends Component<{}, DataEntryState> {
  parserComponent: RefObject<DramatistsCom>
  constructor(props: {}) {
    super(props)
    this.parserComponent = createRef()
    this.state = {
      parsed: {}
    }
  }
  async saveToDatabase() {
    for (const parsedItem of Object.values(this.state.parsed)) {
      await parsedItem.upsert()
    }
  }
  async find() {
    for (const parsedItem of Object.values(this.state.parsed)) {
      await parsedItem.find()
    }
    this.forceUpdate()
  }
  clear() {
    const parserComponent = this.parserComponent.current
    if (parserComponent) {
      parserComponent.clear()
    }
    this.setState({ parsed: {} })
  }
  onParse(parsed: { [label: string]: Document<any, any> }) {
    if (!Object.keys(parsed).length) return
    this.setState({ parsed })
  }
  render() {
    return (
      <DataEntryUI {...this.state}
        saveToDatabase={this.saveToDatabase.bind(this)}
        clear={this.clear.bind(this)}
        find={this.find.bind(this)}>
        <DramatistsCom 
          ref={this.parserComponent}
          onParse={this.onParse.bind(this)}
          />
      </DataEntryUI>
    )
  }
}

type DataEntryProps = DataEntryState & {
  saveToDatabase: () => void,
  clear: () => void,
  find: () => void
}

export class DataEntryUI extends Component<DataEntryProps> {
  constructor(props: DataEntryProps) {
    super(props)
  }
  render() {
    return (
      <div className="page data-entry">
        <h1>Data Entry</h1>
        <div className="container horizontal">
          <div>
            {this.props.children}
            <button onClick={this.find.bind(this)}>Find</button>
            <button onClick={this.saveToDatabase.bind(this)}>Save</button>
            <button onClick={this.clear.bind(this)}>Clear</button>
          </div>
          <div className="previews">
          Data Preview:<br/>
          {Object.keys(this.props.parsed).map(label => {
            return this.renderParsedItemPreview(label, this.props.parsed[label])
          })}
          </div>
        </div>
      </div>
    )
  }
  renderParsedItemPreview(label: string, parsedItem: Document<any, any>) {
    return (<div key={label} className="preview">
      ---{'\n'}
      {label}:{'\n'}
      {JSON.stringify(
        parsedItem.document,
        null,
        2
      )}{'\n'}
    </div>)
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
  }
}
