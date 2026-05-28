import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';
import Footer from '../Plannings/footer/footer';
import { getPlannings, deletePlanning } from "../../../API/planningService";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, encours: 0, cloture: 0 });

  const fetchPlannings = async () => {
    try {
      setLoading(true);
      const data = await getPlannings(1);
      const results = data.results || data;
      const planningsData = Array.isArray(results) ? results : [];
      setPlannings(planningsData);

      // Mise à jour basique des stats
      const encours = planningsData.filter(p => (p.statut || "").toLowerCase().includes("cours")).length;
      const cloture = planningsData.filter(p => (p.statut || "").toLowerCase().includes("clôturé")).length;
      setStats({ total: data.count || planningsData.length, encours, cloture });

    } catch (error) {
      console.error("Erreur lors de la récupération des plannings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannings();
  }, []);

  const filteredPlannings = plannings.filter(p => 
    (p.nom || p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.entite_metier?.name || p.service || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.statut || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusClass = (status) => {
    if (!status) return 'status-brouillon';
    switch(status.toLowerCase()) {
      case 'brouillon': return 'status-brouillon';
      case 'soumis': return 'status-soumis';
      case 'en cours': return 'status-encours';
      case 'clôturé': return 'status-cloture';
      default: return 'status-brouillon';
    }
  };

  const handlePlanningClick = (planning) => {
    navigate(`/dashboard/Planning/${planning.id}`);
  };

  const handleEdit = (planning, e) => {
    e.stopPropagation();
    console.log("Edit planning:", planning.id);
    // Logique d'édition du planning (nom, code, service)
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
            fetchPlannings();
          } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            toast.error("Impossible de supprimer le planning.");
          }
        }
      },
      cancel: {
        label: "Annuler",
        onClick: () => {}
      }
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

        {/* Stats Cards (KPIs) */}
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

        {/* Main Table Card */}
        <div className="main-card">
          <div className="section-header">
            <h2 className="section-title">Liste des Plannings</h2>

            <div className="search-container">
               <input 
                  type="text" 
                  placeholder="Rechercher par nom, code, service ou statut..." 
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="material-symbols-outlined search-icon">search</span>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>NOM DU PLANNING</th>
                <th>CODE</th>
                <th>ENTITÉ</th>
                <th>STATUT</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlannings.length > 0 ? (
                filteredPlannings.map(planning => (
                  <tr key={planning.id}>
                    <td 
                      className="planning-name-cell" 
                      onClick={() => handlePlanningClick(planning)}
                      title="Cliquez pour voir les travaux de ce planning"
                    >
                      <span className="planning-name">{planning.nom || planning.name || '—'}</span>
                    </td>
                    <td><span className="ref">{planning.code || '—'}</span></td>
                    <td>{planning.entite_metier?.name || planning.service || '—'}</td>
                    <td><span className={`status ${getStatusClass(planning.statut)}`}>{planning.statut || 'Brouillon'}</span></td>
                    <td>
                      {(planning.statut || '').toLowerCase() !== 'clôturé' ? (
                        <div className="td-actions" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="action-btn edit-btn" 
                            title="Modifier le planning"
                            onClick={(e) => handleEdit(planning, e)}
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button 
                            className="action-btn delete-btn" 
                            title="Supprimer le planning"
                            onClick={(e) => handleDelete(planning, e)}
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      ) : (
                        <div className="td-actions" style={{ justifyContent: 'flex-end' }}>
                          <span title="Planning clôturé" style={{ color: '#9ca3af', cursor: 'not-allowed', display: 'flex', alignItems: 'center', padding: '6px' }}>
                            <span className="material-symbols-outlined">lock</span>
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    Aucun planning trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <Footer />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;