'use client'

// ================================================================
// TransferenciaForm — Formulario de transferencia ACH/TEF
// Recibe las cuentas del usuario logueado desde el Server Component
// ================================================================

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { SolicitudTransferencia, ResultadoTransferencia } from '@/lib/tipos'

interface CuentaResumen {
  cod:    string
  nombre: string
  saldo:  number
  banco?: string
}

interface TransferenciaFormProps {
  cuentas: CuentaResumen[]
}

export default function TransferenciaForm({ cuentas }: TransferenciaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const [form, setForm] = useState<SolicitudTransferencia>({
    cod_cuenta_origen:  cuentas[0]?.cod ?? '',
    cod_banco_destino:  '',
    cod_cuenta_destino: '',
    monto:              0,
    concepto:           '',
    terminal:           'WEB',
  })

  const [comisionPreview, setComisionPreview] = useState<number | null>(null)

  useEffect(() => {
    const m = form.monto
    if (!m || m <= 0)      { setComisionPreview(null); return }
    if (m <= 100000)        setComisionPreview(0)
    else if (m <= 500000)  setComisionPreview(5000)
    else if (m <= 1000000) setComisionPreview(10000)
    else                   setComisionPreview(20000)
  }, [form.monto])

  const set = (k: keyof SolicitudTransferencia, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res  = await fetch('/api/transferencia', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data: ResultadoTransferencia = await res.json()

      if (data.exito && data.orden) {
        router.push(`/transferencia/${data.orden.num_orden}`)
      } else {
        setError(data.mensaje)
      }
    } catch {
      setError('Error de red. Verifique su conexión.')
    } finally {
      setLoading(false)
    }
  }

  const saldoCuenta  = cuentas.find(c => c.cod === form.cod_cuenta_origen)?.saldo ?? 0
  const totalPreview = (form.monto || 0) + (comisionPreview ?? 0)

  if (cuentas.length === 0) {
    return (
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-4 text-sm text-yellow-800">
        No tienes cuentas activas. Contacta al administrador.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">

      {/* Cuenta origen */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta origen</label>
        <select
          required
          value={form.cod_cuenta_origen}
          onChange={e => set('cod_cuenta_origen', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-banco-500"
        >
          {cuentas.map(c => (
            <option key={c.cod} value={c.cod}>
              {c.banco ? `[${c.banco}] ` : ''}{c.cod} — {c.nombre}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Saldo disponible:{' '}
          <span className="font-medium text-gray-600">${saldoCuenta.toLocaleString('es-CO')} COP</span>
        </p>
      </div>

      {/* Banco destino */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Banco destino</label>
        <select
          required
          value={form.cod_banco_destino}
          onChange={e => set('cod_banco_destino', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-banco-500"
        >
          <option value="">— Seleccione banco —</option>
          <option value="001">001 — Banco A (propio)</option>
          <option value="002">002 — Banco B</option>
          <option value="003">003 — Banco C</option>
        </select>
      </div>

      {/* Cuenta destino */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Número de cuenta destino</label>
        <input
          required
          type="text"
          placeholder="002-001-0000654321-0"
          value={form.cod_cuenta_destino}
          onChange={e => set('cod_cuenta_destino', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-banco-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Puedes encontrar el número en el Directorio.
        </p>
      </div>

      {/* Monto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Monto (COP, múltiplos de $100)</label>
        <input
          required
          type="number"
          min={100}
          step={100}
          placeholder="500000"
          value={form.monto || ''}
          onChange={e => set('monto', Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-banco-500"
        />
      </div>

      {/* Preview comisión */}
      {form.monto > 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm space-y-1">
          <div className="flex justify-between text-gray-700">
            <span>Transferencia</span>
            <span>${form.monto.toLocaleString('es-CO')}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Comisión</span>
            <span>${(comisionPreview ?? 0).toLocaleString('es-CO')}</span>
          </div>
          <div className="flex justify-between font-semibold text-banco-700 border-t border-blue-200 pt-1 mt-1">
            <span>Total a descontar</span>
            <span>${totalPreview.toLocaleString('es-CO')}</span>
          </div>
          {totalPreview > saldoCuenta && (
            <p className="text-red-600 text-xs pt-1">⚠ Fondos insuficientes</p>
          )}
        </div>
      )}

      {/* Concepto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
        <input
          required
          type="text"
          maxLength={200}
          placeholder="Pago de servicios"
          value={form.concepto}
          onChange={e => set('concepto', e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-banco-500"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          ❌ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-banco-600 hover:bg-banco-700 disabled:opacity-60 text-white font-semibold py-2.5 text-sm transition-colors"
      >
        {loading ? 'Procesando transferencia...' : 'Enviar transferencia'}
      </button>
    </form>
  )
}
