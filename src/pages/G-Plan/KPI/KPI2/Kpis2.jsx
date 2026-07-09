import React, { useState, useEffect } from "react";
import { COLORS, styles } from "../components/kpi";
import { LineBarChart } from "../components/charts";
import { MaintenanceService } from "../../../../services/KpiData";

export default function Page2({ selectedMonth = "Avril 2026" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        setLoading(true);
        const result = await MaintenanceService.getExecutionMaintenanceDCP(selectedMonth);
        setData(result);
      } catch (error) {
        console.error("Erreur chargement Page 2:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaintenanceData();
  }, [selectedMonth]);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Chargement des indicateurs DCP...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: "center" }}>Aucune donnée disponible.</div>;

  const { tableData, totals } = data;

  // Extraction dynamique des données pour le composant graphique (sans la ligne globale)
  const chartItems = tableData.slice(0, -1);
  const chartData = {
    labels: chartItems.map(row => row[0]),
    bars: {
      budget: chartItems.map(row => row[1]),
      actual: chartItems.map(row => row[2])
    },
    line: chartItems.map(row => row[3])
  };

  return (
    <div className="print-area" style={styles.page}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Exécution des activités de maintenance DCP vs plannings de référence</div>
        <span style={styles.pill}>{selectedMonth}</span>
      </div>

      {/* Cartes KPI Dynamiques */}
      <div style={styles.kpiGrid}>
        {[
          { val: `${totals.mtdPct}%`, label: "Taux de réalisation (MTD)", sub: "Ajusté ce mois", color: COLORS.blue },
          { val: totals.mtdActual.toLocaleString(), label: "Activités MTD", sub: `/ ${totals.mtdBudget} planifiées`, color: COLORS.text },
          { val: totals.ytdActual.toLocaleString(), label: "Activités YTD", sub: `/ ${totals.ytdBudget} planifiées`, color: COLORS.text },
          { val: `${totals.ytdPct}%`, label: "Taux de réalisation (YTD)", sub: "Cumulé annuel", color: COLORS.green },
        ].map((k, i) => (
          <div key={i} style={styles.kpiCard(k.color)}>
            <div style={styles.kpiVal(k.color)}>{k.val}</div>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={styles.row2}>
        {/* Tableau d'exécution de la maintenance */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Maintenance Execution Status (Nber of Activity)</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}></th>
                <th style={{ ...styles.th, textAlign: "center" }} colSpan={3}>MTD {selectedMonth.split(" ")[0]}</th>
                <th style={{ ...styles.th, textAlign: "center" }} colSpan={3}>YTD {selectedMonth.split(" ")[0]}</th>
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

        {/* Graphique d'analyse */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Activités MTD {selectedMonth}</div>
          
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
            ↓ Taux de réalisation global basé sur le volume d'activité : {totals.mtdPct}% pour le mois ciblé.
          </div>
        </div>
      </div>

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
        }
      `}</style>
    </div>
  );
}