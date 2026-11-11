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

// ms-ventas/src/ventas.routes.js  -> endpoint confirmar MEJORADO
router.post("/confirmar/:idPedido", requireRole("VENDEDOR", "ADMINISTRADOR"), async (req, res) => {
    const idPedido = req.params.idPedido;
    const token = req.headers.authorization;   // reusar token para llamar a inventarios
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1. Detalle del pedido + almacen de donde sale
        const det = await client.query(
            `SELECT dp.id_producto, dp.cantidad, pv.id_almacen
         FROM ventas.detalle_pedido dp
         JOIN ventas.pedidos_venta pv ON pv.id_pedido = dp.id_pedido
        WHERE dp.id_pedido = $1`,
            [idPedido]
        );
        if (det.rowCount === 0) throw new Error("El pedido no tiene detalle");

        // 2. Confirmar pedido + crear venta
        await client.query(
            `UPDATE ventas.pedidos_venta SET estado='CONFIRMADO' WHERE id_pedido=$1`,
            [idPedido]
        );
        const v = await client.query(
            `INSERT INTO ventas.ventas (id_pedido) VALUES ($1) RETURNING id_venta`,
            [idPedido]
        );

        // 3. Descontar stock en ms-inventarios (SALIDA) por cada producto
        for (const item of det.rows) {
            const r = await fetch(`${process.env.URL_INVENTARIOS}/inventarios/movimientos`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": token },
                body: JSON.stringify({
                    id_almacen: item.id_almacen,
                    id_producto: item.id_producto,
                    tipo_movimiento: "SALIDA",
                    cantidad: item.cantidad,
                }),
            });
            if (!r.ok) {
                const err = await r.json().catch(() => ({}));
                throw new Error("Fallo al descontar stock: " + (err.error || r.status));
            }
        }

        await client.query("COMMIT");
        res.status(201).json({ id_venta: v.rows[0].id_venta, mensaje: "Venta confirmada y stock descontado" });
    } catch (e) {
        await client.query("ROLLBACK");
        res.status(400).json({ error: e.message });
    } finally {
        client.release();
    }
});


// Registrar pago (cajero)
router.post("/pagos", requireRole("CAJERO", "ADMINISTRADOR"), async (req, res) => {
    const { id_venta, valor, medio_pago } = req.body || {};
    if (!id_venta || !valor || !medio_pago) {
        return res.status(400).json({ error: "Faltan campos: id_venta, valor, medio_pago" });
    }
    try {
        // 1. Registrar el pago
        const pago = await pool.query(
            `INSERT INTO ventas.pagos (id_venta, valor, medio_pago)
       VALUES ($1,$2,$3) RETURNING id_pago`,
            [id_venta, valor, medio_pago]
        );

        // 2. Calcular saldo pendiente: total del pedido - pagos aprobados
        const saldoQ = await pool.query(
            `SELECT pv.total_registrado
              - COALESCE((SELECT SUM(p.valor) FROM ventas.pagos p
                           WHERE p.id_venta = v.id_venta AND p.estado = 'APROBADO'), 0) AS saldo
         FROM ventas.ventas v
         JOIN ventas.pedidos_venta pv ON pv.id_pedido = v.id_pedido
        WHERE v.id_venta = $1`,
            [id_venta]
        );
        const saldo = saldoQ.rows[0]?.saldo ?? null;

        res.status(201).json({ id_pago: pago.rows[0].id_pago, saldo_pendiente: saldo });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});


// Procesar devolucion (cajero)
router.post("/devoluciones/:id/aprobar", requireRole("CAJERO", "ADMINISTRADOR"), async (req, res) => {
    const idDev = req.params.id;
    const token = req.headers.authorization;
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1. Marcar devolucion como aprobada
        await client.query(
            `UPDATE ventas.devoluciones SET estado='APROBADA' WHERE id_devolucion=$1`,
            [idDev]
        );

        // 2. Traer productos devueltos + almacen de la venta original
        const det = await client.query(
            `SELECT dd.id_producto, dd.cantidad, dd.condicion_producto, pv.id_almacen
         FROM ventas.detalle_devolucion dd
         JOIN ventas.devoluciones d ON d.id_devolucion = dd.id_devolucion
         JOIN ventas.ventas v       ON v.id_venta = d.id_venta
         JOIN ventas.pedidos_venta pv ON pv.id_pedido = v.id_pedido
        WHERE dd.id_devolucion = $1`,
            [idDev]
        );

        // 3. Reingresar al stock SOLO los productos en buen estado
        for (const item of det.rows) {
            if (item.condicion_producto === "BUENO") {
                const r = await fetch(`${process.env.URL_INVENTARIOS}/inventarios/movimientos`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": token },
                    body: JSON.stringify({
                        id_almacen: item.id_almacen,
                        id_producto: item.id_producto,
                        tipo_movimiento: "ENTRADA",
                        cantidad: item.cantidad,
                    }),
                });
                if (!r.ok) {
                    const err = await r.json().catch(() => ({}));
                    throw new Error("Fallo al reingresar stock: " + (err.error || r.status));
                }
            }
        }

        await client.query("COMMIT");
        res.status(200).json({ mensaje: "Devolucion aprobada; stock reingresado (productos en buen estado)" });
    } catch (e) {
        await client.query("ROLLBACK");
        res.status(400).json({ error: e.message });
    } finally {
        client.release();
    }
});

export default router;