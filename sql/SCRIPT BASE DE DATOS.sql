CREATE SCHEMA EMPRESA;

-- ============================================================
--  NIVEL 0 - Tablas independientes (sin FK)
-- ============================================================

CREATE TABLE EMPRESA.sedes (
	id_sede INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
	ciudad VARCHAR(80) NOT NULL,
	direccion VARCHAR(255) NOT NULL,
	tipo_sede VARCHAR(30) NOT NULL
		CHECK (tipo_sede IN ('PRINCIPAL','SUCURSAL','CENTRO_DISTRIBUCION')),
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado IN ('ACTIVO','INACTIVO'))
);

CREATE TABLE EMPRESA.categorias (
	id_categoria INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
	descripcion VARCHAR(255) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado IN ('ACTIVO','INACTIVO'))
);

CREATE TABLE EMPRESA.proveedores (
	id_proveedor INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	identificacion VARCHAR(30) NOT NULL UNIQUE,
	razon_social VARCHAR(150) NOT NULL,
	ciudad VARCHAR(80),
	correo VARCHAR(120),
	telefono VARCHAR(20),
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado IN ('ACTIVO','INACTIVO'))
);

CREATE TABLE EMPRESA.clientes (
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

CREATE TABLE EMPRESA.cargos (
	id_cargo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
	descripcion VARCHAR(255) NOT NULL
);

CREATE TABLE EMPRESA.roles (
	id_rol INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nombre VARCHAR(80) NOT NULL,
	descripcion VARCHAR(255) NOT NULL
);

-- ============================================================
--  NIVEL 1 - Dependen del Nivel 0
-- ============================================================

CREATE TABLE EMPRESA.almacenes (
	id_almacen INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_sede INTEGER NOT NULL,
	nombre VARCHAR(100) NOT NULL,
	tipo_almacen VARCHAR(20) NOT NULL
		CHECK (tipo_almacen IN ('PRINCIPAL','SECUNDARIO')),
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado IN ('ACTIVO','INACTIVO')),

	CONSTRAINT fk_almacenes_sede
		FOREIGN KEY (id_sede)
		REFERENCES EMPRESA.sedes (id_sede)
);

CREATE TABLE EMPRESA.empleados (
	id_empleado INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_sede INTEGER NOT NULL,
	num_documento VARCHAR(30) NOT NULL UNIQUE,
	nombre_completo VARCHAR(150) NOT NULL,
	id_cargo INTEGER NOT NULL,
	correo VARCHAR(120) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado IN ('ACTIVO','INACTIVO')),

	CONSTRAINT fk_empleados_sedes
		FOREIGN KEY (id_sede)
		REFERENCES EMPRESA.sedes (id_sede),
	CONSTRAINT fk_empleados_cargos
		FOREIGN KEY (id_cargo)
		REFERENCES EMPRESA.cargos (id_cargo)
);

CREATE TABLE EMPRESA.productos (
	id_producto INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	sku VARCHAR(50) NOT NULL UNIQUE,
	nombre VARCHAR(150) NOT NULL,
	id_categoria INTEGER NOT NULL,
	unidad_medida VARCHAR(20) NOT NULL,
	precio_lista DECIMAL(12,2) NOT NULL DEFAULT 0,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado IN ('ACTIVO','INACTIVO')),

	CONSTRAINT fk_productos_categoria
		FOREIGN KEY (id_categoria)
		REFERENCES EMPRESA.categorias (id_categoria)
);

-- ============================================================
--  NIVEL 2 - Dependen del Nivel 1
-- ============================================================

CREATE TABLE EMPRESA.producto_proveedor (
	id_producto INTEGER NOT NULL,
	id_proveedor INTEGER NOT NULL,
	costo_referencia DECIMAL(12,2) NOT NULL DEFAULT 0,
	plazo_entrega_dias INTEGER,

	CONSTRAINT pk_producto_proveedor
		PRIMARY KEY (id_producto, id_proveedor),
	CONSTRAINT fk_prodprov_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos (id_producto),
	CONSTRAINT fk_prodprov_proveedor
		FOREIGN KEY (id_proveedor)
		REFERENCES EMPRESA.proveedores (id_proveedor)
);

CREATE TABLE EMPRESA.usuarios (
	id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_empleado INTEGER NOT NULL UNIQUE,
	nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO'
		CHECK (estado IN ('ACTIVO','INACTIVO')),
	fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT fk_usuario_empleado
		FOREIGN KEY (id_empleado)
		REFERENCES EMPRESA.empleados (id_empleado)
);

CREATE TABLE EMPRESA.inventarios (
	id_almacen INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	existencia_actual DECIMAL(12,2) NOT NULL DEFAULT 0,
	stock_minimo DECIMAL(12,2) NOT NULL DEFAULT 0,
	fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT pk_almacen_producto
		PRIMARY KEY (id_almacen, id_producto),
	CONSTRAINT fk_inventarios_almacen
		FOREIGN KEY (id_almacen)
		REFERENCES EMPRESA.almacenes (id_almacen),
	CONSTRAINT fk_inventarios_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos (id_producto)
);

CREATE TABLE EMPRESA.movimientos_inventarios (
	id_movimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_almacen INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	tipo_movimiento VARCHAR(20) NOT NULL
		CHECK (tipo_movimiento IN ('ENTRADA','SALIDA','AJUSTE')),
	cantidad DECIMAL(12,2) NOT NULL,
	fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT fk_movimientos_almacen
		FOREIGN KEY (id_almacen)
		REFERENCES EMPRESA.almacenes (id_almacen),
	CONSTRAINT fk_movimientos_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos (id_producto)
);

CREATE TABLE EMPRESA.ajustes_inventarios (
	id_ajuste INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_almacen INTEGER NOT NULL,
	id_empleado INTEGER NOT NULL,
	fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	motivo VARCHAR(255) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR'
		CHECK (estado IN ('BORRADOR','APLICADO','ANULADO')),

	CONSTRAINT fk_ajustes_almacen
		FOREIGN KEY (id_almacen)
		REFERENCES EMPRESA.almacenes (id_almacen),
	CONSTRAINT fk_ajustes_empleado
		FOREIGN KEY (id_empleado)
		REFERENCES EMPRESA.empleados (id_empleado)
);

CREATE TABLE EMPRESA.transferencias (
	id_transferencia INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_almacen_origen INTEGER NOT NULL,
	id_almacen_destino INTEGER NOT NULL,
	fecha_solicitud TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	fecha_despacho TIMESTAMP,
	fecha_recepcion TIMESTAMP,
	estado VARCHAR(20) NOT NULL DEFAULT 'SOLICITADA'
		CHECK (estado IN ('SOLICITADA','DESPACHADA','RECIBIDA','ANULADA')),

	CONSTRAINT chk_transf_almacenes_distintos
		CHECK (id_almacen_origen <> id_almacen_destino),
	CONSTRAINT fk_transf_almacen_origen
		FOREIGN KEY (id_almacen_origen)
		REFERENCES EMPRESA.almacenes (id_almacen),
	CONSTRAINT fk_transf_almacen_destino
		FOREIGN KEY (id_almacen_destino)
		REFERENCES EMPRESA.almacenes (id_almacen)
);

CREATE TABLE EMPRESA.ordenes_compra (
	id_orden_compra INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_proveedor INTEGER NOT NULL,
	id_almacen_destino INTEGER NOT NULL,
	id_empleado INTEGER NOT NULL,
	fecha_orden DATE NOT NULL DEFAULT CURRENT_DATE,
	fecha_estimada DATE,
	estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR'
		CHECK (estado IN ('BORRADOR','ENVIADA','RECIBIDA','ANULADA')),

	CONSTRAINT fk_ordenes_proveedor
		FOREIGN KEY (id_proveedor)
		REFERENCES EMPRESA.proveedores (id_proveedor),
	CONSTRAINT fk_ordenes_almacen_destino
		FOREIGN KEY (id_almacen_destino)
		REFERENCES EMPRESA.almacenes (id_almacen),
	CONSTRAINT fk_ordenes_empleado
		FOREIGN KEY (id_empleado)
		REFERENCES EMPRESA.empleados (id_empleado)
);

CREATE TABLE EMPRESA.pedidos_venta (
	id_pedido INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_sede INTEGER NOT NULL,
	id_almacen INTEGER NOT NULL,
	id_cliente INTEGER NOT NULL,
	id_empleado INTEGER NOT NULL,
	fecha_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
	estado VARCHAR(20) NOT NULL DEFAULT 'CREADO'
		CHECK (estado IN ('CREADO','CONFIRMADO','ANULADO')),
	total_registrado DECIMAL(12,2) NOT NULL DEFAULT 0,

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
);

-- ============================================================
--  NIVEL 3 - Dependen del Nivel 2
-- ============================================================

CREATE TABLE EMPRESA.detalle_transferencias (
	id_transferencia INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	cantidad_enviada DECIMAL(12,2) NOT NULL,
	cantidad_recibida DECIMAL(12,2) NOT NULL DEFAULT 0,

	CONSTRAINT pk_detalle_transferencias
		PRIMARY KEY (id_transferencia, id_producto),
	CONSTRAINT fk_dettransf_transferencia
		FOREIGN KEY (id_transferencia)
		REFERENCES EMPRESA.transferencias (id_transferencia),
	CONSTRAINT fk_dettransf_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos (id_producto)
);

CREATE TABLE EMPRESA.usuario_rol (
	id_usuario INTEGER NOT NULL,
	id_rol INTEGER NOT NULL,

	CONSTRAINT pk_usuario_rol
		PRIMARY KEY (id_usuario, id_rol),
	CONSTRAINT fk_usuariorol_usuario
		FOREIGN KEY (id_usuario)
		REFERENCES EMPRESA.usuarios (id_usuario),
	CONSTRAINT fk_usuariorol_rol
		FOREIGN KEY (id_rol)
		REFERENCES EMPRESA.roles (id_rol)
);

CREATE TABLE EMPRESA.auditoria_accesos (
	id_auditoria BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_usuario INTEGER NOT NULL,
	fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	accion VARCHAR(100) NOT NULL,
	objeto_consultado VARCHAR(150) NOT NULL,

	CONSTRAINT fk_auditoria_usuario
		FOREIGN KEY (id_usuario)
		REFERENCES EMPRESA.usuarios (id_usuario)
);

CREATE TABLE EMPRESA.detalle_orden_compra (
	id_orden_compra INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	cantidad_solicitada INTEGER NOT NULL,
	costo_unitario DECIMAL(12,2) NOT NULL,

	CONSTRAINT pk_detalle_orden_compra
		PRIMARY KEY (id_orden_compra, id_producto),
	CONSTRAINT fk_detoc_orden_compra
		FOREIGN KEY (id_orden_compra)
		REFERENCES EMPRESA.ordenes_compra (id_orden_compra),
	CONSTRAINT fk_detoc_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos (id_producto)
);

CREATE TABLE EMPRESA.recepciones_compra (
	id_recepcion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_orden_compra INTEGER NOT NULL,
	fecha_recepcion DATE NOT NULL DEFAULT CURRENT_DATE,
	estado VARCHAR(20) NOT NULL DEFAULT 'PARCIAL'
		CHECK (estado IN ('PARCIAL','COMPLETA','ANULADA')),

	CONSTRAINT fk_recepciones_orden
		FOREIGN KEY (id_orden_compra)
		REFERENCES EMPRESA.ordenes_compra (id_orden_compra)
);

CREATE TABLE EMPRESA.detalle_pedido (
	id_pedido INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	cantidad DECIMAL(12,2) NOT NULL,
	precio_unitario DECIMAL(12,2) NOT NULL,

	CONSTRAINT pk_detalle_pedido
		PRIMARY KEY (id_pedido, id_producto),
	CONSTRAINT fk_detped_pedido
		FOREIGN KEY (id_pedido)
		REFERENCES EMPRESA.pedidos_venta (id_pedido),
	CONSTRAINT fk_detped_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos (id_producto)
);

CREATE TABLE EMPRESA.ventas (
	id_venta INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_pedido INTEGER NOT NULL UNIQUE,
	fecha_venta DATE NOT NULL DEFAULT CURRENT_DATE,
	estado VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADA'
		CHECK (estado IN ('CONFIRMADA','ANULADA')),

	CONSTRAINT fk_ventas_pedido
		FOREIGN KEY (id_pedido)
		REFERENCES EMPRESA.pedidos_venta (id_pedido)
);

-- ============================================================
--  NIVEL 4 - Dependen del Nivel 3
-- ============================================================

CREATE TABLE EMPRESA.detalle_recepcion (
	id_recepcion INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	cantidad_recibida INTEGER NOT NULL,

	CONSTRAINT pk_detalle_recepcion
		PRIMARY KEY (id_recepcion, id_producto),
	CONSTRAINT fk_detrec_recepcion
		FOREIGN KEY (id_recepcion)
		REFERENCES EMPRESA.recepciones_compra (id_recepcion),
	CONSTRAINT fk_detrec_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos (id_producto)
);

CREATE TABLE EMPRESA.pagos (
	id_pago INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_venta INTEGER NOT NULL,
	fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	valor DECIMAL(12,2) NOT NULL,
	medio_pago VARCHAR(20) NOT NULL
		CHECK (medio_pago IN ('EFECTIVO','TARJETA','TRANSFERENCIA','OTRO')),
	estado VARCHAR(20) NOT NULL DEFAULT 'APROBADO'
		CHECK (estado IN ('APROBADO','RECHAZADO','ANULADO')),

	CONSTRAINT fk_pagos_ventas
		FOREIGN KEY (id_venta)
		REFERENCES EMPRESA.ventas (id_venta)
);

CREATE TABLE EMPRESA.devoluciones (
	id_devolucion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_venta INTEGER NOT NULL,
	fecha_solicitud DATE NOT NULL DEFAULT CURRENT_DATE,
	motivo VARCHAR(255) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'SOLICITADA'
		CHECK (estado IN ('SOLICITADA','APROBADA','RECHAZADA')),

	CONSTRAINT fk_devoluciones_venta
		FOREIGN KEY (id_venta)
		REFERENCES EMPRESA.ventas (id_venta)
);

-- ============================================================
--  NIVEL 5 - Dependen del Nivel 4
-- ============================================================

CREATE TABLE EMPRESA.detalle_devolucion (
	id_devolucion INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	cantidad DECIMAL(12,2) NOT NULL,
	condicion_producto VARCHAR(30) NOT NULL
		CHECK (condicion_producto IN ('BUENO','DAÑADO')),

	CONSTRAINT pk_detalle_devolucion
		PRIMARY KEY (id_devolucion, id_producto),
	CONSTRAINT fk_detdev_devolucion
		FOREIGN KEY (id_devolucion)
		REFERENCES EMPRESA.devoluciones (id_devolucion),
	CONSTRAINT fk_detdev_producto
		FOREIGN KEY (id_producto)
		REFERENCES EMPRESA.productos (id_producto)
);
