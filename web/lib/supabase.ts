// ================================================================
// supabase.ts — Clientes de Supabase
//
// serverClient  → operaciones DB en API routes / Server Components
//                 (usa anon key; sin RLS, la seguridad va en las rutas)
// createSSRClient() → leer / escribir la sesión del usuario (cookies)
// ================================================================

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServerKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey

// ── Cliente genérico para DB (Server Components / API routes) ───
export const serverClient = createClient(supabaseUrl, supabaseServerKey, {
  auth: { persistSession: false },
})

// ── Cliente SSR con cookies — para leer/escribir sesión ─────────
// Usado en middleware, Server Components y API routes que necesiten
// saber quién está logueado.
export async function createSSRClient() {
  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll()                   { return cookieStore.getAll() },
      setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]))
        } catch {
          // En Server Components (solo lectura) se ignora
        }
      },
    },
  })
}
