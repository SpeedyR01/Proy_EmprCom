import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Neon requiere SSL
    max: 3,                              // pocas conexiones: reportes es solo lectura
    idleTimeoutMillis: 10000,
});

pool.query("SELECT 1")
    .then(() => console.log("Conectado a db_reportes (Neon)"))
    .catch((e) => console.error("Error de conexion:", e.message));