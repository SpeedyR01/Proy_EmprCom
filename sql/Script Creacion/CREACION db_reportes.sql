
-- =========================================================================
-- PARTE 1: VISTAS DE REPORTES Y NEGOCIO
-- =========================================================================
-- =========================================================================
-- SCRIPT 1: VISTAS DE REPORTES Y NEGOCIO
-- =========================================================================
SET search_path TO reportes, public;

-- 1. Inventario consolidado por producto
CREATE OR REPLACE VIEW reportes.vw_reporte_1_inventario_consolidado AS
SELECT
    p.id_producto,
    p.sku,
    p.nombre                                   AS nombre_producto,
    c.nombre                                   AS categoria,
    COUNT(i.id_almacen)                        AS almacenes_con_registro,
    COALESCE(SUM(i.existencia_actual), 0)      AS existencia_total_consolidada,
    COALESCE(SUM(i.stock_minimo), 0)           AS stock_minimo_global,
    CASE
        WHEN COALESCE(SUM(i.existencia_actual), 0) < COALESCE(SUM(i.stock_minimo), 0)
            THEN 'BAJO MINIMO'
        ELSE 'OK'
    END                                        AS estado_stock
FROM reportes.productos p
JOIN reportes.categorias c        ON c.id_categoria = p.id_categoria
LEFT JOIN reportes.inventarios i  ON i.id_producto  = p.id_producto
GROUP BY p.id_producto, p.sku, p.nombre, c.nombre;

-- 2. Productos bajo stock mínimo por sede / almacén
CREATE OR REPLACE VIEW reportes.vw_reporte_2_productos_bajo_minimo AS
SELECT
    s.id_sede,
    s.nombre                                   AS sede,
    a.id_almacen,
    a.nombre                                   AS almacen,
    p.id_producto,
    p.nombre                                   AS nombre_producto,
    i.existencia_actual,
    i.stock_minimo,
    (i.stock_minimo - i.existencia_actual)     AS unidades_faltantes
FROM reportes.inventarios i
JOIN reportes.almacenes a  ON a.id_almacen  = i.id_almacen
JOIN reportes.sedes s      ON s.id_sede     = a.id_sede
JOIN reportes.productos p  ON p.id_producto = i.id_producto
WHERE i.existencia_actual < i.stock_minimo;

-- 3. Ventas por sede y período mensual (solo ventas CONFIRMADAS)
CREATE OR REPLACE VIEW reportes.vw_reporte_3_ventas_sede_periodo AS
SELECT
    s.id_sede,
    s.nombre                                         AS sede,
    DATE_TRUNC('month', v.fecha_venta)::date         AS periodo_mes,
    COUNT(v.id_venta)                                AS total_ventas,
    SUM(pv.total_registrado)                         AS ingresos_totales
FROM reportes.ventas v
JOIN reportes.pedidos_venta pv ON pv.id_pedido = v.id_pedido
JOIN reportes.sedes s          ON s.id_sede    = pv.id_sede
WHERE v.estado = 'CONFIRMADA'
GROUP BY s.id_sede, s.nombre, DATE_TRUNC('month', v.fecha_venta);

-- 4. Compras por proveedor
CREATE OR REPLACE VIEW reportes.vw_reporte_4_compras_por_proveedor AS
WITH total_orden AS (
    SELECT id_orden_compra,
           SUM(cantidad_solicitada * costo_unitario) AS costo_total
    FROM reportes.detalle_orden_compra
    GROUP BY id_orden_compra
)
SELECT
    pr.id_proveedor,
    pr.razon_social                                AS nombre_proveedor,
    COUNT(oc.id_orden_compra)                      AS total_ordenes,
    COALESCE(SUM(t.costo_total), 0)                AS inversion_total
FROM reportes.proveedores pr
JOIN reportes.ordenes_compra oc ON oc.id_proveedor = pr.id_proveedor
LEFT JOIN total_orden t         ON t.id_orden_compra = oc.id_orden_compra
WHERE oc.estado <> 'ANULADA'
GROUP BY pr.id_proveedor, pr.razon_social;

-- 5. Clientes frecuentes y volumen de compra
CREATE OR REPLACE VIEW reportes.vw_reporte_5_clientes_frecuentes AS
SELECT
    c.id_cliente,
    c.nombre_completo                              AS nombre_cliente,
    COUNT(v.id_venta)                              AS total_compras,
    SUM(pv.total_registrado)                       AS total_gastado,
    MAX(v.fecha_venta)                             AS ultima_compra
FROM reportes.clientes c
JOIN reportes.pedidos_venta pv ON pv.id_cliente = c.id_cliente
JOIN reportes.ventas v         ON v.id_pedido   = pv.id_pedido
WHERE v.estado = 'CONFIRMADA'
GROUP BY c.id_cliente, c.nombre_completo;

-- 6. Rendimiento de ventas por empleado
CREATE OR REPLACE VIEW reportes.vw_reporte_6_ventas_por_empleado AS
SELECT
    e.id_empleado,
    e.nombre_completo                              AS nombre_empleado,
    e.id_sede,
    ca.nombre                                      AS cargo,
    COUNT(v.id_venta)                              AS ventas_cerradas,
    COALESCE(SUM(pv.total_registrado), 0)          AS total_gestionado
FROM reportes.empleados e
JOIN reportes.cargos ca             ON ca.id_cargo   = e.id_cargo
LEFT JOIN reportes.pedidos_venta pv ON pv.id_empleado = e.id_empleado
LEFT JOIN reportes.ventas v         ON v.id_pedido    = pv.id_pedido
                                   AND v.estado       = 'CONFIRMADA'
GROUP BY e.id_empleado, e.nombre_completo, e.id_sede, ca.nombre;

-- 7. Historial de movimientos de inventario
CREATE OR REPLACE VIEW reportes.vw_reporte_7_movimientos_inventario AS
SELECT
    m.id_movimiento,
    a.id_sede,
    m.id_almacen,
    a.nombre                                       AS almacen,
    m.id_producto,
    p.nombre                                       AS nombre_producto,
    m.tipo_movimiento,
    m.cantidad,
    m.fecha                                        AS fecha_movimiento
FROM reportes.movimientos_inventarios m
JOIN reportes.productos p  ON p.id_producto = m.id_producto
JOIN reportes.almacenes a  ON a.id_almacen  = m.id_almacen;

-- 8. Productos más vendidos
CREATE OR REPLACE VIEW reportes.vw_reporte_8_productos_mas_vendidos AS
SELECT
    dp.id_producto,
    p.nombre                                       AS nombre_producto,
    SUM(dp.cantidad)                               AS cantidad_total_vendida,
    SUM(dp.cantidad * dp.precio_unitario)          AS ingresos_generados
FROM reportes.detalle_pedido dp
JOIN reportes.ventas v     ON v.id_pedido   = dp.id_pedido
                          AND v.estado      = 'CONFIRMADA'
JOIN reportes.productos p  ON p.id_producto = dp.id_producto
GROUP BY dp.id_producto, p.nombre;

-- 9. Facturación / recaudo por medio de pago
CREATE OR REPLACE VIEW reportes.vw_reporte_9_facturacion_metodo_pago AS
SELECT
    medio_pago                                     AS metodo_pago,
    COUNT(id_pago)                                 AS total_transacciones,
    SUM(valor)                                     AS recaudo_total
FROM reportes.pagos
WHERE estado = 'APROBADO'
GROUP BY medio_pago;

-- 10. Resumen de devoluciones por sede
CREATE OR REPLACE VIEW reportes.vw_reporte_10_devoluciones_por_sede AS
SELECT
    s.id_sede,
    s.nombre                                       AS sede,
    COUNT(DISTINCT d.id_devolucion)                AS total_devoluciones,
    SUM(dd.cantidad)                               AS unidades_devueltas,
    SUM(dd.cantidad * dp.precio_unitario)          AS costo_devoluciones
FROM reportes.devoluciones d
JOIN reportes.detalle_devolucion dd ON dd.id_devolucion = d.id_devolucion
JOIN reportes.ventas v              ON v.id_venta       = d.id_venta
JOIN reportes.pedidos_venta pv      ON pv.id_pedido     = v.id_pedido
JOIN reportes.detalle_pedido dp     ON dp.id_pedido     = pv.id_pedido
                                   AND dp.id_producto   = dd.id_producto
JOIN reportes.sedes s               ON s.id_sede        = pv.id_sede
WHERE d.estado <> 'RECHAZADA'
GROUP BY s.id_sede, s.nombre;

-- 11. Saldos por venta (cartera)
CREATE OR REPLACE VIEW reportes.vw_reporte_11_saldos_por_venta AS
SELECT
    v.id_venta,
    pv.id_pedido,
    pv.id_sede,
    c.nombre_completo                              AS cliente,
    v.fecha_venta,
    pv.total_registrado                            AS valor_venta,
    COALESCE(SUM(pg.valor), 0)                     AS total_pagado,
    pv.total_registrado - COALESCE(SUM(pg.valor), 0) AS saldo_pendiente
FROM reportes.ventas v
JOIN reportes.pedidos_venta pv ON pv.id_pedido  = v.id_pedido
JOIN reportes.clientes c       ON c.id_cliente  = pv.id_cliente
LEFT JOIN reportes.pagos pg    ON pg.id_venta   = v.id_venta
                              AND pg.estado     = 'APROBADO'
WHERE v.estado = 'CONFIRMADA'
GROUP BY v.id_venta, pv.id_pedido, pv.id_sede, c.nombre_completo,
         v.fecha_venta, pv.total_registrado;


-- =========================================================================
-- PARTE 2: FRAGMENTACIÓN HORIZONTAL POR SEDE Y VISTAS UNIFICADAS
-- =========================================================================
-- =========================================================================
-- SCRIPT 2: FRAGMENTACIÓN HORIZONTAL POR SEDE Y VISTAS UNIFICADAS
-- =========================================================================
SET search_path TO reportes, public;

DROP VIEW  IF EXISTS reportes.vw_resumen_consolidado_por_sede;
DROP VIEW  IF EXISTS reportes.vw_pedidos_unificado;
DROP VIEW  IF EXISTS reportes.vw_inventarios_unificado;
DROP TABLE IF EXISTS reportes.frag_inventarios CASCADE;
DROP TABLE IF EXISTS reportes.frag_pedidos CASCADE;

-- ---- B1. Fragmentación de Inventarios (Partition by LIST on id_sede) ----
CREATE TABLE reportes.frag_inventarios (
    id_sede             INTEGER       NOT NULL,
    id_almacen          INTEGER       NOT NULL,
    id_producto         INTEGER       NOT NULL,
    existencia_actual   DECIMAL(12,2) NOT NULL,
    stock_minimo        DECIMAL(12,2) NOT NULL,
    fecha_actualizacion TIMESTAMP     NOT NULL,
    PRIMARY KEY (id_sede, id_almacen, id_producto)
) PARTITION BY LIST (id_sede);

CREATE TABLE reportes.frag_inventarios_sede1_bogota   PARTITION OF reportes.frag_inventarios FOR VALUES IN (1);
CREATE TABLE reportes.frag_inventarios_sede2_medellin PARTITION OF reportes.frag_inventarios FOR VALUES IN (2);
CREATE TABLE reportes.frag_inventarios_sede3_cali     PARTITION OF reportes.frag_inventarios FOR VALUES IN (3);
CREATE TABLE reportes.frag_inventarios_sede4_cedi     PARTITION OF reportes.frag_inventarios FOR VALUES IN (4);
CREATE TABLE reportes.frag_inventarios_otras          PARTITION OF reportes.frag_inventarios DEFAULT;

INSERT INTO reportes.frag_inventarios
SELECT a.id_sede, i.id_almacen, i.id_producto, i.existencia_actual,
       i.stock_minimo, i.fecha_actualizacion
FROM reportes.inventarios i
JOIN reportes.almacenes a ON a.id_almacen = i.id_almacen;

-- ---- B2. Fragmentación de Pedidos de Venta ----
CREATE TABLE reportes.frag_pedidos (
    id_pedido        INTEGER       NOT NULL,
    id_sede          INTEGER       NOT NULL,
    id_almacen       INTEGER       NOT NULL,
    id_cliente       INTEGER       NOT NULL,
    id_empleado      INTEGER       NOT NULL,
    fecha_pedido     DATE          NOT NULL,
    estado           VARCHAR(20)   NOT NULL,
    total_registrado DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (id_pedido, id_sede)
) PARTITION BY LIST (id_sede);

CREATE TABLE reportes.frag_pedidos_sede1_bogota   PARTITION OF reportes.frag_pedidos FOR VALUES IN (1);
CREATE TABLE reportes.frag_pedidos_sede2_medellin PARTITION OF reportes.frag_pedidos FOR VALUES IN (2);
CREATE TABLE reportes.frag_pedidos_sede3_cali     PARTITION OF reportes.frag_pedidos FOR VALUES IN (3);
CREATE TABLE reportes.frag_pedidos_sede4_cedi     PARTITION OF reportes.frag_pedidos FOR VALUES IN (4);
CREATE TABLE reportes.frag_pedidos_otras          PARTITION OF reportes.frag_pedidos DEFAULT;

INSERT INTO reportes.frag_pedidos
SELECT id_pedido, id_sede, id_almacen, id_cliente, id_empleado,
       fecha_pedido, estado, total_registrado
FROM reportes.pedidos_venta;

-- =========================================================================
-- VISTAS UNIFICADAS
-- =========================================================================
CREATE VIEW reportes.vw_inventarios_unificado AS
SELECT s.nombre AS sede, f.*
FROM reportes.frag_inventarios_sede1_bogota f JOIN reportes.sedes s ON s.id_sede = f.id_sede
UNION ALL
SELECT s.nombre, f.* FROM reportes.frag_inventarios_sede2_medellin f JOIN reportes.sedes s ON s.id_sede = f.id_sede
UNION ALL
SELECT s.nombre, f.* FROM reportes.frag_inventarios_sede3_cali f JOIN reportes.sedes s ON s.id_sede = f.id_sede
UNION ALL
SELECT s.nombre, f.* FROM reportes.frag_inventarios_sede4_cedi f JOIN reportes.sedes s ON s.id_sede = f.id_sede
UNION ALL
SELECT s.nombre, f.* FROM reportes.frag_inventarios_otras f JOIN reportes.sedes s ON s.id_sede = f.id_sede;

CREATE VIEW reportes.vw_pedidos_unificado AS
SELECT s.nombre AS sede, f.*
FROM reportes.frag_pedidos_sede1_bogota f JOIN reportes.sedes s ON s.id_sede = f.id_sede
UNION ALL
SELECT s.nombre, f.* FROM reportes.frag_pedidos_sede2_medellin f JOIN reportes.sedes s ON s.id_sede = f.id_sede
UNION ALL
SELECT s.nombre, f.* FROM reportes.frag_pedidos_sede3_cali f JOIN reportes.sedes s ON s.id_sede = f.id_sede
UNION ALL
SELECT s.nombre, f.* FROM reportes.frag_pedidos_sede4_cedi f JOIN reportes.sedes s ON s.id_sede = f.id_sede
UNION ALL
SELECT s.nombre, f.* FROM reportes.frag_pedidos_otras f JOIN reportes.sedes s ON s.id_sede = f.id_sede;

CREATE VIEW reportes.vw_resumen_consolidado_por_sede AS
SELECT
    s.id_sede,
    s.nombre AS sede,
    (SELECT COUNT(*) FROM reportes.frag_inventarios i WHERE i.id_sede = s.id_sede)
        AS referencias_en_inventario,
    (SELECT COALESCE(SUM(i.existencia_actual), 0) FROM reportes.frag_inventarios i WHERE i.id_sede = s.id_sede)
        AS existencia_total,
    (SELECT COUNT(*) FROM reportes.frag_pedidos p WHERE p.id_sede = s.id_sede)
        AS pedidos_totales,
    (SELECT COALESCE(SUM(p.total_registrado), 0) FROM reportes.frag_pedidos p
      WHERE p.id_sede = s.id_sede AND p.estado = 'CONFIRMADO')
        AS ingresos_confirmados
FROM reportes.sedes s;

