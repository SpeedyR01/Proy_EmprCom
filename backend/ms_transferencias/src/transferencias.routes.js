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

export default router;