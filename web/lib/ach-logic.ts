// ================================================================
// ach-logic.ts — Lógica de negocio ACH/TEF
// Equivalente TypeScript de MAIN-ACH.cbl
// Solo se ejecuta en el servidor (API routes)
// ================================================================

import { serverClient } from './supabase'
import type {
  SolicitudTransferencia,
  ResultadoTransferencia,
  CuentaCliente,
  ParametroComision,
  LimiteCliente,
} from './tipos'

const MONTO_MAX = 999_999_999
const BANCO_PROPIO = '001'

// ── Generar IDs secuenciales con fecha ──────────────────────────
function generarId(prefijo: string): string {
  const ahora = new Date()
  const fecha = ahora.toISOString().slice(0, 10).replace(/-/g, '')
  const ms = ahora.getTime().toString().slice(-6)
  return `${prefijo}${fecha}${ms}`
}

function fechaHoy(): string {
  return new Date().toISOString().slice(0, 10)
}

function horaActual(): string {
  return new Date().toTimeString().slice(0, 8)
}

// ── 1. Calcular comisión según tabla parametros_comisiones ───────
async function calcularComision(monto: number): Promise<number> {
  const { data, error } = await serverClient
    .from('parametros_comisiones')
    .select('*')
    .lte('rango_desde', monto)
    .lte('vigente_desde', fechaHoy())
    .gte('vigente_hasta', fechaHoy())
    .order('rango_desde', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return 0

  const param = data as ParametroComision
  // rango_hasta null = sin tope (aplica siempre que supere rango_desde)
  if (param.rango_hasta !== null && monto > param.rango_hasta) return 0
  if (param.por_comision > 0) return Math.round(monto * param.por_comision / 100)
  return param.mto_comision_fija
}


// ── FLUJO PRINCIPAL ──────────────────────────────────────────────
export async function procesarTransferencia(
  sol: SolicitudTransferencia
): Promise<ResultadoTransferencia> {

  const usuario = sol.cod_usuario ?? 'SISTEMA'
  const terminal = sol.terminal ?? 'WEB'
  const hoy = fechaHoy()
  const hora = horaActual()

  // ── PASO 1: Validar cuenta origen ───────────────────────────────
  const { data: cuentaOrigenData, error: errOrigen } = await serverClient
    .from('cuentas_clientes')
    .select('*')
    .eq('cod_cuenta', sol.cod_cuenta_origen)
    .single()

  if (errOrigen || !cuentaOrigenData) {
    return { exito: false, cod_resultado: 1, mensaje: 'Cuenta origen no existe en el sistema.' }
  }
  const cuentaOrigen = cuentaOrigenData as CuentaCliente
  if (!cuentaOrigen.mca_activa)  return { exito: false, cod_resultado: 1, mensaje: 'Cuenta origen inactiva.' }
  if (cuentaOrigen.mca_congelada) return { exito: false, cod_resultado: 1, mensaje: 'Cuenta origen congelada.' }

  // ── PASO 2: Validar cuenta destino ──────────────────────────────
  const { data: cuentaDestinoData, error: errDest } = await serverClient
    .from('cuentas_clientes')
    .select('*')
    .eq('cod_cuenta', sol.cod_cuenta_destino)
    .single()

  if (errDest || !cuentaDestinoData) {
    return { exito: false, cod_resultado: 2, mensaje: 'Cuenta destino no encontrada.' }
  }
  const cuentaDestino = cuentaDestinoData as CuentaCliente
  if (!cuentaDestino.mca_activa) return { exito: false, cod_resultado: 2, mensaje: 'Cuenta destino inactiva o cerrada.' }

  // ── PASO 3: Validar monto ───────────────────────────────────────
  if (sol.monto <= 0)           return { exito: false, cod_resultado: 3, mensaje: 'El monto debe ser mayor a cero.' }
  if (sol.monto > MONTO_MAX)    return { exito: false, cod_resultado: 3, mensaje: 'Monto supera el máximo legal ($999.999.999).' }
  if (sol.monto % 100 !== 0)    return { exito: false, cod_resultado: 3, mensaje: 'El monto debe ser múltiplo de 100 (sin centavos).' }

  // ── PASO 4: Calcular comisión ───────────────────────────────────
  const comision = await calcularComision(sol.monto)
  const montoTotal = sol.monto + comision

  // ── PASO 5: Validar fondos ──────────────────────────────────────
  if (cuentaOrigen.sal_disponible < montoTotal) {
    return {
      exito: false, cod_resultado: 4,
      mensaje: `Fondos insuficientes. Disponible: $${cuentaOrigen.sal_disponible.toLocaleString('es-CO')}. Necesita: $${montoTotal.toLocaleString('es-CO')}.`
    }
  }

  // ── PASO 6: Validar límites diarios ────────────────────────────
  const { data: limiteData } = await serverClient
    .from('limites_clientes')
    .select('*')
    .eq('cod_cliente', cuentaOrigen.cod_cliente)
    .single()

  if (limiteData) {
    const limite = limiteData as LimiteCliente
    const usadoHoy = limite.fec_actualizacion === hoy ? limite.limite_diario_usado : 0
    if (usadoHoy + sol.monto > limite.limite_diario) {
      return { exito: false, cod_resultado: 5, mensaje: 'Supera el límite diario permitido.' }
    }
  }

  // ── PASO 8-9: Bloquear fondos + Crear orden (dentro de una sola operación) ──
  const numOrden   = generarId('TRF')
  const numBloqueo = generarId('BLQ')

  // Actualizar saldo: descontar disponible y aumentar bloqueado
  const { error: errBloqueo } = await serverClient
    .from('cuentas_clientes')
    .update({
      sal_disponible: cuentaOrigen.sal_disponible - montoTotal,
      sal_bloqueado:  cuentaOrigen.sal_bloqueado  + montoTotal,
    })
    .eq('cod_cuenta', sol.cod_cuenta_origen)

  if (errBloqueo) return { exito: false, cod_resultado: 99, mensaje: 'Error interno al bloquear fondos.' }

  // Crear orden de transferencia
  const { error: errOrden } = await serverClient
    .from('ordenes_transferencia')
    .insert({
      num_orden:           numOrden,
      fec_creacion:        hoy,
      hoa_creacion:        hora,
      cod_banco_origen:    BANCO_PROPIO,
      cod_cuenta_origen:   sol.cod_cuenta_origen,
      nom_cliente_origen:  cuentaOrigen.nom_cliente,
      cod_banco_destino:   sol.cod_banco_destino,
      cod_cuenta_destino:  sol.cod_cuenta_destino,
      nom_cliente_destino: cuentaDestino.nom_cliente,
      mto_transferencia:   sol.monto,
      mto_comision:        comision,
      mto_total:           montoTotal,
      tip_moneda:          'COP',
      des_concepto:        sol.concepto,
      est_orden:           'PENDIENTE_CONFIRMACION',
      mca_bloqueada:       true,
    })

  if (errOrden) {
    // Revertir bloqueo
    await serverClient.from('cuentas_clientes').update({
      sal_disponible: cuentaOrigen.sal_disponible,
      sal_bloqueado:  cuentaOrigen.sal_bloqueado,
    }).eq('cod_cuenta', sol.cod_cuenta_origen)
    return { exito: false, cod_resultado: 99, mensaje: 'Error interno al crear orden.' }
  }

  // Registrar bloqueo
  await serverClient.from('bloqueos_temporales').insert({
    num_bloqueo:  numBloqueo,
    cod_cuenta:   sol.cod_cuenta_origen,
    num_orden:    numOrden,
    mto_bloqueado: montoTotal,
    fec_bloqueo:  hoy,
    hoa_bloqueo:  hora,
    est_bloqueo:  'ACTIVO',
  })

  // ── PASO 10: Simular confirmación banco destino ─────────────────
  // En producción real esto sería async. Aquí lo simulamos como ACEPTADA.
  await serverClient.from('ordenes_transferencia').update({
    est_orden:       'CONFIRMADA',
    fec_envio:       hoy,
    fec_confirmacion: hoy,
  }).eq('num_orden', numOrden)

  // ── PASO 11: Descuento final ────────────────────────────────────
  await serverClient.from('cuentas_clientes').update({
    sal_disponible:        cuentaOrigen.sal_disponible - montoTotal,
    sal_bloqueado:         0,
    sal_total:             cuentaOrigen.sal_total - montoTotal,
    fec_ultima_transaccion: hoy,
  }).eq('cod_cuenta', sol.cod_cuenta_origen)

  // Liberar bloqueo
  await serverClient.from('bloqueos_temporales').update({
    est_bloqueo: 'EJECUTADO'
  }).eq('num_bloqueo', numBloqueo)

  // ── PASO 12: Registrar movimiento contable ──────────────────────
  const numMovim = generarId('MOV')
  await serverClient.from('movimientos_cuentas').insert({
    num_movimiento:  numMovim,
    cod_cuenta:      sol.cod_cuenta_origen,
    fec_movimiento:  hoy,
    hoa_movimiento:  hora,
    tip_movimiento:  'TRANSFERENCIA_SALIDA',
    mto_movimiento:  -montoTotal,
    sal_anterior:    cuentaOrigen.sal_disponible,
    sal_posterior:   cuentaOrigen.sal_disponible - montoTotal,
    des_detalle:     `Transferencia a ${cuentaDestino.nom_cliente} + comisión`,
    num_orden:       numOrden,
  })

  // Registrar comisión aplicada
  if (comision > 0) {
    const numComis = generarId('COM')
    await serverClient.from('comisiones_aplicadas').insert({
      num_comision:   numComis,
      num_orden:      numOrden,
      cod_cuenta:     sol.cod_cuenta_origen,
      mto_comision:   comision,
      tip_comision:   'TRANSFER_INTERBANCARIA',
      fec_aplicacion: hoy,
    })
  }

  // Actualizar límite diario usado
  if (limiteData) {
    const limite = limiteData as LimiteCliente
    const usadoHoy = limite.fec_actualizacion === hoy ? limite.limite_diario_usado : 0
    await serverClient.from('limites_clientes').update({
      limite_diario_usado: usadoHoy + sol.monto,
      fec_actualizacion:   hoy,
    }).eq('cod_cliente', cuentaOrigen.cod_cliente)
  }

  // ── PASO 13: Registrar auditoría ────────────────────────────────
  await registrarAuditoria({
    numOrden: numOrden, hoy, hora, usuario, terminal,
    estado: 'EXITOSA', monto: montoTotal,
    obs: 'Transferencia completada sin incidencias.'
  })

  // ── PASO 14: Retornar comprobante ───────────────────────────────
  const { data: ordenFinal } = await serverClient
    .from('ordenes_transferencia')
    .select('*')
    .eq('num_orden', numOrden)
    .single()

  return {
    exito: true,
    cod_resultado: 0,
    mensaje: 'Transferencia completada exitosamente.',
    orden: ordenFinal,
    comision,
    monto_total: montoTotal,
  }
}

// ── Helper: registrar auditoría ─────────────────────────────────
async function registrarAuditoria(args: {
  numOrden: string | null
  hoy: string
  hora: string
  usuario: string
  terminal: string
  estado: string
  monto: number
  obs: string
}) {
  const numAudit = generarId('AUD')
  const { error } = await serverClient.from('auditoria_transacciones').insert({
    num_auditoria:    numAudit,
    num_orden:        args.numOrden,
    fec_transaccion:  args.hoy,
    hoa_inicio:       args.hora,
    hoa_fin:          horaActual(),
    tip_transaccion:  'TRANSFERENCIA_ACH',
    cod_usuario:      args.usuario,
    terminal:         args.terminal,
    estado_final:     args.estado,
    mto_procesado:    args.monto,
    observacion:      args.obs,
  })
  if (error) console.error('[Auditoría] Error al insertar:', JSON.stringify(error))
}
