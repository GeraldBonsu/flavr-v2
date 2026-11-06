'use client'

import { useEffect } from 'react'
import { isNative, NATIVE_AUTH_CALLBACK } from '@/lib/native'

/**
 * Wires native-only behaviour when running inside the Capacitor shell.
 * Renders nothing and does nothing in a normal browser.
 */
export default function NativeBridge() {
  useEffect(() => {
    if (!isNative()) return
    document.documentElement.classList.add('is-native')

    const cleanups: Array<() => void> = []
    let cancelled = false

    ;(async () => {
      const [{ App }, { Browser }, { StatusBar, Style }, { SplashScreen }] = await Promise.all([
        import('@capacitor/app'),
        import('@capacitor/browser'),
        import('@capacitor/status-bar'),
        import('@capacitor/splash-screen'),
      ])
      if (cancelled) return

      StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
      SplashScreen.hide().catch(() => {})

      // OAuth return: live.flavr.app://auth/callback?code=…&next=…
      const urlSub = await App.addListener('appUrlOpen', ({ url }) => {
        if (!url.startsWith(NATIVE_AUTH_CALLBACK)) return
        const query = url.slice(NATIVE_AUTH_CALLBACK.length)
        Browser.close().catch(() => {})
        window.location.href = `/auth/callback${query}`
      })
      cleanups.push(() => urlSub.remove())

      // Android hardware back button
      const backSub = await App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) window.history.back()
        else App.exitApp()
      })
      cleanups.push(() => backSub.remove())
    })()

    return () => {
      cancelled = true
      cleanups.forEach(fn => fn())
    }
  }, [])

  return null
}
