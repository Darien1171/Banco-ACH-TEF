// ================================================================
// /transferencia — Nueva transferencia (multi-cuenta)
// ================================================================

import { redirect } from 'next/navigation'
import { getSession, getCuentasDelUsuario, BANCOS } from '@/lib/auth'
import TransferenciaForm from '@/components/TransferenciaForm'

export default async function NuevaTransferenciaPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const cuentas = await getCuentasDelUsuario(user.id)

  const cuentasResumen = cuentas.map(c => ({
    cod:    c.cod_cuenta,
    nombre: c.nom_cliente,
    saldo:  c.sal_disponible,
    banco:  BANCOS[c.cod_banco] ?? c.cod_banco,
  }))

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nueva Transferencia</h1>
        <p className="text-gray-500 text-sm mt-1">
          Transferencia interbancaria ACH/TEF. El proceso toma menos de 10 segundos.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <TransferenciaForm cuentas={cuentasResumen} />
      </div>
    </div>
  )
}
