import { Router } from "express";
import { pool } from "./db.js";
import { authRequired, requireRole } from "./auth.middleware.js";
const router = Router();
router.use(authRequired);

router.get("/", async (_req, res) => {
    const q = await pool.query("SELECT * FROM transferencias.transferencias ORDER BY id_transferencia");
    res.json(q.rows);
});

router.post("/", requireRole("BODEGUERO", "ADMINISTRADOR"), async (req, res) => {
    const { id_almacen_origen, id_almacen_destino, items } = req.body || {};
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const t = await client.query(
            `INSERT INTO transferencias.transferencias (id_almacen_origen, id_almacen_destino, estado)
       VALUES ($1,$2,'SOLICITADA') RETURNING id_transferencia`,
            [id_almacen_origen, id_almacen_destino]
        );
        const idT = t.rows[0].id_transferencia;
        for (const it of items) {
            await client.query(
                `INSERT INTO transferencias.detalle_transferencias (id_transferencia, id_producto, cantidad_enviada)
         VALUES ($1,$2,$3)`,
                [idT, it.id_producto, it.cantidad_enviada]
            );
        }
        await client.query("COMMIT");
        res.status(201).json({ id_transferencia: idT });
    } catch (e) {
        await client.query("ROLLBACK");
        res.status(400).json({ error: e.message });
    } finally { client.release(); }
});

router.post("/:id/recibir", requireRole("BODEGUERO", "ADMINISTRADOR"), async (req, res) => {
    const idT = req.params.id;
    const token = req.headers.authorization;
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1. Datos de la transferencia (origen, destino)
        const t = await client.query(
            `SELECT id_almacen_origen, id_almacen_destino
         FROM transferencias.transferencias WHERE id_transferencia=$1`,
            [idT]
        );
        if (t.rowCount === 0) throw new Error("Transferencia no existe");
        const { id_almacen_origen, id_almacen_destino } = t.rows[0];

        // 2. Detalle (productos y cantidades)
        const det = await client.query(
            `SELECT id_producto, cantidad_enviada
         FROM transferencias.detalle_transferencias WHERE id_transferencia=$1`,
            [idT]
        );

        // 3. Por cada producto: SALIDA del origen + ENTRADA al destino
        for (const it of det.rows) {
            // salida origen
            let resp = await fetch(`${process.env.URL_INVENTARIOS}/inventarios/movimientos`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": token },
                body: JSON.stringify({
                    id_almacen: id_almacen_origen, id_producto: it.id_producto,
                    tipo_movimiento: "SALIDA", cantidad: it.cantidad_enviada,
                }),
            });
            if (!resp.ok) throw new Error("Fallo salida de origen");
            // entrada destino
            resp = await fetch(`${process.env.URL_INVENTARIOS}/inventarios/movimientos`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": token },
                body: JSON.stringify({
                    id_almacen: id_almacen_destino, id_producto: it.id_producto,
                    tipo_movimiento: "ENTRADA", cantidad: it.cantidad_enviada,
                }),
            });
            if (!resp.ok) throw new Error("Fallo entrada a destino");
        }

        // 4. Marcar recibida
        await client.query(
            `UPDATE transferencias.transferencias
          SET estado='RECIBIDA', fecha_recepcion=CURRENT_TIMESTAMP,
              fecha_despacho = COALESCE(fecha_despacho, CURRENT_TIMESTAMP)
        WHERE id_transferencia=$1`,
            [idT]
        );

        await client.query("COMMIT");
        res.status(200).json({ mensaje: "Transferencia recibida y stock movido" });
    } catch (e) {
        await client.query("ROLLBACK");
        res.status(400).json({ error: e.message });
    } finally {
        client.release();
    }
});


export default router;