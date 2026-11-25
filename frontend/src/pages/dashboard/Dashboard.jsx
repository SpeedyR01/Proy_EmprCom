/* ─── DASHBOARD — redirección según rol ─── */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth';

export default function Dashboard() {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/" />;

  const rol = auth.roles[0];
  const destino = {
    ADMINISTRADOR: '/admin',
    COMPRADOR: '/comprador',
    BODEGUERO: '/bodeguero',
    VENDEDOR: '/vendedor',
    CAJERO: '/cajero',
    AUDITOR: '/auditor',
  }[rol] || '/';

  return <Navigate to={destino} />;
}
