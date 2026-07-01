import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Alerts from "./Alert/Alert";
import { BsCheckCircle, BsSend } from "react-icons/bs";
import { FaUserCog } from "react-icons/fa";
import { GrLineChart } from "react-icons/gr";
import { getPlannings } from "../../../services/planningService";
import PlanningTable from "../../../components/shared/PlanningTable/PlanningTable";


export default function StatsCards() {
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState([
    { id: 1, title: "Travaux ce mois", value: 0, change: "", type: "positive", icon: <FaUserCog /> },
    { id: 2, title: "Conflits non traités", value: 0, badge: "ATTENTION", type: "danger", icon: <GrLineChart /> },
    { id: 3, title: "Plannings transmis", value: 0, badge: "ÉTABLE", type: "neutral", icon: <BsSend /> },
    { id: 4, title: "Plannings clôturés", value: 0, change: "", type: "positive", icon: <BsCheckCircle /> },
  ]);

  // ── Liste des plannings (toutes entités) à valider ──
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getPlannings(page);
        const results = data.results || data;
        if (!cancelled) {
          setPlannings(Array.isArray(results) ? results : []);
          setTotalItems(data.count ?? (Array.isArray(results) ? results.length : 0));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  return (
    <div className="Home">
      <div className="stats-container">
        {statsData.map((item) => (
          <div className="card" key={item.id}>
            <div className="card-top">
              <div className="icon-box">{item.icon}</div>

              {item.change && <span className="change positive">{item.change}</span>}
              {item.badge && <span className={`badge ${item.type}`}>{item.badge}</span>}
            </div>

            <div className="card-body">
              <p className="label">{item.title}</p>
              <h2 className={`value ${item.type === "danger" ? "danger" : ""}`}>
                {item.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      <Alerts />

      {/* Plannings à valider — toutes entités confondues */}
      <div style={{ marginTop: "24px" }}>
        <PlanningTable
          plannings={plannings}
          loading={loading}
          onRowClick={(p) => navigate(`/dashboard/Planning/${p.id}`)}
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
