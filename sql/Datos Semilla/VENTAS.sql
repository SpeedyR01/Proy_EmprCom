-- ============================================================
--  VENTAS (distribuidas mayo..octubre) - pedidos 1..10
-- ============================================================

INSERT INTO ventas.pedidos_venta (id_sede, id_almacen, id_cliente, id_empleado, fecha_pedido, estado, total_registrado) VALUES
	(1, 1, 1, 4, '2026-05-20', 'CONFIRMADO', 1053600.00),  -- 1 Bogota
	(2, 2, 3, 5, '2026-06-03', 'CONFIRMADO',  543600.00),  -- 2 Medellin
	(1, 1, 2, 4, '2026-06-28', 'CONFIRMADO',  398700.00),  -- 3 Bogota
	(3, 3, 5, 6, '2026-07-12', 'CONFIRMADO',  659000.00),  -- 4 Cali
	(1, 1, 4, 4, '2026-07-30', 'CONFIRMADO',  231200.00),  -- 5 Bogota
	(2, 2, 6, 5, '2026-08-11', 'CONFIRMADO',  169800.00),  -- 6 Medellin
	(1, 1, 1, 4, '2026-08-26', 'CONFIRMADO',  789500.00),  -- 7 Bogota
	(3, 3, 5, 6, '2026-09-15', 'CONFIRMADO',  452000.00),  -- 8 Cali
	(1, 1, 3, 4, '2026-10-05', 'CONFIRMADO',  131800.00),  -- 9 Bogota
	(2, 2, 2, 5, '2026-10-22', 'CREADO',      284900.00);  -- 10 Medellin (aun pedido, sin venta)

INSERT INTO ventas.detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES
	-- pedido 1
	(1, 1, 5, 189900.00),
	(1, 3, 4,  25900.00),
	-- pedido 2
	(2, 1, 2, 189900.00),
	(2, 10,20,  8900.00),
	-- pedido 3
	(3, 5, 10, 12900.00),
	(3, 7,  4, 65900.00),
	-- pedido 4
	(4, 2, 3, 159900.00),
	(4, 4, 5,  32900.00),
	(4, 9, 1,  22900.00),
	-- pedido 5
	(5, 3, 4,  25900.00),
	(5, 5, 10, 12900.00),
	-- pedido 6
	(6, 10,10,  8900.00),
	(6, 8,  2, 28900.00),
	(6, 9,  1, 22900.00),
	-- pedido 7
	(7, 1, 3, 189900.00),
	(7, 7,  3, 65900.00),
	(7, 5,  2, 12900.00),
	-- pedido 8
	(8, 2, 2, 159900.00),
	(8, 6,  5, 18900.00),
	(8, 4,  1, 32900.00),
	-- pedido 9
	(9, 3, 2,  25900.00),
	(9, 4,  1, 32900.00),
	(9, 10,2,   8900.00),
	-- pedido 10 (solo pedido)
	(10,7, 4, 65900.00),
	(10,8, 1, 28900.00);

-- VENTAS confirmadas (pedidos 1..9; el 10 queda como pedido sin venta) -> ids 1..9
INSERT INTO ventas.ventas (id_pedido, fecha_venta, estado) VALUES
	(1, '2026-05-20', 'CONFIRMADA'),
	(2, '2026-06-03', 'CONFIRMADA'),
	(3, '2026-06-28', 'CONFIRMADA'),
	(4, '2026-07-12', 'CONFIRMADA'),
	(5, '2026-07-30', 'CONFIRMADA'),
	(6, '2026-08-11', 'CONFIRMADA'),
	(7, '2026-08-26', 'CONFIRMADA'),
	(8, '2026-09-15', 'CONFIRMADA'),
	(9, '2026-10-05', 'CONFIRMADA');

-- ============================================================
--  PAGOS (una o varias por venta)
-- ============================================================

INSERT INTO ventas.pagos (id_venta, fecha_pago, valor, medio_pago, estado) VALUES
	(1, '2026-05-20 15:00:00', 1053600.00, 'TRANSFERENCIA', 'APROBADO'),
	(2, '2026-06-03 11:30:00',  543600.00, 'TARJETA',       'APROBADO'),
	(3, '2026-06-28 16:45:00',  200000.00, 'EFECTIVO',      'APROBADO'),
	(3, '2026-07-02 10:00:00',  198700.00, 'TRANSFERENCIA', 'APROBADO'),  -- pago en 2 cuotas
	(4, '2026-07-12 12:00:00',  659000.00, 'TRANSFERENCIA', 'APROBADO'),
	(5, '2026-07-30 17:10:00',  231200.00, 'TARJETA',       'APROBADO'),
	(6, '2026-08-11 13:20:00',  169800.00, 'EFECTIVO',      'APROBADO'),
	(7, '2026-08-26 18:00:00',  789500.00, 'TRANSFERENCIA', 'APROBADO'),
	(8, '2026-09-15 14:40:00',  452000.00, 'TARJETA',       'APROBADO'),
	(9, '2026-10-05 10:15:00',  131800.00, 'EFECTIVO',      'APROBADO');

-- ============================================================
--  DEVOLUCIONES (algunas sobre ventas reales) -> ids 1..2
-- ============================================================

INSERT INTO ventas.devoluciones (id_venta, fecha_solicitud, motivo, estado) VALUES
	(3, '2026-07-05', 'Producto con defecto de fabrica',  'APROBADA'),   -- 1
	(7, '2026-09-01', 'Cliente solicito cambio de medida','SOLICITADA'); -- 2

INSERT INTO ventas.detalle_devolucion (id_devolucion, id_producto, cantidad, condicion_producto) VALUES
	(1, 7, 1, 'DAÑADO'),   -- 1 galon de pintura devuelto danado (venta 3)
	(2, 5, 1, 'BUENO');    -- 1 caja tornillos (venta 7), en buen estado