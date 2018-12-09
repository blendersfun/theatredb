jest.mock('./logic/Auth')
jest.mock('./logic/Database')
jest.mock('./routes')

import React from 'react'
import renderer from 'react-test-renderer';
import { App } from './App'

it('renders without crashing', done => {
  const testRenderer = renderer.create(<App/>)
  setImmediate(() => {
    expect(testRenderer.toJSON()).toMatchSnapshot()
    done()
  })
})
