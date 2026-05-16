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
    <div className="Container">

      <div className="Header">

        <SearchBar />

        <div className="Header-inputs">

          <button
            className="btn-create"
            onClick={() =>
              navigate(
                "/dashboard/CreerTravail"
              )
            }
          >
            + Créer un travail
          </button>

          <button
            className="btn-import"
            onClick={() =>
              navigate(
                "/dashboard/Planning"
              )
            }
          >
            ↻ Importer un planning
          </button>

        </div>
      </div>

      {/* FILTER */}

      <div className="segment-filter">

        <select
          value={selectedSegment}
          onChange={(e) => {

            setSelectedSegment(
              e.target.value
            );

            setPage(1);

          }}
        >

          <option value="">
            Tous les segments
          </option>

          <option value="TRANSPORT">
            Transport
          </option>

          <option value="PRODUCTION">
            Production
          </option>

          <option value="DISTRIBUTION">
            Distribution
          </option>

        </select>

      </div>

      {/* TABLE */}

      <table className="excel-table">

        <thead>

          <tr>
            <th>Référence</th>
            <th>Segment</th>
            <th>Type réseau</th>
            <th>Poste concerné</th>
            <th>Date programmée</th>
            <th>Statut</th>
          </tr>

        </thead>

        <tbody>

          {loading ? (

            <tr>
              <td colSpan="6">
                Chargement...
              </td>
            </tr>

          ) : plannings.length === 0 ? (

            <tr>
              <td colSpan="6">
                Aucun planning
              </td>
            </tr>

          ) : (

            plannings.map(
              (planning) => (

                <tr key={planning.id}>

                  <td>
                    {
                      planning.reference
                    }
                  </td>

                  <td>
                    {
                      planning.segment
                    }
                  </td>

                  <td>
                    {
                      planning.type_reseau
                    }
                  </td>

                  <td>
                    {planning.poste
                      ?.nom || "-"}
                  </td>

                  <td>
                    {
                      planning.date_programmee
                    }
                  </td>

                  <td>
                    {
                      planning.statut_travaux
                    }
                  </td>

                </tr>
              )
            )

          )}

        </tbody>

      </table>

      {/* PAGINATION */}

      <div className="pagination">

        <button
          disabled={!previousPage}
          onClick={() =>
            setPage((prev) =>
              prev - 1
            )
          }
        >
          ← Précédent
        </button>

        <span>
          Page {page}
        </span>

        <button
          disabled={!nextPage}
          onClick={() =>
            setPage((prev) =>
              prev + 1
            )
          }
        >
          Suivant →
        </button>

      </div>

      <div className="pagination-count">
        Total :
        {" "}
        {count}
        {" "}
        plannings
      </div>

      <Footer />

    </div>
  );
};

export default Tableaux;