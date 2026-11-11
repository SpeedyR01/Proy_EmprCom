import { Router } from "express";
import bcrypt from "bcrypt";
import { pool } from "./db.js";
import { authRequired, requireRole } from "./auth.middleware.js";

const router = Router();
router.use(authRequired, requireRole("ADMINISTRADOR"));

router.get("/", async (_req, res) => {
    const q = await pool.query(
        `SELECT id_usuario, id_empleado, nombre_usuario, estado, fecha_creacion
       FROM identidad.usuarios ORDER BY id_usuario`
    );
    res.json(q.rows);
});

router.post("/", async (req, res) => {
    const { id_empleado, nombre_usuario, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const q = await pool.query(
            `INSERT INTO identidad.usuarios (id_empleado, nombre_usuario, password_hash)
       VALUES ($1, $2, $3) RETURNING id_usuario, nombre_usuario`,
            [id_empleado, nombre_usuario, hash]
        );
        res.status(201).json(q.rows[0]);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.post("/:id/roles", async (req, res) => {
    const { id_rol } = req.body;
    try {
        await pool.query(
            `INSERT INTO identidad.usuario_rol (id_usuario, id_rol) VALUES ($1, $2)`,
            [req.params.id, id_rol]
        );
        res.status(201).json({ ok: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

export default router;