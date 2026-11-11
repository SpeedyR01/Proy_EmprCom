import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Verifica que el JWT sea válido
export function authRequired(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token no proporcionado" });
    }
    try {
        const token = header.split(" ")[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
}

// Verifica que el usuario tenga al menos uno de los roles permitidos
export function requireRole(...rolesPermitidos) {
    return (req, res, next) => {
        const roles = req.user?.roles || [];
        const tienePermiso = roles.some((r) => rolesPermitidos.includes(r));
        if (!tienePermiso) {
            return res.status(403).json({ error: "No tienes permiso para esta acción" });
        }
        next();
    };
}