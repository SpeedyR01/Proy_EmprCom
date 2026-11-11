import { Router } from "express";
import { pool } from "./db.js";
import { authRequired, requireRole } from "./auth.middleware.js";
const router = Router();
router.use(authRequired);

// Listar ordenes
router.get("/ordenes", async (_req, res) => {
    const q = await pool.query("SELECT * FROM compras.ordenes_compra ORDER BY id_orden_compra");
    res.json(q.rows);
});

// Crear orden con su detalle (transaccion)
router.post("/ordenes", requireRole("COMPRADOR", "ADMINISTRADOR"), async (req, res) => {
    const { id_proveedor, id_almacen_destino, id_empleado, fecha_estimada, items } = req.body || {};
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const oc = await client.query(
            `INSERT INTO compras.ordenes_compra (id_proveedor, id_almacen_destino, id_empleado, fecha_estimada, estado)
       VALUES ($1,$2,$3,$4,'ENVIADA') RETURNING id_orden_compra`,
            [id_proveedor, id_almacen_destino, id_empleado, fecha_estimada]
        );
        const idOC = oc.rows[0].id_orden_compra;
        for (const it of items) {
            await client.query(
                `INSERT INTO compras.detalle_orden_compra (id_orden_compra, id_producto, cantidad_solicitada, costo_unitario)
         VALUES ($1,$2,$3,$4)`,
                [idOC, it.id_producto, it.cantidad_solicitada, it.costo_unitario]
            );
        }
        await client.query("COMMIT");
        res.status(201).json({ id_orden_compra: idOC });
    } catch (e) {
        await client.query("ROLLBACK");
        res.status(400).json({ error: e.message });
    } finally { client.release(); }
});

// Registrar recepcion (bodeguero)
router.post("/recepciones", requireRole("BODEGUERO", "ADMINISTRADOR"), async (req, res) => {
    const { id_orden_compra, estado, items } = req.body || {};
    const token = req.headers.authorization;
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1. Necesitamos el almacen destino de la orden (para saber dónde entra el stock)
        const oc = await client.query(
            `SELECT id_almacen_destino FROM compras.ordenes_compra WHERE id_orden_compra=$1`,
            [id_orden_compra]
        );
        if (oc.rowCount === 0) throw new Error("La orden de compra no existe");
        const idAlmacen = oc.rows[0].id_almacen_destino;

        // 2. Crear la recepcion + detalle
        const r = await client.query(
            `INSERT INTO compras.recepciones_compra (id_orden_compra, estado)
       VALUES ($1,$2) RETURNING id_recepcion`,
            [id_orden_compra, estado || "PARCIAL"]
        );
        const idR = r.rows[0].id_recepcion;
        for (const it of items) {
            await client.query(
                `INSERT INTO compras.detalle_recepcion (id_recepcion, id_producto, cantidad_recibida)
         VALUES ($1,$2,$3)`,
                [idR, it.id_producto, it.cantidad_recibida]
            );
        }

        // 3. Sumar stock en ms-inventarios (ENTRADA) por cada producto recibido
        for (const it of items) {
            const resp = await fetch(`${process.env.URL_INVENTARIOS}/inventarios/movimientos`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": token },
                body: JSON.stringify({
                    id_almacen: idAlmacen,
                    id_producto: it.id_producto,
                    tipo_movimiento: "ENTRADA",
                    cantidad: it.cantidad_recibida,
                }),
            });
            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error("Fallo al sumar stock: " + (err.error || resp.status));
            }
        }

        await client.query("COMMIT");
        res.status(201).json({ id_recepcion: idR, mensaje: "Recepcion registrada y stock actualizado" });
    } catch (e) {
        await client.query("ROLLBACK");
        res.status(400).json({ error: e.message });
    } finally {
        client.release();
    }
});

export default router;