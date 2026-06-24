import React, { useState } from "react";
import { COLORS, styles } from "../components/kpi";
import { DonutChart } from "../components/charts";
// import { MaintenanceService } from "../../../../services/KpiData";

export default function Page1({ selectedMonth = "Avril 2026" }) {
  const [secteurData] = useState([]);
  const [segmentData] = useState([]);

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

        <div style={styles.row2}>
          {/* Secteur Table */}
          <div>
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
                  {secteurData.map(([s, a, m, h, c], i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? COLORS.white : "#fafafa" }}>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{s}</td>
                      <td style={styles.tdCenter}>{a}</td>
                      <td style={styles.tdCenter}>{m}</td>
                      <td style={styles.tdCenter}>{h}</td>
                      <td style={{ ...styles.td, fontSize: 10, color: COLORS.textMuted }}>{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Donut Chart Card */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Taux de disponibilité des plannings</div>
            <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
              <DonutChart pct={65} color={COLORS.blue} label="Planning reçu" />
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
                {segmentData.map(([s, a, m, h, c], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? COLORS.white : "#fafafa" }}>
                    <td style={{ ...styles.td, fontWeight: 600, fontSize: 10 }}>{s}</td>
                    <td style={styles.tdCenter}>{a}</td>
                    <td style={styles.tdCenter}>{m}</td>
                    <td style={styles.tdCenter}>{h}</td>
                    <td style={{ ...styles.td, fontSize: 10, color: COLORS.textMuted }}>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Commentaires Card */}
          <div style={styles.card}>
            <h1>Commentaires:</h1>
            <ul style={{ fontSize: 11, color: COLORS.textMuted, paddingLeft: 20 }}>
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