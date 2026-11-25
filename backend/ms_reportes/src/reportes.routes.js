import { Router } from "express";
import { pool } from "./db.js";
import { authRequired, requireRole } from "./auth.middleware.js";

const router = Router();

// Todo reporte: requiere login. Lo pueden ver AUDITOR y ADMINISTRADOR.
router.use(authRequired, requireRole("AUDITOR", "ADMINISTRADOR"));

// Whitelist de vistas (solo nombres fijos -> sin riesgo de inyeccion).
const VISTAS = {
    "inventario-consolidado": "reportes.vw_reporte_1_inventario_consolidado",
    "productos-bajo-minimo": "reportes.vw_reporte_2_productos_bajo_minimo",
    "ventas-sede-periodo": "reportes.vw_reporte_3_ventas_sede_periodo",
    "compras-por-proveedor": "reportes.vw_reporte_4_compras_por_proveedor",
    "clientes-frecuentes": "reportes.vw_reporte_5_clientes_frecuentes",
    "ventas-por-empleado": "reportes.vw_reporte_6_ventas_por_empleado",
    "movimientos-inventario": "reportes.vw_reporte_7_movimientos_inventario",
    "productos-mas-vendidos": "reportes.vw_reporte_8_productos_mas_vendidos",
    "facturacion-medio-pago": "reportes.vw_reporte_9_facturacion_metodo_pago",
    "devoluciones-por-sede": "reportes.vw_reporte_10_devoluciones_por_sede",
    "saldos-por-venta": "reportes.vw_reporte_11_saldos_por_venta",
    "resumen-por-sede": "reportes.vw_resumen_consolidado_por_sede",
};

// Lista de reportes disponibles (va ANTES de /:nombre para no ser capturada).
router.get("/", (_req, res) => {
    res.json({ reportes: Object.keys(VISTAS) });
});

// Endpoint generico:  GET /reportes/:nombre
// Ej: GET /reportes/productos-bajo-minimo
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