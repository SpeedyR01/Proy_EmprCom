/* ─── LOGIN ─── */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiIdentidad } from '../../api';
import { useAuth } from '../../auth';
import { colors, fonts, radius, shadow, roles } from '../../theme';
import { Button, Input } from '../../components/ui';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const entrar = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await apiIdentidad.post('/auth/login', {
        nombre_usuario: usuario,
        password,
      });
      login(data);
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Fondo con degradados */}
      <div style={styles.bgGradient1} />
      <div style={styles.bgGradient2} />

      {/* Tarjeta de login */}
      <form onSubmit={entrar} style={styles.card} className="animate-fadeInUp">
        {/* Mascota */}
        <div className="animate-bounce" style={styles.mascot}>
          🛍️
        </div>

        <h1 style={styles.title}>¡Qué bueno verte!</h1>
        <p style={styles.subtitle}>Entra para continuar con tu jornada</p>

        {/* Error pill */}
        {error && (
          <div className="animate-shake" style={styles.errorPill}>
            ❌ {error}
          </div>
        )}

        <Input
          label="Usuario"
          placeholder="Tu nombre de usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          accent={roles.VENDEDOR.accent}
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          accent={roles.VENDEDOR.accent}
          error={null}
        />

        <Button
          type="submit"
          accent={roles.VENDEDOR.accent}
          fullWidth
          disabled={loading}
          style={{ marginTop: '8px', fontSize: '16px', padding: '16px' }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>

        <p style={styles.footer}>
          Cada rol tiene su propio panel 🎨
        </p>
      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.bg,
    position: 'relative',
    overflow: 'hidden',
    padding: '24px',
  },
  bgGradient1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,180,140,0.25) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGradient2: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(100,180,255,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: colors.card,
    borderRadius: radius.login,
    boxShadow: '0 12px 48px rgba(43,35,64,0.10)',
    padding: '48px 40px 36px',
    width: '100%',
    maxWidth: '420px',
  },
  mascot: {
    fontSize: '64px',
    textAlign: 'center',
    marginBottom: '12px',
    lineHeight: 1,
  },
  title: {
    fontFamily: fonts.heading,
    fontWeight: 600,
    fontSize: '28px',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: '4px',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: '15px',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: '28px',
  },
  errorPill: {
    background: colors.errorBg,
    color: colors.error,
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: '13px',
    padding: '10px 16px',
    borderRadius: '20px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  footer: {
    fontFamily: fonts.body,
    fontSize: '13px',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: '24px',
  },
};
