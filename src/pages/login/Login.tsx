import React, {
  Component,
  createRef,
  RefObject
} from 'react'

import { client } from '../../logic/StitchAppClient'
import { UserPasswordCredential } from 'mongodb-stitch-core-sdk';

export class Login extends Component {
  state: {}
  username: RefObject<HTMLInputElement>
  password: RefObject<HTMLInputElement>

  constructor(props: any) {
    super(props)
    this.state = {}
    this.username = createRef()
    this.password = createRef()
  }
  render() {
    return (
      <div className="page">
        <h1>Login</h1>
        Username: <input ref={this.username}></input><br/>
        Password: <input ref={this.password} type="password"></input><br/>
        <button onClick={this.login.bind(this)}>Login</button>
      </div>
    )
  }
  login() {
    const username = this.username.current
    const password = this.password.current
    if (!username) throw new Error('Username ref must refer to some element.')
    if (!password) throw new Error('Password ref must refer to some element.')
    return client.auth.logout().then(() => {
      return client.auth.loginWithCredential(
        new UserPasswordCredential(username.value.trim(), password.value)
      )
    }).then(() => {
      const loginSuccess = new CustomEvent('loginStateChanged')
      const navigate = new CustomEvent('navigate', {
        detail: { page: 'home' }
      })
      window.dispatchEvent(loginSuccess)
      window.dispatchEvent(navigate)

    }).catch(err => {
      console.log(err)
    })
  }
}
