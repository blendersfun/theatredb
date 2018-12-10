jest.mock('./logic/Auth')
jest.mock('./logic/Events')
jest.mock('./routes')

import React from 'react'
import renderer from 'react-test-renderer';
import { App, AppUI, AppProps } from './App'
import sinon from 'sinon'

import { Routes } from './routes'
import { Auth } from './logic/Auth'
import { Events } from './logic/Events'


describe('logic', function () {
  const init = Auth.init as jest.Mock
  const user = Auth.user as jest.Mock
  const evaluateRoute = Routes.evaulateRoute as jest.Mock
  const exists = Routes.exists as jest.Mock
  const attach = Events.attach as jest.Mock
  const detatch = Events.detatch as jest.Mock

  beforeEach(() => {
    sinon.stub(App.prototype, 'render').returns(<div>Fake App</div>)
    window.location.hash = ''
  })
  afterEach(() => {
    sinon.restore()
    init.mockClear()
    user.mockClear()
    evaluateRoute.mockClear()
    attach.mockClear()
    detatch.mockClear()
    window.location.hash = ''
  })
  it('initializes the state when constructed', () => {
    const app = new App({})
    expect(app.state.page).toMatchSnapshot()
    expect(app.state.isLoggedIn).toBe(false)
    expect(app.state.userEmail).toBe(null)
  })
  it('attaches events on mount and detatches them on unmount', done => {
    const testRender = renderer.create(<App/>)
    const app: App = testRender.getInstance() as any
    if (app === null) throw new Error('Expected app instance to be non-null.')
    setImmediate(() => {
      testRender.unmount()
      expect(Events.attach).toBeCalledTimes(3)
      expect(Events.detatch).toBeCalledTimes(1)
      done()
    })
  })
  it('redirects to page=home on mount when hash is empty, and initializes Auth state', done => {
    renderer.create(<App/>)
    setImmediate(() => {
      // Todo: refactor window.history into ./logic so it can be mocked easily
      // and verified here.
      expect(evaluateRoute).toBeCalledWith({ page: 'home' })
      expect(Auth.init).toBeCalledTimes(1)
      done()
    })
  })
  it('redirects to page=home on mount when hash is an unknown page', done => {
    window.location.hash = '#page=f10b42b0-9bae-47d6-9071-9d46ae917b5c'
    renderer.create(<App/>)
    setImmediate(() => {
      expect(evaluateRoute).toBeCalledWith({ page: 'home' })
      done()
    })
  })
  it('navigates to page=login on mount when hash is login', done => {
    window.location.hash = '#page=login'
    renderer.create(<App/>)
    exists.mockReturnValueOnce(true)
    setImmediate(() => {
      expect(evaluateRoute).toBeCalledWith({ page: 'login' })
      done()
    })
  })
  it('navigates to page=login when the hash updates to login', done => {
    const app: App = renderer.create(<App/>).getInstance() as any
    exists.mockReturnValueOnce(true)
    setImmediate(() => {
      window.location.hash = '#page=login'
      app.onHashChanged()
      expect(evaluateRoute).toBeCalledWith({ page: 'login' })
      done()
    })
  })
  it('navigates to page=login when a navigate event indicates to', done => {
    const app: App = renderer.create(<App/>).getInstance() as any
    exists.mockReturnValueOnce(true)
    setImmediate(() => {
      app.onNavigate(new CustomEvent('navigate', { detail: { page: 'login' } }))
      expect(evaluateRoute).toBeCalledWith({ page: 'login' })
      done()
    })
  })
  it('updates the user when a loginStateChanged event indicates to', done => {
    user.mockReturnValueOnce({ email: 'albus@hogwarts.edu' })
    const testRenderer = renderer.create(<App/>)
    const app: App = testRenderer.getInstance() as any
    app.onLoginStateChanged()
    setImmediate(() => {
      expect(user).toBeCalledTimes(1)
      expect(app.state.isLoggedIn).toBe(true)
      expect(app.state.userEmail).toBe('albus@hogwarts.edu')
      done()
    })
  })
})

describe('ui', () => {
  it('renders a test page with a user not logged in', () => {
    const props: AppProps = {
      page: <div> Test Page </div>,
      isLoggedIn: false,
      userEmail: null,
      logout: jest.fn()
    }
    expect(renderer.create(<AppUI {...props}/>).toJSON()).toMatchSnapshot()
  })
  it('renders a test page with a user logged in', () => {
    const props: AppProps = {
      page: <div> Test Page </div>,
      isLoggedIn: true,
      userEmail: 'snape@hogwarts.edu',
      logout: jest.fn()
    }
    expect(renderer.create(<AppUI {...props}/>).toJSON()).toMatchSnapshot()
  })
  it('renders a test page with a no logged in user but an email present the same as no logged in user', () => {
    const props: AppProps = {
      page: <div> Test Page </div>,
      isLoggedIn: false,
      userEmail: 'snape@hogwarts.edu',
      logout: jest.fn()
    }
    expect(renderer.create(<AppUI {...props}/>).toJSON()).toMatchSnapshot()
  })
})
