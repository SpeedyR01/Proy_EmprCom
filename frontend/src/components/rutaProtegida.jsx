import { Navigate } from "react-router-dom";
import { useAuth } from "../auth";
import { NoAccess } from "./StateScreens";

export default function RutaProtegida({ children, rol }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/" />;
  if (rol && !auth.roles.includes(rol)) return <NoAccess />;
  return children;
}
