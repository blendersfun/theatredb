import React, {
  Component,
  MouseEvent,
  createRef,
  RefObject,
  ReactElement
} from 'react'

import { RemoteMongoDatabase } from 'mongodb-stitch-browser-sdk'
import { client, db } from '../../logic/stitch'

type Productions = {
  _id: string,
  name: string
}

export class Home extends Component {
  state: {
    productions: Productions[],
    loading: boolean
  }
  newProduction: RefObject<HTMLInputElement>
  constructor(props: any) {
    super(props)
    this.state = {
      productions: [],
      loading: true
    }
    this.newProduction = createRef<HTMLInputElement>()
  }
  componentDidMount() {
    this.fetchProductions()
  }
  render() {
    return (
      <div className="page">
        <h1>Theatre DB</h1>
        <br/>
        <b>Productions:</b>
        {this.renderProductions()}
        <br/>
        <b>Add a Production:</b><br/>
        <input ref={this.newProduction}/><br/>
        <button onClick={this.addProduction.bind(this)}>Add</button>
      </div>
    )
  }
  renderProductions(): ReactElement<HTMLDivElement> {
    if (this.state.loading) {
      return <div>(loading)</div>
    } else {
      return <div id="productions">{
        this.state.productions.map(p => (
          <div key={p._id} className="production">{p.name}</div>
        ))
      }</div>
    }
  }
  async fetchProductions(): Promise<void> {
    const productions = await db.collection('productions')
      .find({}, { limit: 1000 })
      .asArray()
    this.setState({ productions, loading: false })
  }
  async addProduction(e: MouseEvent<HTMLButtonElement>): Promise<void> {
    e.preventDefault()
    const userId = client.auth.user && client.auth.user.id
    const newProduction = this.newProduction.current && this.newProduction.current.value
    if (userId && newProduction) {
      await db.collection('productions').insertOne({ name: newProduction })
      await this.fetchProductions()
      if (this.newProduction.current) {
        this.newProduction.current.value = ''
      }
    }
  }
}
