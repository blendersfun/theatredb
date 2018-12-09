
import { client } from './stitch'
import {
  AnonymousCredential,
  UserPasswordCredential
} from 'mongodb-stitch-core-sdk'

export type User = {
  email: string
}

export class Auth {
  static async init(): Promise<void> {
    // Resolve stitch client auth before loading any pages:
    if (!client.auth.isLoggedIn) {
      await client.auth.loginWithCredential(new AnonymousCredential())
    }
    window.dispatchEvent(new CustomEvent('loginStateChanged'))
  }
  static async login(email: string, password: string): Promise<void> {
    await client.auth.logout()
    const credential = new UserPasswordCredential(email, password)
    await client.auth.loginWithCredential(credential)
    window.dispatchEvent(new CustomEvent('loginStateChanged'))
    window.dispatchEvent(new CustomEvent('navigate', {
      detail: { page: 'home' }
    }))
  }
  static async logout(): Promise<void> {
    await client.auth.logout()
    await client.auth.loginWithCredential(new AnonymousCredential())
    window.dispatchEvent(new CustomEvent('loginStateChanged'))
  }
  static user(): User|null {
    const user = client.auth.user
    if (!user) throw new Error('Logged in, but user was not defined.')

    // The typescript definitions appear to be out of data with what the service
    // is returning. Todo: file a bug about this.
    const profile: any = user.profile
    if (user.loggedInProviderType === 'anon-user') {
      return null
    }
    return {
      email: profile.data.email || null
    }
  }
}
