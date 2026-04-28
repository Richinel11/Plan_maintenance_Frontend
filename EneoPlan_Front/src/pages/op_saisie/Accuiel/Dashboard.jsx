import { useNavigate } from "react-router-dom";

import './Dashboard.css';   // ← Import external CSS
import SearchBar from '../components/Filter_search/search';
import Footer from '../Plannings/footer/footer';
const Dashboard = () => {
const navigate = useNavigate();



  return (
    <div className="dashboard-container">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="header">
          <div>
            <h1 className="title">Tableau de bord</h1>
            <p className="subtitle">Gérez et suivez vos plannings de travaux énergétiques.</p>
          </div>

          <div className="buttons">
            <button className="btn-create" onClick={() => navigate("/dashboard/CreerTravail")}>
              + Créer un travail
            </button>
            <button className="btn-import" onClick={() => navigate("/dashboard/Planning")}>
              ↻ Importer un planning
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Brouillons</div>
            <div className="stat-value">12</div>
            <div className="stat-sub">Derniers 30j</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Soumis</div>
            <div className="stat-value">8</div>
            <div className="stat-sub">Derniers 30j</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">En cours</div>
            <div className="stat-value">24</div>
            <div className="hausse">+3% hausse</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Clôturés</div>
            <div className="stat-value">156</div>
            <div className="stat-sub">Cumul total</div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="main-card">
          <div className="section-header">
            <h2 className="section-title">Travaux récents</h2>

            <div className="search-container">
              <SearchBar />
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
              <p>No table</p>
            </tbody>
          </table>

{/* Pagination - NOW FUNCTIONAL */}
         {/* Footer */}
            <Footer />

        </div>



      </div>
    </div>
  );
};

export default Dashboard;