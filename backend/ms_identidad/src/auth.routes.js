import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";

const router = Router();

router.post("/login", async (req, res) => {
    const { nombre_usuario, password } = req.body;
    if (!nombre_usuario || !password) {
        return res.status(400).json({ error: "Faltan credenciales" });
    }
    try {
        // 1. Buscar usuario activo
        const uQ = await pool.query(
            `SELECT id_usuario, nombre_usuario, password_hash
         FROM identidad.usuarios
        WHERE nombre_usuario = $1 AND estado = 'ACTIVO'`,
            [nombre_usuario]
        );
        if (uQ.rowCount === 0) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }
        const usuario = uQ.rows[0];

        // 2. Comparar contraseña
        const ok = await bcrypt.compare(password, usuario.password_hash);
        if (!ok) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }

        // 3. Obtener roles del usuario
        const rQ = await pool.query(
            `SELECT r.nombre
         FROM identidad.usuario_rol ur
         JOIN identidad.roles r ON r.id_rol = ur.id_rol
        WHERE ur.id_usuario = $1`,
            [usuario.id_usuario]
        );
        const roles = rQ.rows.map((x) => x.nombre);

        // 4. Generar JWT
        const token = jwt.sign(
            { id_usuario: usuario.id_usuario, roles },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        // 5. Auditoría
        await pool.query(
            `INSERT INTO identidad.auditoria_accesos (id_usuario, accion, objeto_consultado)
       VALUES ($1, 'LOGIN', 'sistema')`,
            [usuario.id_usuario]
        );

        // 6. Responder
        res.json({ token, usuario: usuario.nombre_usuario, roles });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error del servidor" });
    }
});

export default router;