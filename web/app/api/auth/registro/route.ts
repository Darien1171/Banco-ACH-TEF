// ================================================================
// POST /api/auth/registro — Crear usuario + cuenta bancaria
// ================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createSSRClient, serverClient } from '@/lib/supabase'
import { generarNumeroCuenta, generarCodCliente } from '@/lib/auth'
import { enviarEmailBienvenida, enviarSMSBienvenida } from '@/lib/notificaciones'

export async function POST(req: NextRequest) {
  try {
    const { nombre, email, password, telefono, tipoCuenta } = await req.json()

    if (!nombre || !email || !password || !tipoCuenta) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 })
    }

    // ── 1. Crear usuario en Supabase Auth ───────────────────────
    const supabase = await createSSRClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    })

    if (authError) {
      const msg = authError.message.includes('already registered')
        ? 'Este correo ya está registrado.'
        : authError.message
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No se pudo crear el usuario. Verifica el correo.' },
        { status: 400 }
      )
    }

    const userId     = authData.user.id
    const codCliente = generarCodCliente()
    const codCuenta  = generarNumeroCuenta(tipoCuenta as 'A' | 'C')
    const hoy        = new Date().toISOString().slice(0, 10)

    // ── 2. Crear cuenta bancaria ─────────────────────────────────
    const { error: cuentaError } = await serverClient.from('cuentas_clientes').insert({
      cod_cuenta:           codCuenta,
      cod_cliente:          codCliente,
      nom_cliente:          nombre,
      nom_cuenta:           `Cuenta ${tipoCuenta === 'A' ? 'Ahorros' : 'Corriente'} ${nombre}`,
      tip_cuenta:           tipoCuenta,
      sal_disponible:       0,
      sal_bloqueado:        0,
      sal_total:            0,
      mca_activa:           true,
      mca_congelada:        false,
      fec_apertura:         hoy,
      fec_ultima_transaccion: null,
      cod_banco:            '001',
      user_id:              userId,
      telefono:             telefono || null,
      email:                email,
    })

    if (cuentaError) {
      console.error('[Registro] Error cuenta:', cuentaError)
      return NextResponse.json({ error: 'Error al crear cuenta bancaria.' }, { status: 500 })
    }

    // ── 3. Crear límites del cliente ─────────────────────────────
    await serverClient.from('limites_clientes').insert({
      num_limite:            `LIM${Date.now()}`,
      cod_cliente:           codCliente,
      limite_diario:         5_000_000,
      limite_mensual:        50_000_000,
      limite_diario_usado:   0,
      limite_mensual_usado:  0,
      fec_actualizacion:     hoy,
    })

    // ── 4. Notificaciones (no bloquean el registro) ──────────────
    enviarEmailBienvenida({ nombre, email, codCuenta }).catch(console.error)
    if (telefono) {
      enviarSMSBienvenida({ telefono, nombre, codCuenta }).catch(console.error)
    }

    return NextResponse.json({ ok: true, codCuenta })
  } catch (err) {
    console.error('[Registro]', err)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
