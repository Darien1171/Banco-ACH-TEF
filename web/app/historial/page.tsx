// ================================================================
// /historial — Historial de transferencias del usuario (multi-cuenta)
// ================================================================

import { redirect } from 'next/navigation'
import { serverClient } from '@/lib/supabase'
import { getSession, getCuentasDelUsuario } from '@/lib/auth'
import TablaOrdenes from '@/components/TablaOrdenes'
import type { OrdenTransferencia } from '@/lib/tipos'

export default async function HistorialPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const cuentas = await getCuentasDelUsuario(user.id)
  const codigoCuentas = cuentas.map(c => c.cod_cuenta)

  const { data } = codigoCuentas.length > 0
    ? await serverClient
        .from('ordenes_transferencia')
        .select('*')
        .in('cod_cuenta_origen', codigoCuentas)
        .order('fec_creacion', { ascending: false })
        .order('hoa_creacion', { ascending: false })
        .limit(100)
    : { data: [] }

  const ordenes = (data ?? []) as OrdenTransferencia[]

  const resumen = {
    total:      ordenes.length,
    exitosas:   ordenes.filter(o => o.est_orden === 'CONFIRMADA').length,
    rechazadas: ordenes.filter(o => o.est_orden === 'RECHAZADA').length,
    pendientes: ordenes.filter(o => o.est_orden.startsWith('PENDIENTE')).length,
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Historial de Transferencias</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tus transferencias realizadas{cuentas.length > 1 ? ` en ${cuentas.length} cuentas` : ''}.
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',      value: resumen.total,      cls: 'text-gray-700' },
          { label: 'Exitosas',   value: resumen.exitosas,   cls: 'text-green-700' },
          { label: 'Rechazadas', value: resumen.rechazadas, cls: 'text-red-700' },
          { label: 'Pendientes', value: resumen.pendientes, cls: 'text-yellow-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <TablaOrdenes ordenes={ordenes} showCuentaOrigen />
    </div>
  )
}
