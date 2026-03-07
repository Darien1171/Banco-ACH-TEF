'use client'

// ================================================================
// /perfil — Perfil del usuario autenticado
// Editable: solo teléfono
// Solo lectura: nombre, email, cuenta, saldo
// ================================================================

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Perfil {
  nom_cliente:    string
  email:          string | null
  telefono:       string | null
  cod_cuenta:     string
  tip_cuenta:     string
  sal_disponible: number
  sal_bloqueado:  number
  fec_apertura:   string
}

export default function PerfilPage() {
  const [perfil,    setPerfil]    = useState<Perfil | null>(null)
  const [telefono,  setTelefono]  = useState('')
  const [saving,    setSaving]    = useState(false)
  const [msg,       setMsg]       = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)
  const [loading,   setLoading]   = useState(true)

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
        .select('nom_cliente, email, telefono, cod_cuenta, tip_cuenta, sal_disponible, sal_bloqueado, fec_apertura')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setPerfil(data as Perfil)
        setTelefono(data.telefono ?? '')
      }
      setLoading(false)
    }
    cargar()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!perfil) return
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
      setPerfil(p => p ? { ...p, telefono: telefono || null } : p)
      setMsg({ tipo: 'ok', texto: 'Teléfono actualizado correctamente.' })
    }
    setSaving(false)
  }

  const nombreTipo = (t: string) => t === 'A' ? 'Cuenta de Ahorros' : 'Cuenta Corriente'

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="w-8 h-8 border-2 border-banco-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-5 text-sm text-yellow-800">
        No se encontró tu cuenta bancaria. Contacta al administrador.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500 text-sm mt-1">Tu información personal y datos de cuenta.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Datos de cuenta */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Datos de cuenta</h2>

          <div className="rounded-xl bg-banco-800 text-white p-4 mb-5">
            <p className="text-xs text-blue-300">Número de cuenta</p>
            <p className="font-mono text-sm font-bold mt-1 select-all">{perfil.cod_cuenta}</p>
            <p className="text-xs text-blue-300 mt-2">{nombreTipo(perfil.tip_cuenta)} · Banco A</p>
            <p className="text-2xl font-bold mt-3">${perfil.sal_disponible.toLocaleString('es-CO')}</p>
            <p className="text-xs text-blue-300">saldo disponible COP</p>
            {perfil.sal_bloqueado > 0 && (
              <p className="text-xs text-yellow-300 mt-1">
                Bloqueado: ${perfil.sal_bloqueado.toLocaleString('es-CO')}
              </p>
            )}
          </div>

          <dl className="space-y-3 text-sm">
            <Field label="Titular" value={perfil.nom_cliente} />
            <Field label="Correo"  value={perfil.email ?? '—'} />
            <Field label="Apertura" value={perfil.fec_apertura} />
          </dl>
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

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Solo lectura
            </p>
            <dl className="space-y-3 text-sm">
              <Field label="Nombre"   value={perfil.nom_cliente} locked />
              <Field label="Correo"   value={perfil.email ?? '—'} locked />
            </dl>
            <p className="text-xs text-gray-400 mt-3">
              Para cambiar nombre o correo, contacta al administrador.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, locked }: { label: string; value: string; locked?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500 shrink-0">{label}</dt>
      <dd className={`font-medium text-right truncate ${locked ? 'text-gray-400' : 'text-gray-900'}`}>
        {value}
      </dd>
    </div>
  )
}
