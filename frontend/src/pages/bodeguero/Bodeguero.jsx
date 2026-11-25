/* ─── PANEL BODEGUERO ─── */
import React from 'react';
import { roles } from '../../theme';
import PanelLayout from '../../components/PanelLayout';
import { ShortcutCard } from '../../components/ui';

const ACCENT = roles.BODEGUERO.accent;

export default function Bodeguero() {
  return (
    <PanelLayout rol="BODEGUERO">
      <div style={styles.shortcuts}>
        <ShortcutCard emoji="📊" title="Inventario" available={false} accent={ACCENT} />
        <ShortcutCard emoji="🚚" title="Recepciones" available={false} accent={ACCENT} />
        <ShortcutCard emoji="🔁" title="Transferencias" available={false} accent={ACCENT} />
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
