import React, {
  Component,
  createRef,
  RefObject
} from 'react'

import { client } from '../../logic/stitch'
import { UserPasswordCredential } from 'mongodb-stitch-core-sdk';

export class Login extends Component {
  username: RefObject<HTMLInputElement>
  password: RefObject<HTMLInputElement>

  constructor(props: any) {
    super(props)
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
  async login(): Promise<void> {
    const username = this.username.current
    const password = this.password.current
    if (!username) throw new Error('Username ref must refer to some element.')
    if (!password) throw new Error('Password ref must refer to some element.')
    const credential = new UserPasswordCredential(username.value.trim(), password.value)
    try {
      await client.auth.logout()
      await client.auth.loginWithCredential(credential)
      window.dispatchEvent(new CustomEvent('loginStateChanged'))
      window.dispatchEvent(new CustomEvent('navigate', {
        detail: { page: 'home' }
      }))
    } catch (err) {
      console.log(err)
    }
  }
}
