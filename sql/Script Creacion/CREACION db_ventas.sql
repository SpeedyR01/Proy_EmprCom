-- MICROSERVICIO: VENTAS, PAGOS Y DEVOLUCIONES -> base: db_ventas
-- id_sede, id_almacen, id_cliente, id_empleado, id_producto = IDs EXTERNOS (SIN FK)

CREATE TABLE ventas.pedidos_venta (
	id_pedido INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_sede INTEGER NOT NULL,          -- ID EXTERNO (db_catalogo)
	id_almacen INTEGER NOT NULL,       -- ID EXTERNO (db_catalogo)
	id_cliente INTEGER NOT NULL,       -- ID EXTERNO (db_catalogo)
	id_empleado INTEGER NOT NULL,      -- ID EXTERNO (db_identidad)
	fecha_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
	estado VARCHAR(20) NOT NULL DEFAULT 'CREADO'
		CHECK (estado IN ('CREADO','CONFIRMADO','ANULADO')),
	total_registrado DECIMAL(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE ventas.detalle_pedido (
	id_pedido INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,      -- ID EXTERNO (db_catalogo)
	cantidad DECIMAL(12,2) NOT NULL,
	precio_unitario DECIMAL(12,2) NOT NULL,
	CONSTRAINT pk_detalle_pedido PRIMARY KEY (id_pedido, id_producto),
	CONSTRAINT fk_detped_pedido
		FOREIGN KEY (id_pedido) REFERENCES ventas.pedidos_venta (id_pedido)
);

CREATE TABLE ventas.ventas (
	id_venta INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_pedido INTEGER NOT NULL UNIQUE,
	fecha_venta DATE NOT NULL DEFAULT CURRENT_DATE,
	estado VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADA'
		CHECK (estado IN ('CONFIRMADA','ANULADA')),
	CONSTRAINT fk_ventas_pedido
		FOREIGN KEY (id_pedido) REFERENCES ventas.pedidos_venta (id_pedido)
);

CREATE TABLE ventas.pagos (
	id_pago INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_venta INTEGER NOT NULL,
	fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	valor DECIMAL(12,2) NOT NULL,
	medio_pago VARCHAR(20) NOT NULL
		CHECK (medio_pago IN ('EFECTIVO','TARJETA','TRANSFERENCIA','OTRO')),
	estado VARCHAR(20) NOT NULL DEFAULT 'APROBADO'
		CHECK (estado IN ('APROBADO','RECHAZADO','ANULADO')),
	CONSTRAINT fk_pagos_ventas
		FOREIGN KEY (id_venta) REFERENCES ventas.ventas (id_venta)
);

CREATE TABLE ventas.devoluciones (
	id_devolucion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_venta INTEGER NOT NULL,
	fecha_solicitud DATE NOT NULL DEFAULT CURRENT_DATE,
	motivo VARCHAR(255) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'SOLICITADA'
		CHECK (estado IN ('SOLICITADA','APROBADA','RECHAZADA')),
	CONSTRAINT fk_devoluciones_venta
		FOREIGN KEY (id_venta) REFERENCES ventas.ventas (id_venta)
);

CREATE TABLE ventas.detalle_devolucion (
	id_devolucion INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,      -- ID EXTERNO (db_catalogo)
	cantidad DECIMAL(12,2) NOT NULL,
	condicion_producto VARCHAR(30) NOT NULL
		CHECK (condicion_producto IN ('BUENO','DAÑADO')),
	CONSTRAINT pk_detalle_devolucion PRIMARY KEY (id_devolucion, id_producto),
	CONSTRAINT fk_detdev_devolucion
		FOREIGN KEY (id_devolucion) REFERENCES ventas.devoluciones (id_devolucion)
);