import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { getDDRList, getNAPTList } from '../../../services/exploitationService';
import './Historique.css';

/* ── helpers ─────────────────────────────────────────────── */
const fmtDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const initials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
};

const statusMeta = {
  /* DDR */
  EN_ATTENTE: { label: 'En attente', color: 'orange' },
  COMPLETEE:  { label: 'Complétée',  color: 'green'  },
  AUTORISE:   { label: 'Autorisé',   color: 'green'  },
  REFUSE:     { label: 'Refusé',     color: 'red'    },
  REPORTE:    { label: 'Reporté',    color: 'orange' },
  /* NAPT */
  GENEREE:    { label: 'Générée',    color: 'green'  },
  DIFFUSEE:   { label: 'Diffusée',   color: 'blue'   },
};

const isWithinPeriod = (iso, period) => {
  if (!iso || period === 'all') return true;
  const now  = new Date();
  const date = new Date(iso);
  const diffMs = now - date;
  const day  = 86400000;
  if (period === 'day')   return diffMs <= day;
  if (period === 'week')  return diffMs <= day * 7;
  if (period === 'month') return diffMs <= day * 30;
  if (period === 'year')  return diffMs <= day * 365;
  return true;
};

const PAGE_SIZE = 10;

/* ── composant ───────────────────────────────────────────── */
const Historique = ({ ddrOnly = false, naptOnly = false, naptStatut = null, ddrStatut = null, ddrExcludeStatut = null, onRowClick = null }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // IDs des DDR fraîchement générées (transmis depuis Planning.jsx via navigate state).
  const newDDRIds = useMemo(
    () => new Set(location.state?.newDDRIds || []),
    [location.state]
  );

  const [ddrs,    setDdrs]    = useState([]);
  const [napts,   setNapts]   = useState([]);
  const [loading, setLoading] = useState(true);

  const [search,  setSearch]  = useState('');
  const [period,  setPeriod]  = useState('all');
  const [typeFilter, setTypeFilter] = useState(ddrOnly ? 'DDR' : naptOnly ? 'NAPT' : 'all');
  const [page,    setPage]    = useState(1);

  /* fetch */
  useEffect(() => {
    if (ddrOnly) {
      getDDRList()
        .then(res => {
          let all = res.data || [];
          if (ddrStatut) all = all.filter(d => d.statut === ddrStatut);
          if (ddrExcludeStatut) all = all.filter(d => d.statut !== ddrExcludeStatut);
          setDdrs(all);
        })
        .catch(() => toast.error('Impossible de charger les DDR.'))
        .finally(() => setLoading(false));
    } else if (naptOnly) {
      getNAPTList()
        .then(res => {
          let all = res.data || [];
          if (naptStatut) all = all.filter(n => n.statut === naptStatut);
          setNapts(all);
        })
        .catch(() => toast.error('Impossible de charger les NAPT.'))
        .finally(() => setLoading(false));
    } else {
      Promise.all([getDDRList(), getNAPTList()])
        .then(([ddrRes, naptRes]) => {
          let allDdrs  = ddrRes.data  || [];
          if (ddrExcludeStatut) allDdrs = allDdrs.filter(d => d.statut !== ddrExcludeStatut);
          const allNapts = naptRes.data || [];
          setDdrs(allDdrs);
          const travailIds = new Set(allDdrs.map(d => d.travail?.id));
          setNapts(allNapts.filter(n => travailIds.has(n.travail?.id)));
        })
        .catch(() => toast.error('Impossible de charger l\'historique.'))
        .finally(() => setLoading(false));
    }
  }, [ddrOnly, naptOnly, naptStatut]);

  /* stats */
  const stats = useMemo(() => {
    const total    = ddrs.length;
    const enCours  = ddrs.filter(d => d.statut === 'EN_ATTENTE').length;
    const autorise = ddrs.filter(d => d.statut === 'AUTORISE').length;
    const taux     = total > 0 ? ((autorise / total) * 100).toFixed(1) : '0.0';
    const naptPrets = napts.filter(n => n.statut === 'GENEREE').length;
    return { total, enCours, taux, naptPrets };
  }, [ddrs, napts]);

  /* fusion DDR + NAPT en une liste unifiée */
  const allItems = useMemo(() => {
    const ddrItems = ddrs.map(d => ({
      type:      'DDR',
      reference: d.reference || `DDR-${String(d.id).slice(0, 8).toUpperCase()}`,
      statut:    d.statut,
      date:      d.date_decision || d.date_emission,
      entity:    d.travail?.unite_demanderesse?.nom || '—',
      owner:     d.decide_par_nom || d.emis_par_nom || '—',
      id:        d.id,
    }));

    const naptItems = napts.map(n => ({
      type:      'NAPT',
      reference: n.reference || `NAPT-${String(n.id).slice(0, 8).toUpperCase()}`,
      statut:    n.statut,
      date:      n.date_diffusion || n.travail?.heure_debut_planifie,
      entity:    n.travail?.unite_demanderesse?.nom || '—',
      owner:     n.genere_par_nom || '—',
      id:        n.id,
    }));

    return [...ddrItems, ...naptItems]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [ddrs, napts]);

  /* filtres */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allItems.filter(item => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (!isWithinPeriod(item.date, period)) return false;
      if (q && !item.reference.toLowerCase().includes(q)
            && !item.entity.toLowerCase().includes(q)
            && !item.owner.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allItems, search, period, typeFilter]);

  /* pagination */
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  const handleRowClick = (item) => {
    if (onRowClick) { onRowClick(item); return; }
    if (item.type === 'DDR') {
      // DDR en attente → DDRDetailPage (éditable) ; autres statuts → consultation (lecture seule)
      if (item.statut === 'EN_ATTENTE') {
        navigate(`/dashboard/ddr/${item.id}`);
      } else {
        navigate(`/dashboard/consultation/ddr/${item.id}`);
      }
    }
    if (item.type === 'NAPT') navigate(`/dashboard/consultation/napt/${item.id}`);
  };

  const periodLabels = { all: 'Tout', day: 'Jour', week: 'Semaine', month: 'Mois', year: 'Année' };

  if (loading) return <div className="hist-loading">Chargement de l'historique...</div>;

  return (
    <div className="hist-page">

      {/* ── EN-TÊTE ─── */}
      <div className="hist-header">
        <h1 className="hist-title">Historique des Opérations</h1>
        <p className="hist-subtitle">
          Consultation centralisée de l'ensemble de vos dossiers DDR et NAPT.
        </p>
      </div>

      {/* ── STATS ─── */}
      <div className="hist-stats">
        <div className="hist-stat-card">
          <div className="hist-stat-label">TOTAL DDR</div>
          <div className="hist-stat-value">{stats.total.toLocaleString()}</div>
        </div>
        <div className="hist-stat-card">
          <div className="hist-stat-label">EN COURS</div>
          <div className="hist-stat-value">{stats.enCours}</div>
        </div>
        <div className="hist-stat-card hist-stat-card--blue">
          <div className="hist-stat-label">TAUX VALIDATION</div>
          <div className="hist-stat-value hist-stat-value--blue">{stats.taux}%</div>
        </div>
        <div className="hist-stat-card hist-stat-card--green">
          <div className="hist-stat-label">NAPT PRÊTS</div>
          <div className="hist-stat-value hist-stat-value--green">
            {String(stats.naptPrets).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* ── FILTRES ─── */}
      <div className="hist-filters">

        <div className="hist-search-wrap">
          <span className="material-symbols-outlined hist-search-icon">search</span>
          <input
            className="hist-search"
            placeholder="Recherche par Référence, Entité ou Responsable..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="hist-filter-right">
          <div className="hist-period-tabs">
            {Object.entries(periodLabels).map(([key, label]) => (
              <button
                key={key}
                className={`hist-period-btn${period === key ? ' hist-period-btn--active' : ''}`}
                onClick={() => { setPeriod(key); setPage(1); }}
              >
                {label}
              </button>
            ))}
          </div>

          {!ddrOnly && !naptOnly && (
            <select
              className="hist-type-select"
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            >
              <option value="all">Tous les types</option>
              <option value="DDR">DDR</option>
              <option value="NAPT">NAPT</option>
            </select>
          )}
        </div>

      </div>

      {/* ── TABLEAU ─── */}
      <div className="hist-table-wrap">
        <table className="hist-table">
          <thead>
            <tr>
              <th>TYPE</th>
              <th>RÉFÉRENCE</th>
              <th>STATUT FINAL</th>
              <th>DATE D'ACTION</th>
              <th>ENTITÉ</th>
              <th>RESPONSABLE</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="hist-empty">Aucun résultat trouvé</td>
              </tr>
            ) : (
              pageItems.map((item, i) => {
                const meta = statusMeta[item.statut] || { label: item.statut, color: 'grey' };
                return (
                  <tr
                    key={i}
                    className="hist-row hist-row--clickable"
                    onClick={() => handleRowClick(item)}
                  >
                    <td>
                      <span className={`hist-badge hist-badge--${item.type.toLowerCase()}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="hist-ref">
                      #{item.reference}
                      {item.type === 'DDR' && newDDRIds.has(item.id) && (
                        <span style={{
                          marginLeft: "8px",
                          padding: "2px 7px",
                          borderRadius: "10px",
                          fontSize: "10px",
                          fontWeight: "700",
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          verticalAlign: "middle",
                          letterSpacing: "0.03em",
                        }}>
                          NOUVEAU
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`hist-status hist-status--${meta.color}`}>
                        <span className="hist-dot" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="hist-date">{fmtDateTime(item.date)}</td>
                    <td>{item.entity}</td>
                    <td>
                      <div className="hist-owner">
                        <span className="hist-avatar">{initials(item.owner)}</span>
                        {item.owner}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION ─── */}
      <div className="hist-pagination">
        <span className="hist-pag-info">
          Affichage de {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} sur {filtered.length} résultats
        </span>
        <div className="hist-pag-controls">
          <button className="hist-pag-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>‹</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let p;
            if (totalPages <= 5) p = i + 1;
            else if (currentPage <= 3) p = i + 1;
            else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
            else p = currentPage - 2 + i;
            return (
              <button
                key={p}
                className={`hist-pag-btn${currentPage === p ? ' hist-pag-btn--active' : ''}`}
                onClick={() => handlePageChange(p)}
              >
                {p}
              </button>
            );
          })}
          {totalPages > 5 && currentPage < totalPages - 2 && <span className="hist-pag-ellipsis">...</span>}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <button className="hist-pag-btn" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
          )}
          <button className="hist-pag-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>›</button>
        </div>
      </div>

    </div>
  );
};

export default Historique;
