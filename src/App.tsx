import './App.css'

import React, {
  Component,
  ReactElement
} from 'react'

import { RouteParams, Routes } from './routes'
import { client } from './logic/stitch'
import { AnonymousCredential } from 'mongodb-stitch-core-sdk'

interface AppState {
  page: ReactElement<any>,
  isAnonymous: boolean,
  userEmail: string|null
}

export class App extends Component {
  state: AppState
  constructor(props: any) {
    super(props)
    this.state = {
      page: <div/>,
      isAnonymous: true,
      userEmail: null
    }
  }
  async componentDidMount(): Promise<void> {
    const routeParams = this.routeParamsFromHash(window.location.hash)
    this.listen()
  
    // Resolve stitch client auth before loading any pages:
    if (!client.auth.isLoggedIn) {
      await client.auth.loginWithCredential(new AnonymousCredential())
    }

    this.loginStateUpdated()
    this.navigate(routeParams)
  }
  listen() {
    window.addEventListener('hashchange', this.hashChanged.bind(this))
    window.addEventListener('loginStateChanged', this.loginStateUpdated.bind(this))
    window.addEventListener('navigate', (event: Event) => {
      const customEvent = event as CustomEvent<RouteParams>
      this.navigate(customEvent.detail)
    })
  }
  routeParamsFromHash(hashStr: string): RouteParams {
    const hash = new URLSearchParams(hashStr.slice(1))
    let page = hash.get('page')
    if (!page || !Routes.exists(page)) page = 'home'
    return {
      page
    }
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
  loginStateUpdated() {
    const user = client.auth.user
    if (!user) throw new Error('Logged in, but user was not defined.')

    // The typescript definitions appear to be out of data with what the service
    // is returning. Todo: file a bug about this.
    const profile: any = user.profile
    this.setState({
      isAnonymous: user.loggedInProviderType === 'anon-user',
      userEmail: profile.data.email || null
    })
  }
  async logout(): Promise<void> {
    await client.auth.logout()
    await client.auth.loginWithCredential(new AnonymousCredential())
    this.loginStateUpdated()
  }
  render() {
    return (
      <AppUI {...this.state}
        logout={this.logout.bind(this)}
        />
    )
  }
}

interface AppProps extends AppState {
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
    if (this.props.isAnonymous) {
      return <a href="#page=login">Login</a>
    } else {
      return <div>
        <span className="whoami">Logged in as {this.props.userEmail}</span>
        <a onClick={this.props.logout} href="javascript:;">Logout</a>
      </div>
    }
  }
}
