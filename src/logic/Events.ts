const registry: any = {}
const callbacksByBind: any = {}

export class Events {
  static attach(eventName: string, callback: EventListener, bind: Object) {
    // Remember what callbacks go with this bind:
    const bindAsIndex = bind as any
    if(!callbacksByBind[bindAsIndex]) callbacksByBind[bindAsIndex] = []
    callbacksByBind[bindAsIndex].push(callback)

    // Remember what eventName and boundCallback go with this callback:
    const callbackAsIndex = callback as any
    const boundCallback: EventListener = callback.bind(bind)
    registry[callbackAsIndex] = { eventName, boundCallback }

    window.addEventListener(eventName, boundCallback)
  }
  static detatch(what: Object|EventListener) {
    if (typeof what === 'function') {
      const callbackAsIndex = what as any
      const entry: any = registry[callbackAsIndex]
      if (entry && entry.eventName && entry.boundCallback) {
        window.removeEventListener(entry.eventName, entry.boundCallback)
      }
    } else {
      const bindAsIndex = what as any
      const entries = callbacksByBind[bindAsIndex]
      if (entries instanceof Array) {
        for (let i = 0; i < entries.length; i++) {
          const callbackAsIndex = entries[i] as any
          const entry: any = registry[callbackAsIndex]
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
