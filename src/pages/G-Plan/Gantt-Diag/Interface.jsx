import React, { useEffect, useState } from "react";
import TopControl from "./topcontrol/Topcontrol";
import Detail from "./details/GanttTimeline";
import { fetchAllTravaux, fetchConflitIds } from "../../../services/gplanService";
import { mapTravauxToGanttRows } from "../../../services/travailMapper";

const ENTITIES = ["PRODUCTION", "TRANSPORT", "DISTRIBUTION"];
const STATUSES  = ["BROUILLON", "SOUMIS", "VALIDE", "EN_COURS", "TERMINE", "REPORTE"];

export default function PlanningDashboard() {

  const [view,           setView]           = useState("mois");
  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentDate,    setCurrentDate]    = useState(new Date());

  const [allTravaux, setAllTravaux] = useState([]);
  const [conflitIds, setConflitIds] = useState(new Set());
  const [ganttData,  setGanttData]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // Chargement initial depuis le backend
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [travaux, ids] = await Promise.all([
          fetchAllTravaux(),
          fetchConflitIds(),
        ]);

        if (cancelled) return;
        setAllTravaux(travaux);
        setConflitIds(ids);
      } catch (err) {
        if (cancelled) return;
        setError(err?.response?.data?.detail || err.message || 'Erreur inconnue');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // Recalcule les lignes Gantt à chaque changement de filtre ou de période
  useEffect(() => {
    if (!allTravaux.length) {
      setGanttData([]);
      return;
    }

    let filtered = allTravaux;
    if (selectedEntity) filtered = filtered.filter(t => t.segment === selectedEntity);
    if (selectedStatus) filtered = filtered.filter(t => t.statut_travaux === selectedStatus);

    // Tri par date de début : les travaux chronologiquement proches
    // se retrouvent visuellement adjacents → facilite la détection de chevauchements
    const sorted = [...filtered].sort(
      (a, b) => new Date(a.heure_debut_planifie) - new Date(b.heure_debut_planifie)
    );

    setGanttData(mapTravauxToGanttRows(sorted, conflitIds));
  }, [allTravaux, conflitIds, selectedEntity, selectedStatus, view, currentDate]);

  if (loading) return (
    <div style={styles.center}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>Chargement des travaux…</p>
    </div>
  );

  if (error) return (
    <div style={styles.center}>
      <div style={styles.errorBox}>
        <span style={{ fontSize: 28 }}>⚠️</span>
        <p style={styles.errorTitle}>Impossible de charger les données</p>
        <p style={styles.errorMsg}>{error}</p>
        <button style={styles.retryBtn} onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <TopControl
        view={view}
        setView={setView}
        selectedEntity={selectedEntity}
        setSelectedEntity={setSelectedEntity}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        entities={ENTITIES}
        statuses={STATUSES}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        onAnalyze={() => {}}
      />
      <Detail
        data={ganttData}
        view={view}
        currentDate={currentDate}
      />
    </div>
  );
}

const styles = {
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #1B75BB',
    borderRadius: '50%',
    animation: 'spin 0.9s linear infinite',
  },
  loadingText: {
    color: '#64748b',
    fontWeight: 500,
    fontSize: 14,
  },
  errorBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    background: '#fff',
    border: '1px solid #fecaca',
    borderRadius: 14,
    padding: '32px 40px',
    textAlign: 'center',
    maxWidth: 400,
  },
  errorTitle: {
    fontWeight: 700,
    fontSize: 16,
    color: '#1e293b',
    margin: 0,
  },
  errorMsg: {
    fontSize: 13,
    color: '#64748b',
    margin: 0,
  },
  retryBtn: {
    marginTop: 8,
    padding: '8px 20px',
    background: '#1B75BB',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  },
};
