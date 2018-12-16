import './Home.css'

import React, {
  Component,
  ReactElement
} from 'react'

import _ from 'lodash'

import { db } from '../../logic/stitch'
import { ProductionDetail, Production } from '../../logic/model/Production'
import { PersonInRole } from '../../logic/model/Summaries'

interface HomeState {
  productions: ProductionDetail[],
  loading: boolean,
  sort: any,
  selected: string|null
}

const UP_ARROW = '↑'
const DOWN_ARROW = '↓'

export class Home extends Component {
  state: HomeState
  constructor(props: any) {
    super(props)
    this.state = {
      productions: [],
      loading: true,
      sort: {
        'schedule.closingDate': 1
      },
      selected: null
    }
  }
  componentDidMount() {
    this.fetchProductions()
  }
  async fetchProductions(): Promise<void> {
    const productions = await db.collection<ProductionDetail>('productions')
      .find({}, { limit: 1000 })
      .asArray()
    this.setState({
      productions,
      loading: false
    })
  }
  onSort(fieldPath: string) {
    this.setState({
      sort: {
        [fieldPath]: this.state.sort[fieldPath] === 1 ? -1 : 1
      }
    })
  }
  selectProduction(productionId: string) {
    this.setState({
      selected: this.state.selected === productionId ? null : productionId
    })
  }
  render() {
    return (
      <HomeUI {...this.state}
        onSort={this.onSort.bind(this)}
        selectProduction={this.selectProduction.bind(this)}
        />
    )
  }
}

interface HomeProps extends HomeState {
  onSort: (fieldPath: string) => void,
  selectProduction: (productionId: string) => void
}

export class HomeUI extends Component<HomeProps> {
  constructor(props: HomeProps) {
    super(props)
  }
  render() {
    return (
      <div className="page home">
        <h1>Theatre DB</h1>
        <h2>Productions</h2>
        {this.renderProductions()}
      </div>
    )
  }
  renderProductions(): ReactElement<HTMLDivElement> {
    if (this.props.loading) {
      return <div>(loading)</div>
    } else {
      return (
        <table id="productions">
          <thead>
            <tr key="-1">
              <th onClick={this.onSort.bind(this, 'name')}>
                Production {this.renderArrow('name')}
              </th>
              <th onClick={this.onSort.bind(this, 'script.authors')}>
                Author(s) {this.renderArrow('script.authors')}
              </th>
              <th onClick={this.onSort.bind(this, 'organization.name')}>
                Organization {this.renderArrow('organization.name')}
              </th>
              <th onClick={this.onSort.bind(this, 'schedule.openingDate')}>
                Opens {this.renderArrow('schedule.openingDate')}
              </th>
              <th onClick={this.onSort.bind(this, 'schedule.closingDate')}>
                Closes {this.renderArrow('schedule.closingDate')}
              </th>
              <th onClick={this.onSort.bind(this, 'location')}>
                City {this.renderArrow('location')}
              </th>
            </tr>
          </thead>
          <tbody>{
            this.props.productions
              .sort(this.sortProductions.bind(this))
              .map(p => this.renderProduction(p))
          }</tbody>
        </table>
      )
    }
  }
  sortProductions(p1: ProductionDetail, p2: ProductionDetail): number {
    const mappers: { [fieldPath: string]: Function } = {
      'script.authors': this.renderAuthors,
      'location': this.renderLocation
    }
    for (const fieldPath of Object.keys(this.props.sort)) {
      const multiplier: number = this.props.sort[fieldPath]
      const mapper = mappers[fieldPath]
      let f1 = _.get(p1, fieldPath)
      let f2 = _.get(p2, fieldPath)
      if (mapper) {
        f1 = mapper(f1)
        f2 = mapper(f2)
      }
      if (f1 > f2) return 1 * multiplier
      if (f1 < f2) return -1 * multiplier
    }
    return 0
  }
  renderProduction(p: ProductionDetail): ReactElement<HTMLTableRowElement> {
    const productionId = p._id && p._id.toString()
    // Disabling "production" click event for the moment, as it's looking
    // to be more complex than expected. I'm finding I want to load script 
    // details at this point:
    // onClick={this.selectProduction.bind(this, productionId)}
    return (
      <>
        <tr key={productionId} className="production">
          <td>{p.name}</td>
          <td>{this.renderAuthors(p.script && p.script.authors)}</td>
          <td>{p.organization.name}</td>
          <td>{
            this.renderDate(p.schedule && p.schedule.openingDate)
          }</td>
          <td>{
            this.renderDate(p.schedule && p.schedule.closingDate)
          }</td>
          <td>{
            this.renderLocation(p.location)
          }</td>
        </tr>
        {this.renderProductionDetail(p)}
      </>
    )
  }
  renderProductionDetail(p: ProductionDetail): ReactElement<HTMLTableRowElement>|string {
    const productionId = p._id && p._id.toString()
    if (!productionId || productionId !== this.props.selected) return ''
    return (
      <tr key={productionId + '_detail'}>
        <td colSpan={6}>
          {JSON.stringify(p)}
        </td>
      </tr>
    )
  }
  renderAuthors(authors: PersonInRole[]|undefined): string {
    if (!authors) return ''
    return authors.map(a => a.person.name).join(' and ')
  }
  renderDate(d: Date|undefined): string {
    if (!d) return '' 
    return d.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
  renderLocation(loc: { city?: string, state?: string }|undefined): string {
    if (!loc || !loc.city || !loc.state) return ''
    return `${loc.city}, ${loc.state}`
  }
  renderArrow(fieldPath: string): string {
    if (!this.props.sort[fieldPath]) return ''
    if (this.props.sort[fieldPath] === 1) return DOWN_ARROW
    return UP_ARROW
  }
  onSort(fieldPath: string) {
    this.props.onSort(fieldPath)
  }
  selectProduction(productionId: string|undefined) {
    if (!productionId) return
    this.props.selectProduction(productionId)
  }
}