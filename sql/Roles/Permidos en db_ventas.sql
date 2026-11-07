GRANT USAGE ON SCHEMA ventas TO
	rol_administrador, rol_vendedor, rol_cajero, rol_auditor, rol_bodeguero;

-- Vendedor: pedidos, detalle y confirmacion de ventas
GRANT SELECT, INSERT, UPDATE ON ventas.pedidos_venta  TO rol_vendedor;
GRANT SELECT, INSERT, UPDATE ON ventas.detalle_pedido TO rol_vendedor;
GRANT SELECT, INSERT, UPDATE ON ventas.ventas         TO rol_vendedor;
-- Cajero: pagos y devoluciones (lee ventas/pedidos para validar)
GRANT SELECT, INSERT, UPDATE ON ventas.pagos              TO rol_cajero;
GRANT SELECT, INSERT, UPDATE ON ventas.devoluciones       TO rol_cajero;
GRANT SELECT, INSERT, UPDATE ON ventas.detalle_devolucion TO rol_cajero;
GRANT SELECT ON ventas.ventas, ventas.pedidos_venta, ventas.detalle_pedido TO rol_cajero;
-- Bodeguero: lee ventas para despachar (opcional)
GRANT SELECT ON ventas.pedidos_venta, ventas.detalle_pedido TO rol_bodeguero;
-- Administrador y Auditor: lectura total
GRANT SELECT ON ALL TABLES IN SCHEMA ventas TO rol_administrador, rol_auditor;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA ventas TO rol_vendedor, rol_cajero;