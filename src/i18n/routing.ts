export const locales = ['en', 'fr', 'ar', 'yo', 'ha', 'es', 'sw'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'en'
