// ================================================================
// Dashboard — muestra la cuenta del usuario logueado y sus últimas
// transferencias
// ================================================================

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { serverClient } from '@/lib/supabase'
import { getSession, getCuentaDelUsuario } from '@/lib/auth'
import TablaOrdenes from '@/components/TablaOrdenes'
import type { OrdenTransferencia, AuditoriaTransaccion } from '@/lib/tipos'

export default async function DashboardPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const cuenta = await getCuentaDelUsuario(user.id)

  const hoy = new Date().toISOString().slice(0, 10)

  // Últimas transferencias del usuario
  const { data: ordenesData } = cuenta
    ? await serverClient
        .from('ordenes_transferencia')
        .select('*')
        .eq('cod_cuenta_origen', cuenta.cod_cuenta)
        .order('fec_creacion', { ascending: false })
        .limit(5)
    : { data: [] }

  // Auditoría de hoy (global para la tasa)
  const { data: auditData } = await serverClient
    .from('auditoria_transacciones')
    .select('estado_final')
    .eq('fec_transaccion', hoy)

  const ordenes  = (ordenesData ?? []) as OrdenTransferencia[]
  const auditHoy = (auditData   ?? []) as Pick<AuditoriaTransaccion, 'estado_final'>[]

  const exitosas = auditHoy.filter(a => a.estado_final === 'EXITOSA').length
  const total    = auditHoy.length
  const tasa     = total > 0 ? ((exitosas / total) * 100).toFixed(1) : '—'
  const montoHoy = ordenes.reduce(
    (s, o) => s + (o.est_orden === 'CONFIRMADA' ? o.mto_transferencia : 0), 0
  )

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('es-CO', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {/* Tarjeta de cuenta */}
      {cuenta ? (
        <div className="rounded-2xl bg-banco-800 text-white p-5 sm:p-6 mb-6 sm:mb-8 shadow-lg">
          <p className="text-sm text-blue-300 mb-1">Mi cuenta</p>
          <p className="text-lg font-bold">{cuenta.nom_cliente}</p>
          <p className="font-mono text-xs text-blue-300 mt-0.5 mb-4">{cuenta.cod_cuenta}</p>
          <p className="text-3xl sm:text-4xl font-bold">
            ${cuenta.sal_disponible.toLocaleString('es-CO')}
          </p>
          <p className="text-sm text-blue-300 mt-1">disponible COP</p>
          {cuenta.sal_bloqueado > 0 && (
            <p className="text-xs text-yellow-300 mt-2">
              Bloqueado: ${cuenta.sal_bloqueado.toLocaleString('es-CO')}
            </p>
          )}
          <div className="flex gap-3 mt-5 flex-wrap">
            <Link
              href="/transferencia"
              className="rounded-lg bg-white text-banco-800 font-semibold px-4 py-2 text-sm hover:bg-blue-50 transition-colors"
            >
              Transferir
            </Link>
            <Link
              href="/deposito"
              className="rounded-lg bg-banco-600 hover:bg-banco-700 text-white font-semibold px-4 py-2 text-sm transition-colors"
            >
              Depositar
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-5 mb-8 text-sm text-yellow-800">
          No tienes cuenta bancaria registrada. Contacta al administrador.
        </div>
      )}

      {/* Métricas del sistema */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <MetricCard label="Transferencias hoy" value={String(total)}   sub={`${exitosas} exitosas`} color="blue"   />
        <MetricCard label="Monto procesado"     value={`$${montoHoy.toLocaleString('es-CO')}`} sub="COP · hoy" color="green"  />
        <MetricCard label="Tasa de éxito"       value={total > 0 ? `${tasa}%` : '—'} sub="objetivo: >99.8%" color="purple" className="col-span-2 sm:col-span-1" />
      </div>

      {/* Últimas transferencias */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Mis últimas transferencias</h2>
        <Link href="/historial" className="text-sm text-banco-600 hover:underline">Ver todas →</Link>
      </div>
      <TablaOrdenes ordenes={ordenes} showCuentaOrigen />
    </div>
  )
}

function MetricCard({
  label, value, sub, color, className = '',
}: {
  label: string; value: string; sub: string; color: string; className?: string
}) {
  const colors: Record<string, string> = {
    blue:   'bg-blue-50 border-blue-200 text-blue-700',
    green:  'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  }
  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${colors[color]} ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold mt-2">{value}</p>
      <p className="text-xs mt-1 opacity-60">{sub}</p>
    </div>
  )
}
