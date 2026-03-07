-- ================================================================
-- seed.sql — Datos iniciales del sistema ACH/TEF
-- Ejecutar DESPUÉS de schema.sql en Supabase → SQL Editor
-- ================================================================

-- ── Parámetros de comisiones (4 rangos según especificación) ────
INSERT INTO parametros_comisiones VALUES
  ('COMIS001',       0,    100000,      0, 0, '2026-01-01', '9999-12-31'),
  ('COMIS002',  100001,    500000,   5000, 0, '2026-01-01', '9999-12-31'),
  ('COMIS003',  500001,   1000000, 10000, 0, '2026-01-01', '9999-12-31'),
  ('COMIS004', 1000001,      NULL, 20000, 0, '2026-01-01', '9999-12-31');

-- ── Cuentas de clientes ──────────────────────────────────────────
INSERT INTO cuentas_clientes VALUES
  -- Juan Pérez — Banco A — saldo $2.500.000
  ('001-002-0000123456-0', 'CLI001', 'Juan Perez',   'Cuenta Ahorros Juan',   'A',
   2500000, 0, 2500000, TRUE, FALSE, '2020-01-15', '2026-03-01', '001', NOW()),

  -- Pedro García — Banco B — saldo $1.000.000
  ('002-001-0000654321-0', 'CLI002', 'Pedro Garcia', 'Cuenta Ahorros Pedro',  'A',
   1000000, 0, 1000000, TRUE, FALSE, '2021-03-20', '2026-02-28', '002', NOW()),

  -- María López — Banco A — saldo $100.000 (caso fondos insuficientes)
  ('001-003-0000999001-0', 'CLI003', 'Maria Lopez',  'Cuenta Corriente Maria', 'C',
    100000, 0,  100000, TRUE, FALSE, '2022-06-10', '2026-03-01', '001', NOW()),

  -- Cuenta de banco externo C (para pruebas)
  ('003-001-0000777001-0', 'CLI004', 'Carlos Ruiz',  'Cuenta Ahorros Carlos',  'A',
   500000, 0,   500000, TRUE, FALSE, '2023-01-05', '2026-02-15', '003', NOW());

-- ── Límites de clientes ──────────────────────────────────────────
INSERT INTO limites_clientes VALUES
  ('LIM001', 'CLI001', 10000000, 50000000, 2000000, 10000000, CURRENT_DATE),
  ('LIM002', 'CLI002',  5000000, 20000000,       0,         0, CURRENT_DATE),
  ('LIM003', 'CLI003',  3000000, 10000000,       0,         0, CURRENT_DATE),
  ('LIM004', 'CLI004',  5000000, 20000000,       0,         0, CURRENT_DATE);
