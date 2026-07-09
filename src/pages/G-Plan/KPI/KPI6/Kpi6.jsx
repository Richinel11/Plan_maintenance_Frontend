import React, { useState, useEffect } from 'react';
import { MaintenanceService } from '../../../../services/KpiData';
import { BarChart, MiniBar } from "../components/charts"; // Ajustez le chemin relatif si nécessaire
export default function Page6({ styles, COLORS, selectedMonth }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await MaintenanceService.getDistributionReseauData(selectedMonth);
        setData(result);
      } catch (err) {
        console.error("Erreur de chargement de la Page 6:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth]);

  if (loading) return <div style={{ padding: 20 }}>Chargement de l'analyse régionale Réseau...</div>;
  if (!data) return <div style={{ padding: 20 }}>Aucune donnée disponible.</div>;

  const regionsLabels = ["DRD", "DRY", "DRNEA", "DRONO", "DRSOM", "DRSANO", "DRC", "DRE"];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Exécution des activités de maintenance DISTRIBUTION – RÉSEAU</div>
        <span style={styles.pill}>{selectedMonth}</span>
      </div>

      {/* Cartes KPI */}
      <div style={{ ...styles.kpiGrid, gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div style={styles.kpiCard(COLORS.amber)}>
          <div style={styles.kpiVal(COLORS.amber)}>{data.kpis.conformite}</div>
          <div style={styles.kpiLabel}>Taux de conformité moyen</div>
          <div style={styles.kpiSub}>vs Mois Précédent ↑</div>
        </div>
        <div style={styles.kpiCard(COLORS.green)}>
          <div style={styles.kpiVal(COLORS.green)}>{data.kpis.realisation}</div>
          <div style={styles.kpiLabel}>Réalisation des travaux</div>
          <div style={styles.kpiSub}>Global cumulé</div>
        </div>
        <div style={styles.kpiCard(COLORS.blue)}>
          <div style={styles.kpiVal(COLORS.blue)}>{data.kpis.regionsActives}</div>
          <div style={styles.kpiLabel}>Régions concernées</div>
        </div>
      </div>

      <div style={styles.row2}>
        {/* Tableau de performance */}
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
              {data.regData.map((row, i) => {
                const estDerniereLigne = i === data.regData.length - 1;
                return (
                  <tr key={i} style={{ 
                    background: estDerniereLigne ? "#f0f7ff" : i % 2 === 0 ? COLORS.white : "#fafafa", 
                    fontWeight: estDerniereLigne ? 700 : 400 
                  }}>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{row[0]}</td>
                    <td style={styles.tdCenter}>{row[1]}</td>
                    <td style={styles.tdCenter}>{row[2]}</td>
                    <td style={styles.tdCenter}>{row[3]}</td>
                    <td style={styles.tdCenter}>{row[4]}</td>
                    <td style={styles.tdCenter}>
                      {row[5] && !estDerniereLigne ? (
                        <MiniBar 
                          value={parseFloat(row[5].replace('%', '')) || 0} 
                          max={100} 
                          color={parseFloat(row[5].replace('%', '')) > 30 ? COLORS.green : COLORS.amber} 
                        />
                      ) : (
                        <span style={{ fontWeight: 700 }}>{row[5]}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Graphiques à droite */}
        <div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Travaux annoncés vs exécutés</div>
            <BarChart data={{ 
              labels: regionsLabels, 
              datasets: [
                { label: "Annoncés", color: COLORS.barBlue, data: data.barBudget }, 
                { label: "Exécutés", color: COLORS.barGreen, data: data.barActual }
              ] 
            }} height={120} />
          </div>
          
          <div style={styles.card}>
            <div style={styles.cardTitle}>Taux de conformité (%)</div>
            <BarChart data={{ 
              labels: regionsLabels, 
              datasets: [
                { label: "Conformité", color: COLORS.barOrange, data: data.compliance }
              ] 
            }} height={100} />
          </div>
        </div>

      </div>
    </div>
  );
}