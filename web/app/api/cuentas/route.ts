// ================================================================
// GET /api/cuentas — Directorio público de cuentas
// Solo devuelve campos no sensibles: nombre, número de cuenta,
// tipo y banco. NUNCA saldos ni datos financieros.
// ================================================================

import { NextResponse } from 'next/server'
import { createSSRClient, serverClient } from '@/lib/supabase'

export async function GET() {
  // Requiere autenticación
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const { data, error } = await serverClient
    .from('cuentas_clientes')
    .select('cod_cuenta, nom_cliente, tip_cuenta, cod_banco')
    .eq('mca_activa', true)
    .order('nom_cliente', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Error al obtener el directorio.' }, { status: 500 })
  }

  return NextResponse.json({ cuentas: data ?? [] })
}
