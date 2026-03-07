'use client'

// ================================================================
// /reset-password — Formulario para establecer nueva contraseña
// ================================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [ok,        setOk]        = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== password2) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    setError(null)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setOk(true)
    setTimeout(() => router.push('/'), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-banco-900 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">🔑</p>
          <h1 className="text-2xl font-bold text-gray-900">Nueva contraseña</h1>
          <p className="text-sm text-gray-500 mt-1">Elige una contraseña segura</p>
        </div>

        {ok ? (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 text-center">
            ✅ Contraseña actualizada. Redirigiendo...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-banco-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                type="password"
                required
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-banco-500"
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
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
