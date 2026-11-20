CREATE EXTENSION IF NOT EXISTS postgres_fdw SCHEMA reportes;
CREATE SCHEMA IF NOT EXISTS reportes;

-- ============================================================================
--  1. SERVIDOR CATALOGO  (db_catalogo)
--     Tablas: productos, categorias, sedes, almacenes, proveedores, clientes
-- ============================================================================

CREATE SERVER IF NOT EXISTS srv_catalogo
  FOREIGN DATA WRAPPER postgres_fdw
  OPTIONS (host 'ep-solitary-flower-bd7rfbdb-pooler.c-8.us-east-2.aws.neon.tech', dbname 'db_catalogo', port '5432', sslmode 'require');

CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER
  SERVER srv_catalogo
  OPTIONS (user 'neondb_owner', password 'npg_c5D9qxBuNmLo');

IMPORT FOREIGN SCHEMA catalogo
  LIMIT TO (productos, categorias, sedes, almacenes, proveedores, clientes)
  FROM SERVER srv_catalogo INTO reportes;

-- ============================================================
--  2. SERVIDOR IDENTIDAD  (db_identidad)
--     Tablas: empleados, cargos
-- ============================================================

CREATE SERVER IF NOT EXISTS srv_identidad
  FOREIGN DATA WRAPPER postgres_fdw
  OPTIONS (host 'ep-lively-salad-bet63qhi-pooler.c-9.us-east-2.aws.neon.tech', dbname 'db_identidad', port '5432', sslmode 'require');

CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER
  SERVER srv_identidad
  OPTIONS (user 'neondb_owner', password 'npg_WAcD3sOE9mez');

IMPORT FOREIGN SCHEMA identidad
  LIMIT TO (empleados, cargos)
  FROM SERVER srv_identidad INTO reportes;

-- ============================================================
--  3. SERVIDOR COMPRAS  (db_compras)
--     Tablas: ordenes_compra, detalle_orden_compra
-- ============================================================

CREATE SERVER IF NOT EXISTS srv_compras
  FOREIGN DATA WRAPPER postgres_fdw
  OPTIONS (host 'ep-billowing-waterfall-beewil79-pooler.c-9.us-east-2.aws.neon.tech', dbname 'db_compras', port '5432', sslmode 'require');

CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER
  SERVER srv_compras
  OPTIONS (user 'neondb_owner', password 'npg_Hck2tunmECd6');

IMPORT FOREIGN SCHEMA compras
  LIMIT TO (ordenes_compra, detalle_orden_compra, recepciones_compra, detalle_recepcion)
  FROM SERVER srv_compras INTO reportes;

-- ============================================================
--  4. SERVIDOR INVENTARIOS  (db_inventarios)
--     Tablas: inventarios, movimientos_inventarios
-- ============================================================

CREATE SERVER IF NOT EXISTS srv_inventarios
  FOREIGN DATA WRAPPER postgres_fdw
  OPTIONS (host 'ep-super-smoke-bdxuj87v-pooler.c-8.us-east-2.aws.neon.tech', dbname 'db_inventario', port '5432', sslmode 'require');

CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER
  SERVER srv_inventarios
  OPTIONS (user 'neondb_owner', password 'npg_Twp0GDzvLl1u');

IMPORT FOREIGN SCHEMA inventarios
  LIMIT TO (inventarios, movimientos_inventarios, ajustes_inventarios)
  FROM SERVER srv_inventarios INTO reportes;

-- ============================================================
--  5. SERVIDOR TRANSFERENCIAS  (db_transferencias)
--     (no lo usan las vistas actuales, pero se deja listo)
-- ============================================================

CREATE SERVER IF NOT EXISTS srv_transferencias
  FOREIGN DATA WRAPPER postgres_fdw
  OPTIONS (host 'ep-odd-math-bd2ks6v6-pooler.c-8.us-east-2.aws.neon.tech', dbname 'db_transferencias', port '5432', sslmode 'require');

CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER
  SERVER srv_transferencias
  OPTIONS (user 'neondb_owner', password 'npg_niNfUg7PAK6Z');

IMPORT FOREIGN SCHEMA transferencias
  LIMIT TO (transferencias, detalle_transferencias)
  FROM SERVER srv_transferencias INTO reportes;

-- ============================================================
--  6. SERVIDOR VENTAS  (db_ventas)
--     Tablas: pedidos_venta, detalle_pedido, ventas, pagos,
--             devoluciones, detalle_devolucion
-- ============================================================

CREATE SERVER IF NOT EXISTS srv_ventas
  FOREIGN DATA WRAPPER postgres_fdw
  OPTIONS (host 'ep-muddy-credit-beo4iymp-pooler.c-9.us-east-2.aws.neon.tech', dbname 'db_ventas', port '5432', sslmode 'require');

CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER
  SERVER srv_ventas
  OPTIONS (user 'neondb_owner', password 'npg_3clTWPB9xnEj');

IMPORT FOREIGN SCHEMA ventas
  LIMIT TO (pedidos_venta, detalle_pedido, ventas, pagos, devoluciones, detalle_devolucion)
  FROM SERVER srv_ventas INTO reportes;