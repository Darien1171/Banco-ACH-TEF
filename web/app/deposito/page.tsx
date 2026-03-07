// ================================================================
// /deposito — Depósito demo de fondos
// ================================================================

import { redirect } from 'next/navigation'
import { getSession, getCuentaDelUsuario } from '@/lib/auth'
import DepositoForm from '@/components/DepositoForm'

export default async function DepositoPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const cuenta = await getCuentaDelUsuario(user.id)
  if (!cuenta) redirect('/')

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Depósito Demo</h1>
        <p className="text-gray-500 text-sm mt-1">
          Agrega fondos de prueba a tu cuenta para experimentar con transferencias.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <DepositoForm
          codCuenta={cuenta.cod_cuenta}
          nombreCliente={cuenta.nom_cliente}
          saldoActual={cuenta.sal_disponible}
        />
      </div>
    </div>
  )
}
