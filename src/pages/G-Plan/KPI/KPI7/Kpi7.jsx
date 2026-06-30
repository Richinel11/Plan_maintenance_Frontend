import React from 'react';

export default function Page7({ styles, COLORS }) {
  const tableData = [
    ["DRC", 95, 0, 0, 0.687, 0.144, 0.350, 0.046, "51%", "32%"],
    ["DRD", 9, 0, 0, 0.221, 0.080, 0.600, 0.120, "47%", "61%"],
    ["DRONO", 6, 0, 0, 0.324, 0.259, 0.070, 0.141, "23%", "54%"],
    ["DRSOM", 4, 1, 14, 0.451, 0.473, 0.015, 0.048, "3%", "10%"],
    ["DRE", 23, 0, 0, 0.070, 0.014, 0.067, 0.011, "96%", "81%"],
    ["DESANO", 6, 0, 0, 0.286, 0.051, 0.036, 0.009, "13%", "17%"],
    ["ENIED DIST", 168, 3, 1, 0.62, 0.23, 0.24, 0.08, "43%", "45%"],
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Impact des travaux programmés Distribution sur les KPI (SAIDI-SAIFI)</div>
        <span style={styles.pill}>Avril 2026</span>
      </div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Réalisations QDS - Impact TFOR au indicateurs (MTD Avril 2026)</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Région</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Nbre TFOR</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Nbre alignées</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Nbre alignées (récupérées)</th>
              <th style={{ ...styles.th, textAlign: "center" }}>SAIDI RECUEIL</th>
              <th style={{ ...styles.th, textAlign: "center" }}>SAIFI RECUEIL</th>
              <th style={{ ...styles.th, textAlign: "center" }}>SAIDI (ARSEL)</th>
              <th style={{ ...styles.th, textAlign: "center" }}>SAIFI (ARSEL)</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Taux clients &lt; 16h</th>
              <th style={{ ...styles.th, textAlign: "center" }}>Taux travaux &lt; 18h</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? COLORS.white : "#fafafa", fontWeight: i === tableData.length - 1 ? 700 : 400 }}>
                <td style={{ ...styles.td, fontWeight: 600 }}>{row[0]}</td>
                {row.slice(1).map((cell, j) => <td key={j} style={styles.tdCenter}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={styles.row3}>
        <div style={styles.kpiCard(COLORS.blue)}>
          <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 4 }}>Durée moyenne des travaux</div>
          <div style={styles.kpiVal(COLORS.blue)}>10h00</div>
          <div style={styles.kpiSub}>vs Mars 8h11 ↑</div>
        </div>
        <div style={styles.kpiCard(COLORS.amber)}>
          <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 4 }}>% de clients coupés heures</div>
          <div style={styles.kpiVal(COLORS.amber)}>67%</div>
          <div style={styles.kpiSub}>vs Mars 62% ↑</div>
        </div>
        <div style={styles.kpiCard(COLORS.green)}>
          <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 4 }}>Taux travaux &lt; 31h</div>
          <div style={styles.kpiVal(COLORS.green)}>31%</div>
        </div>
      </div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Constats principaux</div>
        {[
          "Toutes les interruptions pour travaux programmés ne sont pas saisies dans le journal des interruptions (JJI).",
          "Non-respect des délais réglementaires : 31% de travaux exécutés au-delà de 18h.",
          "Augmentation du taux de clients coupés heures impactant la qualité de service.",
          "Manque d'alignement aux grandes interruptions du système électrique.",
          "Dégradation de la durée moyenne d'exécution des travaux."
        ].map((txt, i) => (
          <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.textMuted }}>
            <span style={{ color: COLORS.red, fontWeight: 700 }}>⚠</span> {txt}
          </div>
        ))}
      </div>
    </div>
  );
}