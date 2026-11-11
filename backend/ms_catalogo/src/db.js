import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Neon requiere SSL
});

// Prueba de conexión al arrancar
pool.query("SELECT 1")
    .then(() => console.log("✓ Conectado a db_catalogo (Neon)"))
    .catch((e) => console.error("✗ Error de conexión:", e.message));