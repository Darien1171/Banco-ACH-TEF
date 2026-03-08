import { serverClient } from '@/lib/supabase'
import EstadoBadge from '@/components/EstadoBadge'
import type { AuditoriaTransaccion } from '@/lib/tipos'

export const dynamic = 'force-dynamic'

export default async function AuditoriaPage() {
  const { data } = await serverClient
    .from('auditoria_transacciones')
    .select('*')
    .order('fec_transaccion', { ascending: false })
    .limit(100)

  const registros = (data ?? []) as AuditoriaTransaccion[]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Log de Auditoría</h1>
        <p className="text-gray-500 text-sm mt-1">
          Registro inmutable de todas las transacciones del sistema. Solo lectura.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Num. Auditoría', 'Fecha', 'Hora inicio', 'Tipo', 'Usuario', 'Terminal', 'Monto', 'Estado', 'Observación'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {registros.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-400 text-sm">
                  Sin registros de auditoría.
                </td>
              </tr>
            ) : registros.map(r => (
              <tr key={r.num_auditoria} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.num_auditoria}</td>
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{r.fec_transaccion}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.hoa_inicio}</td>
                <td className="px-4 py-3 text-gray-700">{r.tip_transaccion}</td>
                <td className="px-4 py-3 text-gray-700">{r.cod_usuario ?? '—'}</td>
                <td className="px-4 py-3 text-gray-700">{r.terminal ?? '—'}</td>
                <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                  ${r.mto_procesado.toLocaleString('es-CO')}
                </td>
                <td className="px-4 py-3">
                  <EstadoBadge estado={r.estado_final} />
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate" title={r.observacion ?? ''}>
                  {r.observacion ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
