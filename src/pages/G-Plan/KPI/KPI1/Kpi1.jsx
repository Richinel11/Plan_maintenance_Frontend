// KPI1/kpi1.jsx
import React, { useState, useEffect } from "react";
import { MaintenanceService } from "../../../../services/KpiData";
import { DonutChart } from "../components/charts";

export default function Page1({ selectedMonth = "Juin 2026" }) {
  const [secteurData, setSecteurData] = useState([]);
  const [segmentData, setSegmentData] = useState([]);
  const [donutPct, setDonutPct] = useState(0);
  const [annuelCount, setAnnuelCount] = useState(0);
  const [mensuelCount, setMensuelCount] = useState(0);
  const [hebdoCount, setHebdoCount] = useState(0);
  const [totalPlannings, setTotalPlannings] = useState(0);
  const [loading, setLoading] = useState(true);

  // KPI1/kpi1.jsx
useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const result = await MaintenanceService.getPlanningsKPI(selectedMonth);

      // On extrait la liste réelle des secteurs de manière sécurisée
      let secteursListe = [];
      if (Array.isArray(result.secteurs)) {
        secteursListe = result.secteurs;
      } else if (result.secteurs && Array.isArray(result.secteurs.results)) {
        secteursListe = result.secteurs.results; // Pour la pagination Django Rest Framework
      } else if (result.secteurs && Array.isArray(result.secteurs.data)) {
        secteursListe = result.secteurs.data;
      }

      // Même sécurité pour les segments
      let segmentsListe = [];
      if (Array.isArray(result.segments)) {
        segmentsListe = result.segments;
      } else if (result.segments && Array.isArray(result.segments.results)) {
        segmentsListe = result.segments.results;
      } else if (result.segments && Array.isArray(result.segments.data)) {
        segmentsListe = result.segments.data;
      }

      let a = 0, m = 0, h = 0;
      
      // On boucle sur notre liste sécurisée sous forme d'objets
      secteursListe.forEach((row) => {
        a += row.annuel || 0;
        m += row.mensuel || 0;
        h += row.hebdo || 0;
      });

      setSecteurData(secteursListe);
      setSegmentData(segmentsListe);
      setDonutPct(result.tauxDispo || 0);
      setTotalPlannings(result.totalPlannings || 0);
      setAnnuelCount(a);
      setMensuelCount(m);
      setHebdoCount(h);
    } catch (err) {
      console.error("Erreur lors de la récupération des KPIs :", err);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [selectedMonth]);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Chargement...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Disponibilité des Plannings - {selectedMonth}</h2>



      {/* Tables */}
      <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Par Secteur */}
        <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px" }}>
          <h3>Par Secteur</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: "8px" }}>Secteur</th>
                <th style={{ padding: "8px" }}>Entité Métier</th>
                <th style={{ padding: "8px" }}>Annuel</th>
                <th style={{ padding: "8px" }}>Mensuel</th>
                <th style={{ padding: "8px" }}>Hebdo</th>
              </tr>
            </thead>
            <tbody>
        {/* Extrait pour la table Secteur */}
        {secteurData.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: "8px" }}><strong>{row.nomSecteur || row.region}</strong></td> {/* Affiche le Secteur réel */}
            <td style={{ padding: "8px" }}>{row.entite}</td>                     {/* Affiche l'Entité Métier */}
            <td style={{ padding: "8px" }}>{row.annuel}</td>
            <td style={{ padding: "8px" }}>{row.mensuel}</td>
            <td style={{ padding: "8px" }}>{row.hebdo}</td>
          </tr>
        ))}
            </tbody>
          </table>
        </div>

      <div style={{ display: "flex", gap: "60px", marginTop: "30px", alignItems: "center", flexWrap: "wrap", border: "1px solid #ddd", borderRadius: "8px", padding: "15px" }}>
        <div style={{ textAlign: "center" }}>
          <DonutChart pct={donutPct} />
          <h3 style={{ margin: "15px 0 5px" }}>{donutPct}%</h3>
          <p>Planning reçus</p>
        </div>

        <div>
          <h3 style={{ marginBottom: "20px" }}>Répartition des plannings</h3>
          <LegendItem color="#3b82f6" label="Plan annuel" count={annuelCount} total={totalPlannings} />
          <LegendItem color="#22c55e" label="Plan mensuel" count={mensuelCount} total={totalPlannings} />
          <LegendItem color="#8b5cf6" label="Programme hebdo" count={hebdoCount} total={totalPlannings} />
          <LegendItem color="#94a3b8" label="Non disponible" count={0} total={totalPlannings} />
        </div>
      </div>

        {/* Par Segment */}
        <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px" }}>
          <h3>Par Segment</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: "8px" }}>Segment</th>
                <th style={{ padding: "8px" }}>Entité Métier</th>
                <th style={{ padding: "8px" }}>Annuel</th>
                <th style={{ padding: "8px" }}>Mensuel</th>
                <th style={{ padding: "8px" }}>Hebdo</th>
              </tr>
            </thead>
            <tbody>
        {/* Extrait pour la table Segment */}
        {segmentData.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: "8px" }}><strong>{row.nomSegment}</strong></td> {/* Affiche le Segment réel */}
            <td style={{ padding: "8px" }}>{row.entite}</td>                     {/* Affiche l'Entité Métier */}
            <td style={{ padding: "8px" }}>{row.annuel}</td>
            <td style={{ padding: "8px" }}>{row.mensuel}</td>
            <td style={{ padding: "8px" }}>{row.hebdo}</td>
          </tr>
        ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label, count, total }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", fontSize: "15px" }}>
    <div style={{ width: "18px", height: "18px", backgroundColor: color, borderRadius: "4px" }} />
    <span><strong>{label}</strong> ({count}/{total})</span>
  </div>
);