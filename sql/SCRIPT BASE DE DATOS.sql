create schema EMPRESA;
create table EMPRESA.sedes (
	id_sede integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nombre varchar(100) not null,
	ciudad varchar(80) not null,
	direccion varchar(80) not null,
	tipo_Sede varchar(20) not null
		check (tipo_sede in ('Principal', 'Sucursal')),
	estado varchar(20) not null default 'ACTIVO'
		CHECK (estado in ('ACTIVO', 'INACTIVO'))
);

CREATE TABLE EMPRESA.categorias (
	id_categoria INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nombre VARCHAR(100),
	descripcion VARCHAR(255),
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado in ('ACTIVO','INACTIVO'))
);

ALTER TABLE EMPRESA.categorias
	ALTER COLUMN nombre set not null,
	ALTER COLUMN descripcion set not null;

CREATE TABLE EMPRESA.proveedores (
	id_proveedor INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	identificacion VARCHAR(30) NOT NULL UNIQUE,
	razon_social VARCHAR(150) NOT NULL,
	ciudad VARCHAR(80),
	correo VARCHAR(120),
	telefono VARCHAR(20),
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK(estado in ('ACTIVO','INACTIVO'))
)

CREATE TABLE EMPRESA.clientes (
	id_cliente INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	tipo_documento VARCHAR(20) NOT NULL
		CHECK (tipo_documento in ('CC','NIT','CE','PAS')),
	num_documento VARCHAR(30) NOT NULL,
	nombre_completo VARCHAR(150) NOT NULL,
	correo VARCHAR(120) NOT NULL,
	telefono VARCHAR(20) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK(estado in ('ACTIVO','INACTIVO'))
)

CREATE TABLE EMPRESA.cargos (
	id_cargo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
	descripcion VARCHAR(255) NOT NULL
)

CREATE TABLE EMPRESA.roles (
	id_rol INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nombre VARCHAR(80) NOT NULL,
	descripcion VARCHAR(255) NOT NULL
)

-- Las tablas que dependen exclusivamente de las anteriores --
CREATE TABLE EMPRESA.almacenes (
	id_almacen INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_sede INTEGER NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	tipo_almacen varchar(20) not null
		check (tipo_almacen in ('PRINCIPAL', 'SECUNDARIO')),
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK(estado in ('ACTIVO','INACTIVO')),

	CONSTRAINT fk_almacenes_sede
		FOREIGN KEY (id_sede)
		REFERENCES EMPRESA.sedes (id_sede)
)

CREATE TABLE EMPRESA.empleados (
	id_empleado INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_sede INTEGER NOT NULL,
	num_documento VARCHAR(30) NOT NULL,
	nombre_completo VARCHAR(150) NOT NULL,
	id_cargo INTEGER NOT NULL,
	correo VARCHAR(120) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK(estado in ('ACTIVO','INACTIVO')),

	CONSTRAINT fk_empleados_sedes
		FOREIGN KEY (id_sede)
		REFERENCES EMPRESA.sedes (id_sede),
	CONSTRAINT fk_empleados_cargos
		FOREIGN KEY (id_cargo)
		REFERENCES EMPRESA.cargos (id_cargo)
)

CREATE TABLE EMPRESA.productos (
	id_producto INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	SKU VARCHAR(50) NOT NULL UNIQUE,
	nombre VARCHAR(150) NOT NULL,
	id_categoria INTEGER NOT NULL,
	unidad_medida VARCHAR(20) NOT NULL,
	precio_lista DECIMAL(12,2) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK(estado in ('ACTIVO','INACTIVO')),

	CONSTRAINT fk_productos_categoria
		FOREIGN KEY (id_categoria)
		REFERENCES EMPRESA.categorias(id_categoria)
)

-- SIGUIENTE NIVEL DE DEPENDENCIAS --
CREATE TABLE EMPRESA.producto_proveedor (
	id_producto INTEGER NOT NULL,
	id_proveedor INTEGER NOT NULL,
	costo_referencia DECIMAL(12,2) NOT NULL,
	plazo_entrega_dias INTEGER NOT NULL,

	CONSTRAINT pk_producto_proveedor
		PRIMARY KEY (id_producto, id_proveedor),
	CONSTRAINT fk_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos (id_producto),
	CONSTRAINT fk_proveedor
		FOREIGN KEY (id_proveedor)
		REFERENCES EMPRESA.proveedores (id_proveedor)
)

CREATE TABLE EMPRESA.usuarios (
	id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_empleado INTEGER NOT NULL,
	nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK(estado in ('ACTIVO','INACTIVO')),
	fecha_Creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT fk_usuario_empleado
		FOREIGN KEY (id_empleado)
		REFERENCES EMPRESA.empleados (id_empleado)
)

CREATE TABLE EMPRESA.inventarios (
	id_almacen INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	existencia_actual DECIMAL(12,2) NOT NULL,
	stock_minimo DECIMAL(12,2),
	fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT pk_almacen_producto
		PRIMARY KEY (id_almacen, id_producto),
	CONSTRAINT fk_almacen
		FOREIGN KEY (id_almacen)
		REFERENCES EMPRESA.almacenes (id_almacen),
	CONSTRAINT fk_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos (id_producto)
)

CREATE TABLE EMPRESA.movimientos_inventarios (
	id_movimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_almacen INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	tipo_movimiento VARCHAR(20)
		CHECK(tipo_movimiento in ('ENTRADA','SALIDA','AJUSTE')),
	cantidad DECIMAL(12,2) NOT NULL,
	fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT fk_almacen
		FOREIGN KEY (id_almacen)
		REFERENCES EMPRESA.almacenes (id_almacen),
	CONSTRAINT fk_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos(id_producto)
)

CREATE TABLE EMPRESA.ajustes_inventarios (
	id_ajuste INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_almacen INTEGER NOT NULL,
	id_empleado INTEGER NOT NULL,
	fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	motivo VARCHAR(255) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK(estado in ('ACTIVO','INACTIVO')),

	CONSTRAINT fk_almacen
		FOREIGN KEY (id_almacen)
		REFERENCES EMPRESA.almacenes(id_almacen),
	CONSTRAINT fk_empleado
		FOREIGN KEY (id_empleado)
		REFERENCES EMPRESA.empleados (id_empleado)
)

CREATE TABLE EMPRESA.transferencias (
	id_transferencia INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_almacen_origen INTEGER NOT NULL,
	id_almacen_destino INTEGER NOT NULL,
	fecha_solicitud TIMESTAMP NOT NULL,
	fecha_recepcion TIMESTAMP NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK(estado in ('SOLICITADA','DESPACHADA','RECIBIDA','ANULADA')),

	CONSTRAINT fk_almacen_origen
		FOREIGN KEY (id_almacen_origen)
		REFERENCES EMPRESA.almacenes (id_almacen),
	CONSTRAINT fk_almacen_destino
		FOREIGN KEY (id_almacen_destino)
		REFERENCES EMPRESA.almacenes (id_almacen)
)

CREATE TABLE EMPRESA.ordenes_compra (
	id_orden_compra INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_proveedor INTEGER NOT NULL,
	id_almacen_destino INTEGER NOT NULL,
	id_empleado INTEGER NOT NULL,
	fecha_orden TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	fecha_estimada TIMESTAMP NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK(estado in ('SOLICITADA','DESPACHADA','RECIBIDA','ANULADA')),

	CONSTRAINT fk_ordenes_proveedor
		FOREIGN KEY (id_proveedor)
		REFERENCES EMPRESA.proveedores (id_proveedor),
	CONSTRAINT fk_ordenes_almacen_destino
		FOREIGN KEY (id_almacen_destino)
		REFERENCES EMPRESA.almacenes (id_almacen),
	CONSTRAINT fk_ordenes_empleado
		FOREIGN KEY (id_empleado)
		REFERENCES EMPRESA.empleados (id_empleado)
)

CREATE TABLE EMPRESA.pedidos_venta(
	id_pedido INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_sede INTEGER NOT NULL,
	id_almacen INTEGER NOT NULL,
	id_cliente INTEGER NOT NULL,
	id_empleado INTEGER NOT NULL,
	fecha_pedido TIMESTAMP,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK(estado in ('SOLICITADA','DESPACHADA','RECIBIDA','ANULADA')),

	CONSTRAINT fk_pedidos_sede
		FOREIGN KEY (id_sede)
		REFERENCES EMPRESA.sedes (id_sede),
	CONSTRAINT fk_pedidos_almacen
		FOREIGN KEY (id_almacen)
		REFERENCES EMPRESA.almacenes (id_almacen),
	CONSTRAINT fk_pedidos_cliente
		FOREIGN KEY (id_cliente)
		REFERENCES EMPRESA.clientes (id_cliente),
	CONSTRAINT fk_pedidos_empleado
		FOREIGN KEY (id_empleado)
		REFERENCES EMPRESA.empleados (id_empleado)
)

-- SIGUENTE NIVEL DE DEPENDENCIAS --
CREATE TABLE EMPRESA.detalle_transferencias (
	id_transferencia INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	cantidad_enivada DECIMAL (12,2) NOT NULL,
	cantidad_recibida DECIMAL (12,2) NOT NULL,

	CONSTRAINT pk_detalle_transferencias
		PRIMARY KEY (id_transferencia, id_producto),
	CONSTRAINT fk_transferencia
		FOREIGN KEY (id_transferencia)
		REFERENCES EMPRESA.transferencias (id_transferencia),
	CONSTRAINT fk_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos (id_producto)
)

CREATE TABLE EMPRESA.usuario_rol (
	id_usuario INTEGER NOT NULL,
	id_rol INTEGER NOT NULL,

	CONSTRAINT pk_usuario_rol
		PRIMARY KEY (id_usuario, id_rol),

	CONSTRAINT fk_usuario
		FOREIGN KEY (id_usuario)
		REFERENCES EMPRESA.usuarios (id_usuario),
	CONSTRAINT fk_rol
		FOREIGN KEY (id_rol)
		REFERENCES EMPRESA.roles (id_rol)
)

CREATE TABLE EMPRESA.auditoria_accesos (
	id_auditoria BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_usuario INTEGER NOT NULL,
	fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	accion VARCHAR(100) NOT NULL,
	objeto_consultado VARCHAR(150) NOT NULL,

	CONSTRAINT fk_auditoria_usuario
		FOREIGN KEY(id_usuario)
		REFERENCES EMPRESA.usuarios (id_usuario)
)

CREATE TABLE EMPRESA.detalle_orden_compra (
	id_orden_compra INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	cantidad_solicitada INTEGER NOT NULL,
	costo_unitario DECIMAL (12, 2) NOT NULL,

	CONSTRAINT pk_detalle_orden_compra
		PRIMARY KEY (id_orden_compra, id_producto),

	CONSTRAINT fk_orden_compra
		FOREIGN KEY (id_orden_compra)
		REFERENCES EMPRESA.ordenes_compra (id_orden_compra),
	CONSTRAINT fk_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos (id_producto)
)

CREATE TABLE EMPRESA.recepciones_compra (
	id_recepcion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_orden_compra INTEGER NOT NULL,
	fecha_recepcion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK(estado in ('SOLICITADA','DESPACHADA','RECIBIDA','ANULADA')),

	CONSTRAINT fk_recepciones_orden
		FOREIGN KEY (id_orden_compra)
		REFERENCES EMPRESA.ordenes_compra (id_orden_compra)
)

CREATE TABLE EMPRESA.detalle_pedido (
	id_pedido INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	cantidad DECIMAL(12,2) NOT NULL,
	precio_unitario DECIMAL(12,2) NOT NULL,

	CONSTRAINT pk_detalle_pedido
		PRIMARY KEY(id_pedido,id_producto),
	
	CONSTRAINT fk_pedido
		FOREIGN KEY (id_pedido)
		REFERENCES EMPRESA.pedidos_venta (id_pedido),
	CONSTRAINT fk_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos (id_producto)
)


CREATE TABLE EMPRESA.ventas (
	id_venta INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_pedido INTEGER NOT NULL,
	fecha_venta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK(estado in ('SOLICITADA','DESPACHADA','RECIBIDA','ANULADA')),

	CONSTRAINT fk_pedido
		FOREIGN KEY (id_pedido)
		REFERENCES EMPRESA.pedidos_venta (id_pedido)
)

-- DETALLE RECEPCION, PAGOS, DEVOLUCIONES --
CREATE TABLE EMPRESA.detalle_recepcion (
	id_recepcion INTEGER  NOT NULL,
	id_producto INTEGER NOT NULL,
	cantidad_recibida INTEGER NOT NULL,

	CONSTRAINT pk_detalle_recepcion
		PRIMARY KEY(id_recepcion,id_producto),
	CONSTRAINT fk_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos (id_producto),
	CONSTRAINT fk_recepcion
		FOREIGN KEY (id_recepcion)
		REFERENCES EMPRESA.recepciones_compra (id_recepcion)
	
)

CREATE TABLE EMPRESA.pagos (
	id_pago INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_venta INTEGER NOT NULL,
	fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	valor DECIMAL(12,2) NOT NULL,
	medio_pago VARCHAR(20) NOT NULL
		CHECK(medio_pago IN ('EFECTIVO','TARJETA','TRANSFERENCIA','OTRO')),
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK(estado in ('SOLICITADA','DESPACHADA','RECIBIDA','ANULADA')),

	CONSTRAINT fk_pagos_ventas
		FOREIGN KEY (id_venta)
		REFERENCES EMPRESA.ventas(id_venta)
)

CREATE TABLE empresa.devoluciones (
	id_devolucion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_venta INTEGER NOT NULL,
	fecha_solicitud TIMESTAMP NOT NULL,
	motivo VARCHAR(255) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK(estado in ('SOLICITADA','DESPACHADA','RECIBIDA','ANULADA')),

	CONSTRAINT fk_devoluciones_venta 
		FOREIGN KEY (id_venta)
		REFERENCES empresa.ventas (id_venta)
)

CREATE TABLE empresa.detalle_devolucion (
	id_devolucion INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	cantidad DECIMAL(12,2) NOT NULL,
	condicion_producto VARCHAR(30) NOT NULL
		CHECK (condicion_producto IN ('BUENO','DAÑADO')),

	CONSTRAINT pk_detalle_devolucion
		PRIMARY KEY (id_devolucion, id_producto),
	CONSTRAINT fk_devolucion
		FOREIGN KEY (id_devolucion)
		REFERENCES empresa.devoluciones (id_devolucion),
	CONSTRAINT fk_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos(id_producto)
)
		