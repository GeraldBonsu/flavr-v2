import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const SUPPORTED = ['en', 'fr', 'ar', 'yo', 'ha', 'es', 'sw'] as const
type Locale = typeof SUPPORTED[number]

function isSupportedLocale(l: string): l is Locale {
  return (SUPPORTED as readonly string[]).includes(l)
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw = cookieStore.get('FLAVR_LANG')?.value ?? 'en'
  const locale: Locale = isSupportedLocale(raw) ? raw : 'en'

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default as Record<string, unknown>,
  }
})
