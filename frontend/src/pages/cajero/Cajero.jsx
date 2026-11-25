/* ─── PANEL CAJERO (funcional: pagos y devoluciones) ─── */
import React, { useEffect, useState } from 'react';
import { apiVentas } from '../../api';
import { colors, roles, fonts } from '../../theme';
import PanelLayout from '../../components/PanelLayout';
import { Card, Table, Button, Input, Badge, Toast, Skeleton } from '../../components/ui';

const ACCENT = roles.CAJERO.accent;

export default function Cajero() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Form de pago
  const [pago, setPago] = useState({ id_venta: '', valor: '', medio_pago: 'EFECTIVO' });

  const notify = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type }), 2500);
  };

  const cargar = () => {
    setLoading(true);
    apiVentas.get('/ventas/pedidos')
      .then((r) => setPedidos(r.data))
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false));
  };

  useEffect(cargar, []);

  const registrarPago = async (e) => {
    e.preventDefault();
    try {
      const { data } = await apiVentas.post('/ventas/pagos', {
        id_venta: Number(pago.id_venta),
        valor: Number(pago.valor),
        medio_pago: pago.medio_pago,
      });
      notify(`Pago registrado ✓ Saldo: $${Number(data.saldo_pendiente ?? 0).toLocaleString('es-CO')}`);
      setPago({ id_venta: '', valor: '', medio_pago: 'EFECTIVO' });
    } catch (err) {
      notify(err.response?.data?.error || 'Error al registrar pago', 'error');
    }
  };

  const columns = [
    { key: 'id_pedido', label: '# Pedido', bold: true },
    { key: 'id_cliente', label: 'Cliente' },
    { key: 'estado', label: 'Estado', render: (r) => <Badge color={ACCENT}>{r.estado}</Badge> },
    {
      key: 'total_registrado', label: 'Total',
      render: (r) => <span style={{ fontFamily: fonts.heading, fontWeight: 600, color: ACCENT }}>${Number(r.total_registrado).toLocaleString('es-CO')}</span>
    },
  ];

  return (
    <PanelLayout rol="CAJERO">
      {/* Registrar pago */}
      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: fonts.heading, color: colors.textPrimary, marginBottom: 16 }}>Registrar pago</h3>
        <form onSubmit={registrarPago}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 12 }}>
            <Input label="ID Venta" type="number" accent={ACCENT} value={pago.id_venta} onChange={(e) => setPago({ ...pago, id_venta: e.target.value })} required />
            <Input label="Valor" type="number" accent={ACCENT} value={pago.valor} onChange={(e) => setPago({ ...pago, valor: e.target.value })} required />
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>MEDIO DE PAGO</label>
              <select value={pago.medio_pago} onChange={(e) => setPago({ ...pago, medio_pago: e.target.value })} style={selectStyle}>
                <option value="EFECTIVO">EFECTIVO</option>
                <option value="TARJETA">TARJETA</option>
                <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                <option value="OTRO">OTRO</option>
              </select>
            </div>
          </div>
          <Button type="submit" accent={ACCENT}>Registrar pago</Button>
        </form>
      </Card>

      {/* Pedidos/ventas para referencia */}
      <h3 style={{ fontFamily: fonts.heading, color: colors.textPrimary, marginBottom: 12 }}>Pedidos</h3>
      {loading ? <Skeleton height="200px" />
        : pedidos.length ? <Table columns={columns} data={pedidos} accent={ACCENT} />
          : <Card><p style={{ color: colors.textSecondary }}>No hay pedidos.</p></Card>}

      <Toast {...toast} />
    </PanelLayout>
  );
}

const lbl = { fontFamily: fonts.body, fontWeight: 700, fontSize: 13, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6, display: 'block' };
const selectStyle = { width: '100%', padding: '14px 16px', fontFamily: fonts.body, fontSize: 15, color: colors.textPrimary, background: colors.card, border: `2px solid ${colors.border}`, borderRadius: 12, outline: 'none' };