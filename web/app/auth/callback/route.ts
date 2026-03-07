// ================================================================
// GET /auth/callback — Intercambia el código de Supabase por sesión
// Usado por: confirmación de email, recuperación de contraseña
// ================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'recovery' | 'signup' | null

  if (code) {
    const supabase = await createSSRClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Si es recuperación de contraseña → ir a /reset-password
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }
      // Si es confirmación de email → ir al dashboard
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // Error → volver al login con mensaje
  return NextResponse.redirect(`${origin}/login?error=link_invalido`)
}
