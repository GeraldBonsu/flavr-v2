export const locales = ['en', 'fr', 'ar', 'yo', 'ha'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'en'
