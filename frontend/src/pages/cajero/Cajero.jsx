/* ─── PANEL CAJERO ─── */
import React from 'react';
import { roles } from '../../theme';
import PanelLayout from '../../components/PanelLayout';
import { ShortcutCard } from '../../components/ui';

const ACCENT = roles.CAJERO.accent;

export default function Cajero() {
  return (
    <PanelLayout rol="CAJERO">
      <div style={styles.shortcuts}>
        <ShortcutCard emoji="💵" title="Pagos" available={false} accent={ACCENT} />
        <ShortcutCard emoji="↩️" title="Devoluciones" available={false} accent={ACCENT} />
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
