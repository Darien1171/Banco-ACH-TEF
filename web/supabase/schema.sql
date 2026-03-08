-- ================================================================
-- schema.sql — Tablas del sistema ACH/TEF en Supabase (PostgreSQL)
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ================================================================

-- Limpiar si existen (orden inverso a las FK)
DROP TABLE IF EXISTS auditoria_transacciones CASCADE;
DROP TABLE IF EXISTS movimientos_cuentas CASCADE;
DROP TABLE IF EXISTS comisiones_aplicadas CASCADE;
DROP TABLE IF EXISTS bloqueos_temporales CASCADE;
DROP TABLE IF EXISTS ordenes_transferencia CASCADE;
DROP TABLE IF EXISTS limites_clientes CASCADE;
DROP TABLE IF EXISTS parametros_comisiones CASCADE;
DROP TABLE IF EXISTS cuentas_clientes CASCADE;


-- ── CUENTAS_CLIENTES ─────────────────────────────────────────────
CREATE TABLE cuentas_clientes (
  cod_cuenta            VARCHAR(20)    PRIMARY KEY,
  cod_cliente           VARCHAR(10)    NOT NULL,
  nom_cliente           VARCHAR(100)   NOT NULL,
  nom_cuenta            VARCHAR(100),
  tip_cuenta            CHAR(1)        NOT NULL CHECK (tip_cuenta IN ('A','C')),
  sal_disponible        NUMERIC(15,2)  NOT NULL DEFAULT 0,
  sal_bloqueado         NUMERIC(15,2)  NOT NULL DEFAULT 0,
  sal_total             NUMERIC(15,2)  NOT NULL DEFAULT 0,
  mca_activa            BOOLEAN        NOT NULL DEFAULT TRUE,
  mca_congelada         BOOLEAN        NOT NULL DEFAULT FALSE,
  fec_apertura          DATE           NOT NULL,
  fec_ultima_transaccion DATE,
  cod_banco             VARCHAR(3)     NOT NULL,
  created_at            TIMESTAMPTZ    DEFAULT NOW()
);

CREATE INDEX idx_cuentas_cod_cliente ON cuentas_clientes(cod_cliente);
CREATE INDEX idx_cuentas_cod_banco   ON cuentas_clientes(cod_banco);


-- ── PARAMETROS_COMISIONES ────────────────────────────────────────
CREATE TABLE parametros_comisiones (
  num_parametro         VARCHAR(20)    PRIMARY KEY,
  rango_desde           NUMERIC(15,2)  NOT NULL,
  rango_hasta           NUMERIC(15,2),             -- NULL = sin límite superior
  mto_comision_fija     NUMERIC(15,2)  NOT NULL DEFAULT 0,
  por_comision          NUMERIC(5,2)   NOT NULL DEFAULT 0,
  vigente_desde         DATE           NOT NULL,
  vigente_hasta         DATE           NOT NULL DEFAULT '9999-12-31'
);


-- ── LIMITES_CLIENTES ─────────────────────────────────────────────
CREATE TABLE limites_clientes (
  num_limite            VARCHAR(20)    PRIMARY KEY,
  cod_cliente           VARCHAR(10)    NOT NULL,
  limite_diario         NUMERIC(15,2)  NOT NULL,
  limite_mensual        NUMERIC(15,2)  NOT NULL,
  limite_diario_usado   NUMERIC(15,2)  NOT NULL DEFAULT 0,
  limite_mensual_usado  NUMERIC(15,2)  NOT NULL DEFAULT 0,
  fec_actualizacion     DATE           NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX idx_limites_cod_cliente ON limites_clientes(cod_cliente);


-- ── ORDENES_TRANSFERENCIA ────────────────────────────────────────
CREATE TABLE ordenes_transferencia (
  num_orden             VARCHAR(20)    PRIMARY KEY,
  fec_creacion          DATE           NOT NULL,
  hoa_creacion          VARCHAR(8)     NOT NULL,
  cod_banco_origen      VARCHAR(3)     NOT NULL,
  cod_cuenta_origen     VARCHAR(20)    NOT NULL REFERENCES cuentas_clientes(cod_cuenta),
  nom_cliente_origen    VARCHAR(100),
  cod_banco_destino     VARCHAR(3)     NOT NULL,
  cod_cuenta_destino    VARCHAR(20)    NOT NULL,
  nom_cliente_destino   VARCHAR(100),
  mto_transferencia     NUMERIC(15,2)  NOT NULL,
  mto_comision          NUMERIC(15,2)  NOT NULL DEFAULT 0,
  mto_total             NUMERIC(15,2)  NOT NULL,
  tip_moneda            VARCHAR(3)     NOT NULL DEFAULT 'COP',
  des_concepto          VARCHAR(200),
  est_orden             VARCHAR(25)    NOT NULL DEFAULT 'PENDIENTE_CONFIRMACION',
  fec_envio             DATE,
  fec_confirmacion      DATE,
  mca_bloqueada         BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ    DEFAULT NOW()
);

CREATE INDEX idx_ordenes_cuenta_origen ON ordenes_transferencia(cod_cuenta_origen);
CREATE INDEX idx_ordenes_est_orden     ON ordenes_transferencia(est_orden);
CREATE INDEX idx_ordenes_fec_creacion  ON ordenes_transferencia(fec_creacion);


-- ── BLOQUEOS_TEMPORALES ──────────────────────────────────────────
CREATE TABLE bloqueos_temporales (
  num_bloqueo           VARCHAR(20)    PRIMARY KEY,
  cod_cuenta            VARCHAR(20)    NOT NULL REFERENCES cuentas_clientes(cod_cuenta),
  num_orden             VARCHAR(20)    NOT NULL REFERENCES ordenes_transferencia(num_orden),
  mto_bloqueado         NUMERIC(15,2)  NOT NULL,
  fec_bloqueo           DATE           NOT NULL,
  hoa_bloqueo           VARCHAR(8)     NOT NULL,
  est_bloqueo           VARCHAR(10)    NOT NULL DEFAULT 'ACTIVO'
                         CHECK (est_bloqueo IN ('ACTIVO','LIBERADO','EJECUTADO'))
);

CREATE INDEX idx_bloqueos_cod_cuenta ON bloqueos_temporales(cod_cuenta);
CREATE INDEX idx_bloqueos_num_orden  ON bloqueos_temporales(num_orden);


-- ── MOVIMIENTOS_CUENTAS ──────────────────────────────────────────
CREATE TABLE movimientos_cuentas (
  num_movimiento        VARCHAR(20)    PRIMARY KEY,
  cod_cuenta            VARCHAR(20)    NOT NULL REFERENCES cuentas_clientes(cod_cuenta),
  fec_movimiento        DATE           NOT NULL,
  hoa_movimiento        VARCHAR(8)     NOT NULL,
  tip_movimiento        VARCHAR(25)    NOT NULL,
  mto_movimiento        NUMERIC(15,2)  NOT NULL, -- negativo = débito
  sal_anterior          NUMERIC(15,2)  NOT NULL,
  sal_posterior         NUMERIC(15,2)  NOT NULL,
  des_detalle           VARCHAR(200),
  num_orden             VARCHAR(20)    REFERENCES ordenes_transferencia(num_orden)
);

CREATE INDEX idx_movimientos_cod_cuenta ON movimientos_cuentas(cod_cuenta);
CREATE INDEX idx_movimientos_fec        ON movimientos_cuentas(fec_movimiento);


-- ── COMISIONES_APLICADAS ─────────────────────────────────────────
CREATE TABLE comisiones_aplicadas (
  num_comision          VARCHAR(20)    PRIMARY KEY,
  num_orden             VARCHAR(20)    NOT NULL REFERENCES ordenes_transferencia(num_orden),
  cod_cuenta            VARCHAR(20)    NOT NULL REFERENCES cuentas_clientes(cod_cuenta),
  mto_comision          NUMERIC(15,2)  NOT NULL,
  tip_comision          VARCHAR(30)    NOT NULL DEFAULT 'TRANSFER_INTERBANCARIA',
  fec_aplicacion        DATE           NOT NULL,
  rango_desde           NUMERIC(15,2),
  rango_hasta           NUMERIC(15,2)
);


-- ── AUDITORIA_TRANSACCIONES ──────────────────────────────────────
CREATE TABLE auditoria_transacciones (
  num_auditoria         VARCHAR(20)    PRIMARY KEY,
  num_orden             VARCHAR(20),              -- puede ser NULL si rechaza antes de crear orden
  fec_transaccion       DATE           NOT NULL,
  hoa_inicio            VARCHAR(8)     NOT NULL,
  hoa_fin               VARCHAR(8),
  tip_transaccion       VARCHAR(25)    NOT NULL DEFAULT 'TRANSFERENCIA_ACH',
  cod_usuario           VARCHAR(36),
  terminal              VARCHAR(36),
  estado_final          VARCHAR(25)    NOT NULL,
  mto_procesado         NUMERIC(15,2)  NOT NULL DEFAULT 0,
  observacion           VARCHAR(500),
  created_at            TIMESTAMPTZ    DEFAULT NOW()
);

CREATE INDEX idx_auditoria_fec ON auditoria_transacciones(fec_transaccion);
CREATE INDEX idx_auditoria_est ON auditoria_transacciones(estado_final);
