import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./auth.routes.js";
import usuariosRoutes from "./usuarios.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ servicio: "ms-identidad", ok: true }));
app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`→ ms-identidad en http://localhost:${PORT}`));