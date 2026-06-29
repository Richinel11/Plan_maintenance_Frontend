import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { analyserMois } from '../../../services/gplanService';
import './AlertesView.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOIS_LABELS = [
    '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const SEGMENT_COLORS = {
    TRANSPORT:                 { bg: '#f0fdf4', text: '#15803d', dot: '#16a34a' },
    DISTRIBUTION_POSTE_SOURCE: { bg: '#fff7ed', text: '#c2410c', dot: '#ea580c' },
    DISTRIBUTION_LIGNE:        { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
    PRODUCTION:                { bg: '#eff6ff', text: '#1d4ed8', dot: '#2563eb' },
};

const FILTRES = [
    { key: 'TOUS',    label: 'Tous'     },
    { key: 'CONFLIT', label: 'Conflits' },
];

// Construit un groupe uniforme depuis un chevauchement retourné par analyser-mois
function buildGroupe(chev) {
    const ref = chev.reference;
    return {
        id_groupe:           ref.id.slice(0, 12),
        type:                'CONFLIT',
        statut:              'OUVERT',
        ressources_communes: [ref.ressource],
        chevauchement:       `${ref.debut} → ${ref.fin}`,
        nb_travaux:          1 + chev.travaux_en_conflit.length,
        travaux: [
            {
                id:          ref.id,
                reference:   ref.ressource,
                segment:     ref.segment,
                planning_nom: ref.planning_nom,
                debut:       ref.debut,
                fin:         ref.fin,
                peut_bouger: ref.peut_bouger,
            },
            ...chev.travaux_en_conflit.map(t => ({
                id:          t.id,
                reference:   t.ressource,
                segment:     t.segment,
                planning_nom: t.planning_nom,
                debut:       t.debut,
                fin:         t.fin,
                peut_bouger: t.peut_bouger,
            })),
        ],
    };
}

// ── Composant ─────────────────────────────────────────────────────────────────

const AlertesView = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const now = new Date();
    const [mois,         setMois]         = useState(now.getMonth() + 1);
    const [annee,        setAnnee]        = useState(now.getFullYear());
    const [groupes,      setGroupes]      = useState([]);
    const [propositions, setPropositions] = useState([]);
    const [resume,       setResume]       = useState(null);
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState(null);
    const [filtre,       setFiltre]       = useState('TOUS');
    const [analyse,      setAnalyse]      = useState(false);

    // Fonction de chargement : prend annee/mois en paramètres explicites
    // pour ne pas dépendre du state et éviter des appels non voulus
    const fetchData = useCallback(async (a, m) => {
        setLoading(true);
        setError(null);
        try {
            const data = await analyserMois(a, m);
            setGroupes((data.chevauchements || []).map(buildGroupe));
            setPropositions(data.propositions || []);
            setResume(data.resume || null);
            setAnalyse(true);
        } catch (err) {
            console.error('[AlertesView]', err?.response?.data || err.message);
            setError(`Impossible de charger les alertes. (${err?.response?.status ?? 'réseau'})`);
        } finally {
            setLoading(false);
        }
    }, []);

    // Chargement automatique à l'arrivée sur la page (mois en cours)
    useEffect(() => {
        fetchData(now.getFullYear(), now.getMonth() + 1);
    }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAnalyse = () => fetchData(annee, mois);

    // Clic sur une carte : on filtre les propositions liées à ce groupe et on navigue
    const handleClick = (groupe) => {
        const idsGroupe = new Set(groupe.travaux.map(t => t.id));
        const propositionsGroupe = propositions.filter(p =>
            idsGroupe.has(p.travail_a_modifier)
        );
        navigate('/dashboard/advanced-gantt', {
            state: { groupe, propositionsGroupe },
        });
    };

    const filtered = groupes.filter(g =>
        filtre === 'TOUS' || g.type === filtre
    );

    // ── États de chargement / erreur ─────────────────────────────────────────

    if (loading) {
        return (
            <div className="al-center">
                <div className="al-spinner" />
                <p>Analyse de {MOIS_LABELS[mois]} {annee} en cours…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="al-center">
                <span style={{ fontSize: 36 }}>⚠️</span>
                <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
                <button className="al-filtre-btn" onClick={handleAnalyse}>Réessayer</button>
            </div>
        );
    }

    // ── Rendu principal ───────────────────────────────────────────────────────

    return (
        <div className="al-page">

            {/* ── En-tête ── */}
            <div className="al-header">
                <div>
                    <h1 className="al-title">Alertes d'harmonisation</h1>
                    <p className="al-subtitle">
                        Conflits détectés sur l'ensemble des plannings
                    </p>

                    {/* Sélecteur de période */}
                    <div className="al-period-bar">
                        <select
                            className="al-select"
                            value={mois}
                            onChange={e => setMois(Number(e.target.value))}
                        >
                            {MOIS_LABELS.slice(1).map((label, i) => (
                                <option key={i + 1} value={i + 1}>{label}</option>
                            ))}
                        </select>
                        <input
                            className="al-input-annee"
                            type="number"
                            value={annee}
                            min={2020}
                            max={2035}
                            onChange={e => setAnnee(Number(e.target.value))}
                        />
                        <button className="al-filtre-btn active" onClick={handleAnalyse}>
                            Analyser
                        </button>
                    </div>
                </div>

                {/* Stats résumé */}
                {analyse && resume && (
                    <div className="al-stats">
                        <div className="al-stat al-stat-conflit">
                            <span className="al-stat-num">{groupes.length}</span>
                            <span className="al-stat-label">
                                Conflit{groupes.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="al-stat al-stat-opportunite">
                            <span className="al-stat-num">{resume.total_travaux_analyses}</span>
                            <span className="al-stat-label">Travaux analysés</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Filtres ── */}
            {analyse && (
                <div className="al-filtres">
                    {FILTRES.map(f => (
                        <button
                            key={f.key}
                            className={`al-filtre-btn ${filtre === f.key ? 'active' : ''}`}
                            onClick={() => setFiltre(f.key)}
                        >
                            {f.label}
                            <span className="al-filtre-badge">{groupes.length}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* ── Contenu ── */}
            {!analyse ? (
                <div className="al-empty">
                    <span style={{ fontSize: 36 }}>📋</span>
                    <p>Sélectionnez une période et cliquez sur <strong>Analyser</strong>.</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="al-empty">
                    <span style={{ fontSize: 36 }}>🎉</span>
                    <p>Aucun conflit détecté pour {MOIS_LABELS[mois]} {annee}.</p>
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
                            <div className="al-card-side" />
                            <div className="al-card-body">

                                <div className="al-card-top">
                                    <span className="al-type-badge badge-conflit">⚠️ Conflit</span>
                                    <span className="al-statut-badge statut-ouvert">● Ouvert</span>
                                </div>

                                <div className="al-ressources">
                                    {groupe.ressources_communes.map((r, i) => (
                                        <span key={i} className="al-ressource-chip">{r}</span>
                                    ))}
                                </div>

                                <div className="al-travaux-list">
                                    {groupe.travaux.map(t => {
                                        const sc = SEGMENT_COLORS[t.segment] || { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af' };
                                        return (
                                            <div key={t.id} className="al-travail-row">
                                                <span className="al-travail-dot" style={{ background: sc.dot }} />
                                                <span className="al-travail-ref">{t.reference}</span>
                                                <span className="al-travail-seg" style={{ background: sc.bg, color: sc.text }}>
                                                    {t.segment?.replace(/_/g, ' ')}
                                                </span>
                                                <span className="al-travail-planning">{t.planning_nom}</span>
                                                <span className="al-travail-dates">
                                                    {t.debut} → {t.fin}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="al-card-footer">
                                    <span className="al-detail-chip al-detail-conflit">
                                        🕐 {groupe.chevauchement}
                                    </span>
                                    <span className="al-nb-travaux">
                                        {groupe.nb_travaux} travaux impliqués
                                    </span>
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
