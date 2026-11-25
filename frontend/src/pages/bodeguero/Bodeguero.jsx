/* ─── PANEL BODEGUERO (funcional, conectado al back) ─── */
import React, { useEffect, useState } from 'react';
import { apiInventarios, apiCatalogo } from '../../api';
import { colors, roles, fonts } from '../../theme';
import PanelLayout from '../../components/PanelLayout';
import { Card, Table, Button, Input, Badge, Toast, Skeleton } from '../../components/ui';

const ACCENT = roles.BODEGUERO.accent;

export default function Bodeguero() {
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Form movimiento de inventario
  const [mov, setMov] = useState({ id_almacen: '', id_producto: '', tipo_movimiento: 'ENTRADA', cantidad: '' });

  const notify = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type }), 2500);
  };

  const cargar = () => {
    setLoading(true);
    apiInventarios.get('/inventarios')
      .then((r) => setInventario(r.data))
      .catch(() => setInventario([]))
      .finally(() => setLoading(false));
  };

  useEffect(cargar, []);

  const registrarMovimiento = async (e) => {
    e.preventDefault();
    try {
      await apiInventarios.post('/inventarios/movimientos', {
        id_almacen: Number(mov.id_almacen),
        id_producto: Number(mov.id_producto),
        tipo_movimiento: mov.tipo_movimiento,
        cantidad: Number(mov.cantidad),
      });
      notify(`Movimiento ${mov.tipo_movimiento} registrado ✓`);
      setMov({ id_almacen: '', id_producto: '', tipo_movimiento: 'ENTRADA', cantidad: '' });
      cargar();
    } catch (err) {
      notify(err.response?.data?.error || 'Error al registrar movimiento', 'error');
    }
  };

  const bajoMinimo = inventario.filter((i) => Number(i.existencia_actual) < Number(i.stock_minimo));

  const columns = [
    { key: 'id_almacen', label: 'Almacén', bold: true },
    { key: 'id_producto', label: 'Producto' },
    {
      key: 'existencia_actual', label: 'Existencia',
      render: (r) => <span style={{ fontFamily: fonts.heading, fontWeight: 600, color: ACCENT }}>{r.existencia_actual}</span>
    },
    { key: 'stock_minimo', label: 'Mínimo' },
    {
      key: 'estado', label: 'Estado',
      render: (r) => Number(r.existencia_actual) < Number(r.stock_minimo)
        ? <Badge color={colors.error}>BAJO MÍNIMO</Badge>
        : <Badge color={colors.success}>OK</Badge>
    },
  ];

  return (
    <PanelLayout rol="BODEGUERO">
      {/* Registrar movimiento */}
      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: fonts.heading, color: colors.textPrimary, marginBottom: 16 }}>Registrar movimiento</h3>
        <form onSubmit={registrarMovimiento}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 12 }}>
            <Input label="ID Almacén" type="number" accent={ACCENT} value={mov.id_almacen} onChange={(e) => setMov({ ...mov, id_almacen: e.target.value })} required />
            <Input label="ID Producto" type="number" accent={ACCENT} value={mov.id_producto} onChange={(e) => setMov({ ...mov, id_producto: e.target.value })} required />
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>TIPO</label>
              <select value={mov.tipo_movimiento} onChange={(e) => setMov({ ...mov, tipo_movimiento: e.target.value })} style={selectStyle}>
                <option value="ENTRADA">ENTRADA</option>
                <option value="SALIDA">SALIDA</option>
                <option value="AJUSTE">AJUSTE</option>
              </select>
            </div>
            <Input label="Cantidad" type="number" accent={ACCENT} value={mov.cantidad} onChange={(e) => setMov({ ...mov, cantidad: e.target.value })} required />
          </div>
          <Button type="submit" accent={ACCENT}>Registrar</Button>
        </form>
      </Card>

      {/* Resumen bajo mínimo */}
      <Card style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={iconBox}>⚠️</div>
        <div>
          <div style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 28, color: bajoMinimo.length ? colors.error : ACCENT }}>{bajoMinimo.length}</div>
          <div style={{ color: colors.textSecondary, fontFamily: fonts.body, fontSize: 14 }}>productos bajo mínimo</div>
        </div>
      </Card>

      {/* Tabla inventario */}
      {loading ? <Skeleton height="200px" />
        : inventario.length ? <Table columns={columns} data={inventario} accent={ACCENT} />
          : <Card><p style={{ color: colors.textSecondary }}>No hay existencias registradas.</p></Card>}

      <Toast {...toast} />
    </PanelLayout>
  );
}

const iconBox = { width: 52, height: 52, borderRadius: 14, background: `${ACCENT}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 };
const lbl = { fontFamily: fonts.body, fontWeight: 700, fontSize: 13, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' };
const selectStyle = { width: '100%', padding: '14px 16px', fontFamily: fonts.body, fontSize: 15, color: colors.textPrimary, background: colors.card, border: `2px solid ${colors.border}`, borderRadius: 12, outline: 'none' };
