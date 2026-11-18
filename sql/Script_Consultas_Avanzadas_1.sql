-- =========================================================================
-- CONSULTAS SQL AVANZADAS (20 numeradas)
-- Se ejecutan en db_reportes, que via postgres_fdw lee las tablas de los
-- otros servidores como foreign tables dentro del esquema 'reportes'.
-- REQUISITO: haber ejecutado antes el script FDW (conexion a servidores).
-- =========================================================================
SET search_path TO reportes, public;


-- D1. Saldos pendientes con ranking y clasificacion de riesgo (CTE + RANK)
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
           COALESCE(SUM(dr.cantidad_recibida), 0)                           AS recepcion_acumulada,
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


-- D3. Auditoria de integridad: devoluciones <= vendido
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


-- D4. Comprobacion de la fragmentacion (la diferencia debe ser 0)
SELECT 'inventarios' AS tabla,
       (SELECT COUNT(*) FROM reportes.inventarios)              AS filas_global,
       (SELECT COUNT(*) FROM reportes.vw_inventarios_unificado) AS filas_fragmentos
UNION ALL
SELECT 'pedidos_venta',
       (SELECT COUNT(*) FROM reportes.pedidos_venta),
       (SELECT COUNT(*) FROM reportes.vw_pedidos_unificado);


-- D5. Consulta consolidada por sede (usa vista de fragmentacion)
SELECT * FROM reportes.vw_resumen_consolidado_por_sede ORDER BY id_sede;


-- D6. Top 5 productos mas vendidos por sede (window: ROW_NUMBER por particion)
WITH ventas_prod AS (
    SELECT pv.id_sede, dp.id_producto,
           SUM(dp.cantidad)                      AS unidades_vendidas,
           SUM(dp.cantidad * dp.precio_unitario) AS ingreso
    FROM reportes.ventas v
    JOIN reportes.pedidos_venta pv ON pv.id_pedido = v.id_pedido
    JOIN reportes.detalle_pedido dp ON dp.id_pedido = pv.id_pedido
    WHERE v.estado = 'CONFIRMADA'
    GROUP BY pv.id_sede, dp.id_producto
)
SELECT s.nombre AS sede, p.nombre AS producto, vp.unidades_vendidas, vp.ingreso,
       ROW_NUMBER() OVER (PARTITION BY vp.id_sede ORDER BY vp.unidades_vendidas DESC) AS puesto
FROM ventas_prod vp
JOIN reportes.sedes s     ON s.id_sede = vp.id_sede
JOIN reportes.productos p ON p.id_producto = vp.id_producto
QUALIFY ROW_NUMBER() OVER (PARTITION BY vp.id_sede ORDER BY vp.unidades_vendidas DESC) <= 5
ORDER BY s.nombre, puesto;
-- (Si tu PostgreSQL no soporta QUALIFY, usar la version con subconsulta de D7 como patron)


-- D7. Top 3 productos por categoria (subconsulta sobre window, sin QUALIFY)
SELECT * FROM (
    SELECT c.nombre AS categoria, p.nombre AS producto,
           COALESCE(SUM(dp.cantidad), 0) AS unidades,
           RANK() OVER (PARTITION BY c.id_categoria
                        ORDER BY COALESCE(SUM(dp.cantidad),0) DESC) AS puesto
    FROM reportes.productos p
    JOIN reportes.categorias c ON c.id_categoria = p.id_categoria
    LEFT JOIN reportes.detalle_pedido dp ON dp.id_producto = p.id_producto
    GROUP BY c.id_categoria, c.nombre, p.id_producto, p.nombre
) t
WHERE puesto <= 3
ORDER BY categoria, puesto;


-- D8. Ventas mensuales con acumulado y variacion vs mes anterior (LAG + SUM window)
WITH mensual AS (
    SELECT DATE_TRUNC('month', v.fecha_venta)::date AS mes,
           SUM(pv.total_registrado)                 AS ingreso_mes
    FROM reportes.ventas v
    JOIN reportes.pedidos_venta pv ON pv.id_pedido = v.id_pedido
    WHERE v.estado = 'CONFIRMADA'
    GROUP BY DATE_TRUNC('month', v.fecha_venta)
)
SELECT mes, ingreso_mes,
       SUM(ingreso_mes) OVER (ORDER BY mes)                       AS acumulado,
       LAG(ingreso_mes) OVER (ORDER BY mes)                       AS ingreso_mes_anterior,
       ROUND( (ingreso_mes - LAG(ingreso_mes) OVER (ORDER BY mes))
              / NULLIF(LAG(ingreso_mes) OVER (ORDER BY mes),0) * 100, 2) AS variacion_pct
FROM mensual
ORDER BY mes;


-- D9. Clientes: frecuencia, ticket promedio y segmentacion (NTILE)
WITH compras_cliente AS (
    SELECT pv.id_cliente,
           COUNT(DISTINCT v.id_venta)         AS num_compras,
           SUM(pv.total_registrado)           AS total_gastado,
           AVG(pv.total_registrado)           AS ticket_promedio
    FROM reportes.ventas v
    JOIN reportes.pedidos_venta pv ON pv.id_pedido = v.id_pedido
    WHERE v.estado = 'CONFIRMADA'
    GROUP BY pv.id_cliente
)
SELECT c.nombre_completo AS cliente, cc.num_compras, cc.total_gastado,
       ROUND(cc.ticket_promedio, 2) AS ticket_promedio,
       NTILE(4) OVER (ORDER BY cc.total_gastado DESC) AS cuartil_valor
FROM compras_cliente cc
JOIN reportes.clientes c ON c.id_cliente = cc.id_cliente
ORDER BY cc.total_gastado DESC;


-- D10. Rotacion de inventario: existencia vs salidas (LEFT JOIN + agregados)
SELECT p.nombre AS producto, a.nombre AS almacen,
       i.existencia_actual, i.stock_minimo,
       COALESCE(SUM(CASE WHEN m.tipo_movimiento='SALIDA' THEN m.cantidad END),0) AS total_salidas,
       COALESCE(SUM(CASE WHEN m.tipo_movimiento='ENTRADA' THEN m.cantidad END),0) AS total_entradas,
       CASE WHEN i.existencia_actual < i.stock_minimo THEN 'REPONER' ELSE 'OK' END AS alerta
FROM reportes.inventarios i
JOIN reportes.productos p  ON p.id_producto = i.id_producto
JOIN reportes.almacenes a  ON a.id_almacen  = i.id_almacen
LEFT JOIN reportes.movimientos_inventarios m
       ON m.id_producto = i.id_producto AND m.id_almacen = i.id_almacen
GROUP BY p.nombre, a.nombre, i.existencia_actual, i.stock_minimo
ORDER BY total_salidas DESC;


-- D11. Compras por proveedor con participacion porcentual (window sobre total)
WITH compras_prov AS (
    SELECT oc.id_proveedor,
           SUM(doc.cantidad_solicitada * doc.costo_unitario) AS monto_comprado
    FROM reportes.ordenes_compra oc
    JOIN reportes.detalle_orden_compra doc ON doc.id_orden_compra = oc.id_orden_compra
    WHERE oc.estado <> 'ANULADA'
    GROUP BY oc.id_proveedor
)
SELECT pr.razon_social AS proveedor, cp.monto_comprado,
       ROUND(cp.monto_comprado / SUM(cp.monto_comprado) OVER () * 100, 2) AS participacion_pct,
       RANK() OVER (ORDER BY cp.monto_comprado DESC) AS ranking
FROM compras_prov cp
JOIN reportes.proveedores pr ON pr.id_proveedor = cp.id_proveedor
ORDER BY cp.monto_comprado DESC;


-- D12. Ventas por empleado y su sede (ranking por sede)
WITH ventas_emp AS (
    SELECT pv.id_empleado, pv.id_sede,
           COUNT(DISTINCT v.id_venta)  AS ventas_realizadas,
           SUM(pv.total_registrado)    AS ingreso_generado
    FROM reportes.ventas v
    JOIN reportes.pedidos_venta pv ON pv.id_pedido = v.id_pedido
    WHERE v.estado = 'CONFIRMADA'
    GROUP BY pv.id_empleado, pv.id_sede
)
SELECT s.nombre AS sede, e.nombre_completo AS empleado,
       ve.ventas_realizadas, ve.ingreso_generado,
       RANK() OVER (PARTITION BY ve.id_sede ORDER BY ve.ingreso_generado DESC) AS puesto_en_sede
FROM ventas_emp ve
JOIN reportes.empleados e ON e.id_empleado = ve.id_empleado
JOIN reportes.sedes s     ON s.id_sede = ve.id_sede
ORDER BY s.nombre, puesto_en_sede;


-- D13. Metodos de pago: monto y porcentaje por medio (GROUP BY + window)
SELECT medio_pago,
       COUNT(*)                                            AS num_pagos,
       SUM(valor)                                          AS monto_total,
       ROUND(SUM(valor) / SUM(SUM(valor)) OVER () * 100,2) AS porcentaje
FROM reportes.pagos
WHERE estado = 'APROBADO'
GROUP BY medio_pago
ORDER BY monto_total DESC;


-- D14. Devoluciones por motivo y sede, con condicion del producto
SELECT s.nombre AS sede, d.motivo, dd.condicion_producto,
       COUNT(*)            AS num_devoluciones,
       SUM(dd.cantidad)    AS unidades_devueltas
FROM reportes.devoluciones d
JOIN reportes.detalle_devolucion dd ON dd.id_devolucion = d.id_devolucion
JOIN reportes.ventas v         ON v.id_venta = d.id_venta
JOIN reportes.pedidos_venta pv ON pv.id_pedido = v.id_pedido
JOIN reportes.sedes s          ON s.id_sede = pv.id_sede
GROUP BY s.nombre, d.motivo, dd.condicion_producto
ORDER BY unidades_devueltas DESC;


-- D15. Productos nunca vendidos (NOT EXISTS / anti-join)
SELECT p.sku, p.nombre, c.nombre AS categoria, p.precio_lista
FROM reportes.productos p
JOIN reportes.categorias c ON c.id_categoria = p.id_categoria
WHERE NOT EXISTS (
    SELECT 1 FROM reportes.detalle_pedido dp WHERE dp.id_producto = p.id_producto
)
ORDER BY p.nombre;


-- D16. Comparativa pedidos vs ventas confirmadas por sede (tasa de conversion)
WITH ped AS (
    SELECT id_sede, COUNT(*) AS total_pedidos FROM reportes.pedidos_venta GROUP BY id_sede
),
ven AS (
    SELECT pv.id_sede, COUNT(*) AS total_ventas
    FROM reportes.ventas v JOIN reportes.pedidos_venta pv ON pv.id_pedido = v.id_pedido
    WHERE v.estado = 'CONFIRMADA' GROUP BY pv.id_sede
)
SELECT s.nombre AS sede,
       COALESCE(ped.total_pedidos,0) AS pedidos,
       COALESCE(ven.total_ventas,0)  AS ventas_confirmadas,
       ROUND(COALESCE(ven.total_ventas,0)::numeric
             / NULLIF(ped.total_pedidos,0) * 100, 2) AS tasa_conversion_pct
FROM reportes.sedes s
LEFT JOIN ped ON ped.id_sede = s.id_sede
LEFT JOIN ven ON ven.id_sede = s.id_sede
ORDER BY s.nombre;


-- D17. Historial de movimientos con saldo corrido por producto/almacen (SUM window)
SELECT a.nombre AS almacen, p.nombre AS producto, m.fecha, m.tipo_movimiento, m.cantidad,
       SUM(CASE WHEN m.tipo_movimiento='SALIDA' THEN -m.cantidad ELSE m.cantidad END)
           OVER (PARTITION BY m.id_almacen, m.id_producto ORDER BY m.fecha, m.id_movimiento)
           AS saldo_corrido
FROM reportes.movimientos_inventarios m
JOIN reportes.almacenes a ON a.id_almacen = m.id_almacen
JOIN reportes.productos p ON p.id_producto = m.id_producto
ORDER BY a.nombre, p.nombre, m.fecha, m.id_movimiento;


-- D18. Transferencias con diferencias entre enviado y recibido (incidencias)
SELECT t.id_transferencia, ao.nombre AS almacen_origen, ad.nombre AS almacen_destino,
       t.estado, p.nombre AS producto,
       dt.cantidad_enviada, dt.cantidad_recibida,
       (dt.cantidad_enviada - dt.cantidad_recibida) AS diferencia,
       CASE WHEN dt.cantidad_enviada <> dt.cantidad_recibida THEN 'INCIDENCIA' ELSE 'OK' END AS estado_item
FROM reportes.transferencias t
JOIN reportes.detalle_transferencias dt ON dt.id_transferencia = t.id_transferencia
JOIN reportes.productos p  ON p.id_producto = dt.id_producto
JOIN reportes.almacenes ao ON ao.id_almacen = t.id_almacen_origen
JOIN reportes.almacenes ad ON ad.id_almacen = t.id_almacen_destino
ORDER BY diferencia DESC, t.id_transferencia;


-- D19. Ticket promedio por sede vs promedio global (subconsulta escalar)
SELECT s.nombre AS sede,
       ROUND(AVG(pv.total_registrado), 2) AS ticket_promedio_sede,
       ROUND((SELECT AVG(total_registrado) FROM reportes.pedidos_venta), 2) AS ticket_promedio_global,
       CASE WHEN AVG(pv.total_registrado) >
                 (SELECT AVG(total_registrado) FROM reportes.pedidos_venta)
            THEN 'SOBRE EL PROMEDIO' ELSE 'BAJO EL PROMEDIO' END AS comparacion
FROM reportes.pedidos_venta pv
JOIN reportes.sedes s ON s.id_sede = pv.id_sede
GROUP BY s.nombre
ORDER BY ticket_promedio_sede DESC;


-- D20. Resumen ejecutivo integral por sede (multiples agregados cruzando servicios)
SELECT s.nombre AS sede,
       COUNT(DISTINCT e.id_empleado)                                   AS empleados,
       COUNT(DISTINCT CASE WHEN v.estado='CONFIRMADA' THEN v.id_venta END) AS ventas,
       COALESCE(SUM(CASE WHEN v.estado='CONFIRMADA' THEN pv.total_registrado END),0) AS ingresos,
       COUNT(DISTINCT d.id_devolucion)                                 AS devoluciones
FROM reportes.sedes s
LEFT JOIN reportes.empleados e      ON e.id_sede = s.id_sede
LEFT JOIN reportes.pedidos_venta pv ON pv.id_sede = s.id_sede
LEFT JOIN reportes.ventas v         ON v.id_pedido = pv.id_pedido
LEFT JOIN reportes.devoluciones d   ON d.id_venta = v.id_venta
GROUP BY s.nombre
ORDER BY ingresos DESC;

-- =========================================================================
-- FIN DE LAS 20 CONSULTAS AVANZADAS
-- Tecnicas usadas: CTE, RANK/DENSE_RANK/ROW_NUMBER/NTILE, LAG, SUM/AVG window,
-- PARTITION BY, subconsultas escalares, anti-join (NOT EXISTS), auditorias de
-- integridad, participacion porcentual y agregados condicionales (CASE).
-- =========================================================================
