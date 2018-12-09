jest.mock('./logic/Auth')
jest.mock('./logic/Database')
jest.mock('./routes')

import React, { ReactElement } from 'react'
import renderer from 'react-test-renderer';
import { AppUI, AppProps } from './App'


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