// ================================================================
// POST /api/transferencia — Procesar transferencia ACH/TEF
// Verifica que el usuario sea dueño de la cuenta origen
// ================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient, serverClient } from '@/lib/supabase'
import { procesarTransferencia } from '@/lib/ach-logic'
import { enviarEmailTransferencia, enviarSMSTransferencia } from '@/lib/notificaciones'
import type { SolicitudTransferencia } from '@/lib/tipos'

export async function POST(req: NextRequest) {
  try {
    // ── Autenticación ────────────────────────────────────────────
    const supabase = await createSSRClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { exito: false, cod_resultado: 401, mensaje: 'No autorizado.' },
        { status: 401 }
      )
    }

    const body: SolicitudTransferencia = await req.json()

    if (!body.cod_cuenta_origen || !body.cod_cuenta_destino || !body.monto) {
      return NextResponse.json(
        { exito: false, cod_resultado: 400, mensaje: 'Faltan campos requeridos.' },
        { status: 400 }
      )
    }

    // ── Verificar que la cuenta origen pertenece al usuario ──────
    const { data: cuentaAuth } = await serverClient
      .from('cuentas_clientes')
      .select('cod_cuenta, user_id')
      .eq('cod_cuenta', body.cod_cuenta_origen)
      .single()

    if (!cuentaAuth || cuentaAuth.user_id !== user.id) {
      return NextResponse.json(
        { exito: false, cod_resultado: 403, mensaje: 'No tienes permiso para usar esta cuenta.' },
        { status: 403 }
      )
    }

    // ── Procesar transferencia ───────────────────────────────────
    const resultado = await procesarTransferencia({
      ...body,
      cod_usuario: user.email ?? user.id,
    })

    // ── Notificaciones si fue exitosa ────────────────────────────
    if (resultado.exito && resultado.orden) {
      const { data: cuentaOrigen } = await serverClient
        .from('cuentas_clientes')
        .select('nom_cliente, email, telefono')
        .eq('cod_cuenta', body.cod_cuenta_origen)
        .single()

      if (cuentaOrigen?.email) {
        enviarEmailTransferencia({
          email:       cuentaOrigen.email,
          nombre:      cuentaOrigen.nom_cliente,
          numOrden:    resultado.orden.num_orden,
          mtoTransf:   body.monto,
          mtoComision: resultado.comision ?? 0,
          mtoTotal:    resultado.monto_total ?? body.monto,
          destino:     resultado.orden.nom_cliente_destino,
          concepto:    body.concepto,
          fecha:       resultado.orden.fec_creacion,
          hora:        resultado.orden.hoa_creacion,
        }).catch(console.error)
      }

      if (cuentaOrigen?.telefono) {
        enviarSMSTransferencia({
          telefono:  cuentaOrigen.telefono,
          numOrden:  resultado.orden.num_orden,
          mtoTotal:  resultado.monto_total ?? body.monto,
          destino:   resultado.orden.nom_cliente_destino,
        }).catch(console.error)
      }
    }

    return NextResponse.json(resultado, { status: resultado.exito ? 200 : 422 })
  } catch (err) {
    console.error('[API/transferencia]', err)
    return NextResponse.json(
      { exito: false, cod_resultado: 99, mensaje: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
