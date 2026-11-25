/* ─── PANEL AUDITOR ─── */
import React from 'react';
import { roles } from '../../theme';
import PanelLayout from '../../components/PanelLayout';
import { ShortcutCard } from '../../components/ui';

const ACCENT = roles.AUDITOR.accent;

export default function Auditor() {
  return (
    <PanelLayout rol="AUDITOR">
      <div style={styles.shortcuts}>
        <ShortcutCard emoji="📈" title="Reportes de ventas" available={false} accent={ACCENT} />
        <ShortcutCard emoji="🧾" title="Movimientos" available={false} accent={ACCENT} />
      </div>
      <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: '14px', color: '#7C7490', marginTop: '12px' }}>
        Solo lectura — las acciones de escritura no están habilitadas para este rol.
      </p>
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
