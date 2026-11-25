/* ─── LAYOUT COMÚN: TopBar + Encabezado ─── */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { colors, roles, fonts, radius, shadow } from '../theme';
import { Button } from './ui';

export default function PanelLayout({ rol, children }) {
  const { auth, logout } = useAuth();
  const nav = useNavigate();
  const r = roles[rol] || roles.VENDEDOR;

  const handleLogout = () => {
    logout();
    nav('/');
  };

  const initial = auth?.usuario?.charAt(0)?.toUpperCase() || '?';

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      {/* ─── BARRA SUPERIOR ─── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: colors.card,
          borderBottom: `1px solid ${colors.border}`,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          boxShadow: '0 2px 12px rgba(43,35,64,0.04)',
        }}
      >
        {/* Izquierda: insignia + nombre de rol */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: `${r.accent}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}
          >
            {r.mascot}
          </div>
          <div>
            <div
              style={{
                fontFamily: fonts.heading,
                fontWeight: 600,
                fontSize: '16px',
                color: colors.textPrimary,
                lineHeight: 1.2,
              }}
            >
              {r.label}
            </div>
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: '12px',
                color: colors.textSecondary,
                fontWeight: 400,
              }}
            >
              {r.phrase}
            </div>
          </div>
        </div>

        {/* Derecha: avatar + nombre + salir */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: r.accent,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: fonts.heading,
              fontWeight: 600,
              fontSize: '15px',
            }}
          >
            {initial}
          </div>
          <span
            style={{
              fontFamily: fonts.body,
              fontWeight: 700,
              fontSize: '14px',
              color: colors.textPrimary,
            }}
          >
            {auth?.usuario}
          </span>
          <Button variant="outline" accent={r.accent} onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '13px' }}>
            Salir
          </Button>
        </div>
      </header>

      {/* ─── ENCABEZADO ─── */}
      <div
        className="animate-fadeInUp"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px 0',
        }}
      >
        <h1
          style={{
            fontFamily: fonts.heading,
            fontWeight: 600,
            fontSize: '28px',
            color: colors.textPrimary,
            marginBottom: '4px',
          }}
        >
          ¡Hola, {auth?.usuario}! 👋
        </h1>
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: '15px',
            color: colors.textSecondary,
            marginBottom: '28px',
          }}
        >
          {r.phrase}
        </p>
      </div>

      {/* ─── CONTENIDO ─── */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 40px',
        }}
      >
        {children}
      </main>
    </div>
  );
}
