import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cuenta = searchParams.get('cuenta')
  const estado = searchParams.get('estado')
  const limite = Number(searchParams.get('limite') ?? '50')

  let query = serverClient
    .from('ordenes_transferencia')
    .select('*')
    .order('fec_creacion', { ascending: false })
    .order('hoa_creacion', { ascending: false })
    .limit(limite)

  if (cuenta) query = query.or(`cod_cuenta_origen.eq.${cuenta},cod_cuenta_destino.eq.${cuenta}`)
  if (estado) query = query.eq('est_orden', estado)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
