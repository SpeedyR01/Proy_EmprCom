/* ─── PANEL ADMINISTRADOR ─── */
import React, { useEffect, useState } from 'react';
import { apiCatalogo } from '../../api';
import { colors, roles, fonts } from '../../theme';
import PanelLayout from '../../components/PanelLayout';
import { Card, ShortcutCard, Badge, Table } from '../../components/ui';

const ACCENT = roles.ADMINISTRADOR.accent;

export default function Admin() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    apiCatalogo
      .get('/catalogo/productos')
      .then((r) => setProductos(r.data))
      .catch(() => {
        setProductos([
          { id_producto: 1, nombre: 'Auriculares BT', precio_lista: 89900 },
          { id_producto: 2, nombre: 'Termo Acero', precio_lista: 45000 },
          { id_producto: 3, nombre: 'Mochila Urban', precio_lista: 120000 },
          { id_producto: 4, nombre: 'Cargador Rápido', precio_lista: 35000 },
        ]);
      });
  }, []);

  const PRODUCT_EMOJIS = ['🧴', '👟', '📱', '🎧', '🧢', '🕶️', '💡', '📒'];

  const columns = [
    {
      key: 'emoji',
      label: '',
      render: (_row, i) => (
        <span style={{ fontSize: '22px' }}>
          {PRODUCT_EMOJIS[(productos.indexOf(_row)) % PRODUCT_EMOJIS.length]}
        </span>
      ),
    },
    { key: 'nombre', label: 'Producto', bold: true },
    {
      key: 'precio_lista',
      label: 'Precio de Lista',
      render: (row) => (
        <span style={{ fontFamily: fonts.heading, fontWeight: 600, color: ACCENT }}>
          ${Number(row.precio_lista).toLocaleString('es-CO')}
        </span>
      ),
    },
  ];

  return (
    <PanelLayout rol="ADMINISTRADOR">
      {/* Atajos */}
      <div style={styles.shortcuts}>
        <ShortcutCard emoji="📚" title="Catálogo" available accent={ACCENT} />
        <ShortcutCard emoji="👥" title="Usuarios" available={false} accent={ACCENT} />
        <ShortcutCard emoji="🔭" title="Supervisión" available={false} accent={ACCENT} />
      </div>

      {/* Conteo */}
      <Card style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: `${ACCENT}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}
        >
          📦
        </div>
        <div>
          <div style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: '28px', color: ACCENT }}>
            {productos.length}
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: '14px', color: colors.textSecondary }}>
            productos en catálogo
          </div>
        </div>
      </Card>

      {/* Tabla */}
      <Table columns={columns} data={productos} accent={ACCENT} />
    </PanelLayout>
  );
}

const styles = {
  shortcuts: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
};
