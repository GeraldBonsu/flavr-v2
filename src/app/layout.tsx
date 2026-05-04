import type { Metadata, Viewport } from 'next'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex justify-center">
        <div className="phone-shell">
          {children}
        </div>
      </body>
    </html>
  )
}
