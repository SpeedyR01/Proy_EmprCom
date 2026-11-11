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
    if (!id_almacen || !id_producto || !tipo_movimiento || cantidad == null) {
        return res.status(400).json({ error: "Faltan campos" });
    }
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1. Registrar el movimiento (historial)
        await client.query(
            `INSERT INTO inventarios.movimientos_inventarios (id_almacen, id_producto, tipo_movimiento, cantidad)
       VALUES ($1,$2,$3,$4)`,
            [id_almacen, id_producto, tipo_movimiento, cantidad]
        );

        // 2. Calcular el signo EN JS (evita el error 'operator is not unique')
        const signo = tipo_movimiento === "SALIDA" ? -1 : 1;
        const cantidadConSigno = Number(cantidad) * signo;

        // 3. Actualizar existencia (UPSERT: si no existe la fila inventario, la crea)
        await client.query(
            `INSERT INTO inventarios.inventarios (id_almacen, id_producto, existencia_actual, stock_minimo)
       VALUES ($1, $2, $3::numeric, 0)
       ON CONFLICT (id_almacen, id_producto)
       DO UPDATE SET existencia_actual = inventarios.inventarios.existencia_actual + $3::numeric,
                     fecha_actualizacion = CURRENT_TIMESTAMP`,
            [id_almacen, id_producto, cantidadConSigno]
        );

        // 4. Validar que no quede stock negativo
        const chk = await client.query(
            `SELECT existencia_actual FROM inventarios.inventarios
        WHERE id_almacen=$1 AND id_producto=$2`,
            [id_almacen, id_producto]
        );
        if (Number(chk.rows[0].existencia_actual) < 0) {
            throw new Error("Stock insuficiente para la salida");
        }

        await client.query("COMMIT");
        res.status(201).json({ ok: true, existencia_actual: chk.rows[0].existencia_actual });
    } catch (e) {
        await client.query("ROLLBACK");
        res.status(400).json({ error: e.message });
    } finally {
        client.release();
    }
});


export default router;