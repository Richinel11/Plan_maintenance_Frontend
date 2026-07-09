import React, { useState, useEffect } from 'react';
import { MaintenanceService } from '../../../../services/KpiData';
import { BarChart } from "../components/charts"; // Ajustez le chemin relatif si nécessaire

export default function Page4({ styles, COLORS, selectedMonth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await MaintenanceService.getTransportData(selectedMonth);
        setData(result);
      } catch (err) {
        console.error("Erreur Page 4:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth]);

  if (loading) return <div style={{ padding: 20 }}>Chargement des indicateurs Réseau Transport...</div>;
  if (!data) return <div style={{ padding: 20 }}>Aucune donnée disponible</div>;

  // Agrégation dynamique pour le graphique en colonnes
  const barData = {
    labels: ["Planifié", "Exécuté", "Alig. Poste", "Alig. Ligne"],
    datasets: [
      { 
        label: "Indicateurs", 
        color: COLORS.barBlue || "#1B75BB", 
        data: [data.totals.planifie, data.totals.execute, data.totals.alignPoste, data.totals.alignLigne] 
      },
    ],
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Exécution des activités de maintenance TRANSPORT vs plannings de référence</div>
        <span style={styles.pill}>{selectedMonth}</span>
      </div>

      {/* Cartes KPI supérieures */}
      <div style={{ ...styles.kpiGrid, gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { val: data.kpis.conformite, label: "Taux de conformité", sub: "au planning de réf. annuel", color: COLORS.amber },
          { val: data.kpis.realisation, label: "Taux de réalisation", sub: "des travaux programmés", color: COLORS.green },
          { val: data.kpis.alignement, label: "Taux d'alignement", sub: "TRANSPORT-DISTRIBUTION", color: COLORS.blue },
        ].map((k, i) => (
          <div key={i} style={styles.kpiCard(k.color)}>
            <div style={styles.kpiVal(k.color)}>{k.val}</div>
            <div style={styles.kpiLabel}>{k.label}</div>
            <div style={styles.kpiSub}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={styles.row2}>
        {/* Tableau Réseau */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Détail des ouvrages</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ouvrage GRT</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Planifié</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Exécuté</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Alignement Tr. dist. Poste</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Alignement Tr. Distr. Ligne</th>
              </tr>
            </thead>
            <tbody>
              {data.tableData.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? COLORS.white : "#fafafa", borderBottom: "1px solid #eee" }}>
                  <td style={{ ...styles.td, fontSize: 10, fontWeight: 500 }}>{row[0]}</td>
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
        </div>

        {/* Bloc Droite: Graphe + Observations */}
        <div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Exécution planning transport</div>
            <BarChart data={barData} height={140} />
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {[
                { c: COLORS.barBlue, l: "Planifié (réf.)" },
                { c: COLORS.barGreen, l: "Exécuté" },
                { c: COLORS.barOrange, l: "Align. Tr. Poste" },
                { c: COLORS.barPurple, l: "Align. Tr. Ligne" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: item.c }} />
                  <span style={{ color: COLORS.textMuted }}>{item.l}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ fontSize: 11, color: COLORS.textMuted || "#718096", lineHeight: 1.7 }}>
              <p style={{ margin: "0 0 4px 0" }}>• <b>Taux de conformité</b> au planning de référence annuel : {data.kpis.conformite}.</p>
              <p style={{ margin: "0 0 4px 0" }}>• <b>Taux de réalisation</b> des travaux programmés : {data.kpis.realisation}.</p>
              <p style={{ margin: "0 0 4px 0" }}>• <b>Taux d'alignement</b> TRANSPORT DISTRIBUTION : {data.kpis.alignement}.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}