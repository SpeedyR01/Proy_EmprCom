import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth";
import RutaProtegida from "./components/RutaProtegida";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Comprador from "./pages/Comprador";
import Bodeguero from "./pages/Bodeguero";
import Vendedor from "./pages/Vendedor";
import Cajero from "./pages/Cajero";
import Auditor from "./pages/Auditor";

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