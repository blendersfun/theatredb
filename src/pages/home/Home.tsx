import React, {
  Component,
  MouseEvent,
  createRef,
  RefObject,
  ReactElement
} from 'react'

import { client, db } from '../../logic/stitch'

type Productions = {
  _id: string,
  name: string
}

interface HomeState {
  productions: Productions[],
  loading: boolean
}

export class Home extends Component {
  state: HomeState
  constructor(props: any) {
    super(props)
    this.state = {
      productions: [],
      loading: true
    }
  }
  componentDidMount() {
    this.fetchProductions()
  }
  async fetchProductions(): Promise<void> {
    const productions = await db.collection('productions')
      .find({}, { limit: 1000 })
      .asArray()
    this.setState({ productions, loading: false })
  }
  async addProduction(newProduction: string): Promise<void> {
    const userId = client.auth.user && client.auth.user.id
    if (userId && newProduction) {
      await db.collection('productions').insertOne({ name: newProduction })
      await this.fetchProductions()
    }
  }
  render() {
    return (
      <HomeUI {...this.state}
        addProduction={this.addProduction.bind(this)}
        />
    )
  }
}

interface HomeProps extends HomeState {
  addProduction: (newProduction: string) => Promise<void>
}

export class HomeUI extends Component<HomeProps> {
  newProduction: RefObject<HTMLInputElement>
  constructor(props: HomeProps) {
    super(props)
    this.newProduction = createRef()
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
    if (this.props.loading) {
      return <div>(loading)</div>
    } else {
      return <div id="productions">{
        this.props.productions.map(p => (
          <div key={p._id} className="production">{p.name}</div>
        ))
      }</div>
    }
  }
  async addProduction(e: MouseEvent<HTMLButtonElement>): Promise<void> {
    e.preventDefault()
    const newProduction = this.newProduction.current && this.newProduction.current.value
    if (newProduction) {
      await this.props.addProduction(newProduction)
    }
    if (this.newProduction.current) {
      this.newProduction.current.value = ''
    }
  }
}