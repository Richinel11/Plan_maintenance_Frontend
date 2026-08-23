// Palette EneoPlan officielle (voir src/pages/Security/UserManagement/components/Modals.css)
// Primary: #1B75BB — Gray: #939597 — Accent: #8DC640
export const COLORS = {
  blue: "#1B75BB",
  blueLight: "#e0f2fe",
  blueDark: "#14689E",
  green: "#8DC640",
  greenLight: "#EAF3DE",
  teal: "#1D9E75",
  tealLight: "#E1F5EE",
  amber: "#BA7517",
  amberLight: "#FAEEDA",
  red: "#ef4444",
  redLight: "#FCEBEB",
  purple: "#7F77DD",
  purpleLight: "#EEEDFE",
  gray: "#939597",
  grayLight: "#f1f5f9",
  border: "#e2e8f0",
  bg: "#f8fafc",
  white: "#ffffff",
  text: "#1a202c",
  textMuted: "#64748b",
  barBlue: "#1B75BB",
  barGreen: "#8DC640",
  barPurple: "#9B59B6",
  barOrange: "#E67E22",
};

export const styles = {
  app: { fontFamily: "'Inter', sans-serif", background: COLORS.bg, minHeight: "100vh", fontSize: 13 },
  nav: { background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 0, overflowX: "auto", padding: "0 16px" },
  navTab: (active) => ({
    padding: "12px 18px", cursor: "pointer", fontSize: 12, fontWeight: active ? 600 : 500,
    color: active ? COLORS.blue : COLORS.textMuted, borderBottom: active ? `2px solid ${COLORS.blue}` : "2px solid transparent",
    whiteSpace: "nowrap", background: "none", border: "none", fontFamily: "'Inter', sans-serif",
  }),

  page: {
    padding: "24px 32px",
    width: "100%",
    boxSizing: "border-box"
  },

  card: { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "20px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 16, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 10 },

  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 20 },
  kpiCard: (color) => ({ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px 20px", textAlign: "center", borderTop: `3px solid ${color || COLORS.blue}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }),
  kpiVal: (color) => ({ fontSize: 28, fontWeight: 700, color: color || COLORS.blue, lineHeight: 1.1 }),
  kpiLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  kpiSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 6 },

  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { background: "transparent", padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: `1px solid ${COLORS.border}`, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" },
  td: { padding: "12px 16px", borderBottom: "1px solid #f1f5f9", color: "#334155", verticalAlign: "middle" },
  tdCenter: { padding: "12px 16px", borderBottom: "1px solid #f1f5f9", color: "#334155", textAlign: "center" },

  row2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(45%, 1fr))", gap: 24 },
  row3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(30%, 1fr))", gap: 24 },

  badge: (color, bg) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 3, fontSize: 10, fontWeight: 600, color: color, background: bg }),
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  pageTitle: { fontSize: 20, fontWeight: 700, color: COLORS.text },
  pill: { background: COLORS.blueLight, color: COLORS.blue, fontSize: 11, padding: "3px 10px", borderRadius: 10, fontWeight: 600 },
};
