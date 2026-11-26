import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth";
import RutaProtegida from "./components/rutaProtegida";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Admin from "./pages/admin/Admin";
import Comprador from "./pages/comprador/Comprador";
import Bodeguero from "./pages/bodeguero/Bodeguero";
import Vendedor from "./pages/vendedor/vendedorr";
import Cajero from "./pages/cajero/Cajero";
import Auditor from "./pages/auditor/Auditor";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<RutaProtegida rol="ADMINISTRADOR"><Admin /></RutaProtegida>} />
        <Route path="/comprador" element={<RutaProtegida rol="COMPRADOR"><Comprador /></RutaProtegida>} />
        <Route path="/bodeguero" element={<RutaProtegida rol="BODEGUERO"><Bodeguero /></RutaProtegida>} />
        <Route path="/vendedor" element={<RutaProtegida rol="VENDEDOR"><Vendedor /></RutaProtegida>} />
        <Route path="/cajero" element={<RutaProtegida rol="CAJERO"><Cajero /></RutaProtegida>} />
        <Route path="/auditor" element={<RutaProtegida rol="AUDITOR"><Auditor /></RutaProtegida>} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
