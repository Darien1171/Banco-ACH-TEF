'use client'

// ================================================================
// DepositoForm — Formulario de depósito demo (multi-cuenta)
// ================================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CuentaResumen {
  cod:    string
  nombre: string
  saldo:  number
  banco?: string
}

interface DepositoFormProps {
  cuentas: CuentaResumen[]
}

const MONTOS_RAPIDOS = [50_000, 200_000, 500_000, 1_000_000]

export default function DepositoForm({ cuentas }: DepositoFormProps) {
  const router   = useRouter()
  const [codCuentaSeleccionada, setCodCuenta] = useState(cuentas[0]?.cod ?? '')
  const [monto,   setMonto]   = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<number | null>(null)

  const cuentaActual = cuentas.find(c => c.cod === codCuentaSeleccionada) ?? cuentas[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!monto) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res  = await fetch('/api/deposito', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ monto, codCuenta: cuentaActual?.cod }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al procesar el depósito.')
      } else {
        setSuccess(data.saldoNuevo)
        setMonto('')
        router.refresh()
      }
    } catch {
      setError('Error de red. Verifica tu conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md space-y-6">

      {/* Selector de cuenta destino */}
      {cuentas.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta destino</label>
          <select
            value={codCuentaSeleccionada}
            onChange={e => { setCodCuenta(e.target.value); setSuccess(null); setError(null) }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-banco-500"
          >
            {cuentas.map(c => (
              <option key={c.cod} value={c.cod}>
                {c.banco ? `[${c.banco}] ` : ''}{c.cod}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tarjeta de cuenta */}
      {cuentaActual && (
        <div className="rounded-xl bg-banco-800 text-white p-5">
          <p className="text-xs text-blue-300 mb-1">
            Cuenta destino del depósito{cuentaActual.banco ? ` — ${cuentaActual.banco}` : ''}
          </p>
          <p className="font-semibold">{cuentaActual.nombre}</p>
          <p className="font-mono text-xs text-blue-300 mt-0.5">{cuentaActual.cod}</p>
          <p className="text-2xl font-bold mt-3">${cuentaActual.saldo.toLocaleString('es-CO')}</p>
          <p className="text-xs text-blue-300">saldo actual</p>
        </div>
      )}

      {/* Alerta demo */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        <strong>Modo demo:</strong> Este depósito es simulado y no involucra dinero real.
      </div>

      {/* Montos rápidos */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Montos rápidos</p>
        <div className="grid grid-cols-2 gap-2">
          {MONTOS_RAPIDOS.map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMonto(m)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors
                ${monto === m
                  ? 'bg-banco-600 border-banco-600 text-white'
                  : 'border-gray-300 text-gray-700 hover:border-banco-500 hover:text-banco-700'
                }`}
            >
              ${m.toLocaleString('es-CO')}
            </button>
          ))}
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Otro monto (COP)
          </label>
          <input
            type="number"
            min={10000}
            step={100}
            max={50000000}
            placeholder="Ej. 300000"
            value={monto}
            onChange={e => setMonto(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-banco-500"
          />
          <p className="text-xs text-gray-400 mt-1">Mín. $10.000 · Máx. $50.000.000 · múltiplos de $100</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            ❌ {error}
          </div>
        )}

        {success !== null && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            ✅ Depósito exitoso. Nuevo saldo: <strong>${success.toLocaleString('es-CO')} COP</strong>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !monto}
          className="w-full rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 text-sm transition-colors"
        >
          {loading ? 'Procesando...' : `Depositar $${(monto || 0).toLocaleString('es-CO')}`}
        </button>
      </form>
    </div>
  )
}
