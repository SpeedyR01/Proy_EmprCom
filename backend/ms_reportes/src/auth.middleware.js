import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function authRequired(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer "))
        return res.status(401).json({ error: "Token no proporcionado" });
    try {
        req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: "Token invalido o expirado" });
    }
}

export function requireRole(...roles) {
    return (req, res, next) => {
        const r = req.user?.roles || [];
        if (!r.some((x) => roles.includes(x)))
            return res.status(403).json({ error: "Sin permiso" });
        next();
    };
}