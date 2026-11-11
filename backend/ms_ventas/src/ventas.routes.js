import { Router } from "express";
import { pool } from "./db.js";
import { authRequired, requireRole } from "./auth.middleware.js";
const router = Router();
router.use(authRequired);

// Listar pedidos
router.get("/pedidos", async (_req, res) => {
    const q = await pool.query("SELECT * FROM ventas.pedidos_venta ORDER BY id_pedido");
    res.json(q.rows);
});

// Crear pedido + detalle + total (vendedor)
router.post("/pedidos", requireRole("VENDEDOR", "ADMINISTRADOR"), async (req, res) => {
    const { id_sede, id_almacen, id_cliente, id_empleado, items } = req.body || {};
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        let total = 0;
        const p = await client.query(
            `INSERT INTO ventas.pedidos_venta (id_sede, id_almacen, id_cliente, id_empleado, estado, total_registrado)
       VALUES ($1,$2,$3,$4,'CREADO',0) RETURNING id_pedido`,
            [id_sede, id_almacen, id_cliente, id_empleado]
        );
        const idP = p.rows[0].id_pedido;
        for (const it of items) {
            await client.query(
                `INSERT INTO ventas.detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario)
         VALUES ($1,$2,$3,$4)`,
                [idP, it.id_producto, it.cantidad, it.precio_unitario]
            );
            total += it.cantidad * it.precio_unitario;
        }
        await client.query(
            `UPDATE ventas.pedidos_venta SET total_registrado = $2 WHERE id_pedido = $1`,
            [idP, total]
        );
        await client.query("COMMIT");
        res.status(201).json({ id_pedido: idP, total });
    } catch (e) {
        await client.query("ROLLBACK");
        res.status(400).json({ error: e.message });
    } finally { client.release(); }
});

// Confirmar venta (crea la venta a partir del pedido)
router.post("/confirmar/:idPedido", requireRole("VENDEDOR", "ADMINISTRADOR"), async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(
            `UPDATE ventas.pedidos_venta SET estado='CONFIRMADO' WHERE id_pedido=$1`,
            [req.params.idPedido]
        );
        const v = await client.query(
            `INSERT INTO ventas.ventas (id_pedido) VALUES ($1) RETURNING id_venta`,
            [req.params.idPedido]
        );
        await client.query("COMMIT");
        // NOTA: aqui, en la app real, se llamaria a ms-inventarios para descontar stock.
        res.status(201).json({ id_venta: v.rows[0].id_venta });
    } catch (e) {
        await client.query("ROLLBACK");
        res.status(400).json({ error: e.message });
    } finally { client.release(); }
});

// Registrar pago (cajero)
router.post("/pagos", requireRole("CAJERO", "ADMINISTRADOR"), async (req, res) => {
    const { id_venta, valor, medio_pago } = req.body || {};
    try {
        const q = await pool.query(
            `INSERT INTO ventas.pagos (id_venta, valor, medio_pago)
       VALUES ($1,$2,$3) RETURNING id_pago`,
            [id_venta, valor, medio_pago]
        );
        res.status(201).json(q.rows[0]);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// Procesar devolucion (cajero)
router.post("/devoluciones", requireRole("CAJERO", "ADMINISTRADOR"), async (req, res) => {
    const { id_venta, motivo, items } = req.body || {};
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const d = await client.query(
            `INSERT INTO ventas.devoluciones (id_venta, motivo, estado)
       VALUES ($1,$2,'SOLICITADA') RETURNING id_devolucion`,
            [id_venta, motivo]
        );
        const idD = d.rows[0].id_devolucion;
        for (const it of items) {
            await client.query(
                `INSERT INTO ventas.detalle_devolucion (id_devolucion, id_producto, cantidad, condicion_producto)
         VALUES ($1,$2,$3,$4)`,
                [idD, it.id_producto, it.cantidad, it.condicion_producto]
            );
        }
        await client.query("COMMIT");
        res.status(201).json({ id_devolucion: idD });
    } catch (e) {
        await client.query("ROLLBACK");
        res.status(400).json({ error: e.message });
    } finally { client.release(); }
});

export default router;