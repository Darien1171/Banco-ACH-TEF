'use client'

// ================================================================
// /perfil — Perfil del usuario + gestión de cuentas multi-banco
// ================================================================

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { CuentaCliente } from '@/lib/tipos'

const BANCOS: Record<string, string> = {
  '001': 'Banco A',
  '002': 'Banco B',
  '003': 'Banco C',
}

export default function PerfilPage() {
  const [cuentas,   setCuentas]   = useState<CuentaCliente[]>([])
  const [telefono,  setTelefono]  = useState('')
  const [saving,    setSaving]    = useState(false)
  const [msg,       setMsg]       = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)
  const [loading,   setLoading]   = useState(true)

  // Nueva cuenta
  const [abriendo,     setAbriendo]     = useState(false)
  const [nuevoBanco,   setNuevoBanco]   = useState('')
  const [nuevoTipo,    setNuevoTipo]    = useState<'A' | 'C'>('A')
  const [abrirLoading, setAbrirLoading] = useState(false)
  const [abrirMsg,     setAbrirMsg]     = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const cargar = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const { data } = await supabase
        .from('cuentas_clientes')
        .select('*')
        .eq('user_id', user.id)
        .order('fec_apertura', { ascending: true })

      if (data && data.length > 0) {
        setCuentas(data as CuentaCliente[])
        setTelefono(data[0].telefono ?? '')
      }
      setLoading(false)
    }
    cargar()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true)
    setMsg(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('cuentas_clientes')
      .update({ telefono: telefono || null })
      .eq('user_id', user.id)

    if (error) {
      setMsg({ tipo: 'err', texto: 'Error al guardar. Intenta de nuevo.' })
    } else {
      setCuentas(cs => cs.map(c => ({ ...c, telefono: telefono || null })))
      setMsg({ tipo: 'ok', texto: 'Teléfono actualizado correctamente.' })
    }
    setSaving(false)
  }

  const handleAbrirCuenta = async () => {
    if (!nuevoBanco) return
    setAbrirLoading(true)
    setAbrirMsg(null)

    try {
      const res  = await fetch('/api/cuentas/nueva', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ tipoCuenta: nuevoTipo, codBanco: nuevoBanco }),
      })
      const data = await res.json()

      if (!res.ok) {
        setAbrirMsg({ tipo: 'err', texto: data.error ?? 'Error al abrir cuenta.' })
      } else {
        setAbrirMsg({ tipo: 'ok', texto: `Cuenta ${data.codCuenta} abierta exitosamente.` })
        setAbriendo(false)
        // Recargar cuentas
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: nuevasCuentas } = await supabase
            .from('cuentas_clientes')
            .select('*')
            .eq('user_id', user.id)
            .order('fec_apertura', { ascending: true })
          if (nuevasCuentas) setCuentas(nuevasCuentas as CuentaCliente[])
        }
      }
    } catch {
      setAbrirMsg({ tipo: 'err', texto: 'Error de red.' })
    } finally {
      setAbrirLoading(false)
    }
  }

  const nombreTipo = (t: string) => t === 'A' ? 'Ahorros' : 'Corriente'

  // Bancos donde el usuario aún no tiene cuenta
  const bancosUsados      = cuentas.map(c => c.cod_banco)
  const bancosDisponibles = Object.entries(BANCOS).filter(([cod]) => !bancosUsados.includes(cod))

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="w-8 h-8 border-2 border-banco-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (cuentas.length === 0) {
    return (
      <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-5 text-sm text-yellow-800">
        No se encontró tu cuenta bancaria. Contacta al administrador.
      </div>
    )
  }

  const primeraCuenta = cuentas[0]

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500 text-sm mt-1">Tu información personal y cuentas bancarias.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Mis cuentas */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Mis cuentas bancarias</h2>
            {bancosDisponibles.length > 0 && (
              <button
                onClick={() => {
                  setAbriendo(a => !a)
                  setAbrirMsg(null)
                  if (!abriendo) setNuevoBanco(bancosDisponibles[0][0])
                }}
                className="text-sm text-banco-600 hover:underline font-medium"
              >
                {abriendo ? 'Cancelar' : '+ Abrir cuenta en otro banco'}
              </button>
            )}
          </div>

          {/* Lista de cuentas */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
            {cuentas.map(c => (
              <div key={c.cod_cuenta} className="rounded-xl bg-banco-800 text-white p-4">
                <p className="text-xs text-blue-300 font-semibold">{BANCOS[c.cod_banco] ?? c.cod_banco}</p>
                <p className="font-mono text-xs text-blue-200 mt-1 select-all">{c.cod_cuenta}</p>
                <p className="text-xs text-blue-300 mt-0.5">Cuenta {nombreTipo(c.tip_cuenta)}</p>
                <p className="text-xl font-bold mt-3">${c.sal_disponible.toLocaleString('es-CO')}</p>
                <p className="text-xs text-blue-300">saldo disponible COP</p>
                {c.sal_bloqueado > 0 && (
                  <p className="text-xs text-yellow-300 mt-1">
                    Bloqueado: ${c.sal_bloqueado.toLocaleString('es-CO')}
                  </p>
                )}
                <p className="text-xs text-blue-400 mt-2">Apertura: {c.fec_apertura}</p>
              </div>
            ))}
          </div>

          {/* Formulario abrir nueva cuenta */}
          {abriendo && bancosDisponibles.length > 0 && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">Abrir cuenta en otro banco</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Banco</label>
                  <select
                    value={nuevoBanco}
                    onChange={e => setNuevoBanco(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-banco-500 bg-white"
                  >
                    {bancosDisponibles.map(([cod, nombre]) => (
                      <option key={cod} value={cod}>{nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de cuenta</label>
                  <select
                    value={nuevoTipo}
                    onChange={e => setNuevoTipo(e.target.value as 'A' | 'C')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-banco-500 bg-white"
                  >
                    <option value="A">Cuenta de Ahorros</option>
                    <option value="C">Cuenta Corriente</option>
                  </select>
                </div>
              </div>
              {abrirMsg && (
                <div className={`rounded-lg px-3 py-2.5 text-sm ${
                  abrirMsg.tipo === 'ok'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {abrirMsg.tipo === 'ok' ? '✅' : '❌'} {abrirMsg.texto}
                </div>
              )}
              <button
                onClick={handleAbrirCuenta}
                disabled={abrirLoading || !nuevoBanco}
                className="rounded-lg bg-banco-600 hover:bg-banco-700 disabled:opacity-60 text-white font-semibold px-4 py-2 text-sm transition-colors"
              >
                {abrirLoading ? 'Abriendo...' : 'Confirmar apertura'}
              </button>
            </div>
          )}

          {abrirMsg && !abriendo && (
            <div className={`rounded-lg px-3 py-2.5 text-sm mt-3 ${
              abrirMsg.tipo === 'ok'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {abrirMsg.tipo === 'ok' ? '✅' : '❌'} {abrirMsg.texto}
            </div>
          )}

          {bancosDisponibles.length === 0 && (
            <p className="text-xs text-gray-400">Ya tienes cuenta en todos los bancos disponibles.</p>
          )}
        </div>

        {/* Editar teléfono */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Contacto</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono <span className="text-gray-400 font-normal">(editable)</span>
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="+57 300 000 0000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-banco-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Usado para notificaciones SMS. Formato: +57 3XX XXX XXXX
              </p>
            </div>

            {msg && (
              <div className={`rounded-lg px-4 py-3 text-sm ${
                msg.tipo === 'ok'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {msg.tipo === 'ok' ? '✅' : '❌'} {msg.texto}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-lg bg-banco-600 hover:bg-banco-700 disabled:opacity-60 text-white font-semibold py-2.5 text-sm transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar teléfono'}
            </button>
          </div>
        </div>

        {/* Info personal */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Información personal</h2>
          <dl className="space-y-3 text-sm">
            <Field label="Titular" value={primeraCuenta.nom_cliente} />
            <Field label="Correo"  value={primeraCuenta.email ?? '—'} />
          </dl>
          <p className="text-xs text-gray-400 mt-4">
            Para cambiar nombre o correo, contacta al administrador.
          </p>
        </div>

      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500 shrink-0">{label}</dt>
      <dd className="font-medium text-right truncate text-gray-700">{value}</dd>
    </div>
  )
}
