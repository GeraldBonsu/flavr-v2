'use client'

import { Capacitor } from '@capacitor/core'
import { createClient } from '@/lib/supabase/client'

/** Custom URL scheme registered in Info.plist / AndroidManifest.xml. */
export const NATIVE_SCHEME = 'live.flavr.app'
export const NATIVE_AUTH_CALLBACK = `${NATIVE_SCHEME}://auth/callback`

/** True inside the iOS/Android Capacitor shell, false in a normal browser. */
export function isNative(): boolean {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform()
}

export function nativePlatform(): 'ios' | 'android' | 'web' {
  return typeof window === 'undefined' ? 'web' : (Capacitor.getPlatform() as 'ios' | 'android' | 'web')
}

/**
 * OAuth sign-in that works both on the web and inside the native apps.
 * Google blocks OAuth inside embedded WebViews, so in the app we open the
 * provider in the system browser (SFSafariViewController / Custom Tabs) and
 * come back via the live.flavr.app:// deep link (handled in NativeBridge).
 * The PKCE verifier stays in this WebView's cookies, so /auth/callback can
 * finish the exchange server-side exactly as on the web.
 */
export async function signInWithOAuth(provider: 'google' | 'apple', next: string) {
  const supabase = createClient()

  if (isNative()) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${NATIVE_AUTH_CALLBACK}?next=${encodeURIComponent(next)}`,
        skipBrowserRedirect: true,
      },
    })
    if (error || !data?.url) return { error }
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url: data.url, presentationStyle: 'popover' })
    return { error: null }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(next)}` },
  })
  return { error }
}

/** Light haptic tap in the app; no-op on the web. */
export async function hapticTap() {
  if (!isNative()) return
  const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
  await Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
}
