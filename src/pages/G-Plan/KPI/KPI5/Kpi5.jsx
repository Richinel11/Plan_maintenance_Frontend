import React from 'react';

export default function Page5({ styles, COLORS, BarChart }) {
  const tableData = [
    ["POSTE DE AKOMBE, RAME - 20kV", 0, 1, 0, 0],
    ["POSTE SOURCE DE NGAOUNDERE, RAME 15kV", 0, 1, 0, 0],
    ["POSTE, LIBRE MILE 3, RAME 30kV", 0, 1, 0, 0],
    ["POSTE NGAOUNDAMBA, RAME 15kV", 0, 1, 0, 0],
    ["POSTE AKWA, RAME 15kV et 30kV", 0, 1, 0, 0],
    ["POSTE DE NOMAILAYO, RAME 30kV", 0, 1, 0, 0],
    ["POSTE DE MBALMAYO, RAME 30kV", 0, 5, 1, 0],
  ];

  const barData = {
    labels: ["AKOMBE", "NGAOUN.", "LIBRE MILE", "NGOUND.", "AKWA", "NOMAILY.", "MBALMAYO"],
    datasets: [
      { label: "Planifié", color: COLORS.barBlue, data: [0, 0, 0, 0, 0, 0, 0] },
      { label: "Exécuté", color: COLORS.barGreen, data: [1, 1, 1, 1, 1, 1, 5] },
    ],
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Exécution des activités de maintenance DISTRIBUTION – POSTE SOURCE</div>
        <span style={styles.pill}>Avril 2026</span>
      </div>
      <div style={styles.row2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Ouvrage GRD</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ouvrage GRD</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Planifié (référence)</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Exécuté</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Alignement Trc. distribution</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Alignement Trc. Distr. Lignes</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? COLORS.white : "#fafafa" }}>
                  <td style={{ ...styles.td, fontSize: 10 }}>{row[0]}</td>
                  {row.slice(1).map((cell, j) => <td key={j} style={styles.tdCenter}>{cell}</td>)}
                </tr>
              ))}
              <tr style={{ background: "#f0f7ff", fontWeight: 700 }}>
                <td style={styles.td}>TOTAL</td>
                <td style={styles.tdCenter}>5</td>
                <td style={styles.tdCenter}>11</td>
                <td style={styles.tdCenter}>1</td>
                <td style={styles.tdCenter}>0</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 12, padding: "8px 10px", background: "#f0f7ff", borderRadius: 6, fontSize: 11, color: COLORS.textMuted }}>
            • Travaux d'entretien sur la Rame 15 KV – NGAOUNDERE exécutés en alignement avec les travaux TRANSPORT sur la Travée TFO 110/15 kV de Ngaoundere.
          </div>
        </div>
        <div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Exécution planning poste source</div>
            <BarChart data={barData} height={160} />
            <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
              {[
                { c: COLORS.barBlue, l: "Planifié (réf.)" },
                { c: COLORS.barGreen, l: "Exécuté" },
                { c: COLORS.barOrange, l: "Align. Trc transport" },
                { c: COLORS.barPurple, l: "Align. Trc Distr. Lignes" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: COLORS.textMuted }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: item.c }} />
                  {item.l}
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...styles.kpiGrid, gridTemplateColumns: "repeat(3, 1fr)", marginTop: 0 }}>
            <div style={styles.kpiCard(COLORS.red)}>
              <div style={styles.kpiVal(COLORS.red)}>0%</div>
              <div style={styles.kpiLabel}>Taux de conformité</div>
            </div>
            <div style={styles.kpiCard(COLORS.blue)}>
              <div style={styles.kpiVal(COLORS.blue)}>100%</div>
              <div style={styles.kpiLabel}>Taux de réalisation</div>
            </div>
            <div style={styles.kpiCard(COLORS.amber)}>
              <div style={styles.kpiVal(COLORS.amber)}>33%</div>
              <div style={styles.kpiLabel}>Taux d'alignement</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}