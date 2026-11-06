-- MICROSERVICIO: INVENTARIOS -> base: db_inventarios
-- id_almacen, id_producto, id_empleado = IDs EXTERNOS (SIN FK)

CREATE TABLE inventarios.inventarios (
	id_almacen INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	existencia_actual DECIMAL(12,2) NOT NULL DEFAULT 0,
	stock_minimo DECIMAL(12,2) NOT NULL DEFAULT 0,
	fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_almacen_producto PRIMARY KEY (id_almacen, id_producto)
);

CREATE TABLE inventarios.movimientos_inventarios (
	id_movimiento BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_almacen INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	tipo_movimiento VARCHAR(20) NOT NULL
		CHECK (tipo_movimiento IN ('ENTRADA','SALIDA','AJUSTE')),
	cantidad DECIMAL(12,2) NOT NULL,
	fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventarios.ajustes_inventarios (
	id_ajuste INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_almacen INTEGER NOT NULL,
	id_empleado INTEGER NOT NULL,
	fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	motivo VARCHAR(255) NOT NULL,
	estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR'
		CHECK (estado IN ('BORRADOR','APLICADO','ANULADO'))
);