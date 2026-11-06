-- MICROSERVICIO: IDENTIDAD Y ACCESOS -> base: db_identidad
-- empleados.id_sede es ID EXTERNO (db_catalogo) -> SIN FK

CREATE TABLE identidad.cargos (
	id_cargo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
	descripcion VARCHAR(255) NOT NULL
);

CREATE TABLE identidad.roles (
	id_rol INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nombre VARCHAR(80) NOT NULL,
	descripcion VARCHAR(255) NOT NULL
);

CREATE TABLE identidad.empleados (
	id_empleado INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_sede INTEGER NOT NULL,          -- ID EXTERNO (db_catalogo) - SIN FK
	num_documento VARCHAR(30) NOT NULL UNIQUE,
	nombre_completo VARCHAR(150) NOT NULL,
	id_cargo INTEGER NOT NULL,
	correo VARCHAR(120) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado IN ('ACTIVO','INACTIVO')),
	CONSTRAINT fk_empleados_cargos
		FOREIGN KEY (id_cargo) REFERENCES identidad.cargos (id_cargo)
);

CREATE TABLE identidad.usuarios (
	id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_empleado INTEGER NOT NULL UNIQUE,
	nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado IN ('ACTIVO','INACTIVO')),
	fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_usuario_empleado
		FOREIGN KEY (id_empleado) REFERENCES identidad.empleados (id_empleado)
);

CREATE TABLE identidad.usuario_rol (
	id_usuario INTEGER NOT NULL,
	id_rol INTEGER NOT NULL,
	CONSTRAINT pk_usuario_rol PRIMARY KEY (id_usuario, id_rol),
	CONSTRAINT fk_usuariorol_usuario
		FOREIGN KEY (id_usuario) REFERENCES identidad.usuarios (id_usuario),
	CONSTRAINT fk_usuariorol_rol
		FOREIGN KEY (id_rol) REFERENCES identidad.roles (id_rol)
);

CREATE TABLE identidad.auditoria_accesos (
	id_auditoria BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_usuario INTEGER NOT NULL,
	fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	accion VARCHAR(100) NOT NULL,
	objeto_consultado VARCHAR(150) NOT NULL,
	CONSTRAINT fk_auditoria_usuario
		FOREIGN KEY (id_usuario) REFERENCES identidad.usuarios (id_usuario)
);