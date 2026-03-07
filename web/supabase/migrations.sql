-- ================================================================
-- migrations.sql — Cambios sobre el schema existente
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- IMPORTANTE: Ejecutar UNA SOLA VEZ después del schema.sql inicial
-- ================================================================

-- 1. Agregar columnas de usuario a cuentas_clientes
ALTER TABLE cuentas_clientes
  ADD COLUMN IF NOT EXISTS user_id  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS telefono VARCHAR(15),
  ADD COLUMN IF NOT EXISTS email    VARCHAR(100);

-- Índice para búsqueda por user_id
CREATE INDEX IF NOT EXISTS idx_cuentas_user_id ON cuentas_clientes(user_id);

-- 2. Sin RLS — la seguridad se aplica en las API routes (Next.js)
--    Esto simplifica el setup y funciona con la anon key como serverClient.
--    Las cuentas de test (Juan, Pedro, Maria, Carlos) no tienen user_id,
--    son accesibles para todos (cuentas demo del sistema).

-- 3. Verificar que las columnas se crearon
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cuentas_clientes'
ORDER BY ordinal_position;
