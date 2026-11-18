import { Navbar } from "react-router-dom";
import { useAuth } from "../auth";

export default function Dashboard() {
    const { auth } = useAuth;
    if (!auth) return <Navigate to="/" />;
    const rol = auth.roles[0]; // toma el primer rol o muestra un seletor
    const destino = {
        ADMINISTRADOR: "/admin",
        COMPRADOR: "/comprador",
        BODEGUERO: "/bodeguero",
        VENDEDOR: "/vendedor",
        CAJERO: "/cajero",
        AUDITOR: "/auditor",
    }[rol] || "/";
    return <Navigate to={destino} />
}