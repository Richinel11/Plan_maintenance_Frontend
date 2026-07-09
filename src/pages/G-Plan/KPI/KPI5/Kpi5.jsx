import React, { useState, useEffect } from 'react';
import { MaintenanceService } from '../../../../services/KpiData';
import { BarChart } from "../components/charts"; // Ajustez le chemin relatif si nécessaire
export default function Page5({ styles, COLORS, selectedMonth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await MaintenanceService.getDistributionPosteData(selectedMonth);
        setData(result);
      } catch (err) {
        console.error("Erreur de chargement de la Page 5:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth]);

  if (loading) return <div style={{ padding: 20 }}>Chargement de la maintenance Distribution...</div>;
  if (!data) return <div style={{ padding: 20 }}>Aucune donnée disponible.</div>;

  const barData = {
    labels: data.chartData.labels,
    datasets: [
      { label: "Planifié", color: COLORS.barBlue || "#1B75BB", data: data.chartData.pData },
      { label: "Exécuté", color: COLORS.barGreen || "#2E7D32", data: data.chartData.eData },
    ],
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Exécution des activités de maintenance DISTRIBUTION – POSTE SOURCE</div>
        <span style={styles.pill}>{selectedMonth}</span>
      </div>
      <div style={styles.row2}>
        
        {/* Tableau de gauche */}
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
              {data.tableData.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? COLORS.white : "#fafafa" }}>
                  <td style={{ ...styles.td, fontSize: 10 }}>{row[0]}</td>
                  <td style={styles.tdCenter}>{row[1]}</td>
                  <td style={styles.tdCenter}>{row[2]}</td>
                  <td style={styles.tdCenter}>{row[3]}</td>
                  <td style={styles.tdCenter}>{row[4]}</td>
                </tr>
              ))}
              <tr style={{ background: "#f0f7ff", fontWeight: 700 }}>
                <td style={styles.td}>TOTAL</td>
                <td style={styles.tdCenter}>{data.totals.planifie}</td>
                <td style={styles.tdCenter}>{data.totals.execute}</td>
                <td style={styles.tdCenter}>{data.totals.alignPoste}</td>
                <td style={styles.tdCenter}>{data.totals.alignLigne}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 12, padding: "8px 10px", background: "#f0f7ff", borderRadius: 6, fontSize: 11, color: COLORS.textMuted }}>
            • Travaux d'entretien sur les postes sources exécutés en alignement technique selon le planning d'arrêt coordonné.
          </div>
        </div>

        {/* Graphique et KPIs à droite */}
        <div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Exécution planning poste source</div>
            <BarChart data={barData} height={160} />
            <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
              {[
                { c: COLORS.barBlue, l: "Planifié (réf.)" },
                { c: COLORS.barGreen, l: "Exécuté" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: COLORS.textMuted }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: item.c }} />
                  {item.l}
                </div>
              ))}
            </div>
          </div>
          
          {/* Cartes KPI */}
          <div style={{ ...styles.kpiGrid, gridTemplateColumns: "repeat(3, 1fr)", marginTop: 0 }}>
            <div style={styles.kpiCard(data.kpis.conformite === 0 ? COLORS.red : COLORS.green)}>
              <div style={styles.kpiVal(data.kpis.conformite === 0 ? COLORS.red : COLORS.green)}>{data.kpis.conformite}%</div>
              <div style={styles.kpiLabel}>Taux de conformité</div>
            </div>
            <div style={styles.kpiCard(COLORS.blue)}>
              <div style={styles.kpiVal(COLORS.blue)}>{data.kpis.realisation}%</div>
              <div style={styles.kpiLabel}>Taux de réalisation</div>
            </div>
            <div style={styles.kpiCard(COLORS.amber)}>
              <div style={styles.kpiVal(COLORS.amber)}>{data.kpis.alignement}%</div>
              <div style={styles.kpiLabel}>Taux d'alignement</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}