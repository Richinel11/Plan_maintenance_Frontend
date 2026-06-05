import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchAlertes } from '../../../services/gplanService';
import './AlertesView.css';

const FILTRES = [
    { key: 'TOUS',    label: 'Tous'      },
    { key: 'CONFLIT', label: 'Conflits'  },
    { key: 'RESOLU',  label: 'Résolus'   },
];

const SEGMENT_COLORS = {
    TRANSPORT:    { bg: '#f0fdf4', text: '#15803d', dot: '#16a34a' },
    DISTRIBUTION: { bg: '#fff7ed', text: '#c2410c', dot: '#ea580c' },
    PRODUCTION:   { bg: '#eff6ff', text: '#1d4ed8', dot: '#2563eb' },
};

const fmt = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
};

const AlertesView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [groupes,  setGroupes]  = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);
    const [filtre,   setFiltre]   = useState('TOUS');

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        fetchAlertes()
            .then(setGroupes)
            .catch((err) => {
                console.error('[AlertesView] Erreur chargement alertes :', err?.response?.data || err.message);
                setError(`Impossible de charger les alertes. (${err?.response?.status ?? 'réseau'})`);
            })
            .finally(() => setLoading(false));
    }, []);

    // Recharge à chaque fois qu'on arrive sur cette page
    useEffect(() => { load(); }, [load, location.key]);

    const filtered = groupes.filter(g => {
        if (filtre === 'TOUS')    return true;
        if (filtre === 'RESOLU')  return g.statut === 'RESOLU';
        if (filtre === 'CONFLIT') return g.statut !== 'RESOLU';
        return true;
    });

    const nbConflits = groupes.filter(g => g.statut === 'OUVERT').length;
    const nbResolus  = groupes.filter(g => g.statut === 'RESOLU').length;

    const handleClick = (groupe) => {
        navigate('/dashboard/advanced-gantt', { state: { groupe } });
    };

    if (loading) {
        return (
            <div className="al-center">
                <div className="al-spinner" />
                <p>Chargement des alertes…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="al-center">
                <span style={{ fontSize: 36 }}>⚠️</span>
                <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
                <button className="al-filtre-btn" onClick={load}>Réessayer</button>
            </div>
        );
    }

    return (
        <div className="al-page">

            {/* ── En-tête ── */}
            <div className="al-header">
                <div>
                    <h1 className="al-title">Alertes d'harmonisation</h1>
                    <p className="al-subtitle">
                        Conflits et opportunités détectés sur l'ensemble des plannings
                    </p>
                    <button
                        className="al-filtre-btn"
                        style={{ marginTop: 8 }}
                        onClick={load}
                        title="Actualiser la liste"
                    >
                        ↻ Actualiser
                    </button>
                </div>
                <div className="al-stats">
                    <div className="al-stat al-stat-conflit">
                        <span className="al-stat-num">{nbConflits}</span>
                        <span className="al-stat-label">Conflit{nbConflits !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="al-stat al-stat-resolu">
                        <span className="al-stat-num">{nbResolus}</span>
                        <span className="al-stat-label">Résolu{nbResolus !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>

            {/* ── Filtres ── */}
            <div className="al-filtres">
                {FILTRES.map(f => (
                    <button
                        key={f.key}
                        className={`al-filtre-btn ${filtre === f.key ? 'active' : ''}`}
                        onClick={() => setFiltre(f.key)}
                    >
                        {f.label}
                        <span className="al-filtre-badge">
                            {f.key === 'TOUS'    && groupes.length}
                            {f.key === 'CONFLIT' && nbConflits}
                            {f.key === 'RESOLU'  && nbResolus}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Liste des alertes ── */}
            {filtered.length === 0 ? (
                <div className="al-empty">
                    <span style={{ fontSize: 36 }}>
                        {filtre === 'RESOLU' ? '✅' : '🎉'}
                    </span>
                    <p>{filtre === 'RESOLU' ? 'Aucune alerte résolue.' : 'Aucune alerte dans cette catégorie.'}</p>
                </div>
            ) : (
                <div className="al-list">
                    {filtered.map(groupe => (
                        <div
                            key={groupe.id_groupe}
                            className={`al-card ${groupe.type === 'CONFLIT' ? 'al-card-conflit' : 'al-card-opportunite'} ${groupe.statut === 'RESOLU' ? 'al-card-resolu' : ''}`}
                            onClick={() => groupe.statut !== 'RESOLU' && handleClick(groupe)}
                            style={{ cursor: groupe.statut !== 'RESOLU' ? 'pointer' : 'default' }}
                        >
                            {/* Indicateur latéral */}
                            <div className="al-card-side" />

                            {/* Corps */}
                            <div className="al-card-body">

                                {/* Ligne 1 : type + statut */}
                                        <div className="al-card-top">
                                    <span className="al-type-badge badge-conflit">
                                        ⚠️ Conflit
                                    </span>
                                    <span className={`al-statut-badge ${groupe.statut === 'RESOLU' ? 'statut-resolu' : 'statut-ouvert'}`}>
                                        {groupe.statut === 'RESOLU' ? '✓ Résolu' : '● Ouvert'}
                                    </span>
                                </div>

                                {/* Ressources */}
                                <div className="al-ressources">
                                    {groupe.ressources_communes.map((r, i) => (
                                        <span key={i} className="al-ressource-chip">{r}</span>
                                    ))}
                                </div>

                                {/* Travaux */}
                                <div className="al-travaux-list">
                                    {groupe.travaux.map(t => {
                                        const sc = SEGMENT_COLORS[t.segment] || { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af' };
                                        return (
                                            <div key={t.id} className="al-travail-row">
                                                <span className="al-travail-dot" style={{ background: sc.dot }} />
                                                <span className="al-travail-ref">{t.reference}</span>
                                                <span className="al-travail-seg" style={{ background: sc.bg, color: sc.text }}>
                                                    {t.segment}
                                                </span>
                                                <span className="al-travail-planning">{t.planning_nom}</span>
                                                <span className="al-travail-dates">
                                                    {fmt(t.debut)} → {fmt(t.fin)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Détail temporel */}
                                <div className="al-card-footer">
                                    {groupe.chevauchement && groupe.chevauchement !== '—' && (
                                        <span className="al-detail-chip al-detail-conflit">
                                            🕐 {groupe.chevauchement}
                                        </span>
                                    )}
                                    <span className="al-nb-travaux">{groupe.nb_travaux} travaux impliqués</span>
                                    {groupe.statut !== 'RESOLU' && (
                                        <span className="al-cta">Cliquer pour harmoniser →</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AlertesView;
