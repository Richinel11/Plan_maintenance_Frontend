import React, {
  useEffect,
  useState,
  
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import SearchBar from "../../components/Filter_search/search";

import "./Tableaux.css";

import Footer from "../footer/footer";

import {
  getPlannings,
  getPlanningsBySegment,
} from "../../../../API/planningService";

const Tableaux = () => {

  const navigate = useNavigate();

  const [plannings, setPlannings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedSegment,
    setSelectedSegment] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [nextPage,
    setNextPage] =
    useState(null);

  const [previousPage,
    setPreviousPage] =
    useState(null);

  const [count, setCount] =
    useState(0);

const loadPlannings = React.useCallback(
  async () => {

    try {

      setLoading(true);

      let response;

      if (selectedSegment) {

        response =
          await getPlanningsBySegment(
            selectedSegment,
            page
          );

      } else {

        response =
          await getPlannings(page);

      }

      setPlannings(
        response.results || []
      );

      setNextPage(
        response.next
      );

      setPreviousPage(
        response.previous
      );

      setCount(
        response.count || 0
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  },
  [selectedSegment, page]
);

useEffect(() => {
  loadPlannings();
}, [loadPlannings]);

  return (
    <div className="tableaux-container tableaux-fade-in">

      {/* ── HEADER ── */}
      <div className="tableaux-header">
        <div className="tableaux-header-left">
          <div className="tableaux-title-row">
            <div className="planning-icon-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="3" y1="15" x2="21" y2="15"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </div>
            <h2 className="tableaux-planning-name">Mes plannings</h2>
          </div>
          {!loading && (
            <div className="tableaux-planning-meta">
              <span>{count} planning{count > 1 ? "s" : ""} au total</span>
            </div>
          )}
        </div>

        <div className="tableaux-header-actions">
          <button
            className="btn-import"
            onClick={() => navigate("/dashboard/Planning")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Importer un planning
          </button>

          <button
            className="btn-create"
            onClick={() => navigate("/dashboard/CreerTravail")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Créer un travail
          </button>
        </div>
      </div>

      {/* ── BARRE DE RECHERCHE ── */}
      <div className="tableaux-toolbar">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un planning..."
        />
      </div>

      {/* ── ERREUR ── */}
      {error && (
        <div className="tableaux-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* ── TABLEAU LISTE DES PLANNINGS ── */}
      <div className="tableaux-scroll-wrapper">
        <table className="tableaux-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom du planning</th>
              <th>Code</th>
              <th>Entité</th>
              <th>Étape workflow</th>
              <th>Date création</th>
            </tr>
          </thead>
          <tbody>

            {/* Chargement */}
            {loading && (
              <tr className="tableaux-empty-row">
                <td colSpan="6">Chargement des plannings...</td>
              </tr>
            )}

            {/* Aucun résultat */}
            {!loading && planningsFiltres.length === 0 && (
              <tr className="tableaux-empty-row">
                <td colSpan="6">
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <line x1="3" y1="9" x2="21" y2="9"/>
                    </svg>
                    Aucun planning disponible. Commencez par en importer un.
                  </div>
                </td>
              </tr>
            )}

            {/* Liste */}
            {!loading &&
              planningsFiltres.map((planning, index) => (
                <tr
                  key={planning.id}
                  onClick={() => navigate(`/dashboard/Planning/${planning.id}`)}
                  title="Cliquer pour voir le détail de ce planning"
                >
                  <td style={{ color: "#94a3b8", fontWeight: 400, fontSize: "12px" }}>
                    {(page - 1) * 10 + index + 1}
                  </td>
                  <td className="planning-row-name">{planning.nom || planning.name || "—"}</td>
                  <td>{planning.code || "—"}</td>
                  <td>{planning.entite_metier?.name || planning.service || "—"}</td>
                  <td>
                    {planning.current_step?.name ? (
                      <span className="workflow-step-badge">
                        {planning.current_step.name}
                      </span>
                    ) : (planning.statut || "—")}
                  </td>
                  <td>
                    {planning.date_creation
                      ? new Date(planning.date_creation).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION ── */}
      <div className="tableaux-pagination">
        <button
          className="pagination-btn"
          disabled={!previousPage}
          onClick={() => setPage((prev) => prev - 1)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Précédent
        </button>

        <span className="pagination-info">Page {page}</span>

        <button
          className="pagination-btn"
          disabled={!nextPage}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Suivant
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <div className="pagination-total">
        {count} planning{count > 1 ? "s" : ""} au total
      </div>

      <Footer />
    </div>
  );
};

export default Tableaux;