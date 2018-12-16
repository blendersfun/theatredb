import React, { ReactElement } from 'react'

import { Home } from './pages/home/Home'
import { Login } from './pages/login/Login'
import { DataEntry } from './pages/data-entry/DataEntry'

export type RouteParams = {
  page: string
}

export type RouteConfig = {
  [page: string]: (params: RouteParams) => ReactElement<any>|null
}

export class Routes {
  static routes: RouteConfig = {
    'home': () => <Home/>,
    'login': () => <Login/>,
    'data-entry': () => <DataEntry/>
  }
  static evaulateRoute(routeParams: RouteParams): ReactElement<any> {
    for (const pageName of Object.keys(this.routes)) {
      if (pageName === routeParams.page) {
        const page = this.routes[pageName](routeParams)
        if (page) return page
      }
    }
    return <div>Error: No page found.</div>
  }
  static exists(routeName: string): boolean {
    return this.routes.hasOwnProperty(routeName)
  }
}
