

export class Events {
  static registry: any = {}
  static callbacksByBind: any = {}
  static attach(eventName: string, callback: EventListener, bind: Object) {
    // Remember what callbacks go with this bind:
    const bindAsIndex = bind as any
    if(!this.callbacksByBind[bindAsIndex]) this.callbacksByBind[bindAsIndex] = []
    this.callbacksByBind[bindAsIndex].push(callback)

    // Remember what eventName and boundCallback go with this callback:
    const callbackAsIndex = callback as any
    const boundCallback: EventListener = callback.bind(bind)
    this.registry[callbackAsIndex] = { eventName, boundCallback }

    window.addEventListener(eventName, boundCallback)
  }
  static detatch(what: Object|EventListener) {
    if (typeof what === 'function') {
      const callbackAsIndex = what as any
      const entry: any = this.registry[callbackAsIndex]
      if (entry && entry.eventName && entry.boundCallback) {
        window.removeEventListener(entry.eventName, entry.boundCallback)
      }
    } else {
      const bindAsIndex = what as any
      const entries = this.callbacksByBind[bindAsIndex]
      if (entries instanceof Array) {
        for (let i = 0; i < entries.length; i++) {
          const callbackAsIndex = entries[i] as any
          const entry: any = this.registry[callbackAsIndex]
          if (entry && entry.eventName && entry.boundCallback) {
            window.removeEventListener(entry.eventName, entry.boundCallback)
          }
        }
      }
    }
  }
  static dispatch(eventName: string, detail?: any) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }))
  }
}
