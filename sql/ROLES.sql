-- ============================================================
--  1. PERFILES (roles de grupo, sin login)
-- ============================================================
CREATE ROLE rol_administrador NOLOGIN;
CREATE ROLE rol_comprador NOLOGIN;
CREATE ROLE rol_bodeguero NOLOGIN;
CREATE ROLE rol_vendedor NOLOGIN;
CREATE ROLE rol_cajero NOLOGIN;
CREATE ROLE rol_auditor NOLOGIN;

-- ==============================
--  2. Acceso base al esquema
-- ==============================
GRANT USAGE ON SCHEMA empresa TO rol_administrador, rol_comprador, rol_bodeguero, rol_vendedor, rol_cajero, rol_auditor;

-- ============================================================
--  3. PERMISOS POR TABLA  (segun matriz RBAC)
-- ============================================================

-- ADMINISTRADOR
-- Catalogo y Terceros
GRANT SELECT, INSERT, UPDATE ON EMPRESA.sedes TO rol_administrador;
GRANT SELECT, INSERT, UPDATE ON EMPRESA.almacenes TO rol_administrador;
GRANT SELECT, INSERT, UPDATE ON EMPRESA.cate
