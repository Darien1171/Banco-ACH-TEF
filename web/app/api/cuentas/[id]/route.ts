import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { data, error } = await serverClient
    .from('cuentas_clientes')
    .select('cod_cuenta, cod_cliente, nom_cliente, tip_cuenta, sal_disponible, sal_bloqueado, sal_total, mca_activa, mca_congelada, cod_banco')
    .eq('cod_cuenta', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Cuenta no encontrada.' }, { status: 404 })
  }

  return NextResponse.json(data)
}
