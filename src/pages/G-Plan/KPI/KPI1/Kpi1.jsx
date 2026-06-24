import React, { useState, useEffect } from "react";
import { COLORS, styles } from "../components/kpi";
import { DonutChart } from "../components/charts"; // 🟢 Chemin corrigé sans extension .js pour éviter le bug de Vite
import { MaintenanceService } from "../../../../services/KpiData"; // Assurez-vous que le chemin est correct
export default function Page1({ selectedMonth = "Avril 2026" }) {
  // États dynamiques reliés au mois sélectionné
  const [secteurData, setSecteurData] = useState([]);
  const [segmentData, setSegmentData] = useState([]);
  const [donutPct, setDonutPct] = useState(65); // Taux par défaut ou dynamique
  const [loading, setLoading] = useState(false);

  // Déclenché automatiquement dès que l'utilisateur change de mois dans KpiResults
  useEffect(() => {
    const loadKpiData = async () => {
      try {
        setLoading(true);
        // Décommentez ceci dès que votre backend Django est prêt :
        const res = await MaintenanceService.getPlanningsSecteur(selectedMonth);
        setSecteurData(res.secteurs);
        setSegmentData(res.segments);
        setDonutPct(res.tauxDispo);
        
        console.log("Filtrage mis à jour pour la base de données :", selectedMonth);
      } catch (err) {
        console.error("Erreur de chargement du planning", err);
      } finally {
        setLoading(false);
      }
    };

    loadKpiData();
  }, [selectedMonth]); 

  if (loading) return <div style={{ padding: 20 }}>Mise à jour des indicateurs...</div>;

  return (
    <>
      <div style={styles.page}>
        <div style={styles.header}>
          <div style={styles.pageTitle}>Disponibilité des plannings du secteur</div>
        </div>

        {/* Print-only month */}
        <div 
          style={{ 
            marginBottom: "15px", 
            fontSize: "12px", 
            color: COLORS.textMuted, 
            display: "none" 
          }} 
          className="print-only"
        >
          Rapport de Maintenance — Période : {selectedMonth}
        </div>

        {/* Utilisation de styles.row2 qui bénéficie maintenant d'un grand espace (gap: 24px) */}
        <div style={styles.row2}>
          
          {/* Secteur Table */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Par Secteur ({selectedMonth})</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>SECTEUR</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>PLANNING ANNUEL</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>PLANNINGS MENSUELS</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>PROGRAMME HEBDOMADAIRE</th>
                  <th style={styles.th}>COMMENTAIRES</th>
                </tr>
              </thead>
              <tbody>
                {secteurData.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ ...styles.td, textAlign: "center", color: COLORS.textMuted, padding: "20px" }}>
                      Aucune donnée disponible en base de données pour {selectedMonth}
                    </td>
                  </tr>
                ) : (
                  secteurData.map(([s, a, m, h, c], i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? COLORS.white : "#fafafa" }}>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{s}</td>
                      <td style={styles.tdCenter}>{a}</td>
                      <td style={styles.tdCenter}>{m}</td>
                      <td style={styles.tdCenter}>{h}</td>
                      <td style={{ ...styles.td, fontSize: 10, color: COLORS.textMuted }}>{c}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Donut Chart Card */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Taux de disponibilité des plannings</div>
            <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
              <DonutChart pct={donutPct} color={COLORS.blue} label="Planning reçu" />
            </div>
            <div style={{ marginTop: 12 }}>
              {[
                { label: "Plan annuel (5/7)", color: COLORS.blue },
                { label: "Plan mensuel (4/7)", color: COLORS.green },
                { label: "Programme hebdo (4/5)", color: COLORS.teal },
                { label: "Non disponible", color: "#ccc" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Segment Table */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Par Segment</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>SEGMENT</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>PLAN. ANNUEL</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>PLAN. MENS.</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>PROG. HEBDO</th>
                  <th style={styles.th}>COMMENTAIRES</th>
                </tr>
              </thead>
              <tbody>
                {segmentData.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ ...styles.td, textAlign: "center", color: COLORS.textMuted, padding: "20px" }}>
                      Aucun segment trouvé.
                    </td>
                  </tr>
                ) : (
                  segmentData.map(([s, a, m, h, c], i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? COLORS.white : "#fafafa" }}>
                      <td style={{ ...styles.td, fontWeight: 600, fontSize: 10 }}>{s}</td>
                      <td style={styles.tdCenter}>{a}</td>
                      <td style={styles.tdCenter}>{m}</td>
                      <td style={styles.tdCenter}>{h}</td>
                      <td style={{ ...styles.td, fontSize: 10, color: COLORS.textMuted }}>{c}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Commentaires Card */}
          <div style={styles.card}>
            <h1 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>Commentaires:</h1>
            <ul style={{ fontSize: 11, color: COLORS.textMuted, paddingLeft: 20, lineHeight: "1.6" }}>
              <li>Les plannings annuels sont disponibles pour 5 secteurs sur 7.</li>
              <li>Les plannings mensuels sont disponibles pour 4 secteurs sur 7.</li>
              <li>Les programmes hebdomadaires sont disponibles pour 4 secteurs sur 5.</li>
              <li>Des efforts doivent être faits pour améliorer la disponibilité des plannings...</li>
            </ul>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          .print-only { display: none; }
          @media print {
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            div[style*="card"] {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          }
        `}</style>
      </div>
    </>
  );
}