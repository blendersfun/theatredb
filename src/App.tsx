import './App.css'

import React, {
  Component,
  ReactElement
} from 'react'

import { RouteParams, Routes } from './routes'
import { Auth } from './logic/Auth'
import { Events } from './logic/Events'

export interface AppState {
  page: ReactElement<any>,
  isLoggedIn: boolean,
  userEmail: string|null
}

export class App extends Component {
  state: AppState
  constructor(props: any) {
    super(props)
    this.state = {
      page: <div/>,
      isLoggedIn: false,
      userEmail: null
    }
  }
  async componentDidMount(): Promise<void> {
    this.attach()
    await Auth.init()
    this.navigate(this.routeParamsFromHash(window.location.hash))
  }
  componentWillUnmount() {
    Events.detatch(this)
  }
  attach() {
    Events.attach('hashchange', this.hashChanged, this)
    Events.attach('loginStateChanged', this.loginStateChanged, this)
    Events.attach('navigate', this.onNavigate, this)
  }
  routeParamsFromHash(hashStr: string): RouteParams {
    const hash = new URLSearchParams(hashStr.slice(1))
    let page = hash.get('page')
    if (!page || !Routes.exists(page)) page = 'home'
    return {
      page
    }
  }
  onNavigate(event: Event) {
    const customEvent = event as CustomEvent<RouteParams>
    this.navigate(customEvent.detail)
  }
  navigate(routeParams: RouteParams) {
    window.history.pushState({}, '', `#page=${routeParams.page}`)
    this.setState({
      page: Routes.evaulateRoute(routeParams)
    })
  }
  hashChanged() {
    const routeParams = this.routeParamsFromHash(window.location.hash)
    this.setState({ page: Routes.evaulateRoute(routeParams) })
  }
  loginStateChanged() {
    const user = Auth.user()
    this.setState({
      isLoggedIn: user !== null,
      userEmail: user && user.email
    })
  }
  async logout(): Promise<void> {
    await Auth.logout()
  }
  render() {
    return (
      <AppUI {...this.state}
        logout={this.logout.bind(this)}
        />
    )
  }
}

export interface AppProps extends AppState {
  logout: () => void
}

export class AppUI extends Component<AppProps> {
  render() {
    return (
      <div className="App">
        <div className="navMenu">
          {this.renderLoginStatus()}
        </div>
        {this.props.page}
      </div>
    )
  }
  renderLoginStatus(): ReactElement<any> {
    if (!this.props.isLoggedIn) {
      return <a href="#page=login">Login</a>
    } else {
      return <div>
        <span className="whoami">Logged in as {this.props.userEmail}</span>
        <a onClick={this.props.logout} href="javascript:;">Logout</a>
      </div>
    }
  }
}
