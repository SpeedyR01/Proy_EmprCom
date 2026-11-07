GRANT USAGE ON SCHEMA compras TO rol_administrador, rol_comprador, rol_bodeguero, rol_auditor;

-- Comprador: gestiona ordendes de compra y sus detalles
GRANT SELECT, INSERT, UPDATE ON compras.ordenes_compra TO rol_comprador;
GRANT SELECT, INSERT, UPDATE ON compras.detalle_orden_compra TO rol_comprador;
GRANT SELECT ON compras.recepciones_compra, compras.detalle_recepcion TO rol_comprador;

-- Bodeguero: registra recepciones
GRANT SELECT, INSERT, UPDATE ON compras.recepciones_compra TO rol_bodeguero;
GRANT SELECT, INSERT, UPDATE ON compras.detalle_recepcion TO rol_bodeguero;
GRANT SELECT ON compras.ordenes_compra, compras.detalle_orden_compra TO rol_bodeguero;

-- Administrador
GRANT SELECT ON ALL TABLES IN SCHEMA compras TO rol_administrador, rol_auditor;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA compras TO rol_comprador, rol_bodeguero;