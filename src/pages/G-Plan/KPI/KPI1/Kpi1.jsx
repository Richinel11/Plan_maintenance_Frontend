import React, { useState, useEffect } from "react";
import { DonutChart } from "../components/charts";
import { MaintenanceService } from "../../../../services/KpiData";

export default function Page1({ selectedMonth = "Avril 2026", styles, COLORS }) {
  const [data, setData] = useState(null);
  const [harmonises, setHarmonises] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [resume, harmo] = await Promise.all([
          MaintenanceService.getKpiResume(selectedMonth),
          MaintenanceService.getTravauxHarmonises(selectedMonth),
        ]);
        setData(resume);
        setHarmonises(harmo);
      } catch (err) {
        console.error("Erreur de chargement des KPI travaux", err);
        setError("Impossible de charger les indicateurs.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedMonth]);

  if (loading) return <div style={{ padding: 20 }}>Chargement des indicateurs...</div>;
  if (error) return <div style={{ padding: 20, color: COLORS.red }}>{error}</div>;
  if (!data) return <div style={{ padding: 20 }}>Aucune donnée disponible</div>;

  const total = data.total || 0;
  const totalHarmonises = harmonises?.total_harmonises ?? 0;
  const tauxExecution = total > 0 ? Math.round((data.executes / total) * 100) : 0;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Vue d'ensemble des travaux</div>
        <span style={styles.pill}>{selectedMonth}</span>
      </div>

      <div style={{ ...styles.kpiGrid, gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div style={styles.kpiCard(COLORS.blue)}>
          <div style={styles.kpiVal(COLORS.blue)}>{data.programmes}</div>
          <div style={styles.kpiLabel}>Travaux programmés</div>
        </div>
        <div style={styles.kpiCard(COLORS.green)}>
          <div style={styles.kpiVal(COLORS.green)}>{data.executes}</div>
          <div style={styles.kpiLabel}>Travaux exécutés</div>
        </div>
        <div style={styles.kpiCard(COLORS.red)}>
          <div style={styles.kpiVal(COLORS.red)}>{data.non_executes}</div>
          <div style={styles.kpiLabel}>Travaux non exécutés</div>
        </div>
        <div style={styles.kpiCard(COLORS.purple)}>
          <div style={styles.kpiVal(COLORS.purple)}>{totalHarmonises}</div>
          <div style={styles.kpiLabel}>Travaux harmonisés</div>
        </div>
      </div>

      <div style={styles.row2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Taux d'exécution</div>
          <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
            <DonutChart pct={tauxExecution} color={COLORS.green} label="Travaux exécutés" />
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Répartition des travaux</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Catégorie</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Nombre</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>Programmés</td>
                <td style={styles.tdCenter}>{data.programmes}</td>
              </tr>
              <tr style={{ background: "#f8fafc" }}>
                <td style={styles.td}>Exécutés</td>
                <td style={styles.tdCenter}>{data.executes}</td>
              </tr>
              <tr>
                <td style={styles.td}>Non exécutés</td>
                <td style={styles.tdCenter}>{data.non_executes}</td>
              </tr>
              <tr style={{ background: "#f8fafc" }}>
                <td style={styles.td}>Harmonisés</td>
                <td style={styles.tdCenter}>{totalHarmonises}</td>
              </tr>
              <tr>
                <td style={{ ...styles.td, fontWeight: 600 }}>Total travaux</td>
                <td style={{ ...styles.tdCenter, fontWeight: 600 }}>{total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
