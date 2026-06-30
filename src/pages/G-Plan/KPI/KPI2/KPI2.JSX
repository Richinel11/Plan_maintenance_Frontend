import React from "react";
import { COLORS, styles } from "../components/kpi";
// import { LineBarChart } from "../components/charts";
// 
// ─── PAGE 2: Exécution des activités de maintenance DCP ───────────────────────
export default function Page2({ selectedMonth = "Avril 2026" }) {
  const tableData = [
    ["SONGLOULOU", 111, 111, 100, 566, 566, 100],
    ["EDEA", 67, 56, 84, 314, 296, 94],
    ["LAGDO", 104, 75, 72, 367, 347, 90],
    ["THERMAL GRID", 421, 416, 99, 1671, 1592, 95],
    ["REMOTES", 500, 484, 97, 1810, 1693, 94],
    ["HYBRIDS", 66, 57, 82, 224, 194, 87],
    ["GLOBAL GENERATION", 1269, 1199, 94.48, 4952, 4673, 94.37],
  ];

  const chartData = {
    labels: ["SONGLOULOU", "EDEA", "LAGDO", "THERMAL", "REMOTES", "HYBRIDS"],
    bars: { budget: [111, 67, 104, 421, 500, 66], actual: [111, 56, 75, 416, 484, 57] },
    line: [100, 84, 72, 99, 97, 82],
  };

  return (
    <div className="print-area" style={styles.page}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Exécution des activités de maintenance DCP vs plannings de référence</div>
        <span style={styles.pill}>{selectedMonth}</span>
      </div>

      <div style={styles.kpiGrid}>
        {[
          { val: "94,48%", label: "Taux de réalisation (MTD)", sub: "vs Mars 96,61% ↓", color: COLORS.blue },
          { val: "1 199", label: "Activités MTD", sub: "/ 1 269 planifiées", color: COLORS.text },
          { val: "4 673", label: "Activités YTD", sub: "/ 4 952 planifiées", color: COLORS.text },
          { val: "94,37%", label: "Taux de réalisation (YTD)", sub: "vs Mars 95,00% ↓", color: COLORS.green },
        ].map((k, i) => (
          <div key={i} style={styles.kpiCard(k.color)}>
            <div style={styles.kpiVal(k.color)}>{k.val}</div>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={styles.row2}>
        {/* Left Card - Table */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Maintenance Execution Status (Nber of Activity)</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}></th>
                <th style={{ ...styles.th, textAlign: "center" }} colSpan={3}>MTD Avril</th>
                <th style={{ ...styles.th, textAlign: "center" }} colSpan={3}>YTD Avril</th>
              </tr>
              <tr>
                <th style={styles.th}></th>
                <th style={{ ...styles.th, textAlign: "center" }}>Budget</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Actual</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Compl.%</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Budget</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Actual</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Compl.%</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(([name, mb, ma, mc, yb, ya, yc], i) => (
                <tr 
                  key={i} 
                  style={{ 
                    background: i === tableData.length - 1 ? "#f0f7ff" : i % 2 === 0 ? COLORS.white : "#fafafa",
                    fontWeight: i === tableData.length - 1 ? 700 : 400 
                  }}
                >
                  <td style={styles.td}>{name}</td>
                  <td style={styles.tdCenter}>{mb}</td>
                  <td style={styles.tdCenter}>{ma}</td>
                  <td style={styles.tdCenter}>
                    <span style={styles.badge(mc >= 95 ? COLORS.teal : mc >= 80 ? COLORS.amber : COLORS.red, 
                                             mc >= 95 ? COLORS.tealLight : mc >= 80 ? COLORS.amberLight : COLORS.redLight)}>
                      {mc}%
                    </span>
                  </td>
                  <td style={styles.tdCenter}>{yb}</td>
                  <td style={styles.tdCenter}>{ya}</td>
                  <td style={styles.tdCenter}>
                    <span style={styles.badge(yc >= 95 ? COLORS.teal : COLORS.amber, yc >= 95 ? COLORS.tealLight : COLORS.amberLight)}>
                      {yc}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Card - Chart */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Activités MTD Avril 2026</div>
          
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            {[
              { c: COLORS.barBlue, l: "Budget" }, 
              { c: COLORS.barGreen, l: "Actual" }, 
              { c: COLORS.red, l: "Compl. rate (%)" }
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: COLORS.textMuted }}>
                <div style={{ width: 12, height: i === 2 ? 2 : 12, borderRadius: i === 2 ? 0 : 3, background: item.c }} />
                {item.l}
              </div>
            ))}
          </div>

          <div style={{ width: "100%", height: "220px", marginBottom: 12 }}>
            <LineBarChart data={chartData} height={220} />
          </div>

          <div style={{ padding: "10px", background: "#fff8e1", borderRadius: 6, fontSize: 11, color: COLORS.amber }}>
            ↓ Taux de réalisation des travaux en fonction du Nombre d'activités : 94,48%, en baisse par rapport à mars 2026 (96,61%)
          </div>
        </div>
      </div>

      {/* Print-specific styles for this page */}
      <style>{`
        @media print {
          .print-area, .print-area * {
            visibility: visible !important;
          }
          
          ${styles.card} {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 25px !important;
          }
          
          canvas, svg {
            max-width: 100% !important;
            height: auto !important;
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}