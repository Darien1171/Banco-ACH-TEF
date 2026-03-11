import { serverClient } from '@/lib/supabase'
import EstadoBadge from '@/components/EstadoBadge'
import type { AuditoriaTransaccion, OrdenTransferencia } from '@/lib/tipos'

export const dynamic = 'force-dynamic'

const BANCOS: Record<string, string> = {
  '001': 'Banco A',
  '002': 'Banco B',
  '003': 'Banco C',
}

export default async function AuditoriaPage() {
  const { data: audData } = await serverClient
    .from('auditoria_transacciones')
    .select('*')
    .order('fec_transaccion', { ascending: false })
    .order('hoa_inicio',      { ascending: false })
    .limit(100)

  const registros = (audData ?? []) as AuditoriaTransaccion[]

  // Obtener órdenes para las auditorías que tienen num_orden
  const numOrdenes = registros
    .map(r => r.num_orden)
    .filter((n): n is string => !!n)

  let ordenesMap = new Map<string, OrdenTransferencia>()

  if (numOrdenes.length > 0) {
    const { data: ordData } = await serverClient
      .from('ordenes_transferencia')
      .select('num_orden, cod_cuenta_origen, cod_banco_origen, cod_cuenta_destino, cod_banco_destino, nom_cliente_origen, nom_cliente_destino, mto_transferencia')
      .in('num_orden', numOrdenes)

    for (const o of (ordData ?? []) as OrdenTransferencia[]) {
      ordenesMap.set(o.num_orden, o)
    }
  }

  const COLS = [
    'Num. Auditoría', 'Fecha', 'Hora', 'Usuario',
    'Cuenta origen', 'Banco origen',
    'Cuenta destino', 'Banco destino',
    'Monto', 'Estado', 'Observación',
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Log de Auditoría</h1>
        <p className="text-gray-500 text-sm mt-1">
          Registro de todas las transacciones del sistema. Solo lectura.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {COLS.map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {registros.length === 0 ? (
              <tr>
                <td colSpan={COLS.length} className="px-4 py-10 text-center text-gray-400 text-sm">
                  Sin registros de auditoría.
                </td>
              </tr>
            ) : registros.map(r => {
              const orden = r.num_orden ? ordenesMap.get(r.num_orden) : undefined
              return (
                <tr key={r.num_auditoria} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{r.num_auditoria}</td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{r.fec_transaccion}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{r.hoa_inicio}</td>
                  <td className="px-4 py-3 text-gray-700 text-xs max-w-[140px] truncate" title={r.cod_usuario ?? ''}>
                    {r.cod_usuario ?? '—'}
                  </td>

                  {/* Cuenta origen */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {orden ? (
                      <span className="font-mono text-xs text-gray-700">{orden.cod_cuenta_origen}</span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {orden ? (
                      <span className="text-xs text-gray-600">{BANCOS[orden.cod_banco_origen] ?? orden.cod_banco_origen}</span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>

                  {/* Cuenta destino */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {orden ? (
                      <div>
                        <p className="font-mono text-xs text-gray-700">{orden.cod_cuenta_destino}</p>
                        <p className="text-xs text-gray-400">{orden.nom_cliente_destino}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {orden ? (
                      <span className="text-xs text-gray-600">{BANCOS[orden.cod_banco_destino] ?? orden.cod_banco_destino}</span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                    ${r.mto_procesado.toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={r.estado_final} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate" title={r.observacion ?? ''}>
                    {r.observacion ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
