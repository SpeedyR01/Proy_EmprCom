/* ─── PANTALLAS DE ESTADO ─── */
import React from 'react';
import { colors, fonts, radius, shadow } from '../theme';
import { Button } from './ui';

/* Sin acceso */
export function NoAccess() {
  return (
    <div style={centerStyle}>
      <div className="animate-fadeInUp" style={boxStyle}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
        <h2 style={titleStyle}>No tienes acceso a esta sección</h2>
        <p style={subtitleStyle}>Contacta a un administrador si crees que es un error.</p>
      </div>
    </div>
  );
}

/* Lista vacía */
export function EmptyState({ message = 'No hay nada aquí todavía', emoji = '📭' }) {
  return (
    <div style={centerStyle}>
      <div className="animate-fadeInUp" style={boxStyle}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>{emoji}</div>
        <h2 style={titleStyle}>{message}</h2>
        <p style={subtitleStyle}>Cuando haya datos, aparecerán aquí.</p>
      </div>
    </div>
  );
}

/* Error de red */
export function NetworkError({ onRetry }) {
  return (
    <div style={centerStyle}>
      <div className="animate-shake" style={boxStyle}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌐</div>
        <h2 style={{ ...titleStyle, color: colors.error }}>Error de conexión</h2>
        <p style={subtitleStyle}>No pudimos conectar con el servidor. Revisa tu red.</p>
        {onRetry && (
          <Button accent={colors.error} onClick={onRetry} style={{ marginTop: '20px' }}>
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}

/* Carga */
export function LoadingScreen() {
  return (
    <div style={centerStyle}>
      <div className="animate-fadeInUp" style={boxStyle}>
        <div
          style={{
            fontSize: '48px',
            marginBottom: '16px',
            animation: 'bounce 1.5s ease-in-out infinite',
          }}
        >
          ⏳
        </div>
        <h2 style={titleStyle}>Cargando...</h2>
        <p style={subtitleStyle}>Un momento, por favor.</p>
      </div>
    </div>
  );
}

/* ─── estilos compartidos ─── */
const centerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '70vh',
  padding: '24px',
};

const boxStyle = {
  textAlign: 'center',
  background: colors.card,
  borderRadius: radius.card,
  boxShadow: shadow.card,
  padding: '48px 40px',
  maxWidth: '420px',
  width: '100%',
};

const titleStyle = {
  fontFamily: fonts.heading,
  fontWeight: 600,
  fontSize: '22px',
  color: colors.textPrimary,
  marginBottom: '8px',
};

const subtitleStyle = {
  fontFamily: fonts.body,
  fontSize: '15px',
  color: colors.textSecondary,
};
