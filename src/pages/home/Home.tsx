import React, {
  Component,
  MouseEvent,
  createRef,
  RefObject
} from 'react'

import { RemoteMongoDatabase } from 'mongodb-stitch-browser-sdk'
import { client } from '../../logic/StitchAppClient'
import { db } from '../../logic/database'

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
  db: RemoteMongoDatabase
  constructor(props: any) {
    super(props)
    this.state = {
      productions: [],
      loading: true
    }
    this.newProduction = createRef<HTMLInputElement>()
    this.db = db
    this.fetchProductions()
  }
  render() {
    return (
      <div className="page">
        <h1>Theatre DB</h1>
        <br/>
        <b>Productions:</b>
        {this.state.loading
          ? <div>(loading)</div>
          : <div id="productions">{
            this.state.productions.map(p => (
              <div key={p._id} className="production">{p.name}</div>
            ))
          }</div>
        }
        <br/>
        <b>Add a Production:</b><br/>
        <input ref={this.newProduction}/><br/>
        <button onClick={this.addProduction.bind(this)}>Add</button>
      </div>
    )
  }
  fetchProductions() {
    this.db.collection('productions')
      .find({}, { limit: 1000 })
      .asArray()
      .then(productions => {
        this.setState({ productions, loading: false })
      })
  }
  addProduction(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    const userId = client.auth.user && client.auth.user.id
    const newProduction = this.newProduction.current && this.newProduction.current.value
    if (userId && newProduction) {
      this.db.collection('productions')
        .insertOne({
          name: newProduction
        })
        .then(() => {
          this.fetchProductions()
          if (this.newProduction.current) {
            this.newProduction.current.value = ''
          }
        })
    }
  }
}
