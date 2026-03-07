// ================================================================
// /directorio — Directorio de usuarios registrados (solo lectura)
// No muestra saldos ni información financiera
// ================================================================

import { redirect } from 'next/navigation'
import { serverClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { Users } from 'lucide-react'

export default async function DirectorioPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const { data } = await serverClient
    .from('cuentas_clientes')
    .select('cod_cuenta, nom_cliente, tip_cuenta, cod_banco')
    .eq('mca_activa', true)
    .order('nom_cliente', { ascending: true })

  const cuentas = data ?? []

  const nombreTipo = (tipo: string) => tipo === 'A' ? 'Ahorros' : 'Corriente'
  const nombreBanco = (cod: string) => {
    const bancos: Record<string, string> = {
      '001': 'Banco A',
      '002': 'Banco B',
      '003': 'Banco C',
    }
    return bancos[cod] ?? cod
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Directorio de Cuentas</h1>
        <p className="text-gray-500 text-sm mt-1">
          Usuarios registrados — solo nombre y número de cuenta. Sin información financiera.
        </p>
      </div>

      {/* Nota de privacidad */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700 mb-6 flex gap-2 items-start">
        <span className="mt-0.5 shrink-0">ℹ</span>
        <span>
          Para realizar una transferencia, copia el número de cuenta del destinatario y
          pégalo en el formulario de transferencia.
        </span>
      </div>

      {/* Tabla */}
      {cuentas.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-40" />
          <p>No hay cuentas registradas aún.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Desktop: tabla */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titular</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Número de cuenta</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Banco</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cuentas.map((c: { cod_cuenta: string; nom_cliente: string; tip_cuenta: string; cod_banco: string }) => (
                  <tr key={c.cod_cuenta} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">{c.nom_cliente}</td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs bg-gray-100 rounded px-2 py-1 text-gray-700 select-all">
                        {c.cod_cuenta}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{nombreTipo(c.tip_cuenta)}</td>
                    <td className="px-5 py-4 text-gray-600">{nombreBanco(c.cod_banco)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="sm:hidden divide-y divide-gray-100">
            {cuentas.map((c: { cod_cuenta: string; nom_cliente: string; tip_cuenta: string; cod_banco: string }) => (
              <div key={c.cod_cuenta} className="px-4 py-4">
                <p className="font-medium text-gray-900">{c.nom_cliente}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {nombreTipo(c.tip_cuenta)} · {nombreBanco(c.cod_banco)}
                </p>
                <p className="font-mono text-xs bg-gray-100 rounded px-2 py-1 text-gray-700 mt-2 inline-block select-all">
                  {c.cod_cuenta}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4 text-center">
        {cuentas.length} cuenta{cuentas.length !== 1 ? 's' : ''} registrada{cuentas.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
