import { notFound } from 'next/navigation'
import { serverClient } from '@/lib/supabase'
import Comprobante from '@/components/Comprobante'
import type { OrdenTransferencia } from '@/lib/tipos'

interface Props { params: Promise<{ id: string }> }

export default async function ComprobantePage({ params }: Props) {
  const { id } = await params
  const { data, error } = await serverClient
    .from('ordenes_transferencia')
    .select('*')
    .eq('num_orden', id)
    .single()

  if (error || !data) notFound()

  const orden = data as OrdenTransferencia

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Comprobante</h1>
        <p className="text-gray-500 text-sm mt-1">Detalle de la transferencia {id}</p>
      </div>

      <Comprobante orden={orden} />
    </div>
  )
}
