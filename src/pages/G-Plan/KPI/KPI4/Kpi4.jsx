import React from 'react';

export default function Page4({ styles, COLORS, BarChart }) {
  const tableData = [
    ["Ligne TFO kV Lajili – Ganua N°1", 0, 1, 0, 0, 16],
    ["Jeu de barre 90 kV à BONABERI", 0, 1, 0, 2, ""],
    ["TRAVEE 90kV DOUANIERS, POSTE DE BEKHO", 0, 1, 0, 1, ""],
    ["BARC DE CONDENSATEURS 90kV, POSTE DE BEKHO", 0, 1, 1, 0, ""],
    ["TRAVEE 225kV LOGBABA, POSTE DE BEKHO", 0, 1, 0, 0, ""],
  ];

  const barData = {
    labels: ["Planifié", "Exécuté", "Alig. Tr. dist.", "Alig. Tr. Dist. Ligne"],
    datasets: [
      { label: "Values", color: COLORS.barBlue, data: [7, 11, 1, 4] },
    ],
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Exécution des activités de maintenance TRANSPORT vs plannings de référence</div>
        <span style={styles.pill}>Avril 2026</span>
      </div>
      <div style={{ ...styles.kpiGrid, gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { val: "28,5%", label: "Conformité au planning", sub: "vs Mars 4% ↑", color: COLORS.amber },
          { val: "157%", label: "Réalisation des travaux", sub: "vs Mars 99% ↑", color: COLORS.green },
          { val: "45,4%", label: "Alignement Transport-Distribution", sub: "", color: COLORS.blue },
        ].map((k, i) => (
          <div key={i} style={styles.kpiCard(k.color)}>
            <div style={styles.kpiVal(k.color)}>{k.val}</div>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={styles.row2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Détail des ouvrages</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ouvrage ORT</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Planifié</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Exécuté</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Alignement Tr. dist. Poste</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Alignement Tr. Distr. Ligne</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Exécution planning transport</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? COLORS.white : "#fafafa" }}>
                  {row.map((cell, j) => (
                    <td key={j} style={j === 0 ? { ...styles.td, fontSize: 10 } : styles.tdCenter}>{cell}</td>
                  ))}
                </tr>
              ))}
              <tr style={{ background: "#f0f7ff", fontWeight: 700 }}>
                <td style={styles.td}>TOTAL</td>
                <td style={styles.tdCenter}>07</td>
                <td style={styles.tdCenter}>11</td>
                <td style={styles.tdCenter}>1</td>
                <td style={styles.tdCenter}>4</td>
                <td style={styles.tdCenter}></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Exécution planning transport</div>
            <BarChart data={barData} height={140} />
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              {[
                { c: COLORS.barBlue, l: "Planifié (réf.)" },
                { c: COLORS.barGreen, l: "Exécuté" },
                { c: COLORS.barOrange, l: "Align. Tr. distr. Poste" },
                { c: COLORS.barPurple, l: "Align. Tr. Distr. Ligne" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: COLORS.textMuted }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: item.c }} />
                  {item.l}
                </div>
              ))}
            </div>
          </div>
          <div style={styles.card}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.7 }}>
              <p>• Taux de conformité au planning de référence annuel pour le mois d'Avril 2026 : 28,5% (amélioration par rapport à mars 2026 : 4%).</p>
              <p>• Taux de réalisation des travaux programmés : 157%.</p>
              <p>• Taux d'alignement TRANSPORT DISTRIBUTION : 45,4%.</p>
              <p>• Les travaux Distribution ligne de BONABERI, MAROUA, NGAOUNDERE alignés aux retraits TRANSPORT.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}