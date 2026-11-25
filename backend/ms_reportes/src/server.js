import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reportesRoutes from "./reportes.routes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ servicio: "ms-reportes", ok: true }));
app.use("/reportes", reportesRoutes);

const PORT = process.env.PORT || 4007;
app.listen(PORT, () => console.log(`ms-reportes en http://localhost:${PORT}`));