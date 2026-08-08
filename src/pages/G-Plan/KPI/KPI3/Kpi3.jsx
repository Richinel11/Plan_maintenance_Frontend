import React, { useState, useEffect } from 'react';
import { DonutChart } from '../components/charts';
import { MaintenanceService } from '../../../../services/KpiData';

export default function Page3({ styles, COLORS, selectedMonth }) {
  const [parOuvrage, setParOuvrage] = useState(null);
  const [ippInterne, setIppInterne] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [ouvrage, ipp] = await Promise.all([
          MaintenanceService.getTravauxParOuvrage(selectedMonth),
          MaintenanceService.getCentralesIppInterne(selectedMonth),
        ]);
        setParOuvrage(ouvrage);
        setIppInterne(ipp);
      } catch (err) {
        console.error("Erreur lors de la récupération des KPI ouvrage/IPP:", err);
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  if (loading) return <div style={{ padding: 20 }}>Chargement des données...</div>;
  if (error) return <div style={{ padding: 20, color: COLORS.red }}>{error}</div>;
  if (!parOuvrage || !ippInterne) return <div style={{ padding: 20 }}>Aucune donnée disponible</div>;

  const totalCentrales = ippInterne.total || 0;
  const pctIpp = totalCentrales > 0 ? Math.round((ippInterne.ipp / totalCentrales) * 100) : 0;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Travaux par ouvrage & centrales IPP / internes</div>
        <span style={styles.pill}>{selectedMonth}</span>
      </div>

      <div style={styles.row2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Travaux programmés par ouvrage</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ouvrage</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Travaux</th>
              </tr>
            </thead>
            <tbody>
              {parOuvrage.par_ouvrage.length === 0 ? (
                <tr>
                  <td colSpan="2" style={{ ...styles.td, textAlign: "center", color: COLORS.textMuted, padding: "20px" }}>
                    Aucune donnée disponible
                  </td>
                </tr>
              ) : (
                parOuvrage.par_ouvrage.map((o, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? COLORS.white : "#f8fafc" }}>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{o.ouvrage}</td>
                    <td style={styles.tdCenter}>{o.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Centrales thermiques : IPP vs interne</div>
          <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
            <DonutChart pct={pctIpp} color={COLORS.amber} label="Part IPP" />
          </div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={styles.td}>Centrales internes (ENEO)</td>
                <td style={styles.tdCenter}>{ippInterne.interne}</td>
              </tr>
              <tr style={{ background: "#f8fafc" }}>
                <td style={styles.td}>Centrales IPP</td>
                <td style={styles.tdCenter}>{ippInterne.ipp}</td>
              </tr>
              {ippInterne.non_renseigne > 0 && (
                <tr>
                  <td style={styles.td}>Non renseigné</td>
                  <td style={styles.tdCenter}>{ippInterne.non_renseigne}</td>
                </tr>
              )}
              <tr style={{ background: "#f8fafc" }}>
                <td style={{ ...styles.td, fontWeight: 600 }}>Total travaux Production</td>
                <td style={{ ...styles.tdCenter, fontWeight: 600 }}>{totalCentrales}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
