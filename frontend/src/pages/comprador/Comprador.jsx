/* ─── PANEL COMPRADOR ─── */
import React from 'react';
import { roles } from '../../theme';
import PanelLayout from '../../components/PanelLayout';
import { ShortcutCard } from '../../components/ui';

const ACCENT = roles.COMPRADOR.accent;

export default function Comprador() {
  return (
    <PanelLayout rol="COMPRADOR">
      <div style={styles.shortcuts}>
        <ShortcutCard emoji="🤝" title="Proveedores" available={false} accent={ACCENT} />
        <ShortcutCard emoji="📝" title="Órdenes de compra" available={false} accent={ACCENT} />
      </div>
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
