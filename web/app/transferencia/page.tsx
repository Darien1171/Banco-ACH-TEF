// ================================================================
// /transferencia — Nueva transferencia (cuenta del usuario actual)
// ================================================================

import { redirect } from 'next/navigation'
import { getSession, getCuentaDelUsuario } from '@/lib/auth'
import TransferenciaForm from '@/components/TransferenciaForm'

export default async function NuevaTransferenciaPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const cuenta = await getCuentaDelUsuario(user.id)

  const cuentas = cuenta
    ? [{ cod: cuenta.cod_cuenta, nombre: cuenta.nom_cliente, saldo: cuenta.sal_disponible }]
    : []

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nueva Transferencia</h1>
        <p className="text-gray-500 text-sm mt-1">
          Transferencia interbancaria ACH/TEF. El proceso toma menos de 10 segundos.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <TransferenciaForm cuentas={cuentas} />
      </div>
    </div>
  )
}
