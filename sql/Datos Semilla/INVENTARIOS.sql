-- INVENTARIOS (existencia inicial por almacen principal/CEDI)
-- Todos los productos arrancan en el CEDI (almacen 4) y hay stock distribuido en sedes.
INSERT INTO inventarios.inventarios (id_almacen, id_producto, existencia_actual, stock_minimo, fecha_actualizacion) VALUES
	-- CEDI (almacen 4): stock alto
	(4, 1, 120, 20, '2026-10-31 18:00:00'),
	(4, 2, 100, 20, '2026-10-31 18:00:00'),
	(4, 3, 300, 50, '2026-10-31 18:00:00'),
	(4, 4, 250, 40, '2026-10-31 18:00:00'),
	(4, 5, 500, 80, '2026-10-31 18:00:00'),
	(4, 6, 400, 60, '2026-10-31 18:00:00'),
	(4, 7, 180, 30, '2026-10-31 18:00:00'),
	(4, 8, 220, 40, '2026-10-31 18:00:00'),
	(4, 9, 160, 30, '2026-10-31 18:00:00'),
	(4, 10,600, 100,'2026-10-31 18:00:00'),
	-- Bogota (almacen 1)
	(1, 1, 15, 10, '2026-10-31 18:00:00'),
	(1, 3, 45, 20, '2026-10-31 18:00:00'),
	(1, 5, 60, 30, '2026-10-31 18:00:00'),
	(1, 7,  8, 15, '2026-10-31 18:00:00'),   -- bajo minimo (para reporte)
	(1, 9, 25, 15, '2026-10-31 18:00:00'),
	-- Medellin (almacen 2)
	(2, 1, 12, 10, '2026-10-31 18:00:00'),
	(2, 3, 30, 20, '2026-10-31 18:00:00'),
	(2, 8, 10, 20, '2026-10-31 18:00:00'),   -- bajo minimo
	(2, 10,120,50, '2026-10-31 18:00:00'),
	-- Cali (almacen 3)
	(3, 2, 18, 15, '2026-10-31 18:00:00'),
	(3, 4, 35, 20, '2026-10-31 18:00:00'),
	(3, 6, 25, 30, '2026-10-31 18:00:00');   -- bajo minimo


INSERT INTO inventarios.ajustes_inventarios (id_almacen, id_empleado, fecha, motivo, estado) VALUES
	(1, 3, '2026-08-31 17:00:00', 'Conteo fisico mensual - faltante menor', 'APLICADO'),
	(4, 3, '2026-10-31 19:00:00', 'Conteo fisico cierre mes - sobrante',    'APLICADO');


INSERT INTO inventarios.movimientos_inventarios (id_almacen, id_producto, tipo_movimiento, cantidad, fecha) VALUES
	-- Entradas al CEDI por recepciones
	(4, 1, 'ENTRADA', 50, '2026-05-11 10:00:00'),
	(4, 2, 'ENTRADA', 40, '2026-05-11 10:00:00'),
	(4, 3, 'ENTRADA', 200,'2026-06-14 10:00:00'),
	(4, 7, 'ENTRADA', 120,'2026-07-17 10:00:00'),
	(4, 9, 'ENTRADA', 80, '2026-08-19 10:00:00'),
	-- Salidas del CEDI por transferencias
	(4, 1, 'SALIDA',  20, '2026-05-16 09:00:00'),
	(4, 3, 'SALIDA',  50, '2026-05-16 09:00:00'),
	(4, 10,'SALIDA',  120,'2026-06-21 09:00:00'),
	-- Entradas a sedes por transferencias
	(1, 1, 'ENTRADA', 20, '2026-05-18 11:00:00'),
	(2, 10,'ENTRADA', 120,'2026-06-24 11:00:00'),
	-- Salidas por ventas (sedes)
	(1, 1, 'SALIDA',   5, '2026-05-20 15:00:00'),
	(2, 1, 'SALIDA',   2, '2026-06-03 11:30:00'),
	(1, 7, 'SALIDA',   4, '2026-06-28 16:45:00'),
	(3, 2, 'SALIDA',   3, '2026-07-12 12:00:00'),
	(1, 1, 'SALIDA',   3, '2026-08-26 18:00:00'),
	-- Ajustes por conteo
	(1, 7, 'AJUSTE',  -1, '2026-08-31 17:00:00'),
	(4, 5, 'AJUSTE',   5, '2026-10-31 19:00:00');