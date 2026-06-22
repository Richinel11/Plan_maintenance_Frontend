import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchAllPlannings, analyserChevauchements, clearCache } from '../../../services/gplanService';
import './AlertesView.css';

function buildGroupeFromChevauchement(chev, planningId, planningNom) {
    const allTravaux = [
        {
            id:          chev.reference.id,
            reference:   chev.reference.ressource,
            segment:     chev.reference.segment,
            planning_id: planningId,
            planning_nom: planningNom,
            debut:       chev.reference.debut,
            fin:         chev.reference.fin,
            peut_bouger: chev.reference.peut_bouger,
        },
        ...chev.travaux_en_conflit.map(t => ({
            id:          t.id,
            reference:   t.ressource,
            segment:     t.segment,
            planning_id: planningId,
            planning_nom: planningNom,
            debut:       t.debut,
            fin:         t.fin,
            peut_bouger: t.peut_bouger,
        })),
    ];

    const ressourcesCommunes = [...new Set(
        chev.travaux_en_conflit.flatMap(t => t.ressources_communes)
    )];
    const ressourcesAffichees = ressourcesCommunes.length > 0
        ? ressourcesCommunes
        : [chev.reference.ressource];

    return {
        id_groupe:        chev.reference.id.slice(0, 12),
        type:             'CONFLIT',
        statut:           'OUVERT',
        planning_id:      planningId,
        ressources_communes: ressourcesAffichees,
        chevauchement:    `${chev.reference.debut} → ${chev.reference.fin}`,
        nb_travaux:       allTravaux.length,
        travaux:          allTravaux,
    };
}

const FILTRES = [
    { key: 'TOUS',    label: 'Tous'      },
    { key: 'CONFLIT', label: 'Conflits'  },
];

const SEGMENT_COLORS = {
    TRANSPORT:    { bg: '#f0fdf4', text: '#15803d', dot: '#16a34a' },
    DISTRIBUTION: { bg: '#fff7ed', text: '#c2410c', dot: '#ea580c' },
    PRODUCTION:   { bg: '#eff6ff', text: '#1d4ed8', dot: '#2563eb' },
};


const AlertesView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [groupes,  setGroupes]  = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState(null);
    const [filtre,   setFiltre]   = useState('TOUS');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const plannings = await fetchAllPlannings();

            const results = await Promise.allSettled(
                plannings.map(p =>
                    analyserChevauchements(p.id).then(data => ({
                        planningId:  p.id,
                        planningNom: p.nom,
                        chevauchements: data.chevauchements || [],
                    }))
                )
            );

            const groupes = [];
            for (const r of results) {
                if (r.status !== 'fulfilled') continue;
                const { planningId, planningNom, chevauchements } = r.value;
                for (const chev of chevauchements) {
                    groupes.push(buildGroupeFromChevauchement(chev, planningId, planningNom));
                }
            }
            setGroupes(groupes);
        } catch (err) {
            console.error('[AlertesView] Erreur chargement alertes :', err?.response?.data || err.message);
            setError(`Impossible de charger les alertes. (${err?.response?.status ?? 'réseau'})`);
        } finally {
            setLoading(false);
        }
    }, []);

    // Recharge à chaque fois qu'on arrive sur cette page
    useEffect(() => { load(); }, [load, location.key]);

    const filtered = groupes.filter(g => {
        if (filtre === 'TOUS')    return true;
        if (filtre === 'CONFLIT') return true;
        return true;
    });

    const nbConflits = groupes.length;

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
                        onClick={() => { clearCache(); load(); }}
                        title="Actualiser la liste"
                    >
                        ↻ Actualiser
                    </button>
                </div>
                <div className="al-stats">
                    <div className="al-stat al-stat-conflit">
                        <span className="al-stat-num">{nbConflits}</span>
                        <span className="al-stat-label">Conflit{nbConflits !== 1 ? 's' : ''} détecté{nbConflits !== 1 ? 's' : ''}</span>
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
                            {groupes.length}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Liste des alertes ── */}
            {filtered.length === 0 ? (
                <div className="al-empty">
                    <span style={{ fontSize: 36 }}>🎉</span>
                    <p>Aucun conflit détecté sur les plannings.</p>
                </div>
            ) : (
                <div className="al-list">
                    {filtered.map(groupe => (
                        <div
                            key={groupe.id_groupe}
                            className="al-card al-card-conflit"
                            onClick={() => handleClick(groupe)}
                            style={{ cursor: 'pointer' }}
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
                                    <span className="al-statut-badge statut-ouvert">
                                        ● Ouvert
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
                                                    {t.debut} → {t.fin}
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
                                    <span className="al-cta">Cliquer pour voir les propositions →</span>
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
