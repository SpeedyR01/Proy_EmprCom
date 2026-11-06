-- MICROSERVICIO: COMPRAS -> base: db_compras
-- id_proveedor, id_almacen_destino, id_empleado, id_producto = IDs EXTERNOS (SIN FK)

CREATE TABLE compras.ordenes_compra (
	id_orden_compra INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_proveedor INTEGER NOT NULL,
	id_almacen_destino INTEGER NOT NULL,
	id_empleado INTEGER NOT NULL,
	fecha_orden DATE NOT NULL DEFAULT CURRENT_DATE,
	fecha_estimada DATE,
	estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR'
		CHECK (estado IN ('BORRADOR','ENVIADA','RECIBIDA','ANULADA'))
);

CREATE TABLE compras.detalle_orden_compra (
	id_orden_compra INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	cantidad_solicitada INTEGER NOT NULL,
	costo_unitario DECIMAL(12,2) NOT NULL,
	CONSTRAINT pk_detalle_orden_compra PRIMARY KEY (id_orden_compra, id_producto),
	CONSTRAINT fk_detoc_orden_compra
		FOREIGN KEY (id_orden_compra) REFERENCES compras.ordenes_compra (id_orden_compra)
);

CREATE TABLE compras.recepciones_compra (
	id_recepcion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_orden_compra INTEGER NOT NULL,
	fecha_recepcion DATE NOT NULL DEFAULT CURRENT_DATE,
	estado VARCHAR(20) NOT NULL DEFAULT 'PARCIAL'
		CHECK (estado IN ('PARCIAL','COMPLETA','ANULADA')),
	CONSTRAINT fk_recepciones_orden
		FOREIGN KEY (id_orden_compra) REFERENCES compras.ordenes_compra (id_orden_compra)
);

CREATE TABLE compras.detalle_recepcion (
	id_recepcion INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	cantidad_recibida INTEGER NOT NULL,
	CONSTRAINT pk_detalle_recepcion PRIMARY KEY (id_recepcion, id_producto),
	CONSTRAINT fk_detrec_recepcion
		FOREIGN KEY (id_recepcion) REFERENCES compras.recepciones_compra (id_recepcion)
);