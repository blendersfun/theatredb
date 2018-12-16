import './DataEntry.css'

import React, {
  Component, RefObject, createRef
} from 'react'

import { DramatistsCom } from '../../components/parsers/Dramatists.com'

import {
  Production, Script
} from '../../logic/model'

type DataEntryState = {
  production: Production|null,
  script: Script|null
}

export class DataEntry extends Component<{}, DataEntryState> {
  parserComponent: RefObject<DramatistsCom>
  constructor(props: {}) {
    super(props)
    this.parserComponent = createRef()
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
    if (this.state.production) {
      await this.state.production.find()
    }
    if (this.state.script) {
      await this.state.script.find()
    }
    this.forceUpdate()
  }
  clear() {
    const parserComponent = this.parserComponent.current
    if (parserComponent) {
      parserComponent.clear()
    }
    this.setState({ production: null, script: null })
  }
  onParse(production: Production|null, script: Script|null) {
    this.setState({ production, script })
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
    this.state = {
      production: null,
      script: null
    }
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
