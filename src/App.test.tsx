jest.mock('./routes')
jest.mock('./logic/stitch')

import React from 'react'
import renderer from 'react-test-renderer';
import { App } from './App'
import { StitchUser } from 'mongodb-stitch-browser-sdk'

import { client } from './logic/stitch'

function mockUser() {
  const user: unknown = {
    profile: { data: {} },
    loggedInProviderType: 'anon-user'
  }
  return user as StitchUser
}

it('renders without crashing', done => {
  const loginWithCredential = client.auth.loginWithCredential as jest.Mock
  loginWithCredential.mockImplementation(() => {
    client.auth.user = mockUser()
    return Promise.resolve()
  })

  const testRenderer = renderer
    .create(<App/>)
  
  setImmediate(() => {
    expect(testRenderer.toJSON()).toMatchSnapshot()
    done()
  })
})
