-- =========================================================================
-- SCRIPT 3: CONSULTAS SQL AVANZADAS, RANKINGS Y AUDITORÍAS DE INTEGRIDAD
-- =========================================================================
SET search_path TO reportes, public;

-- D1. Saldos pendientes con ranking y clasificación de riesgo (CTE + RANK)
WITH estado_deuda AS (
    SELECT v.id_venta, pv.id_sede, pv.id_cliente, v.fecha_venta,
           pv.total_registrado                                  AS valor_venta,
           COALESCE(SUM(pg.valor), 0)                           AS total_pagado,
           pv.total_registrado - COALESCE(SUM(pg.valor), 0)     AS saldo_pendiente
    FROM reportes.ventas v
    JOIN reportes.pedidos_venta pv ON pv.id_pedido = v.id_pedido
    LEFT JOIN reportes.pagos pg    ON pg.id_venta = v.id_venta AND pg.estado = 'APROBADO'
    WHERE v.estado = 'CONFIRMADA'
    GROUP BY v.id_venta, pv.id_sede, pv.id_cliente, v.fecha_venta, pv.total_registrado
)
SELECT ed.id_venta, s.nombre AS sede, c.nombre_completo AS cliente, ed.fecha_venta,
       ed.valor_venta, ed.total_pagado, ed.saldo_pendiente,
       RANK() OVER (ORDER BY ed.saldo_pendiente DESC) AS ranking_deuda,
       CASE WHEN ed.saldo_pendiente > 500000 THEN 'Riesgo Alto'
            WHEN ed.saldo_pendiente > 0      THEN 'Pendiente Normal'
            ELSE 'Pagado' END                           AS categoria_riesgo
FROM estado_deuda ed
JOIN reportes.sedes s    ON s.id_sede = ed.id_sede
JOIN reportes.clientes c ON c.id_cliente = ed.id_cliente
ORDER BY ed.saldo_pendiente DESC, ed.id_venta;

-- D2. Recepciones acumuladas vs solicitadas (CTE + DENSE_RANK)
WITH analisis AS (
    SELECT oc.id_orden_compra, oc.estado AS estado_orden, doc.id_producto,
           doc.cantidad_solicitada,
           COALESCE(SUM(dr.cantidad_recibida), 0)                         AS recepcion_acumulada,
           doc.cantidad_solicitada - COALESCE(SUM(dr.cantidad_recibida), 0) AS faltante
    FROM reportes.ordenes_compra oc
    JOIN reportes.detalle_orden_compra doc ON doc.id_orden_compra = oc.id_orden_compra
    LEFT JOIN reportes.recepciones_compra rc
           ON rc.id_orden_compra = oc.id_orden_compra AND rc.estado <> 'ANULADA'
    LEFT JOIN reportes.detalle_recepcion dr
           ON dr.id_recepcion = rc.id_recepcion AND dr.id_producto = doc.id_producto
    WHERE oc.estado <> 'ANULADA'
    GROUP BY oc.id_orden_compra, oc.estado, doc.id_producto, doc.cantidad_solicitada
)
SELECT a.id_orden_compra, a.estado_orden, p.nombre AS producto,
       a.cantidad_solicitada, a.recepcion_acumulada, a.faltante,
       ROUND(a.recepcion_acumulada::numeric / NULLIF(a.cantidad_solicitada, 0) * 100, 2)
                                                        AS porcentaje_cumplimiento,
       DENSE_RANK() OVER (ORDER BY a.faltante DESC)     AS ranking_atraso
FROM analisis a
JOIN reportes.productos p ON p.id_producto = a.id_producto
ORDER BY ranking_atraso, a.id_orden_compra, a.id_producto;

-- D3. Validación: devoluciones <= vendido (auditoría de integridad)
WITH devuelto AS (
    SELECT d.id_venta, dd.id_producto, SUM(dd.cantidad) AS cantidad_devuelta
    FROM reportes.devoluciones d
    JOIN reportes.detalle_devolucion dd ON dd.id_devolucion = d.id_devolucion
    WHERE d.estado <> 'RECHAZADA'
    GROUP BY d.id_venta, dd.id_producto
)
SELECT dv.id_venta, p.nombre AS producto, dv.cantidad_devuelta,
       COALESCE(dp.cantidad, 0) AS cantidad_vendida,
       CASE WHEN dp.cantidad IS NULL               THEN 'ANOMALIA: producto no esta en la venta'
            WHEN dv.cantidad_devuelta > dp.cantidad THEN 'ANOMALIA: excede lo vendido'
            ELSE 'APROBADO' END                     AS veredicto_auditoria
FROM devuelto dv
JOIN reportes.ventas v    ON v.id_venta = dv.id_venta
LEFT JOIN reportes.detalle_pedido dp ON dp.id_pedido = v.id_pedido AND dp.id_producto = dv.id_producto
JOIN reportes.productos p ON p.id_producto = dv.id_producto
ORDER BY dv.id_venta;

-- D4. Comprobación de la fragmentación (diferencia debe ser 0)
SELECT 'inventarios' AS tabla,
       (SELECT COUNT(*) FROM reportes.inventarios)              AS filas_global,
       (SELECT COUNT(*) FROM reportes.vw_inventarios_unificado) AS filas_fragmentos
UNION ALL
SELECT 'pedidos_venta',
       (SELECT COUNT(*) FROM reportes.pedidos_venta),
       (SELECT COUNT(*) FROM reportes.vw_pedidos_unificado);

-- D5. Consulta consolidada por sede
SELECT * FROM reportes.vw_resumen_consolidado_por_sede ORDER BY id_sede;