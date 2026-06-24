export const COLORS = {
  blue: "#378ADD",
  blueLight: "#E6F1FB",
  blueDark: "#0C447C",
  green: "#639922",
  greenLight: "#EAF3DE",
  teal: "#1D9E75",
  tealLight: "#E1F5EE",
  amber: "#BA7517",
  amberLight: "#FAEEDA",
  red: "#E24B4A",
  redLight: "#FCEBEB",
  purple: "#7F77DD",
  purpleLight: "#EEEDFE",
  gray: "#888780",
  grayLight: "#F1EFE8",
  border: "rgba(0,0,0,0.12)",
  bg: "#f7f8fa",
  white: "#ffffff",
  text: "#1a1a1a",
  textMuted: "#666",
  barBlue: "#4472C4",
  barGreen: "#70AD47",
  barPurple: "#9B59B6",
  barOrange: "#E67E22",
};

export const styles = {
  app: { fontFamily: "system-ui, -apple-system, sans-serif", background: COLORS.bg, minHeight: "100vh", fontSize: 13 },
  nav: { background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 0, overflowX: "auto", padding: "0 16px" },
  navTab: (active) => ({
    padding: "12px 18px", cursor: "pointer", fontSize: 11, fontWeight: active ? 600 : 400,
    color: active ? COLORS.blue : COLORS.textMuted, borderBottom: active ? `2px solid ${COLORS.blue}` : "2px solid transparent",
    whiteSpace: "nowrap", background: "none", border: "none",
  }),
  
  // 🟢 AÉRATION : Augmentation de l'espace extérieur de la page
  page: { 
    padding: "24px 32px", 
    width: "100%", 
    boxSizing: "border-box" 
  },
  
  // 🟢 AÉRATION : Plus d'espace blanc à l'intérieur des cartes (padding) et entre les cartes (marginBottom)
  card: { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "20px", marginBottom: 20 },
  cardTitle: { fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 16, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 10 },
  
  // 🟢 AÉRATION : Plus d'espace entre les mini-cartes KPI (gap de 16px)
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 20 },
  kpiCard: (color) => ({ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "16px 20px", textAlign: "center", borderTop: `3px solid ${color || COLORS.blue}` }),
  kpiVal: (color) => ({ fontSize: 28, fontWeight: 700, color: color || COLORS.blue, lineHeight: 1.1 }),
  kpiLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  kpiSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 6 },
  
  // 🟢 AÉRATION : Cellules de tableau plus hautes pour une lecture reposante
  table: { width: "100%", borderCollapse: "collapse", fontSize: 11 },
  th: { background: "#f0f2f5", padding: "10px 12px", textAlign: "left", fontWeight: 600, color: COLORS.textMuted, borderBottom: `1px solid ${COLORS.border}`, fontSize: 10 },
  td: { padding: "10px 12px", borderBottom: `1px solid rgba(0,0,0,0.06)`, color: COLORS.text, verticalAlign: "middle" },
  tdCenter: { padding: "10px 12px", borderBottom: `1px solid rgba(0,0,0,0.06)`, color: COLORS.text, textAlign: "center" },
  
  // 🟢 AÉRATION : Écart important (gap: 24px) entre les grands blocs disposés côte à côte
  row2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(45%, 1fr))", gap: 24 },
  row3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(30%, 1fr))", gap: 24 },
  
  badge: (color, bg) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 3, fontSize: 10, fontWeight: 600, color: color, background: bg }),
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  pageTitle: { fontSize: 18, fontWeight: 700, color: COLORS.text },
  pill: { background: COLORS.blueLight, color: COLORS.blueDark, fontSize: 10, padding: "3px 10px", borderRadius: 10, fontWeight: 500 },
};