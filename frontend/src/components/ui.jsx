/* ─── LIBRERÍA DE COMPONENTES REUTILIZABLES ─── */
import React from 'react';
import { colors, radius, shadow, fonts } from '../theme';

/* ════════════════════════════════════════════════
   BOTÓN
   Variantes: primary | outline | small | disabled
   ════════════════════════════════════════════════ */
export function Button({
  children,
  variant = 'primary',
  accent = '#6C5CE7',
  onClick,
  disabled = false,
  style = {},
  type = 'button',
  fullWidth = false,
  ...rest
}) {
  const base = {
    fontFamily: fonts.body,
    fontWeight: 700,
    fontSize: variant === 'small' ? '13px' : '15px',
    padding: variant === 'small' ? '8px 16px' : '14px 28px',
    borderRadius: radius.button,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.15s ease',
    width: fullWidth ? '100%' : 'auto',
    position: 'relative',
    userSelect: 'none',
  };

  const variants = {
    primary: {
      background: disabled ? '#d1cdd8' : accent,
      color: '#fff',
      boxShadow: disabled ? 'none' : `${shadow.button} ${adjustColor(accent, -30)}`,
      transform: 'translateY(0)',
    },
    outline: {
      background: 'transparent',
      color: disabled ? '#d1cdd8' : accent,
      border: `2px solid ${disabled ? '#d1cdd8' : accent}`,
      boxShadow: 'none',
    },
    small: {
      background: disabled ? '#d1cdd8' : accent,
      color: '#fff',
      boxShadow: disabled ? 'none' : `${shadow.button} ${adjustColor(accent, -30)}`,
    },
  };

  const handleMouseDown = (e) => {
    if (disabled || variant === 'outline') return;
    e.currentTarget.style.transform = 'translateY(3px)';
    e.currentTarget.style.boxShadow = `0 1px 0 ${adjustColor(accent, -30)}`;
  };

  const handleMouseUp = (e) => {
    if (disabled || variant === 'outline') return;
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = `${shadow.button} ${adjustColor(accent, -30)}`;
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ ...base, ...variants[variant], ...style }}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════════
   INPUT
   Estados: normal | foco (CSS) | error
   ════════════════════════════════════════════════ */
export function Input({
  label,
  error,
  accent = '#6C5CE7',
  style = {},
  inputStyle = {},
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);

  const borderColor = error
    ? colors.error
    : focused
      ? accent
      : colors.border;

  return (
    <div style={{ marginBottom: '16px', ...style }}>
      {label && (
        <label
          style={{
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: '13px',
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '6px',
            display: 'block',
          }}
        >
          {label}
        </label>
      )}
      <input
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '14px 16px',
          fontFamily: fonts.body,
          fontSize: '15px',
          fontWeight: 400,
          color: colors.textPrimary,
          background: colors.card,
          border: `2px solid ${borderColor}`,
          borderRadius: radius.input,
          outline: 'none',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          boxShadow: focused ? `0 0 0 4px ${accent}18` : 'none',
          ...inputStyle,
        }}
        {...rest}
      />
      {error && (
        <span
          style={{
            fontFamily: fonts.body,
            fontSize: '13px',
            color: colors.error,
            marginTop: '4px',
            display: 'block',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════
   TARJETA
   ════════════════════════════════════════════════ */
export function Card({
  children,
  hover = false,
  accent,
  onClick,
  style = {},
  ...rest
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.card,
        borderRadius: radius.card,
        boxShadow: hovered && hover ? shadow.hover : shadow.card,
        border: `2px solid ${hovered && accent ? accent : 'transparent'}`,
        padding: '24px',
        transition: 'all 0.25s ease',
        transform: hovered && hover ? 'translateY(-4px)' : 'translateY(0)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════
   TARJETA DE PRODUCTO
   ════════════════════════════════════════════════ */
export function ProductCard({ product, accent = '#FF7A59', onAdd }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.card,
        borderRadius: radius.card,
        boxShadow: hovered ? shadow.hover : shadow.card,
        border: `2px solid ${hovered ? accent : 'transparent'}`,
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Imagen/emoji */}
      <div
        style={{
          background: `${accent}15`,
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          minHeight: '120px',
        }}
      >
        {product.emoji || '📦'}
      </div>
      {/* Info */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h4
          style={{
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: '14px',
            color: colors.textPrimary,
            marginBottom: '4px',
          }}
        >
          {product.nombre}
        </h4>
        <span
          style={{
            fontFamily: fonts.heading,
            fontWeight: 600,
            fontSize: '20px',
            color: accent,
            marginBottom: '12px',
          }}
        >
          ${Number(product.precio_lista).toLocaleString('es-CO')}
        </span>
        <Button
          accent={accent}
          variant="small"
          onClick={() => onAdd(product)}
          style={{ marginTop: 'auto', width: '100%' }}
        >
          + Agregar
        </Button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   FILA DE CARRITO
   ════════════════════════════════════════════════ */
export function CartRow({ item, accent = '#FF7A59', onIncrease, onDecrease, onRemove }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: `1px solid ${colors.border}`,
        gap: '8px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: '14px',
            color: colors.textPrimary,
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.nombre}
        </span>
        <span style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: '14px', color: accent }}>
          ${Number(item.precio_unitario).toLocaleString('es-CO')}
        </span>
      </div>
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <QuantityButton onClick={onDecrease}>−</QuantityButton>
        <span
          style={{
            fontFamily: fonts.heading,
            fontWeight: 600,
            fontSize: '16px',
            minWidth: '24px',
            textAlign: 'center',
          }}
        >
          {item.cantidad}
        </span>
        <QuantityButton onClick={onIncrease}>+</QuantityButton>
      </div>
    </div>
  );
}

function QuantityButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        border: `2px solid ${colors.border}`,
        background: colors.card,
        fontFamily: fonts.body,
        fontWeight: 800,
        fontSize: '16px',
        color: colors.textPrimary,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
      }}
    >
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════════
   ETIQUETA / BADGE
   ════════════════════════════════════════════════ */
export function Badge({ children, color = '#6C5CE7', style = {} }) {
  return (
    <span
      style={{
        fontFamily: fonts.body,
        fontWeight: 700,
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        padding: '4px 12px',
        borderRadius: '20px',
        background: `${color}18`,
        color: color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ════════════════════════════════════════════════
   TOAST / NOTIFICACIÓN
   ════════════════════════════════════════════════ */
export function Toast({ message, type = 'success', visible }) {
  if (!visible) return null;

  const bg = type === 'success' ? colors.success : colors.error;

  return (
    <div
      className="animate-slideUp"
      style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: bg,
        color: '#fff',
        fontFamily: fonts.body,
        fontWeight: 700,
        fontSize: '15px',
        padding: '14px 28px',
        borderRadius: radius.button,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {message}
    </div>
  );
}

/* ════════════════════════════════════════════════
   TABLA
   ════════════════════════════════════════════════ */
export function Table({ columns, data, accent = '#6C5CE7' }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: radius.card, border: `1px solid ${colors.border}` }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: fonts.body,
          fontSize: '14px',
        }}
      >
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  fontWeight: 700,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color: colors.textSecondary,
                  borderBottom: `2px solid ${colors.border}`,
                  background: `${accent}08`,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              style={{
                borderBottom: i < data.length - 1 ? `1px solid ${colors.border}` : 'none',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = `${accent}06`)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: '12px 16px',
                    color: colors.textPrimary,
                    fontWeight: col.bold ? 700 : 400,
                  }}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ════════════════════════════════════════════════
   SKELETON (carga shimmer)
   ════════════════════════════════════════════════ */
export function Skeleton({ width = '100%', height = '20px', borderRadius: br = '10px', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: br,
        background: `linear-gradient(90deg, ${colors.border} 25%, #f7efe5 50%, ${colors.border} 75%)`,
        backgroundSize: '800px 100%',
        animation: 'shimmer 1.5s infinite ease-in-out',
        ...style,
      }}
    />
  );
}

/* ════════════════════════════════════════════════
   ATAJO (ShortcutCard)
   ════════════════════════════════════════════════ */
export function ShortcutCard({ emoji, title, available = false, accent, onClick }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={available ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.card,
        borderRadius: radius.card,
        boxShadow: hovered && available ? shadow.hover : shadow.card,
        border: `2px solid ${hovered && available ? accent : 'transparent'}`,
        padding: '28px 20px',
        textAlign: 'center',
        transition: 'all 0.25s ease',
        transform: hovered && available ? 'translateY(-4px)' : 'translateY(0)',
        cursor: available ? 'pointer' : 'default',
        opacity: available ? 1 : 0.7,
        minWidth: '160px',
      }}
    >
      <div style={{ fontSize: '36px', marginBottom: '12px' }}>{emoji}</div>
      <h4
        style={{
          fontFamily: fonts.body,
          fontWeight: 700,
          fontSize: '14px',
          color: colors.textPrimary,
          marginBottom: '8px',
        }}
      >
        {title}
      </h4>
      <Badge color={available ? colors.success : colors.textSecondary}>
        {available ? 'Disponible' : 'Próximamente'}
      </Badge>
    </div>
  );
}

/* ════════════════════════════════════════════════
   HELPER: oscurecer/aclarar un color hex
   ════════════════════════════════════════════════ */
function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
