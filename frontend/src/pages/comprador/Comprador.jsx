/* ─── PANEL COMPRADOR (funcional, conectado al back) ─── */
import React, { useEffect, useState } from 'react';
import { apiCatalogo, apiCompras } from '../../api';
import { colors, roles, fonts } from '../../theme';
import PanelLayout from '../../components/PanelLayout';
import { Card, Table, Button, Input, Badge, Toast, Skeleton } from '../../components/ui';

const ACCENT = roles.COMPRADOR.accent;

export default function Comprador() {
  const [vista, setVista] = useState('ordenes'); // 'ordenes' | 'proveedores'
  const [ordenes, setOrdenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Form nuevo proveedor
  const [prov, setProv] = useState({ identificacion: '', razon_social: '', ciudad: '', correo: '', telefono: '' });

  const notify = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type }), 2500);
  };

  const cargar = () => {
    setLoading(true);
    Promise.all([
      apiCompras.get('/compras/ordenes').then((r) => r.data).catch(() => []),
      apiCatalogo.get('/catalogo/proveedores').then((r) => r.data).catch(() => []),
    ]).then(([o, p]) => {
      setOrdenes(o);
      setProveedores(p);
    }).finally(() => setLoading(false));
  };

  useEffect(cargar, []);

  const crearProveedor = async (e) => {
    e.preventDefault();
    try {
      await apiCatalogo.post('/catalogo/proveedores', prov);
      notify('Proveedor creado ✓');
      setProv({ identificacion: '', razon_social: '', ciudad: '', correo: '', telefono: '' });
      cargar();
    } catch (err) {
      notify(err.response?.data?.error || 'Error al crear proveedor', 'error');
    }
  };

  const colOrdenes = [
    { key: 'id_orden_compra', label: '# Orden', bold: true },
    { key: 'id_proveedor', label: 'Proveedor' },
    { key: 'id_almacen_destino', label: 'Almacén destino' },
    { key: 'fecha_orden', label: 'Fecha' },
    { key: 'estado', label: 'Estado', render: (r) => <Badge color={ACCENT}>{r.estado}</Badge> },
  ];

  const colProv = [
    { key: 'id_proveedor', label: 'ID', bold: true },
    { key: 'identificacion', label: 'NIT' },
    { key: 'razon_social', label: 'Razón social', bold: true },
    { key: 'ciudad', label: 'Ciudad' },
    { key: 'telefono', label: 'Teléfono' },
  ];

  return (
    <PanelLayout rol="COMPRADOR">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <Button variant={vista === 'ordenes' ? 'primary' : 'outline'} accent={ACCENT} onClick={() => setVista('ordenes')}>
          📝 Órdenes de compra
        </Button>
        <Button variant={vista === 'proveedores' ? 'primary' : 'outline'} accent={ACCENT} onClick={() => setVista('proveedores')}>
          🤝 Proveedores
        </Button>
      </div>

      {loading ? (
        <Skeleton height="200px" />
      ) : vista === 'ordenes' ? (
        <>
          <Card style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={iconBox}>📝</div>
            <div>
              <div style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 28, color: ACCENT }}>{ordenes.length}</div>
              <div style={{ color: colors.textSecondary, fontFamily: fonts.body, fontSize: 14 }}>órdenes de compra</div>
            </div>
          </Card>
          {ordenes.length ? <Table columns={colOrdenes} data={ordenes} accent={ACCENT} />
            : <Card><p style={{ color: colors.textSecondary }}>No hay órdenes registradas.</p></Card>}
        </>
      ) : (
        <>
          <Card style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: fonts.heading, color: colors.textPrimary, marginBottom: 16 }}>Nuevo proveedor</h3>
            <form onSubmit={crearProveedor}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 12 }}>
                <Input label="NIT" accent={ACCENT} value={prov.identificacion} onChange={(e) => setProv({ ...prov, identificacion: e.target.value })} required />
                <Input label="Razón social" accent={ACCENT} value={prov.razon_social} onChange={(e) => setProv({ ...prov, razon_social: e.target.value })} required />
                <Input label="Ciudad" accent={ACCENT} value={prov.ciudad} onChange={(e) => setProv({ ...prov, ciudad: e.target.value })} />
                <Input label="Correo" accent={ACCENT} value={prov.correo} onChange={(e) => setProv({ ...prov, correo: e.target.value })} />
                <Input label="Teléfono" accent={ACCENT} value={prov.telefono} onChange={(e) => setProv({ ...prov, telefono: e.target.value })} />
              </div>
              <Button type="submit" accent={ACCENT}>Guardar proveedor</Button>
            </form>
          </Card>
          {proveedores.length ? <Table columns={colProv} data={proveedores} accent={ACCENT} />
            : <Card><p style={{ color: colors.textSecondary }}>No hay proveedores.</p></Card>}
        </>
      )}

      <Toast {...toast} />
    </PanelLayout>
  );
}

const iconBox = {
  width: 52, height: 52, borderRadius: 14, background: `${ACCENT}15`,
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
};