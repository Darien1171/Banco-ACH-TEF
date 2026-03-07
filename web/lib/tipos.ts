// ================================================================
// tipos.ts — Tipos TypeScript que mapean las tablas de Supabase
// Equivalente a los copybooks COBOL del proyecto
// ================================================================

export type TipoCuenta = 'A' | 'C' // Ahorros | Corriente
export type EstadoOrden =
  | 'PENDIENTE_CONFIRMACION'
  | 'ENVIADA'
  | 'CONFIRMADA'
  | 'RECHAZADA'
  | 'TIMEOUT'
  | 'PENDIENTE_REVISION'
export type EstadoBloqueo = 'ACTIVO' | 'LIBERADO' | 'EJECUTADO'
export type TipoMoneda = 'COP' | 'USD' | 'EUR'

// ── CUENTAS_CLIENTES ─────────────────────────────────────────────
export interface CuentaCliente {
  cod_cuenta: string
  cod_cliente: string
  nom_cliente: string
  nom_cuenta: string
  tip_cuenta: TipoCuenta
  sal_disponible: number
  sal_bloqueado: number
  sal_total: number
  mca_activa: boolean
  mca_congelada: boolean
  fec_apertura: string
  fec_ultima_transaccion: string | null
  cod_banco: string
  // Agregados en migrations.sql
  user_id?: string | null
  telefono?: string | null
  email?: string | null
}

// ── ORDENES_TRANSFERENCIA ────────────────────────────────────────
export interface OrdenTransferencia {
  num_orden: string
  fec_creacion: string
  hoa_creacion: string
  cod_banco_origen: string
  cod_cuenta_origen: string
  nom_cliente_origen: string
  cod_banco_destino: string
  cod_cuenta_destino: string
  nom_cliente_destino: string
  mto_transferencia: number
  mto_comision: number
  mto_total: number
  tip_moneda: TipoMoneda
  des_concepto: string
  est_orden: EstadoOrden
  fec_envio: string | null
  fec_confirmacion: string | null
  mca_bloqueada: boolean
}

// ── BLOQUEOS_TEMPORALES ──────────────────────────────────────────
export interface BloqueoTemporal {
  num_bloqueo: string
  cod_cuenta: string
  num_orden: string
  mto_bloqueado: number
  fec_bloqueo: string
  hoa_bloqueo: string
  est_bloqueo: EstadoBloqueo
}

// ── MOVIMIENTOS_CUENTAS ──────────────────────────────────────────
export interface MovimientoCuenta {
  num_movimiento: string
  cod_cuenta: string
  fec_movimiento: string
  hoa_movimiento: string
  tip_movimiento: string
  mto_movimiento: number
  sal_anterior: number
  sal_posterior: number
  des_detalle: string
  num_orden: string
}

// ── LIMITES_CLIENTES ─────────────────────────────────────────────
export interface LimiteCliente {
  num_limite: string
  cod_cliente: string
  limite_diario: number
  limite_mensual: number
  limite_diario_usado: number
  limite_mensual_usado: number
  fec_actualizacion: string
}

// ── PARAMETROS_COMISIONES ────────────────────────────────────────
export interface ParametroComision {
  num_parametro: string
  rango_desde: number
  rango_hasta: number | null  // null = sin límite superior
  mto_comision_fija: number
  por_comision: number
  vigente_desde: string
  vigente_hasta: string
}

// ── AUDITORIA_TRANSACCIONES ──────────────────────────────────────
export interface AuditoriaTransaccion {
  num_auditoria: string
  num_orden: string | null
  fec_transaccion: string
  hoa_inicio: string
  hoa_fin: string
  tip_transaccion: string
  cod_usuario: string
  terminal: string
  estado_final: string
  mto_procesado: number
  observacion: string
}

// ── DTOs de entrada/salida de la API ────────────────────────────
export interface SolicitudTransferencia {
  cod_cuenta_origen: string
  cod_banco_destino: string
  cod_cuenta_destino: string
  monto: number
  concepto: string
  cod_usuario?: string
  terminal?: string
}

export interface ResultadoTransferencia {
  exito: boolean
  cod_resultado: number
  mensaje: string
  orden?: OrdenTransferencia
  comision?: number
  monto_total?: number
}
