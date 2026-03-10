// ================================================================
// auth.ts — Utilidades de autenticación
// ================================================================

import { createSSRClient } from './supabase'
import { serverClient } from './supabase'
import type { CuentaCliente } from './tipos'

export const BANCOS: Record<string, string> = {
  '001': 'Banco A',
  '002': 'Banco B',
  '003': 'Banco C',
}

// Retorna el usuario de Supabase Auth de la sesión actual (o null)
export async function getSession() {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ?? null
}

// Retorna TODAS las cuentas del usuario (multi-banco)
export async function getCuentasDelUsuario(userId: string): Promise<CuentaCliente[]> {
  const { data, error } = await serverClient
    .from('cuentas_clientes')
    .select('*')
    .eq('user_id', userId)
    .order('fec_apertura', { ascending: true })
  if (error || !data) return []
  return data as CuentaCliente[]
}

// Alias: retorna la primera cuenta (compatibilidad con código existente)
export async function getCuentaDelUsuario(userId: string): Promise<CuentaCliente | null> {
  const cuentas = await getCuentasDelUsuario(userId)
  return cuentas[0] ?? null
}

// Genera número de cuenta único basado en tipo, banco y timestamp
export function generarNumeroCuenta(tipoCuenta: 'A' | 'C', codBanco: string = '001'): string {
  const tipoSeg = tipoCuenta === 'A' ? '002' : '003'
  const sufijo  = Date.now().toString().slice(-10).padStart(10, '0')
  return `${codBanco}-${tipoSeg}-${sufijo}-0`
}

// Genera código de cliente único
export function generarCodCliente(): string {
  return `CLI${Date.now().toString().slice(-7)}`
}
