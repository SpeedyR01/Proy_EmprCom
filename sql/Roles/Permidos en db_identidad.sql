GRANT USAGE ON SCHEMA identidad TO rol_administrador, rol_auditor;

-- Administrador: gestiona usuarios, empleados, roles de negocio
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA identidad TO rol_administrador;

-- Auditor: Lee la auditoria y usuarios
GRANT SELECT ON ALL TABLES IN SCHEMA identidad TO rol_auditor;

-- Secuencias
GRANT USAGE ON ALL SEQUENCES IN SCHEMA identidad TO rol_administrador;