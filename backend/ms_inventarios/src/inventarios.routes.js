import { Router } from "express";
import { pool } from "./db.js";
import { authRequired, requireRole } from "./auth.middleware.js";
const router = Router();
router.use(authRequired);

// Existencias (todos pueden consultar)
router.get("/", async (_req, res) => {
    const q = await pool.query("SELECT * FROM inventarios.inventarios ORDER BY id_almacen, id_producto");
    res.json(q.rows);
});

// Existencias bajo minimo (reporte)
router.get("/bajo-minimo", async (_req, res) => {
    const q = await pool.query(
        "SELECT * FROM inventarios.inventarios WHERE existencia_actual < stock_minimo"
    );
    res.json(q.rows);
});

// Registrar movimiento (bodeguero) - actualiza existencia
router.post("/movimientos", requireRole("BODEGUERO", "ADMINISTRADOR"), async (req, res) => {
    const { id_almacen, id_producto, tipo_movimiento, cantidad } = req.body || {};
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        await client.query(
            `INSERT INTO inventarios.movimientos_inventarios (id_almacen, id_producto, tipo_movimiento, cantidad)
       VALUES ($1,$2,$3,$4)`,
            [id_almacen, id_producto, tipo_movimiento, cantidad]
        );

        // Calcular la cantidad con signo EN JAVASCRIPT (no en SQL)
        const signo = tipo_movimiento === "SALIDA" ? -1 : 1;
        const cantidadConSigno = Number(cantidad) * signo;

        await client.query(
            `UPDATE inventarios.inventarios
          SET existencia_actual = existencia_actual + $3::numeric,
              fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_almacen = $1 AND id_producto = $2`,
            [id_almacen, id_producto, cantidadConSigno]
        );

        await client.query("COMMIT");
        res.status(201).json({ ok: true });
    } catch (e) {
        await client.query("ROLLBACK");
        res.status(400).json({ error: e.message });
    } finally { client.release(); }
});

export default router;