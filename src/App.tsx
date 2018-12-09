import React, {
  Component,
  ReactElement
} from 'react'
import './App.css'
import { Home } from './pages/home/Home'
import { Login } from './pages/login/Login'
import { client } from './logic/StitchAppClient'
import { AnonymousCredential } from 'mongodb-stitch-core-sdk'

type RouteParams = {
  page: string
}

type Routes = {
  [page: string]: (params: RouteParams) => ReactElement<any>|null
}

const routes: Routes = {
  'home': () => <Home/>,
  'login': () => <Login/>,
  'data-entry': () => <div> Data Entry </div>
}

export class App extends Component {
  state: {
    page: ReactElement<any>,
    isAnon: boolean,
    username: string|null
  }
  constructor(props: any) {
    super(props)
    const routeParams = this.routeParamsFromHash(window.location.hash)
    window.onhashchange = this.onHashChange.bind(this)

    this.state = {
      page: <div></div>,
      isAnon: true,
      username: null
    }

    window.addEventListener('loginStateChanged', this.loginStateUpdated.bind(this))
    window.addEventListener('navigate', (event: Event) => {
      const customEvent = event as CustomEvent<RouteParams>
      this.navigate(customEvent.detail)
    })
  
    // Resolve stitch client auth before loading any pages:
    const authPromise = !client.auth.isLoggedIn
      ? client.auth.loginWithCredential(new AnonymousCredential()).then(() => {})
      : Promise.resolve()

    authPromise.then(() => {
      this.loginStateUpdated()
      this.navigate(routeParams)
    })
  }
  routeParamsFromHash(hashStr: string): RouteParams {
    const hash = new URLSearchParams(hashStr.slice(1))
    let page = hash.get('page')
    if (!page || !Object.keys(routes).includes(page)) page = 'home'
    return {
      page
    }
  }
  navigate(routeParams: RouteParams) {
    window.history.pushState({}, '', `#page=${routeParams.page}`)
    this.setState({
      page: this.evaulateRoute(routeParams)
    })
  }
  evaulateRoute(routeParams: RouteParams): ReactElement<any> {
    for (const pageName of Object.keys(routes)) {
      if (pageName === routeParams.page) {
        const page = routes[pageName](routeParams)
        if (page) return page
      }
    }
    return <div>Error: No page found.</div>
  }
  onHashChange() {
    const routeParams = this.routeParamsFromHash(window.location.hash)
    this.setState({ page: this.evaulateRoute(routeParams) })
  }
  render() {
    let loginLogout
    if (this.state.isAnon) {
      loginLogout =  <a href="#page=login">Login</a>
    } else {
      loginLogout = <div>
        <span className="whoami">Logged in as {this.state.username}</span>
        <a onClick={this.logout.bind(this)} href="javascript:;">Logout</a>
      </div>
    }
    return (
      <div className="App">
        <div className="navMenu">
          {loginLogout}
        </div>
        {this.state.page}
      </div>
    )
  }
  loginStateUpdated() {
    const user = client.auth.user
    if (!user) throw new Error('Logged in, but user was not defined.')

    // The typescript definitions appear to be out of data with what the service
    // is returning. Todo: file a bug about this.
    const profile: any = user.profile
    this.setState({
      isAnon: user.loggedInProviderType === 'anon-user',
      username: profile.data.email || null
    })
  }
  logout() {
    return client.auth.logout().then(() => {
      return client.auth.loginWithCredential(new AnonymousCredential())
    }).then(() => {
      this.loginStateUpdated()
    })
  }
}
