import Link from 'next/link'
import type { OrdenTransferencia } from '@/lib/tipos'
import EstadoBadge from './EstadoBadge'

interface Props {
  ordenes: OrdenTransferencia[]
  showCuentaOrigen?: boolean
}

export default function TablaOrdenes({ ordenes, showCuentaOrigen = false }: Props) {
  if (ordenes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
        No hay transferencias registradas.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Referencia</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
            {showCuentaOrigen && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Origen</th>
            )}
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Beneficiario</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {ordenes.map(o => (
            <tr key={o.num_orden} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-gray-600">{o.num_orden}</td>
              <td className="px-4 py-3 text-gray-700">{o.fec_creacion}</td>
              {showCuentaOrigen && (
                <td className="px-4 py-3 text-gray-700 text-xs">{o.nom_cliente_origen}</td>
              )}
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{o.nom_cliente_destino}</p>
                <p className="text-xs text-gray-400">Banco {o.cod_banco_destino}</p>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">
                ${o.mto_transferencia.toLocaleString('es-CO')}
              </td>
              <td className="px-4 py-3">
                <EstadoBadge estado={o.est_orden} />
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/transferencia/${o.num_orden}`}
                  className="text-xs text-banco-600 hover:underline font-medium"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
