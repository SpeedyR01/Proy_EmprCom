-- 4 SEDES (requisito: >=4, incluyendo un centro de distribucion) -> ids 1..4
INSERT INTO catalogo.sedes (nombre, ciudad, direccion, tipo_sede, estado) VALUES
	('Sede Principal Bogota',       'Bogota',     'Cra 15 # 88-21',  'PRINCIPAL',           'ACTIVO'),
	('Sucursal Medellin',           'Medellin',   'Cll 10 # 43-55',  'SUCURSAL',            'ACTIVO'),
	('Sucursal Cali',               'Cali',       'Av 6N # 23-10',   'SUCURSAL',            'ACTIVO'),
	('Centro de Distribucion Funza','Funza',      'Km 2 Via Siberia','CENTRO_DISTRIBUCION', 'ACTIVO');

-- CATEGORIAS -> ids 1..5
INSERT INTO catalogo.categorias (nombre, descripcion, estado) VALUES
	('Herramientas Electricas', 'Taladros, pulidoras y afines', 'ACTIVO'),
	('Herramientas Manuales',   'Martillos, destornilladores', 'ACTIVO'),
	('Ferreteria General',      'Tornilleria, anclajes',       'ACTIVO'),
	('Pinturas',                'Pinturas y recubrimientos',   'ACTIVO'),
	('Seguridad Industrial',    'EPP y proteccion',            'ACTIVO');

-- PROVEEDORES -> ids 1..4
INSERT INTO catalogo.proveedores (identificacion, razon_social, ciudad, correo, telefono, estado) VALUES
	('900111222-3', 'Herramientas del Valle S.A.S.', 'Cali',     'ventas@herval.com',    '6027000001', 'ACTIVO'),
	('900333444-5', 'Importadora Andina Ltda',       'Bogota',   'compras@andina.com',   '6017000002', 'ACTIVO'),
	('901555666-7', 'Pinturas Nacionales S.A.',      'Medellin', 'contacto@pinal.com',   '6047000003', 'ACTIVO'),
	('901777888-9', 'Suministros EPP S.A.S.',        'Bogota',   'info@epp.com',         '6017000004', 'ACTIVO');

-- CLIENTES -> ids 1..6
INSERT INTO catalogo.clientes (tipo_documento, num_documento, nombre_completo, correo, telefono, estado) VALUES
	('NIT', '830001001-1', 'Constructora Delta S.A.',   'pagos@delta.com',      '6011110001', 'ACTIVO'),
	('NIT', '830002002-2', 'Remodelaciones Omega Ltda', 'compras@omega.com',    '6011110002', 'ACTIVO'),
	('CC',  '1012345678',  'Juan Perez Gomez',          'juanperez@mail.com',   '3001110003', 'ACTIVO'),
	('CC',  '1023456789',  'Maria Lopez Ruiz',          'marialopez@mail.com',  '3001110004', 'ACTIVO'),
	('NIT', '830003003-3', 'Ingenieria Sigma S.A.S.',   'tesoreria@sigma.com',  '6011110005', 'ACTIVO'),
	('CC',  '1034567890',  'Carlos Ramirez Soto',       'carlosr@mail.com',     '3001110006', 'ACTIVO');

-- ALMACENES (>=4). 1 por sede comercial + el del centro de distribucion -> ids 1..5
INSERT INTO catalogo.almacenes (id_sede, nombre, tipo_almacen, estado) VALUES
	(1, 'Bodega Principal Bogota',   'PRINCIPAL',  'ACTIVO'),  -- id 1
	(2, 'Bodega Medellin',           'PRINCIPAL',  'ACTIVO'),  -- id 2
	(3, 'Bodega Cali',               'PRINCIPAL',  'ACTIVO'),  -- id 3
	(4, 'CEDI - Almacen Central',    'PRINCIPAL',  'ACTIVO'),  -- id 4
	(1, 'Bodega Secundaria Bogota',  'SECUNDARIO', 'ACTIVO');  -- id 5

-- PRODUCTOS -> ids 1..10
INSERT INTO catalogo.productos (sku, nombre, id_categoria, unidad_medida, precio_lista, estado) VALUES
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

-- PRODUCTO_PROVEEDOR (PK compuesta)
INSERT INTO catalogo.producto_proveedor (id_producto, id_proveedor, costo_referencia, plazo_entrega_dias) VALUES
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