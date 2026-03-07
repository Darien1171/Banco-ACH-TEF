// ================================================================
// auth.ts — Utilidades de autenticación
// ================================================================

import { createSSRClient } from './supabase'
import { serverClient } from './supabase'
import type { CuentaCliente } from './tipos'

// Retorna el usuario de Supabase Auth de la sesión actual (o null)
export async function getSession() {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ?? null
}

// Retorna la cuenta bancaria del usuario logueado (o null)
export async function getCuentaDelUsuario(userId: string): Promise<CuentaCliente | null> {
  const { data, error } = await serverClient
    .from('cuentas_clientes')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return data as CuentaCliente
}

// Genera número de cuenta único basado en tipo y timestamp
export function generarNumeroCuenta(tipoCuenta: 'A' | 'C'): string {
  const tipoSeg = tipoCuenta === 'A' ? '002' : '003'
  const sufijo  = Date.now().toString().slice(-10).padStart(10, '0')
  return `001-${tipoSeg}-${sufijo}-0`
}

// Genera código de cliente único
export function generarCodCliente(): string {
  return `CLI${Date.now().toString().slice(-7)}`
}
