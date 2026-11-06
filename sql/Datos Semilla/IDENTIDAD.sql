-- CARGOS -> ids 1..6
INSERT INTO identidad.cargos (nombre, descripcion) VALUES
	('Administrador',   'Gestiona catalogo, usuarios y configuracion'),
	('Comprador',       'Gestiona proveedores y ordenes de compra'),
	('Bodeguero',       'Maneja inventario, recepciones y transferencias'),
	('Vendedor',        'Registra pedidos y ventas'),
	('Cajero',          'Registra pagos y devoluciones'),
	('Auditor',         'Consulta reportes y auditoria');

-- ROLES -> ids 1..6
INSERT INTO identidad.roles (nombre, descripcion) VALUES
	('ADMINISTRADOR', 'Acceso total de configuracion'),
	('COMPRADOR',     'Gestion de compras'),
	('BODEGUERO',     'Gestion de inventario y transferencias'),
	('VENDEDOR',      'Gestion de ventas'),
	('CAJERO',        'Gestion de pagos y devoluciones'),
	('AUDITOR',       'Solo lectura / reportes');

-- EMPLEADOS -> ids 1..8
INSERT INTO identidad.empleados (id_sede, num_documento, nombre_completo, id_cargo, correo, estado) VALUES
	(1, '79001001', 'Andres Torres',   1, 'atorres@empresa.com',  'ACTIVO'),  -- 1 Admin (Bogota)
	(4, '79001002', 'Laura Gimenez',   2, 'lgimenez@empresa.com', 'ACTIVO'),  -- 2 Comprador (CEDI)
	(4, '79001003', 'Pedro Castro',    3, 'pcastro@empresa.com',  'ACTIVO'),  -- 3 Bodeguero (CEDI)
	(1, '79001004', 'Sofia Herrera',   4, 'sherrera@empresa.com', 'ACTIVO'),  -- 4 Vendedor (Bogota)
	(2, '79001005', 'Diego Morales',   4, 'dmorales@empresa.com', 'ACTIVO'),  -- 5 Vendedor (Medellin)
	(3, '79001006', 'Camila Rojas',    4, 'crojas@empresa.com',   'ACTIVO'),  -- 6 Vendedor (Cali)
	(1, '79001007', 'Felipe Nunez',    5, 'fnunez@empresa.com',   'ACTIVO'),  -- 7 Cajero (Bogota)
	(1, '79001008', 'Diana Pardo',     6, 'dpardo@empresa.com',   'ACTIVO');  -- 8 Auditor (Bogota)

-- USUARIOS (1:1 con empleado) -> ids 1..8
INSERT INTO identidad.usuarios (id_empleado, nombre_usuario, password_hash, estado, fecha_creacion) VALUES
	(1, 'atorres',  '$2y$10$hashAdmin00000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:00:00'),
	(2, 'lgimenez', '$2y$10$hashComp000000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:05:00'),
	(3, 'pcastro',  '$2y$10$hashBod0000000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:10:00'),
	(4, 'sherrera', '$2y$10$hashVen1000000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:15:00'),
	(5, 'dmorales', '$2y$10$hashVen2000000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:20:00'),
	(6, 'crojas',   '$2y$10$hashVen3000000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:25:00'),
	(7, 'fnunez',   '$2y$10$hashCaj000000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:30:00'),
	(8, 'dpardo',   '$2y$10$hashAud000000000000000000000000000000000000000', 'ACTIVO', '2026-04-28 08:35:00');

INSERT INTO identidad.usuario_rol (id_usuario, id_rol) VALUES
	(1, 1),           -- Andres  -> ADMINISTRADOR
	(2, 2),           -- Laura    -> COMPRADOR
	(3, 3),           -- Pedro    -> BODEGUERO
	(4, 4),           -- Sofia    -> VENDEDOR
	(5, 4),           -- Diego    -> VENDEDOR
	(6, 4),           -- Camila   -> VENDEDOR
	(7, 5),           -- Felipe   -> CAJERO
	(8, 6),           -- Diana    -> AUDITOR
	(3, 2);           -- Pedro tambien es COMPRADOR (ejemplo multi-rol)

INSERT INTO identidad.auditoria_accesos (id_usuario, fecha_hora, accion, objeto_consultado) VALUES
	(1, '2026-05-02 08:01:00', 'LOGIN',    'sistema'),
	(2, '2026-05-02 08:10:00', 'LOGIN',    'ordenes_compra'),
	(4, '2026-05-05 09:00:00', 'LOGIN',    'pedidos_venta'),
	(8, '2026-10-30 16:00:00', 'CONSULTA', 'reporte_ventas_sede'),
	(7, '2026-10-30 17:30:00', 'LOGIN',    'pagos');