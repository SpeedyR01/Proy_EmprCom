CREATE ROLE rol_administrador NOLOGIN;
CREATE ROLE rol_comprador     NOLOGIN;
CREATE ROLE rol_bodeguero     NOLOGIN;
CREATE ROLE rol_vendedor      NOLOGIN;
CREATE ROLE rol_cajero        NOLOGIN;
CREATE ROLE rol_auditor       NOLOGIN;

GRANT USAGE ON SCHEMA catalogo TO
	rol_administrador, rol_comprador, rol_bodeguero,
	rol_vendedor, rol_cajero, rol_auditor;

-- Administrador: gestiona el catalogo maestro
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA catalogo TO rol_administrador;

-- Comprador: lee catalogo, gestiona proveedores y su relacion
GRANT SELECT ON ALL TABLES IN SCHEMA catalogo TO rol_comprador;
GRANT INSERT, UPDATE ON catalogo.proveedores        TO rol_comprador;
GRANT INSERT, UPDATE ON catalogo.producto_proveedor TO rol_comprador;

-- Bodeguero: solo lee catalogo (productos, almacenes, sedes)
GRANT SELECT ON ALL TABLES IN SCHEMA catalogo TO rol_bodeguero;

-- Vendedor: lee catalogo, gestiona clientes
GRANT SELECT ON ALL TABLES IN SCHEMA catalogo TO rol_vendedor;
GRANT INSERT, UPDATE ON catalogo.clientes TO rol_vendedor;

-- Cajero: lee catalogo (clientes, productos)
GRANT SELECT ON ALL TABLES IN SCHEMA catalogo TO rol_cajero;

-- Auditor: solo lectura total
GRANT SELECT ON ALL TABLES IN SCHEMA catalogo TO rol_auditor;

-- Secuencias (para INSERT con IDENTITY)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA catalogo TO
	rol_administrador, rol_comprador, rol_vendedor;