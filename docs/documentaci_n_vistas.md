# Documentación: Vistas de Reportes y Negocio (`schema reportes`)

Este documento detalla la arquitectura, propósito y estructura de las **11 vistas analíticas y operativas** implementadas en el esquema `reportes` del proyecto **Proy_EmprCom**. Estas vistas consolidan información distribuida y sirven como fuente de consulta para la toma de decisiones empresariales.

---

## Catálogo de Vistas Implementadas

| # | Nombre de la Vista | Descripción General | Tablas Involucradas |
|---|---|---|---|
| 1 | `vw_reporte_1_inventario_consolidado` | Inventario consolidado por producto a nivel global con cálculo de stock mínimo. | `productos`, `categorias`, `inventarios` |
| 2 | `vw_reporte_2_productos_bajo_minimo` | Detalla productos que se encuentran por debajo del stock mínimo por almacén y sede. | `inventarios`, `almacenes`, `sedes`, `productos` |
| 3 | `vw_reporte_3_ventas_sede_periodo` | Ventas mensuales agrupadas por sede (solo transacciones con estado `CONFIRMADA`). | `ventas`, `pedidos_venta`, `sedes` |
| 4 | `vw_reporte_4_compras_por_proveedor` | Inversión y volumen de compras por proveedor (excluyendo órdenes anuladas). | `proveedores`, `ordenes_compra`, `detalle_orden_compra` |
| 5 | `vw_reporte_5_clientes_frecuentes` | Historial de compras, volumen gastado y última fecha de compra por cliente. | `clientes`, `pedidos_venta`, `ventas` |
| 6 | `vw_reporte_6_ventas_por_empleado` | Rendimiento de ventas cerradas y monto gestionado por cada empleado. | `empleados`, `cargos`, `pedidos_venta`, `ventas` |
| 7 | `vw_reporte_7_movimientos_inventario` | Historial detallado de entradas, salidas y ajustes de inventario por almacén y sede. | `movimientos_inventarios`, `productos`, `almacenes`, `sedes` |
| 8 | `vw_reporte_8_productos_mas_vendidos` | Ranking histórico de productos más vendidos y generación de ingresos (`CONFIRMADA`). | `detalle_pedido`, `ventas`, `productos` |
| 9 | `vw_reporte_9_facturacion_metodo_pago` | Recaudo y transacciones agrupadas por medio de pago (pagos con estado `APROBADO`). | `pagos` |
| 10 | `vw_reporte_10_devoluciones_por_sede` | Resumen de devoluciones y costo económico de las mismas por sede. | `devoluciones`, `detalle_devolucion`, `ventas`, `pedidos_venta`, `detalle_pedido`, `sedes` |
| 11 | `vw_reporte_11_saldos_por_venta` | Cartera pendiente: comparación entre el valor total de la venta y los pagos aprobados. | `ventas`, `pedidos_venta`, `clientes`, `pagos` |

---

## Detalle Técnico de Vistas Clave

### 1. Inventario Consolidado (`vw_reporte_1_inventario_consolidado`)
Calcula la existencia total sumando todos los almacenes registrados por producto, evaluando dinámicamente si el stock global se encuentra bajo el límite mínimo:
```sql
CREATE OR REPLACE VIEW reportes.vw_reporte_1_inventario_consolidado AS
SELECT
    p.id_producto,
    p.sku,
    p.nombre AS nombre_producto,
    c.nombre AS categoria,
    COUNT(i.id_almacen) AS almacenes_con_registro,
    COALESCE(SUM(i.existencia_actual), 0) AS existencia_total_consolidada,
    COALESCE(SUM(i.stock_minimo), 0) AS stock_minimo_global,
    CASE 
        WHEN COALESCE(SUM(i.existencia_actual), 0) < COALESCE(SUM(i.stock_minimo), 0) THEN 'BAJO MINIMO'
        ELSE 'OK'
    END AS estado_stock
FROM reportes.productos p
JOIN reportes.categorias c ON c.id_categoria = p.id_categoria
LEFT JOIN reportes.inventarios i ON i.id_producto = p.id_producto
GROUP BY p.id_producto, p.sku, p.nombre, c.nombre;
```

### 2. Control de Cartera y Saldos (`vw_reporte_11_saldos_por_venta`)
Cruza las ventas confirmadas con los pagos aprobados mediante una agregación `LEFT JOIN`, permitiendo calcular de manera transparente el saldo pendiente por cobrar a los clientes.

---

## Instrucciones de Ejecución
Para desplegar o actualizar el conjunto de vistas, ejecute el script SQL correspondiente en PostgreSQL:
```bash
psql -U usuario -d nombre_bd -f sql/1_vistas.sql
```