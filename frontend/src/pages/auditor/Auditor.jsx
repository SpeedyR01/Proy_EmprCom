/* ─── PANEL AUDITOR (solo lectura: reportes) ─── */
import React, { useEffect, useState } from 'react';
import { apiInventarios, apiVentas, apiCompras } from '../../api';
import { colors, roles, fonts } from '../../theme';
import PanelLayout from '../../components/PanelLayout';
import { Card, Table, Button, Skeleton } from '../../components/ui';

const ACCENT = roles.AUDITOR.accent;

export default function Auditor() {
  const [vista, setVista] = useState('inventario'); // inventario | pedidos | compras
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = (v) => {
    setLoading(true);
    const req = {
      inventario: () => apiInventarios.get('/inventarios').then((r) => r.data),
      pedidos: () => apiVentas.get('/ventas/pedidos').then((r) => r.data),
      compras: () => apiCompras.get('/compras/ordenes').then((r) => r.data),
    }[v];
    req().then(setData).catch(() => setData([])).finally(() => setLoading(false));
  };

  useEffect(() => cargar(vista), [vista]);

  const columnas = {
    inventario: [
      { key: 'id_almacen', label: 'Almacén', bold: true },
      { key: 'id_producto', label: 'Producto' },
      { key: 'existencia_actual', label: 'Existencia' },
      { key: 'stock_minimo', label: 'Mínimo' },
    ],
    pedidos: [
      { key: 'id_pedido', label: '# Pedido', bold: true },
      { key: 'id_sede', label: 'Sede' },
      { key: 'id_cliente', label: 'Cliente' },
      { key: 'estado', label: 'Estado' },
      {
        key: 'total_registrado', label: 'Total',
        render: (r) => `$${Number(r.total_registrado).toLocaleString('es-CO')}`
      },
    ],
    compras: [
      { key: 'id_orden_compra', label: '# Orden', bold: true },
      { key: 'id_proveedor', label: 'Proveedor' },
      { key: 'fecha_orden', label: 'Fecha' },
      { key: 'estado', label: 'Estado' },
    ],
  };

  return (
    <PanelLayout rol="AUDITOR">
      {/* Nota: el auditor solo consulta, no modifica */}
      <Card style={{ marginBottom: 24, background: `${ACCENT}0c` }}>
        <p style={{ color: colors.textSecondary, fontFamily: fonts.body, margin: 0 }}>
          🔍 Vista de solo lectura. El auditor consulta la información sin modificarla.
        </p>
      </Card>

      {/* Tabs de reportes */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <Button variant={vista === 'inventario' ? 'primary' : 'outline'} accent={ACCENT} onClick={() => setVista('inventario')}>📊 Inventario</Button>
        <Button variant={vista === 'pedidos' ? 'primary' : 'outline'} accent={ACCENT} onClick={() => setVista('pedidos')}>🛍 Ventas / Pedidos</Button>
        <Button variant={vista === 'compras' ? 'primary' : 'outline'} accent={ACCENT} onClick={() => setVista('compras')}>📝 Compras</Button>
      </div>

      {loading ? <Skeleton height="220px" />
        : data.length ? <Table columns={columnas[vista]} data={data} accent={ACCENT} />
          : <Card><p style={{ color: colors.textSecondary }}>Sin datos para esta vista.</p></Card>}
    </PanelLayout>
  );
}