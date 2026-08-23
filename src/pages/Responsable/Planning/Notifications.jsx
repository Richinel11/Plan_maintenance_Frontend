import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPlannings } from "../../../services/planningService";
import { getCurrentUser } from "../../../services/Authservice";
import PlanningTable from "../../../components/shared/PlanningTable/PlanningTable";
import "./Notifications.css";

/**
 * Page « Plannings » du responsable d'exploitation.
 * Liste seule : les alertes (plannings reçus, DDR refusées, NAPT reçues)
 * sont regroupées sur la page d'accueil.
 */
export default function Notifications() {
  const navigate = useNavigate();
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = getCurrentUser();
  const userEntiteId = user?.entite_metier?.id;

  useEffect(() => {
    const fetchPlannings = async () => {
      try {
        setLoading(true);
        const data = await getPlannings(1);
        const results = data.results || data;
        setPlannings(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error("Erreur plannings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlannings();
  }, [userEntiteId]);

  const handlePlanningClick = (planning) => {
    navigate(`/dashboard/Planning/${planning.id}`);
  };

  return (
    <div className="notifications-wrapper">
      <PlanningTable
        plannings={plannings}
        loading={loading}
        onRowClick={handlePlanningClick}
      />
    </div>
  );
}
