-- MICROSERVICIO: TRANSFERENCIAS -> base: db_transferencias
-- id_almacen_origen/destino, id_producto = IDs EXTERNOS (SIN FK)

CREATE TABLE transferencias.transferencias (
	id_transferencia INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	id_almacen_origen INTEGER NOT NULL,
	id_almacen_destino INTEGER NOT NULL,
	fecha_solicitud TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	fecha_despacho TIMESTAMP,
	fecha_recepcion TIMESTAMP,
	estado VARCHAR(20) NOT NULL DEFAULT 'SOLICITADA'
		CHECK (estado IN ('SOLICITADA','DESPACHADA','RECIBIDA','ANULADA')),
	CONSTRAINT chk_transf_almacenes_distintos
		CHECK (id_almacen_origen <> id_almacen_destino)
);

CREATE TABLE transferencias.detalle_transferencias (
	id_transferencia INTEGER NOT NULL,
	id_producto INTEGER NOT NULL,
	cantidad_enviada DECIMAL(12,2) NOT NULL,
	cantidad_recibida DECIMAL(12,2) NOT NULL DEFAULT 0,
	CONSTRAINT pk_detalle_transferencias PRIMARY KEY (id_transferencia, id_producto),
	CONSTRAINT fk_dettransf_transferencia
		FOREIGN KEY (id_transferencia) REFERENCES transferencias.transferencias (id_transferencia)
);