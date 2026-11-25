import { Router } from "express";
import { pool } from "./db.js";
import { authRequired, requireRole } from "./auth.middleware.js";

const router = Router();

// Todo reporte: requiere login. Lo pueden ver AUDITOR y ADMINISTRADOR.
router.use(authRequired, requireRole("AUDITOR", "ADMINISTRADOR"));

// Whitelist de vistas (solo nombres fijos -> sin riesgo de inyeccion).
const VISTAS = {
    "inventario-consolidado":  "reportes.vw_reporte_1_inventario_consolidado",
    "productos-bajo-minimo":   "reportes.vw_reporte_2_productos_bajo_minimo",
    "ventas-sede-periodo":     "reportes.vw_reporte_3_ventas_sede_periodo",
    "compras-por-proveedor":   "reportes.vw_reporte_4_compras_por_proveedor",
    "clientes-frecuentes":     "reportes.vw_reporte_5_clientes_frecuentes",
    "ventas-por-empleado":     "reportes.vw_reporte_6_ventas_por_empleado",
    "movimientos-inventario":  "reportes.vw_reporte_7_movimientos_inventario",
    "productos-mas-vendidos":  "reportes.vw_reporte_8_productos_mas_vendidos",
    "facturacion-medio-pago":  "reportes.vw_reporte_9_facturacion_metodo_pago",
    "devoluciones-por-sede":   "reportes.vw_reporte_10_devoluciones_por_sede",
    "saldos-por-venta":        "reportes.vw_reporte_11_saldos_por_venta",
    "resumen-por-sede":        "reportes.vw_resumen_consolidado_por_sede",
};

// Lista de reportes disponibles
router.get("/", (_req, res) => {
    res.json({ reportes: Object.keys(VISTAS) });
});

// Registro de auditoría de accesos (quién inició sesión, qué consultó, cuándo)
router.get("/auditoria/accesos", async (_req, res) => {
    try {
        const q = await pool.query(
            `SELECT aa.id_acceso, u.nombre_usuario, aa.accion,
                    aa.objeto_consultado, aa.fecha_hora
             FROM identidad.auditoria_accesos aa
             JOIN identidad.usuarios u ON u.id_usuario = aa.id_usuario
             ORDER BY aa.fecha_hora DESC
             LIMIT 200`
        );
        res.json(q.rows);
    } catch (e) {
        // Si no hay FDW a identidad, intentar con tabla local
        try {
            const q2 = await pool.query(
                `SELECT id_acceso, id_usuario AS nombre_usuario, accion,
                        objeto_consultado, fecha_hora
                 FROM reportes.auditoria_accesos
                 ORDER BY fecha_hora DESC LIMIT 200`
            );
            res.json(q2.rows);
        } catch (e2) {
            res.status(500).json({ error: e2.message });
        }
    }
});

// Alertas: productos bajo mínimo
router.get("/alertas/productos-bajo-minimo", async (_req, res) => {
    try {
        const q = await pool.query(
            `SELECT p.nombre AS producto, a.nombre AS almacen,
                    i.existencia_actual, i.stock_minimo,
                    (i.stock_minimo - i.existencia_actual) AS deficit
             FROM reportes.inventarios i
             JOIN reportes.productos p ON p.id_producto = i.id_producto
             JOIN reportes.almacenes a ON a.id_almacen  = i.id_almacen
             WHERE i.existencia_actual < i.stock_minimo
             ORDER BY deficit DESC`
        );
        res.json(q.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Alertas: ventas sin pago (saldo pendiente > 0)
router.get("/alertas/ventas-sin-pago", async (_req, res) => {
    try {
        const q = await pool.query(
            `SELECT v.id_venta, pv.id_sede, pv.id_cliente, v.fecha_venta,
                    pv.total_registrado AS valor_venta,
                    COALESCE(SUM(pg.valor),0) AS total_pagado,
                    pv.total_registrado - COALESCE(SUM(pg.valor),0) AS saldo_pendiente,
                    CASE WHEN pv.total_registrado - COALESCE(SUM(pg.valor),0) > 500000
                         THEN 'Riesgo Alto'
                         ELSE 'Pendiente Normal'
                    END AS categoria_riesgo
             FROM reportes.ventas v
             JOIN reportes.pedidos_venta pv ON pv.id_pedido = v.id_pedido
             LEFT JOIN reportes.pagos pg    ON pg.id_venta = v.id_venta AND pg.estado = 'APROBADO'
             WHERE v.estado = 'CONFIRMADA'
             GROUP BY v.id_venta, pv.id_sede, pv.id_cliente, v.fecha_venta, pv.total_registrado
             HAVING pv.total_registrado - COALESCE(SUM(pg.valor),0) > 0
             ORDER BY saldo_pendiente DESC`
        );
        res.json(q.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Alertas: devoluciones que exceden lo vendido (D3)
router.get("/alertas/devoluciones-anomalas", async (_req, res) => {
    try {
        const q = await pool.query(
            `WITH devuelto AS (
                SELECT d.id_venta, dd.id_producto, SUM(dd.cantidad) AS cantidad_devuelta
                FROM reportes.devoluciones d
                JOIN reportes.detalle_devolucion dd ON dd.id_devolucion = d.id_devolucion
                WHERE d.estado <> 'RECHAZADA'
                GROUP BY d.id_venta, dd.id_producto
            )
            SELECT dv.id_venta, p.nombre AS producto, dv.cantidad_devuelta,
                   COALESCE(dp.cantidad, 0) AS cantidad_vendida,
                   CASE WHEN dp.cantidad IS NULL               THEN 'ANOMALIA: producto no está en la venta'
                        WHEN dv.cantidad_devuelta > dp.cantidad THEN 'ANOMALIA: excede lo vendido'
                        ELSE 'OK' END AS veredicto
            FROM devuelto dv
            JOIN reportes.ventas v     ON v.id_venta = dv.id_venta
            LEFT JOIN reportes.detalle_pedido dp ON dp.id_pedido = v.id_pedido AND dp.id_producto = dv.id_producto
            JOIN reportes.productos p  ON p.id_producto = dv.id_producto
            WHERE dp.cantidad IS NULL OR dv.cantidad_devuelta > dp.cantidad
            ORDER BY dv.id_venta`
        );
        res.json(q.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Endpoint generico: GET /reportes/:nombre
router.get("/:nombre", async (req, res) => {
    const vista = VISTAS[req.params.nombre];
    if (!vista) {
        return res.status(404).json({
            error: "Reporte no encontrado",
            disponibles: Object.keys(VISTAS),
        });
    }
    try {
        const q = await pool.query(`SELECT * FROM ${vista}`);
        res.json(q.rows);
    } catch (e) {
        console.error(`Error en vista ${vista}:`, e.message);
        res.status(500).json({ error: e.message });
    }
});

export default router;
