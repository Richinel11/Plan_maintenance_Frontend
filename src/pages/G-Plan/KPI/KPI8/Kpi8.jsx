import React from 'react';

export default function Page8({ styles, COLORS }) {
  const ouvrageData = [
    ["Distribution", "017 MINVILLE, Transfo 15/10kV BONABERI", "Enlèvement et nettoyage des isolateurs de JJI 90kV + connexions appareillage", "11/04/2026", "9h26", 24481],
    ["Distribution", "016 FOGE (BONABERI), Transfo 15/10kV", "Remplacement supports", "11/04/2026", "9h54", 22400],
    ["Distribution", "021 MAROUA (MAROUA), Transfo 90/15kV", "Remplacement supports", "11/04/2026", "7h50", 37700],
    ["Transport", "POSTE MAROUA, TRANSPORT 90/15kV ZGRIA", "Maintenance type 3-4 3 fins appareillages HTA", "11/04/2026", "9h02", 0],
    ["Distribution", "016 FOGE (BONABERI), Transfo 90/15kV", "Elagage / abattage d'arbres", "11/04/2026", "7h02", 37700],
    ["Distribution", "POSTE NGAOUNDERE, RAME 30 kV", "Entretien Rame 30 kV", "26/04/2026", "13h20", 13230],
  ];
  const bars = [
    { label: "017 MINVILLE (BONABERI)", value: 24481, color: COLORS.barBlue },
    { label: "016 FOGE (BONABERI)", value: 22400, color: COLORS.barGreen },
    { label: "021 MAROUA (MAROUA)", value: 37700, color: COLORS.barPurple },
    { label: "RAME 30kV (NGAOUNDERE)", value: 13330, color: COLORS.barOrange },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Evaluation des ENDs dus aux travaux programmés exécutés en alignement</div>
        <span style={styles.pill}>Avril 2026</span>
      </div>
      <div style={styles.row2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>END épargnées total</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: COLORS.tealLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 22 }}>⚡</span>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: COLORS.teal }}>119,161</div>
              <div style={{ fontSize: 14, color: COLORS.textMuted }}>MWh</div>
            </div>
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>END épargnées par ouvrage (MWh)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 0" }}>
            {bars.map((b, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: COLORS.textMuted, marginBottom: 3 }}>
                  <span>{b.label}</span>
                  <span style={{ fontWeight: 600 }}>{b.value.toLocaleString()}</span>
                </div>
                <div style={{ background: "#e8eaed", borderRadius: 3, height: 10 }}>
                  <div style={{ width: `${(b.value / 40000) * 100}%`, background: b.color, height: 10, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Détail des alignements</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Segment</th>
              <th style={styles.th}>Ouvrage</th>
              <th style={styles.th}>Nature du travaux</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Date d'exécution</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Durée (radio h)</th>
              <th style={{ ...styles.th, textAlign: "center" }}>END épargnée (MWh)</th>
            </tr>
          </thead>
          <tbody>
            {ouvrageData.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? COLORS.white : "#fafafa" }}>
                <td style={styles.td}>
                  <span style={styles.badge(row[0] === "Distribution" ? COLORS.blueDark : COLORS.amber, row[0] === "Distribution" ? COLORS.blueLight : COLORS.amberLight)}>
                    {row[0]}
                  </span>
                </td>
                <td style={{ ...styles.td, fontSize: 10 }}>{row[1]}</td>
                <td style={{ ...styles.td, fontSize: 10 }}>{row[2]}</td>
                <td style={styles.tdCenter}>{row[3]}</td>
                <td style={styles.tdCenter}>{row[4]}</td>
                <td style={{ ...styles.tdCenter, fontWeight: 600, color: row[5] > 0 ? COLORS.teal : COLORS.textMuted }}>
                  {row[5] > 0 ? row[5].toLocaleString() : "-"}
                </td>
              </tr>
            ))}
            <tr style={{ background: "#f0f7ff", fontWeight: 700 }}>
              <td style={styles.td} colSpan={5}>TOTAL</td>
              <td style={{ ...styles.tdCenter, color: COLORS.teal }}>119,161</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}