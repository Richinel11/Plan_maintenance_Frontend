import React, { useState, useEffect } from 'react';
import { MaintenanceService } from '../../../../services/KpiData'; // Ajustez le chemin d'accès

export default function Page3({ styles, COLORS, BarChart, selectedMonth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const barData = {
    labels: data?.chartData?.labels || [],
    datasets: [
      { 
        label: "Puiss. Moy. Disponible", 
        color: COLORS.barBlue, 
        data: data?.chartData?.disponible || [] 
      },
      // ...
    ],
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await MaintenanceService.getDispoIPPs();
        setData(result);
      } catch (err) {
        console.error("Erreur lors de la récupération des IPPs:", err);
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
   }, []);

  if (loading) return <div style={{ padding: 20 }}>Chargement des données IPP...</div>;
  if (error) return <div style={{ padding: 20, color: COLORS.red }}>{error}</div>;
  if (!data) return <div style={{ padding: 20 }}>Aucune donnée disponible</div>;
  // Formatage des données pour le composant BarChart à partir du backend
  // const barData = {
  //   labels: data.chartData.labels, // ex: ["KPOC", "OPDC", "NHPC"]
  //   datasets: [
  //     { label: "Puiss. Moy. Disponible", color: COLORS.barBlue, data: data.chartData.disponible },
  //     { label: "Puiss. Moy. Planifiée", color: COLORS.barGreen, data: data.chartData.planifie },
  //     { label: "Puiss. Moy. Sollicitée", color: COLORS.barPurple, data: data.chartData.sollicite },
  //   ],
  // };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Disponibilité des IPPs</div>
        <span style={styles.pill}>{selectedMonth}</span>
      </div>
      
      <div style={{ ...styles.kpiGrid, gridTemplateColumns: "repeat(4, 1fr)" }}>
        {data.kpis.map((k, i) => (
          <div key={i} style={styles.kpiCard(k.color || COLORS.blue)}>
            <div style={styles.kpiVal(k.color || COLORS.blue)}>{k.val}</div>
            <div style={styles.kpiLabel}>{k.label}</div>
            {k.sub && <div style={styles.kpiSub}>{k.sub}</div>}
          </div>
        ))}
      </div>

      <div style={styles.row2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Puissance (MW)</div>
          <BarChart data={barData} height={180} />
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Maintenance en cours / réalisée</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>IPP</th>
                <th style={styles.th}>Type maintenance</th>
                <th style={styles.th}>Période</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Disponibilité mécanique</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Puissance horaire max sollicitée</th>
              </tr>
            </thead>
            <tbody>
              {data.maintenances.map((m, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? COLORS.white : "#fafafa" }}>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{m.ipp}</td>
                  <td style={styles.td}>{m.type}</td>
                  <td style={styles.td}>{m.periode}</td>
                  <td style={styles.tdCenter}>{m.dispo_meca}</td>
                  <td style={styles.tdCenter}>{m.puissance_max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}