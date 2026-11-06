INSERT INTO transferencias.transferencias (id_almacen_origen, id_almacen_destino, fecha_solicitud, fecha_despacho, fecha_recepcion, estado) VALUES
	(4, 1, '2026-05-15', '2026-05-16', '2026-05-18', 'RECIBIDA'),  -- CEDI -> Bogota
	(4, 2, '2026-06-20', '2026-06-21', '2026-06-24', 'RECIBIDA'),  -- CEDI -> Medellin
	(4, 3, '2026-09-25', '2026-09-26', NULL,         'DESPACHADA');-- CEDI -> Cali (en transito)

INSERT INTO transferencias.detalle_transferencias (id_transferencia, id_producto, cantidad_enviada, cantidad_recibida) VALUES
	(1, 1, 20, 20),
	(1, 3, 50, 50),
	(1, 7, 30, 30),
	(2, 1, 15, 15),
	(2, 10,120,120),
	(3, 2, 20, 0),   -- aun no recibida
	(3, 6, 40, 0);