import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { data, error } = await serverClient
    .from('ordenes_transferencia')
    .select('*')
    .eq('num_orden', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Orden no encontrada.' }, { status: 404 })
  }

  return NextResponse.json(data)
}
