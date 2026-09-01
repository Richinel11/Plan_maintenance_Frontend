// Style du rapport « Suivi des travaux prévisionnels ».
// Reprend la mise en page dense/tabulaire du rapport de référence tout en
// utilisant la palette EneoPlan (voir ../../components/kpi.js).
import { COLORS } from '../../components/kpi';

export { COLORS };

// Vert du bandeau de titre et gris des bandeaux de tableau, repris du rapport.
export const BANDEAU_VERT = COLORS.green;
export const BANDEAU_GRIS = '#6f7276';

export const s = {
  page: {
    fontFamily: "'Inter', sans-serif",
    background: COLORS.bg,
    minHeight: '100vh',
    fontSize: 12,
    color: COLORS.text,
    padding: '0 0 32px',
  },

  // ── Bandeau de titre ──
  bandeau: {
    background: BANDEAU_VERT,
    color: COLORS.white,
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  bandeauTitre: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    margin: 0,
  },
  bandeauDate: { fontSize: 12, fontWeight: 700 },

  // ── Barre d'outils (sélecteurs) ──
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    padding: '12px 20px',
    background: COLORS.white,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  toolbarLabel: { fontSize: 12, fontWeight: 600, color: COLORS.textMuted },
  select: {
    padding: '7px 10px',
    borderRadius: 8,
    border: `1.5px solid #d1d5db`,
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    color: COLORS.text,
    background: COLORS.white,
  },
  bouton: {
    padding: '7px 16px',
    background: COLORS.blue,
    color: COLORS.white,
    border: 'none',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
  },

  corps: { padding: '16px 20px' },

  // ── Tuiles ──
  tuilesRangee: {
    display: 'grid',
    gap: 8,
    marginBottom: 8,
  },
  tuile: (highlight) => ({
    background: highlight ? COLORS.blueDark : COLORS.white,
    color: highlight ? COLORS.white : COLORS.text,
    border: `1px solid ${highlight ? COLORS.blueDark : COLORS.border}`,
    borderRadius: 6,
    padding: '8px 10px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 84,
    textAlign: 'center',
  }),
  tuileSurtitre: (highlight) => ({
    fontSize: 10,
    fontWeight: 600,
    color: highlight ? 'rgba(255,255,255,0.85)' : COLORS.textMuted,
    minHeight: 13,
    lineHeight: 1.2,
  }),
  tuileValeur: (highlight) => ({
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.15,
    color: highlight ? COLORS.white : COLORS.text,
    padding: '2px 0',
    whiteSpace: 'nowrap',
  }),
  tuileLibelle: (highlight) => ({
    fontSize: 10.5,
    fontWeight: 500,
    color: highlight ? 'rgba(255,255,255,0.9)' : COLORS.textMuted,
    lineHeight: 1.25,
  }),

  // ── Tableaux ──
  colonnes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
    gap: 16,
    alignItems: 'start',
  },
  bloc: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  blocTitre: {
    background: BANDEAU_GRIS,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'center',
    padding: '6px 10px',
  },
  scroll: { overflowX: 'auto' },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 11.5,
    whiteSpace: 'nowrap',
  },
  th: {
    background: '#f1f3f5',
    padding: '7px 10px',
    fontWeight: 700,
    color: '#374151',
    borderBottom: `1px solid ${COLORS.border}`,
    borderRight: '1px solid #e9ecef',
    textAlign: 'center',
  },
  thGauche: { textAlign: 'left' },
  td: {
    padding: '6px 10px',
    borderBottom: '1px solid #f1f3f5',
    borderRight: '1px solid #f8f9fa',
    color: '#334155',
  },
  tdNum: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  ligneTotal: { background: '#f8f9fa', fontWeight: 700, color: COLORS.text },

  // ── États ──
  etat: { padding: 40, textAlign: 'center', color: COLORS.textMuted, fontSize: 13 },
  etatErreur: {
    margin: '20px',
    padding: '14px 16px',
    borderRadius: 8,
    background: COLORS.redLight,
    border: `1px solid ${COLORS.red}`,
    color: '#991b1b',
    fontSize: 12.5,
  },
};
