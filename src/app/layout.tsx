import type { Metadata, Viewport } from 'next'
import { getLocale, getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import './globals.css'

export const metadata: Metadata = {
  title: 'flavr. — Your AI kitchen companion',
  description: 'Recipes from what you have. Nutrition that fits your goals.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1A3A0A',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className="h-full">
      <body className="min-h-full flex justify-center">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="phone-shell">
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
