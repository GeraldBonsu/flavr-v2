import { createServerClient } from '@supabase/ssr'
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Sync FLAVR_LANG cookie from profile on first load (when cookie is absent)
  if (!request.cookies.get('FLAVR_LANG')?.value) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
      )
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('language')
          .eq('id', user.id)
          .single()
        if (data?.language) {
          response.cookies.set('FLAVR_LANG', data.language as string, {
            path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365,
          })
        }
      }
    } catch { /* non-critical */ }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
