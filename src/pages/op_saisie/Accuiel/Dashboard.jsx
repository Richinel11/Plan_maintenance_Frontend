import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';
import Footer from '../Plannings/footer/footer';
import { getPlannings, deletePlanning } from "../../../services/planningService";
import PlanningTable from "../../../components/shared/PlanningTable/PlanningTable";
import CreatePlanningModal from "../Plannings/NewPlanning/CreatePlanningModal";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

const Dashboard = () => {
  const navigate = useNavigate();
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, encours: 0, cloture: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [editingPlanning, setEditingPlanning] = useState(null);

  const fetchPlannings = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getPlannings(page);
      const results = data.results || data;
      const planningsData = Array.isArray(results) ? results : [];
      setPlannings(planningsData);

      const count = data.count || planningsData.length;
      setTotalCount(count);
      setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));

      const encours = planningsData.filter(p => (p.statut || "").toLowerCase().includes("cours")).length;
      const cloture = planningsData.filter(p => (p.statut || "").toLowerCase().includes("clôturé")).length;
      setStats({ total: count, encours, cloture });
    } catch (error) {
      console.error("Erreur lors de la récupération des plannings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannings(currentPage);
  }, [currentPage]);

  const handlePlanningClick = (planning) => {
    navigate(`/dashboard/Planning/${planning.id}`);
  };

  const handleEdit = (planning, e) => {
    e.stopPropagation();
    setEditingPlanning(planning);
  };

  const handleDelete = (planning, e) => {
    e.stopPropagation();
    toast.warning(`Supprimer le planning "${planning.nom}" ?`, {
      description: "Cette action est irréversible et supprimera également tous les travaux associés.",
      duration: 8000,
      action: {
        label: "Confirmer",
        onClick: async () => {
          try {
            await deletePlanning(planning.id);
            toast.success("Planning supprimé avec succès.");
            fetchPlannings(currentPage);
          } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            toast.error("Impossible de supprimer le planning.");
          }
        }
      },
      cancel: { label: "Annuler", onClick: () => {} }
    });
  };

  return (
    <div className="dashboard-container">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="header">
          <div>
            <h1 className="title">Plannings de Maintenance</h1>
            <p className="subtitle">Gérez vos dossiers de plannings et suivez leur évolution.</p>
          </div>
          <div className="buttons">
            <button className="btn-create" onClick={() => navigate('/dashboard/Planning')}>
              <span className="material-symbols-outlined">add_circle</span> Créer un Planning
            </button>
            <button className="btn-import" onClick={() => navigate('/dashboard/CreerTravail')}>
              <span className="material-symbols-outlined">add_task</span> Créer un travail
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Plannings</div>
            <div className="stat-value">{loading ? "..." : stats.total}</div>
            <div className="stat-sub">Plannings enregistrés</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Travaux Importés</div>
            <div className="stat-value">--</div>
            <div className="hausse">Non disponible</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">En cours</div>
            <div className="stat-value">{loading ? "..." : stats.encours}</div>
            <div className="stat-sub">Plannings actifs</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Clôturés</div>
            <div className="stat-value">{loading ? "..." : stats.cloture}</div>
            <div className="stat-sub">Historique archivé</div>
          </div>
        </div>

        {/* Tableau partagé */}
        <PlanningTable
          plannings={plannings}
          loading={loading}
          onRowClick={handlePlanningClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          onPageChange={setCurrentPage}
        />

        <Footer />
      </div>

      <CreatePlanningModal
        isOpen={!!editingPlanning}
        onClose={() => setEditingPlanning(null)}
        planningId={editingPlanning?.id}
        initialData={editingPlanning}
        onSuccess={() => {
          setEditingPlanning(null);
          fetchPlannings(currentPage);
        }}
      />
    </div>
  );
};

export default Dashboard;
