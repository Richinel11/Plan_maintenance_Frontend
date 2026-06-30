import React from 'react';

export default function Page6({ styles, COLORS, MiniBar, BarChart }) {
  const regData = [
    ["DRD", 32, 4, 9, 5, "12,5%"],
    ["DRY", 45, 26, 8, 37, "57,7%"],
    ["DRNEA", 46, 9, 2, 27, "19,56%"],
    ["DRONO", 20, 6, 3, 0, "30%"],
    ["DRSOM", 27, 0, 9, 10, "7,4%"],
    ["DRSANO", 6, 0, 0, 2, ""],
    ["DRC", 221, 95, 10, 26, "43%"],
    ["DRE", 33, 0, 3, 2, ""],
    ["TOTAL", 397, 142, 41, 79, "28,36%"],
  ];
  const barBudget = [32, 45, 46, 20, 27, 6, 221, 33];
  const barActual = [4, 26, 9, 6, 0, 0, 95, 0];
  const compliance = [12.5, 57.7, 19.56, 30, 7.4, 0, 43, 0];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Exécution des activités de maintenance DISTRIBUTION – RÉSEAU</div>
        <span style={styles.pill}>Avril 2026</span>
      </div>
      <div style={{ ...styles.kpiGrid, gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div style={styles.kpiCard(COLORS.amber)}>
          <div style={styles.kpiVal(COLORS.amber)}>28,36%</div>
          <div style={styles.kpiLabel}>Taux de conformité moyen</div>
          <div style={styles.kpiSub}>vs Mars 26,1% ↑</div>
        </div>
        <div style={styles.kpiCard(COLORS.red)}>
          <div style={styles.kpiVal(COLORS.red)}>9,38%</div>
          <div style={styles.kpiLabel}>Réalisation des travaux</div>
          <div style={styles.kpiSub}>+ 100% ↓</div>
        </div>
        <div style={styles.kpiCard(COLORS.blue)}>
          <div style={styles.kpiVal(COLORS.blue)}>8 / 9</div>
          <div style={styles.kpiLabel}>Régions concernées</div>
        </div>
      </div>
      <div style={styles.row2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Performance par région</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Région</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Travaux planifiés</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Travaux annoncés et exécutés</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Exécutés et non planifiés</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Non planifiés</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Taux de conformité</th>
              </tr>
            </thead>
            <tbody>
              {regData.map((row, i) => (
                <tr key={i} style={{ background: i === regData.length - 1 ? "#f0f7ff" : i % 2 === 0 ? COLORS.white : "#fafafa", fontWeight: i === regData.length - 1 ? 700 : 400 }}>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{row[0]}</td>
                  {row.slice(1, 5).map((cell, j) => <td key={j} style={styles.tdCenter}>{cell}</td>)}
                  <td style={styles.tdCenter}>{row[5] && <MiniBar value={parseFloat(row[5].replace(',', '.')) || 0} max={100} color={parseFloat(row[5].replace(',', '.')) > 30 ? COLORS.green : COLORS.amber} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Travaux annoncés vs exécutés</div>
            <BarChart data={{ labels: ["DRD", "DRY", "DRNEA", "DRONO", "DRSOM", "DRSANO", "DRC", "DRE"], datasets: [{ label: "Annoncés", color: COLORS.barBlue, data: barBudget }, { label: "Exécutés", color: COLORS.barGreen, data: barActual }] }} height={120} />
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Taux de conformité (%)</div>
            <BarChart data={{ labels: ["DRD", "DRY", "DRNEA", "DRONO", "DRSOM", "DRSANO", "DRC", "DRE"], datasets: [{ label: "Conformité", color: COLORS.barOrange, data: compliance }] }} height={100} />
          </div>
        </div>
      </div>
    </div>
  );
}