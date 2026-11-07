GRANT USAGE ON SCHEMA transferencias TO rol_administrador, rol_bodeguero, rol_auditor;

-- Bodeguero: gestiona transferencias entre almacenes
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA transferencias TO rol_bodeguero;
-- Administrador y Auditor: lectura
GRANT SELECT ON ALL TABLES IN SCHEMA transferencias TO rol_administrador, rol_auditor;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA transferencias TO rol_bodeguero;