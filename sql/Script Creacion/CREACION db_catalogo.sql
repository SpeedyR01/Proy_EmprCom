-- MICROSERVICIO: CATALOGO Y TERCEROS -> base: db_catalogo
-- Base maestra de referencia. Todas sus FK son internas.

CREATE TABLE catalogo.sedes (
	id_sede INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
	ciudad VARCHAR(80) NOT NULL,
	direccion VARCHAR(255) NOT NULL,
	tipo_sede VARCHAR(30) NOT NULL
		CHECK (tipo_sede IN ('PRINCIPAL','SUCURSAL','CENTRO_DISTRIBUCION')),
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado IN ('ACTIVO','INACTIVO'))
);

CREATE TABLE catalogo.categorias (
	id_categoria INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
	descripcion VARCHAR(255) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado IN ('ACTIVO','INACTIVO'))
);

CREATE TABLE catalogo.proveedores (
	id_proveedor INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	identificacion VARCHAR(30) NOT NULL UNIQUE,
	razon_social VARCHAR(150) NOT NULL,
	ciudad VARCHAR(80),
	correo VARCHAR(120),
	telefono VARCHAR(20),
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado IN ('ACTIVO','INACTIVO'))
);

CREATE TABLE catalogo.clientes (
	id_cliente INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	tipo_documento VARCHAR(20) NOT NULL
		CHECK (tipo_documento IN ('CC','NIT','CE','PAS')),
	num_documento VARCHAR(30) NOT NULL UNIQUE,
	nombre_completo VARCHAR(150) NOT NULL,
	correo VARCHAR(120) NOT NULL,
	telefono VARCHAR(20) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado IN ('ACTIVO','INACTIVO'))
);

CREATE TABLE catalogo.almacenes (
	id_almacen INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_sede INTEGER NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	tipo_almacen VARCHAR(20) NOT NULL
		CHECK (tipo_almacen IN ('PRINCIPAL','SECUNDARIO')),
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado IN ('ACTIVO','INACTIVO')),
	CONSTRAINT fk_almacenes_sede
		FOREIGN KEY (id_sede) REFERENCES catalogo.sedes (id_sede)
);

CREATE TABLE catalogo.productos (
	id_producto INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	sku VARCHAR(50) NOT NULL UNIQUE,
	nombre VARCHAR(150) NOT NULL,
	id_categoria INTEGER NOT NULL,
	unidad_medida VARCHAR(20) NOT NULL,
	precio_lista DECIMAL(12,2) NOT NULL DEFAULT 0,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado IN ('ACTIVO','INACTIVO')),
	CONSTRAINT fk_productos_categoria
		FOREIGN KEY (id_categoria) REFERENCES catalogo.categorias (id_categoria)
);

CREATE TABLE catalogo.producto_proveedor (
	id_producto INTEGER NOT NULL,
	id_proveedor INTEGER NOT NULL,
	costo_referencia DECIMAL(12,2) NOT NULL DEFAULT 0,
	plazo_entrega_dias INTEGER,
	CONSTRAINT pk_producto_proveedor PRIMARY KEY (id_producto, id_proveedor),
	CONSTRAINT fk_prodprov_producto
		FOREIGN KEY (id_producto) REFERENCES catalogo.productos (id_producto),
	CONSTRAINT fk_prodprov_proveedor
		FOREIGN KEY (id_proveedor) REFERENCES catalogo.proveedores (id_proveedor)
);