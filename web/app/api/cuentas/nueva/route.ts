// ================================================================
// POST /api/cuentas/nueva — Abrir cuenta adicional en otro banco
// Solo para usuarios ya autenticados
// ================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient, serverClient } from '@/lib/supabase'
import { getCuentasDelUsuario, generarNumeroCuenta } from '@/lib/auth'

const BANCOS_VALIDOS = ['001', '002', '003']

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSSRClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

    const { tipoCuenta, codBanco } = await req.json()

    if (!tipoCuenta || !codBanco) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 })
    }
    if (!BANCOS_VALIDOS.includes(codBanco)) {
      return NextResponse.json({ error: 'Banco no válido.' }, { status: 400 })
    }
    if (!['A', 'C'].includes(tipoCuenta)) {
      return NextResponse.json({ error: 'Tipo de cuenta no válido.' }, { status: 400 })
    }

    // Verificar que no exista ya una cuenta en ese banco
    const cuentasExistentes = await getCuentasDelUsuario(user.id)
    const yaExiste = cuentasExistentes.some(c => c.cod_banco === codBanco)
    if (yaExiste) {
      return NextResponse.json(
        { error: 'Ya tienes una cuenta en ese banco.' },
        { status: 409 }
      )
    }

    // Reusar datos del cliente de la primera cuenta existente
    const primeraCuenta = cuentasExistentes[0]
    const codCliente = primeraCuenta?.cod_cliente ?? `CLI${Date.now().toString().slice(-7)}`
    const codCuenta  = generarNumeroCuenta(tipoCuenta as 'A' | 'C', codBanco)
    const hoy        = new Date().toISOString().slice(0, 10)

    const { error: cuentaError } = await serverClient.from('cuentas_clientes').insert({
      cod_cuenta:             codCuenta,
      cod_cliente:            codCliente,
      nom_cliente:            primeraCuenta?.nom_cliente ?? user.email ?? 'Cliente',
      nom_cuenta:             `Cuenta ${tipoCuenta === 'A' ? 'Ahorros' : 'Corriente'} ${primeraCuenta?.nom_cliente ?? ''}`.trim(),
      tip_cuenta:             tipoCuenta,
      sal_disponible:         0,
      sal_bloqueado:          0,
      sal_total:              0,
      mca_activa:             true,
      mca_congelada:          false,
      fec_apertura:           hoy,
      fec_ultima_transaccion: null,
      cod_banco:              codBanco,
      user_id:                user.id,
      telefono:               primeraCuenta?.telefono ?? null,
      email:                  primeraCuenta?.email ?? user.email,
    })

    if (cuentaError) {
      console.error('[CuentaNueva] Error:', JSON.stringify(cuentaError, null, 2))
      return NextResponse.json(
        { error: 'Error al crear la cuenta.', detalle: cuentaError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, codCuenta })
  } catch (err) {
    console.error('[CuentaNueva] Excepción:', err)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
