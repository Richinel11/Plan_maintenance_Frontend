import React from "react";
import { useState } from "react";
import "../../Accueil/accueil.css";


 
export default function Table({ plannings }) {
    const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  
const getStatusClass = (status) => {
  if (!status) return "brouillon";

  switch (status.toLowerCase()) {
    case "en validation":
      return "validation";

    case "validé":
      return "valide";

    case "brouillon":
      return "brouillon";

    case "expiré":
      return "expire";

    default:
      return "brouillon";
  }
};

 
const filtered = plannings.filter(
  (p) =>
    (p.reference || "")
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    (p.entite || "")
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    (p.nom || "")
      .toLowerCase()
      .includes(search.toLowerCase())
);


    return(
        <>
                     {/* Search */}
          <div className="search-row">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Rechercher par référence, poste ou localité..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="download-btn">⬆ Télécharger</button>
          </div>
 
          {/* Filters */}
          <div className="card">
            <div className="filters-grid">
              {[
                { label: "TYPE DE TRAVAUX",  value: "Tous les types"   },
                { label: "TYPE DE RÉSEAU",   value: "Tous les réseaux" },
                { label: "STATUT",           value: "Tous les statuts" },
                { label: "PÉRIODE",          value: "12/10/2023 – 31/10/2023" },
              ].map((f, i) => (
                <div className="filter-group" key={i}>
                  <label>{f.label}</label>
                  <select className="filter-select">
                    <option>{f.value}</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
 
          {/* Table */}
          <div className="card table-wrapper">
            <div className="card-header">
              <div>
                <div className="card-title">≡ Liste des Plannings Actuels</div>
                <div className="card-subtitle">Gérez et suivez l'avancement de vos dossiers</div>
              </div>
              <div className="table-actions">
                <button className="action-btn">
                     <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-funnel-icon lucide-funnel"><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/></svg></span> Filter 
                </button>
                <button className="action-btn">
                    <span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-icon lucide-download"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg></span> Export</button>
              </div>
            </div>
            <hr className="divider" />
            <table>
              <thead>
                <tr>
                  <th>Référence (REF)</th>
                  <th>Entité</th>
                  <th>Date Début</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
                  <tbody>
                    {filtered.map((planning) => (
                      <tr key={planning.id}>
                        <td className="ref-cell">
                          {planning.reference}
                        </td>

                        <td>
                          {planning.Entite}
                        </td>

                        <td>
                          {planning.date_debut}
                        </td>

                        <td>
                          <span className={`badge ${getStatusClass(planning.statut)}`}>
                            {planning.statut}
                          </span>
                        </td>

                        <td>
                          ...
                        </td>
                      </tr>
                    ))}
                  </tbody>
            </table>
            <div className="pagination">
              <span className="pagination-info">Affichage de 4 sur 25 plannings</span>
              <div className="pagination-btns">
                <button className="page-btn">‹</button>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    className={`page-btn ${page === n ? "active" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button className="page-btn">›</button>
              </div>
            </div>
          </div>
        </>
    )
}