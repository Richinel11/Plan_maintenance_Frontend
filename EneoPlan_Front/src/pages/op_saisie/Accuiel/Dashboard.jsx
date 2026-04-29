import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Dashboard.css';
import SearchBar from '../components/Filter_search/search';
import Footer from '../Plannings/footer/footer';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Données mockées pour la démo
  const recentWorks = [
    { id: 1, ref: "MT-2024-001", titre: "Maintenance Transformateur T1", statut: "Brouillon", date: "2024-04-20" },
    { id: 2, ref: "MT-2024-002", titre: "Réparation Ligne A12", statut: "Soumis", date: "2024-04-21" },
    { id: 3, ref: "MT-2024-003", titre: "Inspection Poteaux Secteur B", statut: "En cours", date: "2024-04-22" },
    { id: 4, ref: "MT-2024-004", titre: "Changement Isolateurs", statut: "Clôturé", date: "2024-04-23" },
    { id: 5, ref: "MT-2024-005", titre: "Élagage Zone Nord", statut: "Brouillon", date: "2024-04-24" },
  ];

  const filteredWorks = recentWorks.filter(work => 
    work.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    work.ref.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'brouillon': return 'status-brouillon';
      case 'soumis': return 'status-soumis';
      case 'en cours': return 'status-encours';
      case 'clôturé': return 'status-cloture';
      default: return '';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="header">
          <div>
            <h1 className="title">Tableau de bord</h1>
            <p className="subtitle">Bienvenue, Opérateur. Gérez vos saisies et plannings.</p>
          </div>

          <div className="buttons">
            <button className="btn-create" onClick={() => navigate("/dashboard/CreerTravail")}>
              <span className="material-symbols-outlined">add</span> Créer un travail
            </button>
            <button className="btn-import" onClick={() => navigate("/dashboard/Planning")}>
              <span className="material-symbols-outlined">upload_file</span> Importer un planning
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Brouillons</div>
            <div className="stat-value">05</div>
            <div className="stat-sub">Travaux à finaliser</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Soumis</div>
            <div className="stat-value">08</div>
            <div className="stat-sub">En attente de validation</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">En cours</div>
            <div className="stat-value">12</div>
            <div className="hausse">+12% cette semaine</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Clôturés</div>
            <div className="stat-value">42</div>
            <div className="stat-sub">Total archivé</div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="main-card">
          <div className="section-header">
            <h2 className="section-title">Travaux récents</h2>

            <div className="search-container">
               <input 
                  type="text" 
                  placeholder="Rechercher par titre ou référence..." 
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
                <th>RÉFÉRENCE</th>
                <th>TITRE</th>
                <th>STATUT</th>
                <th>DATE DE CRÉATION</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorks.length > 0 ? (
                filteredWorks.map(work => (
                  <tr key={work.id}>
                    <td><span className="ref">{work.ref}</span></td>
                    <td>{work.titre}</td>
                    <td><span className={`status ${getStatusClass(work.statut)}`}>{work.statut}</span></td>
                    <td>{work.date}</td>
                    <td>
                      <button className="action-btn" title="Modifier">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    Aucun travail trouvé.
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