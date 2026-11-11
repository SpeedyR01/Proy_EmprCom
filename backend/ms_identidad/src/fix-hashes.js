import bcrypt from "bcrypt";
import { pool } from "./db.js";

// Pone la misma contraseña "demo1234" (hasheada) a todos los usuarios del seed
const PASSWORD = "demo1234";

const run = async () => {
  const hash = await bcrypt.hash(PASSWORD, 10);
  const r = await pool.query(
    `UPDATE identidad.usuarios SET password_hash = $1`,
    [hash]
  );
  console.log(`✓ ${r.rowCount} usuarios actualizados. Contraseña: ${PASSWORD}`);
  await pool.end();
};
run();