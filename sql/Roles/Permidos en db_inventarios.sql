GRANT USAGE ON SCHEMA inventarios TO
	rol_administrador, rol_bodeguero, rol_vendedor, rol_comprador, rol_auditor;

-- Bodeguero: gestiona existencias, movimientos y ajustes
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA inventarios TO rol_bodeguero;
-- Vendedor y Comprador: solo CONSULTA de existencias
GRANT SELECT ON inventarios.inventarios TO rol_vendedor, rol_comprador;
-- Administrador y Auditor: lectura total
GRANT SELECT ON ALL TABLES IN SCHEMA inventarios TO rol_administrador, rol_auditor;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA inventarios TO rol_bodeguero;