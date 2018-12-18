import './Home.css'

import React, {
  Component,
  ReactElement,
  RefObject,
  createRef,
  ChangeEvent
} from 'react'

import _ from 'lodash'

import { db } from '../../logic/stitch'
import { ProductionDetail } from '../../logic/model/Production'
import { PersonInRole } from '../../logic/model/Summaries'

function escapeRegExp(param: string) {
  return param.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

interface HomeState {
  productions: ProductionDetail[],
  loading: boolean,
  sort: any,
  selected: string|null,
  searchTerm: RegExp
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
        4: 1
      },
      selected: null,
      searchTerm: new RegExp('', 'i')
    }
  }
  componentDidMount() {
    this.fetchProductions()
  }
  async fetchProductions(): Promise<void> {
    const productions = await db.collection<ProductionDetail>('productions')
      .find({ 'schedule.closingDate': { $gte: new Date() } }, { limit: 1000 })
      .asArray()
    this.setState({
      productions,
      loading: false
    })
  }
  onSort(fieldIndex: number) {
    this.setState({
      sort: {
        [fieldIndex]: this.state.sort[fieldIndex] === 1 ? -1 : 1
      }
    })
  }
  onSearch(searchTerm: string) {
    this.setState({
      searchTerm: new RegExp(escapeRegExp(searchTerm), 'i')
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
        onSearch={this.onSearch.bind(this)}
        selectProduction={this.selectProduction.bind(this)}
        />
    )
  }
}

interface HomeProps extends HomeState {
  onSort: (fieldIndex: number) => void,
  onSearch: (searchTerm: string) => void,
  selectProduction: (productionId: string) => void
}

type ProductionRow1 = [string, string, string, Date|undefined, Date|undefined, string, string]
type ProductionRow2 = [string, string, string, string, string, string, string]

export class HomeUI extends Component<HomeProps> {
  search: RefObject<HTMLInputElement>
  constructor(props: HomeProps) {
    super(props)
    this.search = createRef()
  }
  render() {
    return (
      <div className="page home">
        <h1>Theatre DB</h1>
        <h2>Productions</h2>
        <input ref={this.search} onChange={this.onSearch.bind(this)} placeholder="Search..."/><br/><br/>
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
              <th onClick={this.onSort.bind(this, 0)}>
                Production {this.renderArrow(0)}
              </th>
              <th onClick={this.onSort.bind(this, 1)}>
                Author(s) {this.renderArrow(1)}
              </th>
              <th onClick={this.onSort.bind(this, 2)}>
                Organization {this.renderArrow(2)}
              </th>
              <th onClick={this.onSort.bind(this, 3)}>
                Opens {this.renderArrow(3)}
              </th>
              <th onClick={this.onSort.bind(this, 4)}>
                Closes {this.renderArrow(4)}
              </th>
              <th onClick={this.onSort.bind(this, 5)}>
                City {this.renderArrow(5)}
              </th>
            </tr>
          </thead>
          <tbody>{
            this.props.productions
              .map(p => this.preRenderProduction1(p))
              .sort(this.sortProductions.bind(this))
              .map(p => this.preRenderProduction2(p))
              .filter(this.filterProductions.bind(this))
              // .slice(0, 20)
              .map(p => this.renderProduction(p))
          }</tbody>
        </table>
      )
    }
  }
  preRenderProduction1(p: ProductionDetail): ProductionRow1 {
    return [
      p.name,
      this.renderAuthors(p.script && p.script.authors),
      p.organization.name,
      (p.schedule && p.schedule.openingDate),
      (p.schedule && p.schedule.closingDate),
      this.renderLocation(p.location),
      p._id && p._id.toString() || ''
    ]
  }
  preRenderProduction2(p: ProductionRow1): ProductionRow2 {
    return [
      p[0],
      p[1],
      p[2],
      this.renderDate(p[3]),
      this.renderDate(p[4]),
      p[5],
      p[6],
    ]
  }
  filterProductions(row: any[]): boolean {
    if (!this.props.searchTerm) return true
    for (const cell of row) {
      if (cell.search(this.props.searchTerm) !== -1) {
        return true
      }
    }
    return false
  }
  sortProductions(p1: any[], p2: any[]): number {
    for (const sortKey of Object.keys(this.props.sort)) {
      const fieldIndex = parseInt(sortKey)
      const multiplier: number = this.props.sort[fieldIndex]
      let f1 = p1[fieldIndex]
      let f2 = p2[fieldIndex]
      if (f1 > f2) return 1 * multiplier
      if (f1 < f2) return -1 * multiplier
    }
    return 0
  }
  renderProduction(p: ProductionRow2): ReactElement<HTMLTableRowElement> {
    const [name, authors, organization, openingDate, closingDate, location, productionId] = p
    // Disabling "production" click event for the moment, as it's looking
    // to be more complex than expected. I'm finding I want to load script 
    // details at this point:
    // onClick={this.selectProduction.bind(this, productionId)}
    return (
      <React.Fragment key={productionId}>
        <tr className="production">
          <td>{name}</td>
          <td>{authors}</td>
          <td>{organization}</td>
          <td>{openingDate}</td>
          <td>{closingDate}</td>
          <td>{location}</td>
        </tr>
        {this.renderProductionDetail(productionId || '')}
      </React.Fragment>
    )
  }
  renderProductionDetail(productionId: string): ReactElement<HTMLTableRowElement>|null {
    if (!productionId || productionId !== this.props.selected) return null
    return (
      <tr key={productionId + '_detail'}>
        <td colSpan={6}>
          Placeholder
        </td>
      </tr>
    )
  }
  renderAuthors(authors: PersonInRole[]|undefined): string {
    if (!authors) return ''
    return authors.map(a => a.person.name).join(', ')
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
  renderArrow(fieldIndex: number): string {
    if (!this.props.sort[fieldIndex]) return ''
    if (this.props.sort[fieldIndex] === 1) return DOWN_ARROW
    return UP_ARROW
  }
  onSort(fieldIndex: number) {
    this.props.onSort(fieldIndex)
  }
  onSearch(event: ChangeEvent<HTMLInputElement>) {
    this.props.onSearch(event.target.value)
  }
  selectProduction(productionId: string|undefined) {
    if (!productionId) return
    this.props.selectProduction(productionId)
  }
}