import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdvancedGantt.css";
import { FaExclamationTriangle, FaLightbulb, FaBolt, FaBell } from "react-icons/fa";
import { BsCheckCircleFill } from "react-icons/bs";
import { RiCloseCircleLine } from "react-icons/ri";
import { AiOutlineTool } from "react-icons/ai";
import {
    analyserChevauchements,
    appliquerProposition,
    refuserProposition,
} from "../../../../services/gplanService";

const SEGMENT_ICON = { TRANSPORT: <FaBolt />, DISTRIBUTION: <FaBell />, PRODUCTION: <FaBolt /> };

const fmt = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} ${d.getHours().toString().padStart(2,'0')}h${d.getMinutes().toString().padStart(2,'0')}`;
};

export default function AdvancedGantt() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const groupe    = location.state?.groupe || null;

    const [propositions,  setPropositions]  = useState([]);
    const [planningId,    setPlanningId]    = useState(null);
    const [loading,       setLoading]       = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [message,       setMessage]       = useState(null);

    // ── Chargement des propositions au montage ─────────────────────────────
    useEffect(() => {
        if (!groupe) return;

        // Prend le planningId du premier travail qui peut bouger,
        // ou du premier travail si aucun ne peut bouger.
        const cible = groupe.travaux.find(t => t.peut_bouger) || groupe.travaux[0];
        if (!cible?.planning_id) return;

        setPlanningId(cible.planning_id);
        setLoading(true);
        analyserChevauchements(cible.planning_id)
            .then(data => setPropositions(data.propositions || []))
            .catch(() => setPropositions([]))
            .finally(() => setLoading(false));
    }, [groupe?.id_groupe]);

    // ── Actions ────────────────────────────────────────────────────────────
    const handleAppliquer = async (proposition) => {
        if (!planningId) return;
        setActionLoading(proposition.id);
        try {
            await appliquerProposition(planningId, proposition.id);
            setPropositions(prev => prev.filter(p => p.id !== proposition.id));
            setMessage({ type: 'ok', text: 'Proposition appliquée avec succès.' });
        } catch {
            setMessage({ type: 'err', text: 'Erreur lors de l\'application.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRefuser = async (proposition) => {
        if (!planningId) return;
        setActionLoading(proposition.id);
        try {
            await refuserProposition(planningId, proposition.id);
            setPropositions(prev => prev.filter(p => p.id !== proposition.id));
            setMessage({ type: 'ok', text: 'Proposition refusée.' });
        } catch {
            setMessage({ type: 'err', text: 'Erreur lors du refus.' });
        } finally {
            setActionLoading(null);
        }
    };

    // ── Pas de groupe reçu ─────────────────────────────────────────────────
    if (!groupe) {
        return (
            <div className="ag-page">
                <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                    <FaExclamationTriangle size={32} style={{ marginBottom: 12 }} />
                    <p>Aucune alerte sélectionnée.</p>
                    <button
                        className="ag-btn-adjust"
                        style={{ marginTop: 16 }}
                        onClick={() => navigate('/dashboard/alertes')}
                    >
                        ← Retour aux alertes
                    </button>
                </div>
            </div>
        );
    }

    const isConflit = groupe.type === 'CONFLIT';

    return (
        <div className="ag-page">

            {/* ── Retour ── */}
            <button
                className="ag-btn-back"
                onClick={() => navigate('/dashboard/alertes')}
            >
                ← Retour aux alertes
            </button>

            {/* ── Message feedback ── */}
            {message && (
                <div className={`ag-feedback ${message.type === 'ok' ? 'ag-feedback-ok' : 'ag-feedback-err'}`}>
                    {message.text}
                    <button onClick={() => setMessage(null)}>✕</button>
                </div>
            )}

            {/* 1 ── Alert Banner ── */}
            <div className="ag-alert-banner">
                <FaExclamationTriangle className="ag-alert-icon" />
                <div className="ag-alert-content">
                    <h3>
                        {isConflit
                            ? 'Diagnostic : Alerte de Co-activité'
                            : 'Opportunité d\'harmonisation détectée'}
                    </h3>
                    <p>
                        <span className="ag-highlight">
                            {groupe.nb_travaux} travaux
                        </span>{' '}
                        {isConflit
                            ? `en chevauchement sur : ${groupe.ressources_communes.join(', ')}.`
                            : `sur la même ressource cette semaine (${groupe.semaine || ''}) : ${groupe.ressources_communes.join(', ')}.`}
                        {isConflit && groupe.chevauchement && (
                            <> Plage de conflit : <strong>{groupe.chevauchement}</strong>.</>
                        )}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                        {groupe.travaux.map(t => (
                            <span key={t.id} className="ag-conflict-ref-badge">
                                {t.reference} — {t.segment}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2 ── Travaux impliqués ── */}
            <div className="ag-availability">
                <div className="ag-avail-header">
                    <AiOutlineTool className="ag-avail-icon" />
                    <h3>Travaux impliqués</h3>
                </div>
                <table className="ag-table">
                    <thead>
                        <tr>
                            <th>SEGMENT</th>
                            <th>RÉFÉRENCE</th>
                            <th>PLANNING</th>
                            <th>DÉBUT</th>
                            <th>FIN</th>
                            <th>PEUT BOUGER</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupe.travaux.map(t => (
                            <tr key={t.id}>
                                <td>
                                    <span className={`ag-seg-badge ag-seg-${t.segment?.toLowerCase()}`}>
                                        {SEGMENT_ICON[t.segment]} {t.segment}
                                    </span>
                                </td>
                                <td><strong>{t.reference}</strong></td>
                                <td>{t.planning_nom}</td>
                                <td>{fmt(t.debut)}</td>
                                <td>{fmt(t.fin)}</td>
                                <td>{t.peut_bouger ? '✅ Oui' : '🔒 Non'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 3 ── Propositions ── */}
            <div className="ag-suggestion">
                <div className="ag-suggestion-header">
                    <div className="ag-suggestion-left">
                        <span className="ag-suggestion-badge">PROPOSITIONS</span>
                        <span className="ag-suggestion-subtitle">
                            {loading ? 'Chargement…' : `${propositions.length} proposition(s) générée(s)`}
                        </span>
                    </div>
                    <FaLightbulb className="ag-suggestion-bulb" />
                </div>

                {loading && <p style={{ color: '#94a3b8', padding: '12px 0' }}>Analyse en cours…</p>}

                {!loading && propositions.length === 0 && (
                    <p style={{ color: '#94a3b8', fontSize: 13, padding: '8px 0' }}>
                        Aucune proposition disponible — réajustement manuel requis.
                    </p>
                )}

                {!loading && propositions.map(p => (
                    <div key={p.id} className={`ag-prop-card ${p.statut === 'BLOQUEE' ? 'ag-prop-bloquee' : ''}`}>
                        <div className="ag-prop-header">
                            <span className="ag-prop-ref">{p.travail_a_modifier_ref || 'Travail'}</span>
                            <span className={`ag-prop-statut statut-${p.statut?.toLowerCase()}`}>{p.statut}</span>
                        </div>
                        <p className="ag-prop-raison">{p.raison}</p>
                        {p.note_compatibilite_types && (
                            <p className="ag-prop-note">{p.note_compatibilite_types}</p>
                        )}
                        <div className="ag-suggestion-time">
                            <span className="ag-time-label">ANCIEN HORAIRE</span>
                            <span className="ag-time-value">{fmt(p.ancien_debut)}</span>
                            <span className="ag-arrow">→</span>
                            <span className="ag-time-label">NOUVEL HORAIRE</span>
                            <span className="ag-time-value" style={{ color: '#16a34a' }}>{fmt(p.nouveau_debut)}</span>
                        </div>
                        {p.statut === 'EN_ATTENTE' && (
                            <div className="ag-prop-actions">
                                <button
                                    className="ag-btn-validate"
                                    disabled={actionLoading === p.id}
                                    onClick={() => handleAppliquer(p)}
                                >
                                    <BsCheckCircleFill size={13} />
                                    {actionLoading === p.id ? 'Application…' : 'Appliquer'}
                                </button>
                                <button
                                    className="ag-btn-reject"
                                    disabled={actionLoading === p.id}
                                    onClick={() => handleRefuser(p)}
                                >
                                    <RiCloseCircleLine size={15} /> Refuser
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* 4 ── Actions globales ── */}
            <div className="ag-actions">
                <div className="ag-actions-left">
                    <button
                        className="ag-btn-adjust"
                        onClick={() => navigate('/dashboard/reajustement-avance', { state: { groupe } })}
                    >
                        <AiOutlineTool size={14} /> Réajuster manuellement
                    </button>
                </div>
                <div className="ag-actions-right">
                    <button
                        className="ag-btn-reject"
                        onClick={() => navigate('/dashboard/alertes')}
                    >
                        <RiCloseCircleLine size={16} /> Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
