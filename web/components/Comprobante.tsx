'use client'

import type { OrdenTransferencia } from '@/lib/tipos'
import EstadoBadge from './EstadoBadge'

interface Props { orden: OrdenTransferencia }

function Fila({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}

export default function Comprobante({ orden }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md max-w-lg w-full p-6 print:shadow-none">
      {/* Encabezado */}
      <div className="text-center mb-6 pb-4 border-b border-gray-200">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Banco A</p>
        <h1 className="text-lg font-bold text-gray-900">Comprobante de Transferencia</h1>
        <div className="mt-2">
          <EstadoBadge estado={orden.est_orden} />
        </div>
      </div>

      {/* Referencia */}
      <div className="bg-blue-50 rounded-lg px-4 py-3 mb-5 text-center">
        <p className="text-xs text-blue-500 mb-1">Número de referencia</p>
        <p className="font-mono text-base font-bold text-banco-700">{orden.num_orden}</p>
        <p className="text-xs text-gray-500 mt-1">
          {orden.fec_creacion} · {orden.hoa_creacion}
        </p>
      </div>

      {/* Ordenante */}
      <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Ordenante</p>
      <div className="mb-4">
        <Fila label="Titular"  value={orden.nom_cliente_origen} />
        <Fila label="Cuenta"   value={<span className="font-mono text-xs">{orden.cod_cuenta_origen}</span>} />
        <Fila label="Banco"    value={`Banco ${orden.cod_banco_origen}`} />
      </div>

      {/* Beneficiario */}
      <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Beneficiario</p>
      <div className="mb-4">
        <Fila label="Titular"  value={orden.nom_cliente_destino} />
        <Fila label="Cuenta"   value={<span className="font-mono text-xs">{orden.cod_cuenta_destino}</span>} />
        <Fila label="Banco"    value={`Banco ${orden.cod_banco_destino}`} />
      </div>

      {/* Montos */}
      <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Movimiento</p>
      <div className="mb-4">
        <Fila label="Transferencia" value={`$${orden.mto_transferencia.toLocaleString('es-CO')} ${orden.tip_moneda}`} />
        <Fila label="Comisión"      value={`$${orden.mto_comision.toLocaleString('es-CO')}`} />
        <div className="flex justify-between py-2 text-sm font-bold text-banco-700">
          <span>Total debitado</span>
          <span>${orden.mto_total.toLocaleString('es-CO')}</span>
        </div>
      </div>

      <Fila label="Concepto" value={orden.des_concepto ?? '—'} />

      {/* Botones */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => window.print()}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Imprimir
        </button>
        <a
          href="/historial"
          className="flex-1 rounded-lg bg-banco-600 hover:bg-banco-700 text-white text-sm font-semibold px-4 py-2 text-center transition-colors"
        >
          Ver historial
        </a>
      </div>
    </div>
  )
}
