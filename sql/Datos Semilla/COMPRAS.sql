INSERT INTO compras.ordenes_compra (id_proveedor, id_almacen_destino, id_empleado, fecha_orden, fecha_estimada, estado) VALUES
	(1, 4, 2, '2026-05-05', '2026-05-12', 'RECIBIDA'),  -- 1
	(2, 4, 2, '2026-06-10', '2026-06-15', 'RECIBIDA'),  -- 2
	(3, 4, 2, '2026-07-08', '2026-07-18', 'RECIBIDA'),  -- 3
	(4, 4, 2, '2026-08-14', '2026-08-20', 'RECIBIDA'),  -- 4
	(1, 4, 2, '2026-09-09', '2026-09-16', 'ENVIADA'),   -- 5
	(2, 4, 2, '2026-10-20', '2026-10-27', 'BORRADOR');  -- 6

INSERT INTO compras.detalle_orden_compra (id_orden_compra, id_producto, cantidad_solicitada, costo_unitario) VALUES
	(1, 1, 50, 130000.00),
	(1, 2, 40, 110000.00),
	(2, 3, 200, 16000.00),
	(2, 4, 150, 21000.00),
	(2, 5, 300,  8000.00),
	(3, 7, 120, 45000.00),
	(3, 8, 150, 19000.00),
	(4, 9, 100, 15000.00),
	(4, 10,400,  5000.00),
	(5, 1, 60, 130000.00),
	(5, 6, 200, 12000.00),
	(6, 3, 150, 16000.00);

-- RECEPCIONES (de las ordenes ya recibidas 1..4) -> ids 1..4
INSERT INTO compras.recepciones_compra (id_orden_compra, fecha_recepcion, estado) VALUES
	(1, '2026-05-11', 'COMPLETA'),  -- 1
	(2, '2026-06-14', 'COMPLETA'),  -- 2
	(3, '2026-07-17', 'COMPLETA'),  -- 3
	(4, '2026-08-19', 'PARCIAL');   -- 4

INSERT INTO compras.detalle_recepcion (id_recepcion, id_producto, cantidad_recibida) VALUES
	(1, 1, 50),
	(1, 2, 40),
	(2, 3, 200),
	(2, 4, 150),
	(2, 5, 300),
	(3, 7, 120),
	(3, 8, 150),
	(4, 9, 80),    -- parcial: llegaron 80 de 100
	(4, 10,400);