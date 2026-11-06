import type { CapacitorConfig } from '@capacitor/cli'

// The native apps load the live Next.js app (server components + API routes
// can't be statically exported). `native-shell/` is only shown if the server
// URL can't be reached, and is what `cap sync` copies into the native projects.
const config: CapacitorConfig = {
  appId: 'live.flavr.app',
  appName: 'Flavr',
  webDir: 'native-shell',
  server: {
    url: process.env.CAP_SERVER_URL || 'https://flavr.live',
    cleartext: false,
    errorPath: 'offline.html',
  },
  ios: {
    contentInset: 'never',
    scheme: 'Flavr',
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#1A3A0A',
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: true,
      style: 'LIGHT',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config
