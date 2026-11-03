-- 4 SEDES (requisito: >=4, incluyendo un centro de distribucion) -> ids 1..4
INSERT INTO EMPRESA.sedes (nombre, ciudad, direccion, tipo_sede, estado) VALUES
	('Sede Principal Bogota',       'Bogota',     'Cra 15 # 88-21',  'PRINCIPAL',           'ACTIVO'),
	('Sucursal Medellin',           'Medellin',   'Cll 10 # 43-55',  'SUCURSAL',            'ACTIVO'),
	('Sucursal Cali',               'Cali',       'Av 6N # 23-10',   'SUCURSAL',            'ACTIVO'),
	('Centro de Distribucion Funza','Funza',      'Km 2 Via Siberia','CENTRO_DISTRIBUCION', 'ACTIVO');

-- CATEGORIAS -> ids 1..5
INSERT INTO EMPRESA.categorias (nombre, descripcion, estado) VALUES
	('Herramientas Electricas', 'Taladros, pulidoras y afines', 'ACTIVO'),
	('Herramientas Manuales',   'Martillos, destornilladores', 'ACTIVO'),
	('Ferreteria General',      'Tornilleria, anclajes',       'ACTIVO'),
	('Pinturas',                'Pinturas y recubrimientos',   'ACTIVO'),
	('Seguridad Industrial',    'EPP y proteccion',            'ACTIVO');

-- PROVEEDORES -> ids 1..4
INSERT INTO EMPRESA.proveedores (identificacion, razon_social, ciudad, correo, telefono, estado) VALUES
	('900111222-3', 'Herramientas del Valle S.A.S.', 'Cali',     'ventas@herval.com',    '6027000001', 'ACTIVO'),
	('900333444-5', 'Importadora Andina Ltda',       'Bogota',   'compras@andina.com',   '6017000002', 'ACTIVO'),
	('901555666-7', 'Pinturas Nacionales S.A.',      'Medellin', 'contacto@pinal.com',   '6047000003', 'ACTIVO'),
	('901777888-9', 'Suministros EPP S.A.S.',        'Bogota',   'info@epp.com',         '6017000004', 'ACTIVO');

-- CLIENTES -> ids 1..6
INSERT INTO EMPRESA.clientes (tipo_documento, num_documento, nombre_completo, correo, telefono, estado) VALUES
	('NIT', '830001001-1', 'Constructora Delta S.A.',   'pagos@delta.com',      '6011110001', 'ACTIVO'),
	('NIT', '830002002-2', 'Remodelaciones Omega Ltda', 'compras@omega.com',    '6011110002', 'ACTIVO'),
	('CC',  '1012345678',  'Juan Perez Gomez',          'juanperez@mail.com',   '3001110003', 'ACTIVO'),
	('CC',  '1023456789',  'Maria Lopez Ruiz',          'marialopez@mail.com',  '3001110004', 'ACTIVO'),
	('NIT', '830003003-3', 'Ingenieria Sigma S.A.S.',   'tesoreria@sigma.com',  '6011110005', 'ACTIVO'),
	('CC',  '1034567890',  'Carlos Ramirez Soto',       'carlosr@mail.com',     '3001110006', 'ACTIVO');

-- CARGOS -> ids 1..6
INSERT INTO EMPRESA.cargos (nombre, descripcion) VALUES
	('Administrador',   'Gestiona catalogo, usuarios y configuracion'),
	('Comprador',       'Gestiona proveedores y ordenes de compra'),
	('Bodeguero',       'Maneja inventario, recepciones y transferencias'),
	('Vendedor',        'Registra pedidos y ventas'),
	('Cajero',          'Registra pagos y devoluciones'),
	('Auditor',         'Consulta reportes y auditoria');

-- ROLES -> ids 1..6
INSERT INTO EMPRESA.roles (nombre, descripcion) VALUES
	('ADMINISTRADOR', 'Acceso total de configuracion'),
	('COMPRADOR',     'Gestion de compras'),
	('BODEGUERO',     'Gestion de inventario y transferencias'),
	('VENDEDOR',      'Gestion de ventas'),
	('CAJERO',        'Gestion de pagos y devoluciones'),
	('AUDITOR',       'Solo lectura / reportes');

-- ============================================================
--  NIVEL 1
-- ============================================================

-- ALMACENES (>=4). 1 por sede comercial + el del centro de distribucion -> ids 1..5
INSERT INTO EMPRESA.almacenes (id_sede, nombre, tipo_almacen, estado) VALUES
	(1, 'Bodega Principal Bogota',   'PRINCIPAL',  'ACTIVO'),  -- id 1
	(2, 'Bodega Medellin',           'PRINCIPAL',  'ACTIVO'),  -- id 2
	(3, 'Bodega Cali',               'PRINCIPAL',  'ACTIVO'),  -- id 3
	(4, 'CEDI - Almacen Central',    'PRINCIPAL',  'ACTIVO'),  -- id 4
	(1, 'Bodega Secundaria Bogota',  'SECUNDARIO', 'ACTIVO');  -- id 5

-- EMPLEADOS -> ids 1..8
INSERT INTO EMPRESA.empleados (id_sede, num_documento, nombre_completo, id_cargo, correo, estado) VALUES
	(1, '79001001', 'Andres Torres',   1, 'atorres@empresa.com',  'ACTIVO'),  -- 1 Admin (Bogota)
	(4, '79001002', 'Laura Gimenez',   2, 'lgimenez@empresa.com', 'ACTIVO'),  -- 2 Comprador (CEDI)
	(4, '79001003', 'Pedro Castro',    3, 'pcastro@empresa.com',  'ACTIVO'),  -- 3 Bodeguero (CEDI)
	(1, '79001004', 'Sofia Herrera',   4, 'sherrera@empresa.com', 'ACTIVO'),  -- 4 Vendedor (Bogota)
	(2, '79001005', 'Diego Morales',   4, 'dmorales@empresa.com', 'ACTIVO'),  -- 5 Vendedor (Medellin)
	(3, '79001006', 'Camila Rojas',    4, 'crojas@empresa.com',   'ACTIVO'),  -- 6 Vendedor (Cali)
	(1, '79001007', 'Felipe Nunez',    5, 'fnunez@empresa.com',   'ACTIVO'),  -- 7 Cajero (Bogota)
	(1, '79001008', 'Diana Pardo',     6, 'dpardo@empresa.com',   'ACTIVO');  -- 8 Auditor (Bogota)

-- PRODUCTOS -> ids 1..10
INSERT INTO EMPRESA.productos (sku, nombre, id_categoria, unidad_medida, precio_lista, estado) VALUES
	('ELE-0001', 'Taladro percutor 650W',          1, 'UND', 189900.00, 'ACTIVO'),  -- 1
	('ELE-0002', 'Pulidora angular 4.5"',          1, 'UND', 159900.00, 'ACTIVO'),  -- 2
	('MAN-0001', 'Martillo carpintero 16oz',        2, 'UND',  25900.00, 'ACTIVO'),  -- 3
	('MAN-0002', 'Juego destornilladores 6 pzs',    2, 'SET',  32900.00, 'ACTIVO'),  -- 4
	('FER-0001', 'Caja tornillos 1" (x100)',        3, 'CAJA', 12900.00, 'ACTIVO'),  -- 5
	('FER-0002', 'Anclaje expansion 3/8" (x50)',    3, 'CAJA', 18900.00, 'ACTIVO'),  -- 6
	('PIN-0001', 'Pintura vinilica blanca galon',   4, 'GAL',  65900.00, 'ACTIVO'),  -- 7
	('PIN-0002', 'Esmalte sintetico negro litro',   4, 'LT',   28900.00, 'ACTIVO'),  -- 8
	('SEG-0001', 'Casco seguridad blanco',          5, 'UND',  22900.00, 'ACTIVO'),  -- 9
	('SEG-0002', 'Guantes nitrilo (par)',           5, 'PAR',   8900.00, 'ACTIVO');  -- 10

-- ============================================================
--  NIVEL 2
-- ============================================================

-- PRODUCTO_PROVEEDOR (PK compuesta)
INSERT INTO EMPRESA.producto_proveedor (id_producto, id_proveedor, costo_referencia, plazo_entrega_dias) VALUES
	(1, 1, 130000.00, 7),
	(2, 1, 110000.00, 7),
	(3, 2,  16000.00, 5),
	(4, 2,  21000.00, 5),
	(5, 2,   8000.00, 5),
	(6, 2,  12000.00, 5),
	(7, 3,  45000.00, 10),
	(8, 3,  19000.00, 10),
	(9, 4,  15000.00, 6),
	(10,4,   5000.00, 6);

-- USUARIOS (1:1 con empleado) -> ids 1..8
INSERT INTO EMPRESA.usuarios (id_empleado, nombre_usuario, password_hash, estado, fecha_creacion) VALUES
	(1, 'atorres',  '$2y$10$hashAdmin00000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:00:00'),
	(2, 'lgimenez', '$2y$10$hashComp000000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:05:00'),
	(3, 'pcastro',  '$2y$10$hashBod0000000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:10:00'),
	(4, 'sherrera', '$2y$10$hashVen1000000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:15:00'),
	(5, 'dmorales', '$2y$10$hashVen2000000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:20:00'),
	(6, 'crojas',   '$2y$10$hashVen3000000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:25:00'),
	(7, 'fnunez',   '$2y$10$hashCaj000000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:30:00'),
	(8, 'dpardo',   '$2y$10$hashAud000000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:35:00');

-- INVENTARIOS (existencia inicial por almacen principal/CEDI)
-- Todos los productos arrancan en el CEDI (almacen 4) y hay stock distribuido en sedes.
INSERT INTO EMPRESA.inventarios (id_almacen, id_producto, existencia_actual, stock_minimo, fecha_actualizacion) VALUES
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

-- ============================================================
--  NIVEL 3 - Seguridad (usuario_rol) y Auditoria
-- ============================================================

INSERT INTO EMPRESA.usuario_rol (id_usuario, id_rol) VALUES
	(1, 1),           -- Andres  -> ADMINISTRADOR
	(2, 2),           -- Laura    -> COMPRADOR
	(3, 3),           -- Pedro    -> BODEGUERO
	(4, 4),           -- Sofia    -> VENDEDOR
	(5, 4),           -- Diego    -> VENDEDOR
	(6, 4),           -- Camila   -> VENDEDOR
	(7, 5),           -- Felipe   -> CAJERO
	(8, 6),           -- Diana    -> AUDITOR
	(3, 2);           -- Pedro tambien es COMPRADOR (ejemplo multi-rol)

INSERT INTO EMPRESA.auditoria_accesos (id_usuario, fecha_hora, accion, objeto_consultado) VALUES
	(1, '2026-05-02 08:01:00', 'LOGIN',    'sistema'),
	(2, '2026-05-02 08:10:00', 'LOGIN',    'ordenes_compra'),
	(4, '2026-05-05 09:00:00', 'LOGIN',    'pedidos_venta'),
	(8, '2026-10-30 16:00:00', 'CONSULTA', 'reporte_ventas_sede'),
	(7, '2026-10-30 17:30:00', 'LOGIN',    'pagos');

-- ============================================================
--  COMPRAS (distribuidas en 6 meses) - ordenes 1..6
-- ============================================================

INSERT INTO EMPRESA.ordenes_compra (id_proveedor, id_almacen_destino, id_empleado, fecha_orden, fecha_estimada, estado) VALUES
	(1, 4, 2, '2026-05-05', '2026-05-12', 'RECIBIDA'),  -- 1
	(2, 4, 2, '2026-06-10', '2026-06-15', 'RECIBIDA'),  -- 2
	(3, 4, 2, '2026-07-08', '2026-07-18', 'RECIBIDA'),  -- 3
	(4, 4, 2, '2026-08-14', '2026-08-20', 'RECIBIDA'),  -- 4
	(1, 4, 2, '2026-09-09', '2026-09-16', 'ENVIADA'),   -- 5
	(2, 4, 2, '2026-10-20', '2026-10-27', 'BORRADOR');  -- 6

INSERT INTO EMPRESA.detalle_orden_compra (id_orden_compra, id_producto, cantidad_solicitada, costo_unitario) VALUES
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
INSERT INTO EMPRESA.recepciones_compra (id_orden_compra, fecha_recepcion, estado) VALUES
	(1, '2026-05-11', 'COMPLETA'),  -- 1
	(2, '2026-06-14', 'COMPLETA'),  -- 2
	(3, '2026-07-17', 'COMPLETA'),  -- 3
	(4, '2026-08-19', 'PARCIAL');   -- 4

INSERT INTO EMPRESA.detalle_recepcion (id_recepcion, id_producto, cantidad_recibida) VALUES
	(1, 1, 50),
	(1, 2, 40),
	(2, 3, 200),
	(2, 4, 150),
	(2, 5, 300),
	(3, 7, 120),
	(3, 8, 150),
	(4, 9, 80),    -- parcial: llegaron 80 de 100
	(4, 10,400);

-- ============================================================
--  TRANSFERENCIAS CEDI -> sedes (durante los 6 meses) -> ids 1..3
-- ============================================================

INSERT INTO EMPRESA.transferencias (id_almacen_origen, id_almacen_destino, fecha_solicitud, fecha_despacho, fecha_recepcion, estado) VALUES
	(4, 1, '2026-05-15', '2026-05-16', '2026-05-18', 'RECIBIDA'),  -- CEDI -> Bogota
	(4, 2, '2026-06-20', '2026-06-21', '2026-06-24', 'RECIBIDA'),  -- CEDI -> Medellin
	(4, 3, '2026-09-25', '2026-09-26', NULL,         'DESPACHADA');-- CEDI -> Cali (en transito)

INSERT INTO EMPRESA.detalle_transferencias (id_transferencia, id_producto, cantidad_enviada, cantidad_recibida) VALUES
	(1, 1, 20, 20),
	(1, 3, 50, 50),
	(1, 7, 30, 30),
	(2, 1, 15, 15),
	(2, 10,120,120),
	(3, 2, 20, 0),   -- aun no recibida
	(3, 6, 40, 0);

-- ============================================================
--  VENTAS (distribuidas mayo..octubre) - pedidos 1..10
-- ============================================================

INSERT INTO EMPRESA.pedidos_venta (id_sede, id_almacen, id_cliente, id_empleado, fecha_pedido, estado, total_registrado) VALUES
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

INSERT INTO EMPRESA.detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES
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
INSERT INTO EMPRESA.ventas (id_pedido, fecha_venta, estado) VALUES
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

INSERT INTO EMPRESA.pagos (id_venta, fecha_pago, valor, medio_pago, estado) VALUES
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

INSERT INTO EMPRESA.devoluciones (id_venta, fecha_solicitud, motivo, estado) VALUES
	(3, '2026-07-05', 'Producto con defecto de fabrica',  'APROBADA'),   -- 1
	(7, '2026-09-01', 'Cliente solicito cambio de medida','SOLICITADA'); -- 2

INSERT INTO EMPRESA.detalle_devolucion (id_devolucion, id_producto, cantidad, condicion_producto) VALUES
	(1, 7, 1, 'DAÑADO'),   -- 1 galon de pintura devuelto danado (venta 3)
	(2, 5, 1, 'BUENO');    -- 1 caja tornillos (venta 7), en buen estado

-- ============================================================
--  AJUSTES DE INVENTARIO (correcciones por conteo fisico) -> ids 1..2
-- ============================================================

INSERT INTO EMPRESA.ajustes_inventarios (id_almacen, id_empleado, fecha, motivo, estado) VALUES
	(1, 3, '2026-08-31 17:00:00', 'Conteo fisico mensual - faltante menor', 'APLICADO'),
	(4, 3, '2026-10-31 19:00:00', 'Conteo fisico cierre mes - sobrante',    'APLICADO');

-- ============================================================
--  MOVIMIENTOS DE INVENTARIO (muestra representativa)
--  ENTRADA por recepciones/transferencias, SALIDA por ventas, AJUSTE por conteos.
-- ============================================================

INSERT INTO EMPRESA.movimientos_inventarios (id_almacen, id_producto, tipo_movimiento, cantidad, fecha) VALUES
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

-- ============================================================
--  FIN DEL SEED
-- ============================================================
--  Para reiniciar los datos (cuidado: borra todo):
--  TRUNCATE
--    EMPRESA.detalle_devolucion, EMPRESA.devoluciones, EMPRESA.pagos,
--    EMPRESA.detalle_recepcion, EMPRESA.ventas, EMPRESA.detalle_pedido,
--    EMPRESA.recepciones_compra, EMPRESA.detalle_orden_compra,
--    EMPRESA.auditoria_accesos, EMPRESA.usuario_rol,
--    EMPRESA.detalle_transferencias, EMPRESA.pedidos_venta,
--    EMPRESA.ordenes_compra, EMPRESA.transferencias,
--    EMPRESA.ajustes_inventarios, EMPRESA.movimientos_inventarios,
--    EMPRESA.inventarios, EMPRESA.usuarios, EMPRESA.producto_proveedor,
--    EMPRESA.productos, EMPRESA.empleados, EMPRESA.almacenes,
--    EMPRESA.roles, EMPRESA.cargos, EMPRESA.clientes,
--    EMPRESA.proveedores, EMPRESA.categorias, EMPRESA.sedes
--  RESTART IDENTITY CASCADE;