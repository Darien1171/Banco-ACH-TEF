// ================================================================
// POST /api/deposito — Depósito demo (solo agrega saldo)
// ================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient, serverClient } from '@/lib/supabase'
import { getCuentaDelUsuario } from '@/lib/auth'
import { enviarEmailDeposito } from '@/lib/notificaciones'

export async function POST(req: NextRequest) {
  try {
    // ── Autenticación ────────────────────────────────────────────
    const supabase = await createSSRClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }

    const cuenta = await getCuentaDelUsuario(user.id)
    if (!cuenta) {
      return NextResponse.json({ error: 'Cuenta no encontrada.' }, { status: 404 })
    }

    // ── Validar monto ────────────────────────────────────────────
    const { monto } = await req.json()
    const montoNum = Number(monto)

    if (!montoNum || montoNum < 10_000) {
      return NextResponse.json({ error: 'El monto mínimo de depósito es $10.000.' }, { status: 400 })
    }
    if (montoNum > 50_000_000) {
      return NextResponse.json({ error: 'El monto máximo de depósito demo es $50.000.000.' }, { status: 400 })
    }
    if (montoNum % 100 !== 0) {
      return NextResponse.json({ error: 'El monto debe ser múltiplo de $100.' }, { status: 400 })
    }

    const hoy  = new Date().toISOString().slice(0, 10)
    const hora = new Date().toTimeString().slice(0, 8)

    const nuevoSaldo = cuenta.sal_disponible + montoNum

    // ── Actualizar saldo ─────────────────────────────────────────
    const { error: updErr } = await serverClient
      .from('cuentas_clientes')
      .update({
        sal_disponible:         nuevoSaldo,
        sal_total:              cuenta.sal_total + montoNum,
        fec_ultima_transaccion: hoy,
      })
      .eq('cod_cuenta', cuenta.cod_cuenta)

    if (updErr) {
      return NextResponse.json({ error: 'Error al procesar el depósito.' }, { status: 500 })
    }

    // ── Registrar movimiento ─────────────────────────────────────
    const numMovim = `MOV${new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)}`

    await serverClient.from('movimientos_cuentas').insert({
      num_movimiento:  numMovim,
      cod_cuenta:      cuenta.cod_cuenta,
      fec_movimiento:  hoy,
      hoa_movimiento:  hora,
      tip_movimiento:  'DEPOSITO_DEMO',
      mto_movimiento:  montoNum,
      sal_anterior:    cuenta.sal_disponible,
      sal_posterior:   nuevoSaldo,
      des_detalle:     'Depósito demo mediante portal web',
      num_orden:       'N/A',
    })

    // ── Notificaciones (no bloquean) ─────────────────────────────
    if (cuenta.email) {
      enviarEmailDeposito({
        email:      cuenta.email,
        nombre:     cuenta.nom_cliente,
        monto:      montoNum,
        codCuenta:  cuenta.cod_cuenta,
        saldoNuevo: nuevoSaldo,
        fecha:      hoy,
      }).catch(console.error)
    }

    return NextResponse.json({
      ok:         true,
      monto:      montoNum,
      saldoNuevo: nuevoSaldo,
    })
  } catch (err) {
    console.error('[Deposito]', err)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
