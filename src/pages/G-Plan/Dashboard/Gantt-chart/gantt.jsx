import React, { useEffect, useState } from 'react';
import "./gantt.css";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import Cookies from 'js-cookie';

const days = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

export default function GanttChart() {
  const [plannings, setPlannings] = useState([]);
  const [allTravaux, setAllTravaux] = useState([]); // To show inside modal
  const [currentWeek, setCurrentWeek] = useState(22);
  const [loading, setLoading] = useState(true);
  const [selectedPlanning, setSelectedPlanning] = useState(null);
  const [error, setError] = useState(null);

  const accessToken = Cookies.get('accessToken');

  // Fetch both Plannings and Travaux
  useEffect(() => {
    if (!accessToken) {
      setError("Vous devez vous reconnecter.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [planningRes, travauxRes] = await Promise.all([
          fetch("http://localhost:8000/plannings/", {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }),
          fetch("http://localhost:8000/travaux/", {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          })
        ]);

        if (!planningRes.ok || !travauxRes.ok) throw new Error("Erreur de chargement");

        const planningsData = await planningRes.json();
        const travauxData = await travauxRes.json();

        setPlannings(planningsData);
        setAllTravaux(travauxData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  // Group Travaux by Planning
  const getTravauxForPlanning = (planningId) => {
    return allTravaux.filter(t => t.planning?.id === planningId);
  };

  // Week navigation
  const goToPreviousWeek = () => setCurrentWeek(w => w - 1);
  const goToNextWeek = () => setCurrentWeek(w => w + 1);

  const getWeekHeader = (week) => {
    const baseDate = new Date(2026, 4, 25);
    const startDate = new Date(baseDate);
    startDate.setDate(startDate.getDate() + (week - 22) * 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    return `Semaine ${week} (${startDate.toLocaleDateString('fr-FR', {day:'numeric', month:'short'})} - ${endDate.toLocaleDateString('fr-FR', {day:'numeric', month:'short'})})`;
  };

  // Filter and group Plannings for current week
  const filteredPlannings = plannings.filter(planning => {
    if (!planning.date_creation) return false;
    const pStart = new Date(planning.date_creation);
    const weekStart = new Date(2026, 4, 25);
    weekStart.setDate(weekStart.getDate() + (currentWeek - 22) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return pStart <= weekEnd;
  });

  if (loading) return <div className="gantt-container">Chargement des Plannings...</div>;

  return (
    <div className="gantt-container">
      <div className="gantt-header">
        <h3>Aperçu Gantt Hebdomadaire - Plannings</h3>
        <div className="week">
          <GrFormPrevious onClick={goToPreviousWeek} style={{ cursor: 'pointer' }} />
          <span>{getWeekHeader(currentWeek)}</span>
          <GrFormNext onClick={goToNextWeek} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      <div className="gantt-days">
        <div className="resource-label">RESSOURCE (Entité Métier)</div>
        {days.map((day) => <div key={day}>{day}</div>)}
      </div>

      {filteredPlannings.map((planning, i) => {
        const resource = planning.entite_metier?.name || "Sans entité";

        return (
          <div className="gantt-row" key={i} onClick={() => setSelectedPlanning(planning)}>
            <div className="resource">{resource}</div>
            <div className="timeline" style={{ height: "60px" }}>
              <div
                className="task task-blue"
                style={{
                  left: "5%",
                  width: "85%",
                  top: "12px",
                  cursor: "pointer"
                }}
                title={planning.nom}
              >
                <span className="task-name">{planning.nom}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Planning Detail Modal with Travaux List */}
      {selectedPlanning && (
        <div className="modal-overlay" onClick={() => setSelectedPlanning(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "700px" }}>
            <h3>Planning : {selectedPlanning.nom}</h3>
            <p><strong>Entité :</strong> {selectedPlanning.entite_metier?.name}</p>
            <p><strong>Code :</strong> {selectedPlanning.code}</p>

            <h4>Travaux associés ({getTravauxForPlanning(selectedPlanning.id).length})</h4>
            
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {getTravauxForPlanning(selectedPlanning.id).map(t => (
                <div key={t.id} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                  <strong>{t.consistance_travaux}</strong> - {t.statut_travaux}
                  <br />
                  <small>
                    {new Date(t.heure_debut_planifie).toLocaleDateString('fr-FR')} → 
                    {new Date(t.heure_fin_planifie).toLocaleDateString('fr-FR')}
                  </small>
                </div>
              ))}
            </div>

            <button onClick={() => setSelectedPlanning(null)} className="close-btn">Fermer</button>
          </div>
        </div>
      )}

      {error && (
        <div className="modal-overlay" onClick={() => setError(null)}>
          <div className="modal-content error-modal">
            <h3>⚠️ Erreur</h3>
            <p>{error}</p>
            <button onClick={() => setError(null)} className="close-btn">OK</button>
          </div>
        </div>
      )}
    </div>
  );
}