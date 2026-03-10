// ================================================================
// /deposito — Depósito demo de fondos (multi-cuenta)
// ================================================================

import { redirect } from 'next/navigation'
import { getSession, getCuentasDelUsuario, BANCOS } from '@/lib/auth'
import DepositoForm from '@/components/DepositoForm'

export default async function DepositoPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const cuentas = await getCuentasDelUsuario(user.id)
  if (cuentas.length === 0) redirect('/')

  const cuentasResumen = cuentas.map(c => ({
    cod:    c.cod_cuenta,
    nombre: c.nom_cliente,
    saldo:  c.sal_disponible,
    banco:  BANCOS[c.cod_banco] ?? c.cod_banco,
  }))

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Depósito Demo</h1>
        <p className="text-gray-500 text-sm mt-1">
          Agrega fondos de prueba a tu cuenta para experimentar con transferencias.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <DepositoForm cuentas={cuentasResumen} />
      </div>
    </div>
  )
}
