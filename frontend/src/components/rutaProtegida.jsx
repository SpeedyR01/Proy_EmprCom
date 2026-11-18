import { Navigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function RutaProtegida({ children, rol }) {
    const { auth } = useAuth();
    if (!auth) return <Navigate to="/" />;            // no logueado -> login
    if (rol && !auth.roles.includes(rol))             // rol no permitido
        return <p>No tienes acceso a esta seccion.</p>;
    return children;
}