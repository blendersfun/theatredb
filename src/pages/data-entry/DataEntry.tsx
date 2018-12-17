import './DataEntry.css'

import React, {
  Component,
  RefObject,
  createRef,
  ChangeEvent
} from 'react'

import { DramatistsParser } from '../../components/parsers/Dramatists'
import { SamFrenchParser } from '../../components/parsers/SamFrench'

import {
  Document
} from '../../logic/model/Document'

type DataEntryState = {
  parsed: { [label: string]: Document<any, any> },
  parserName: string|null
}

const parsers = [
  DramatistsParser,
  SamFrenchParser
]

export class DataEntry extends Component<{}, DataEntryState> {
  parserComponent: RefObject<any>
  constructor(props: {}) {
    super(props)
    this.parserComponent = createRef()
    this.state = {
      parsed: {},
      parserName: window.sessionStorage.selectedParser || null
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
  selectParser(parserName: string) {
    window.sessionStorage.selectedParser = parserName
    const parser = parsers.find(p => p.parserName === parserName)
    if (!parser) return
    this.setState({ parserName: parserName })
  }
  render() {
    const Parser = parsers.find(p => p.parserName === this.state.parserName) || parsers[0]
    return (
      <DataEntryUI {...this.state}
        saveToDatabase={this.saveToDatabase.bind(this)}
        clear={this.clear.bind(this)}
        find={this.find.bind(this)}
        selectParser={this.selectParser.bind(this)}>
        <Parser
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
  find: () => void,
  selectParser: (parserName: string) => void
}

export class DataEntryUI extends Component<DataEntryProps> {
  constructor(props: DataEntryProps) {
    super(props)
  }
  render() {
    return (
      <div className="page data-entry">
        <h1>Data Entry</h1>
        <select
          onChange={this.selectParser.bind(this)}
          defaultValue={this.props.parserName || parsers[0].parserName}>
          {parsers.map(p => (
            <option key={p.parserName}>{p.parserName}</option>
          ))}
        </select>
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
  selectParser(event: ChangeEvent<HTMLSelectElement>) {
    const selected = event.target.selectedOptions[0]
    if (!selected) return
    this.props.selectParser(selected.value)
  }
}
