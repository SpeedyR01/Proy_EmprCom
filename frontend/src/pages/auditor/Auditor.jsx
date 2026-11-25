/* ─── PANEL AUDITOR — Reportes · Auditoría · Alertas (solo lectura) ─── */
import React, { useEffect, useState, useCallback } from 'react';
import { apiReportes } from '../../api';
import { colors, roles, fonts, radius, shadow } from '../../theme';
import PanelLayout from '../../components/PanelLayout';
import { Card, Button, Badge, Table, Skeleton } from '../../components/ui';

const ACCENT = roles.AUDITOR.accent;

/* ════════════════════════════════════════════════════════════════
   HELPER: renderizar una celda de forma inteligente
   ════════════════════════════════════════════════════════════════ */
function renderCelda(valor) {
  if (valor === null || valor === undefined) return <span style={{ color: colors.textSecondary }}>—</span>;
  if (typeof valor === 'boolean') return valor ? '✅' : '❌';

  const str = String(valor);

  // Fechas ISO
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    return new Date(str).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return new Date(str + 'T00:00:00').toLocaleDateString('es-CO');
  }

  // Montos (claves comunes)
  return str;
}

/* ════════════════════════════════════════════════════════════════
   COMPONENTE DE TABLA GENÉRICA (autocolumnas desde los datos)
   ════════════════════════════════════════════════════════════════ */
function TablaGenerica({ data, accentColor = ACCENT, moneyKeys = [], badgeKeys = {} }) {
  if (!data || data.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '36px', marginBottom: '8px' }}>📭</div>
        <p style={{ fontFamily: fonts.body, color: colors.textSecondary }}>No hay datos para este reporte.</p>
      </Card>
    );
  }

  const keys = Object.keys(data[0]);

  return (
    <div style={{ overflowX: 'auto', borderRadius: radius.card, border: `1px solid ${colors.border}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: fonts.body, fontSize: '13px' }}>
        <thead>
          <tr>
            {keys.map(k => (
              <th key={k} style={{
                textAlign: 'left', padding: '12px 14px',
                fontWeight: 700, fontSize: '11px', textTransform: 'uppercase',
                letterSpacing: '0.6px', color: colors.textSecondary,
                borderBottom: `2px solid ${colors.border}`, background: `${accentColor}08`,
                whiteSpace: 'nowrap',
              }}>
                {k.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}
              style={{ borderBottom: i < data.length - 1 ? `1px solid ${colors.border}` : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = `${accentColor}06`}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {keys.map(k => {
                const v = row[k];
                // ¿Es columna de dinero?
                const esMoney = moneyKeys.includes(k);
                // ¿Es columna con badge de estado?
                const badgeCfg = badgeKeys[k];
                // ¿Es columna de veredicto/anomalía?
                const esAnomalia = k === 'veredicto' || k === 'veredicto_auditoria' || k === 'categoria_riesgo';

                let contenido;
                if (esMoney && v != null) {
                  contenido = (
                    <span style={{ fontFamily: fonts.heading, fontWeight: 600, color: accentColor }}>
                      ${Number(v).toLocaleString('es-CO')}
                    </span>
                  );
                } else if (badgeCfg && v) {
                  const color = badgeCfg[v] || colors.textSecondary;
                  contenido = <Badge color={color}>{v}</Badge>;
                } else if (esAnomalia && v) {
                  const isAnomaly = String(v).startsWith('ANOMALIA') || String(v) === 'Riesgo Alto';
                  contenido = <Badge color={isAnomaly ? colors.error : colors.success}>{v}</Badge>;
                } else {
                  contenido = renderCelda(v);
                }

                return (
                  <td key={k} style={{ padding: '10px 14px', color: colors.textPrimary, verticalAlign: 'middle' }}>
                    {contenido}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   DEFINICIÓN DE REPORTES
   ════════════════════════════════════════════════════════════════ */
const REPORTES = [
  // ── Reportes consolidados ──────────────────────────────────────
  {
    id: 'inventario-consolidado', emoji: '📦', label: 'Inventario consolidado',
    grupo: 'reportes',
    desc: 'Existencias agrupadas por sede y producto (FDW multi-sede)',
    moneyKeys: [],
  },
  {
    id: 'productos-bajo-minimo', emoji: '⚠️', label: 'Productos bajo mínimo',
    grupo: 'reportes',
    desc: 'Productos cuya existencia actual está por debajo del stock mínimo',
    moneyKeys: [],
  },
  {
    id: 'ventas-sede-periodo', emoji: '📈', label: 'Ventas por sede y periodo',
    grupo: 'reportes',
    desc: 'Resumen de ventas confirmadas agrupadas por sede y mes',
    moneyKeys: ['total', 'ingreso', 'ingreso_mes', 'valor_venta', 'total_registrado'],
  },
  {
    id: 'compras-por-proveedor', emoji: '🤝', label: 'Compras por proveedor',
    grupo: 'reportes',
    desc: 'Monto comprado por proveedor con participación porcentual',
    moneyKeys: ['monto_comprado', 'monto_total'],
  },
  {
    id: 'saldos-por-venta', emoji: '💰', label: 'Saldos pendientes',
    grupo: 'reportes',
    desc: 'Ventas con saldo sin pagar, ranking de deuda y clasificación de riesgo',
    moneyKeys: ['valor_venta', 'total_pagado', 'saldo_pendiente'],
    badgeKeys: { categoria_riesgo: { 'Riesgo Alto': colors.error, 'Pendiente Normal': '#E08A00', 'Pagado': colors.success } },
  },
  {
    id: 'devoluciones-por-sede', emoji: '↩️', label: 'Devoluciones por motivo',
    grupo: 'reportes',
    desc: 'Devoluciones agrupadas por sede, motivo y condición del producto',
    moneyKeys: [],
  },
  {
    id: 'resumen-por-sede', emoji: '🏢', label: 'Resumen por sede',
    grupo: 'reportes',
    desc: 'Vista ejecutiva integral: empleados, ventas, ingresos y devoluciones por sede',
    moneyKeys: ['ingresos'],
  },
  // ── Alertas ───────────────────────────────────────────────────
  {
    id: 'alertas/productos-bajo-minimo', emoji: '🔴', label: 'Alerta: bajo stock',
    grupo: 'alertas',
    desc: 'Productos cuya existencia cayó por debajo del mínimo → requieren reposición urgente',
    moneyKeys: [],
  },
  {
    id: 'alertas/ventas-sin-pago', emoji: '💸', label: 'Alerta: ventas sin pago',
    grupo: 'alertas',
    desc: 'Ventas confirmadas con saldo pendiente (posibles deudas o pagos incompletos)',
    moneyKeys: ['valor_venta', 'total_pagado', 'saldo_pendiente'],
    badgeKeys: { categoria_riesgo: { 'Riesgo Alto': colors.error, 'Pendiente Normal': '#E08A00' } },
  },
  {
    id: 'alertas/devoluciones-anomalas', emoji: '🚨', label: 'Alerta: devoluciones anómalas',
    grupo: 'alertas',
    desc: 'Devoluciones que superan lo vendido o de productos que no pertenecen a la venta',
    moneyKeys: [],
  },
  // ── Auditoría ─────────────────────────────────────────────────
  {
    id: 'auditoria/accesos', emoji: '🗂️', label: 'Auditoría de accesos',
    grupo: 'auditoria',
    desc: 'Registro de quién inició sesión, qué consultó y cuándo (últimos 200 registros)',
    moneyKeys: [],
    badgeKeys: { accion: { 'LOGIN': ACCENT, 'CONSULTA': colors.success, 'ERROR': colors.error } },
  },
];

const GRUPOS = [
  { id: 'reportes',  label: '📊 Reportes', desc: 'Vistas consolidadas del FDW' },
  { id: 'alertas',   label: '🚨 Alertas',   desc: 'Anomalías y riesgos detectados' },
  { id: 'auditoria', label: '🗂️ Auditoría', desc: 'Registro de accesos al sistema' },
];

/* ════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ════════════════════════════════════════════════════════════════ */
export default function Auditor() {
  const [grupo,    setGrupo]    = useState('reportes');
  const [reporte,  setReporte]  = useState(null);     // id del reporte activo
  const [data,     setData]     = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const reportesDelGrupo = REPORTES.filter(r => r.grupo === grupo);
  const reporteActivo    = REPORTES.find(r => r.id === reporte);

  const cargar = useCallback((id) => {
    if (!id) return;
    setLoading(true);
    setError('');
    setData([]);
    apiReportes.get(`/reportes/${id}`)
      .then(r => setData(r.data))
      .catch(e => {
        const msg = e.response?.data?.error || e.message || 'Error al cargar el reporte';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  /* Al cambiar de reporte */
  const seleccionar = (id) => {
    setReporte(id);
    cargar(id);
  };

  /* Al cambiar de grupo, limpiar selección */
  const cambiarGrupo = (g) => {
    setGrupo(g);
    setReporte(null);
    setData([]);
    setError('');
  };

  return (
    <PanelLayout rol="AUDITOR">
      {/* Banner solo lectura */}
      <div style={{
        background: `${ACCENT}0d`, border: `1px solid ${ACCENT}30`,
        borderRadius: radius.card, padding: '12px 20px',
        marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <span style={{ fontSize: '20px' }}>🔍</span>
        <p style={{ fontFamily: fonts.body, fontSize: '14px', color: colors.textSecondary, margin: 0 }}>
          Vista de <strong>solo lectura</strong>. El auditor consulta sin modificar ningún dato.
        </p>
      </div>

      {/* ─── Tabs de grupo ─── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {GRUPOS.map(g => (
          <button
            key={g.id}
            onClick={() => cambiarGrupo(g.id)}
            style={{
              fontFamily: fonts.body, fontWeight: 700, fontSize: '14px',
              padding: '10px 22px', borderRadius: radius.button,
              border: `2px solid ${grupo === g.id ? ACCENT : colors.border}`,
              background: grupo === g.id ? ACCENT : 'transparent',
              color: grupo === g.id ? '#fff' : colors.textSecondary,
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* ─── Layout: sidebar de reportes + contenido ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* Sidebar con lista de reportes del grupo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {reportesDelGrupo.map(r => (
            <button
              key={r.id}
              onClick={() => seleccionar(r.id)}
              style={{
                fontFamily: fonts.body, fontWeight: reporte === r.id ? 700 : 400,
                fontSize: '13px', textAlign: 'left',
                padding: '12px 16px', borderRadius: '14px', cursor: 'pointer',
                border: `2px solid ${reporte === r.id ? ACCENT : 'transparent'}`,
                background: reporte === r.id ? `${ACCENT}10` : colors.card,
                color: reporte === r.id ? ACCENT : colors.textPrimary,
                boxShadow: shadow.card,
                transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'flex-start', gap: '8px',
              }}
            >
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{r.emoji}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        {/* Área de contenido */}
        <div>
          {!reporte ? (
            /* Estado vacío: elegir reporte */
            <Card style={{ textAlign: 'center', padding: '64px 40px' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>👈</div>
              <h3 style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: '20px', color: colors.textPrimary, marginBottom: '8px' }}>
                Selecciona un reporte
              </h3>
              <p style={{ fontFamily: fonts.body, fontSize: '14px', color: colors.textSecondary }}>
                Elige uno del panel izquierdo para visualizar los datos.
              </p>
            </Card>
          ) : loading ? (
            /* Cargando */
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Skeleton height="20px" width="40%" />
                <Skeleton height="40px" />
                {[1,2,3,4,5].map(n => <Skeleton key={n} height="36px" />)}
              </div>
            </Card>
          ) : error ? (
            /* Error */
            <Card style={{ textAlign: 'center', padding: '48px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌐</div>
              <h3 style={{ fontFamily: fonts.heading, fontWeight: 600, color: colors.error, marginBottom: '8px' }}>
                No se pudo cargar el reporte
              </h3>
              <p style={{ fontFamily: fonts.body, fontSize: '13px', color: colors.textSecondary, marginBottom: '16px' }}>
                {error}
              </p>
              <Button accent={ACCENT} variant="outline" onClick={() => cargar(reporte)}>
                Reintentar
              </Button>
            </Card>
          ) : (
            /* Datos */
            <div>
              {/* Cabecera del reporte */}
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: '20px', color: colors.textPrimary, marginBottom: '4px' }}>
                  {reporteActivo?.emoji} {reporteActivo?.label}
                </h2>
                <p style={{ fontFamily: fonts.body, fontSize: '13px', color: colors.textSecondary }}>
                  {reporteActivo?.desc} · <strong style={{ color: ACCENT }}>{data.length}</strong> registro{data.length !== 1 ? 's' : ''}
                </p>
              </div>

              <TablaGenerica
                data={data}
                accentColor={ACCENT}
                moneyKeys={reporteActivo?.moneyKeys || []}
                badgeKeys={reporteActivo?.badgeKeys || {}}
              />
            </div>
          )}
        </div>
      </div>
    </PanelLayout>
  );
}
