import { Router } from "express";
import { pool } from "./db.js";
import { authRequired, requireRole } from "./auth.middleware.js";
const router = Router();
router.use(authRequired);  // todo requiere estar logueado

// ---- PRODUCTOS ----
router.get("/productos", async (_req, res) => {
    const q = await pool.query("SELECT * FROM catalogo.productos ORDER BY id_producto");
    res.json(q.rows);
});
router.post("/productos", requireRole("ADMINISTRADOR"), async (req, res) => {
    const { sku, nombre, id_categoria, unidad_medida, precio_lista } = req.body || {};
    try {
        const q = await pool.query(
            `INSERT INTO catalogo.productos (sku, nombre, id_categoria, unidad_medida, precio_lista)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [sku, nombre, id_categoria, unidad_medida, precio_lista]
        );
        res.status(201).json(q.rows[0]);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// ---- CATEGORIAS ----
router.get("/categorias", async (_req, res) => {
    const q = await pool.query("SELECT * FROM catalogo.categorias ORDER BY id_categoria");
    res.json(q.rows);
});

// ---- SEDES / ALMACENES ----
router.get("/sedes", async (_req, res) => {
    const q = await pool.query("SELECT * FROM catalogo.sedes ORDER BY id_sede");
    res.json(q.rows);
});
router.get("/almacenes", async (_req, res) => {
    const q = await pool.query("SELECT * FROM catalogo.almacenes ORDER BY id_almacen");
    res.json(q.rows);
});

// ---- PROVEEDORES (comprador gestiona) ----
router.get("/proveedores", async (_req, res) => {
    const q = await pool.query("SELECT * FROM catalogo.proveedores ORDER BY id_proveedor");
    res.json(q.rows);
});
router.post("/proveedores", requireRole("COMPRADOR", "ADMINISTRADOR"), async (req, res) => {
    const { identificacion, razon_social, ciudad, correo, telefono } = req.body || {};
    try {
        const q = await pool.query(
            `INSERT INTO catalogo.proveedores (identificacion, razon_social, ciudad, correo, telefono)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [identificacion, razon_social, ciudad, correo, telefono]
        );
        res.status(201).json(q.rows[0]);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// ---- CLIENTES (vendedor gestiona) ----
router.get("/clientes", async (_req, res) => {
    const q = await pool.query("SELECT * FROM catalogo.clientes ORDER BY id_cliente");
    res.json(q.rows);
});
router.post("/clientes", requireRole("VENDEDOR", "ADMINISTRADOR"), async (req, res) => {
    const { tipo_documento, num_documento, nombre_completo, correo, telefono } = req.body || {};
    try {
        const q = await pool.query(
            `INSERT INTO catalogo.clientes (tipo_documento, num_documento, nombre_completo, correo, telefono)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [tipo_documento, num_documento, nombre_completo, correo, telefono]
        );
        res.status(201).json(q.rows[0]);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;