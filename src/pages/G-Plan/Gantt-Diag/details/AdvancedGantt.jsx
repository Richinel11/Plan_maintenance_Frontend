import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdvancedGantt.css";
import { FaExclamationTriangle, FaLightbulb, FaBolt, FaBell } from "react-icons/fa";
import { BsCheckCircleFill } from "react-icons/bs";
import { RiCloseCircleLine } from "react-icons/ri";
import { AiOutlineTool } from "react-icons/ai";
import {
    fetchPropositions,
    appliquerProposition,
    refuserProposition,
} from "../../../../services/gplanService";

const SEGMENT_ICON = { TRANSPORT: <FaBolt />, DISTRIBUTION: <FaBell />, PRODUCTION: <FaBolt /> };

const fmt = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} ${d.getHours().toString().padStart(2,'0')}h${d.getMinutes().toString().padStart(2,'0')}`;
};

// ── Carte proposition ──────────────────────────────────────────────────────────
function PropCard({ p, actionLoading, onAppliquer, onRefuser, onReajuster }) {
    const isBloquee      = p.statut === 'BLOQUEE';
    const isChargeConfl  = p.conflit_charge_consignation;

    return (
        <div className={`ag-prop-card ${isBloquee ? 'ag-prop-bloquee' : 'ag-prop-libre'}`}>

            {/* ── Bandeau latéral coloré ── */}
            <div className={`ag-prop-side ${isBloquee ? 'side-bloquee' : 'side-libre'}`} />

            <div className="ag-prop-inner">

                {/* En-tête */}
                <div className="ag-prop-header">
                    <div className="ag-prop-header-left">
                        <span className="ag-prop-ref">{p.travail_a_modifier_ref || 'Travail'}</span>
                        {p.priorite_travail && (
                            <span className={`ag-prop-prio prio-${p.priorite_travail?.toLowerCase()}`}>
                                {p.priorite_travail}
                            </span>
                        )}
                    </div>
                    <span className={`ag-prop-statut statut-${p.statut?.toLowerCase()}`}>
                        {isBloquee ? '🔒 Bloquée' : '⏳ En attente'}
                    </span>
                </div>

                {/* Référence de calage */}
                <div className="ag-prop-ref-line">
                    <span className="ag-prop-ref-label">Aligner sur :</span>
                    <span className="ag-prop-ref-val">{p.travail_reference_ref || '—'}</span>
                </div>

                {/* Timeline */}
                <div className="ag-prop-timeline">
                    <div className="ag-prop-time-block old">
                        <span className="ag-tl-label">AVANT</span>
                        <span className="ag-tl-main">{fmt(p.ancien_debut)}</span>
                        <span className="ag-tl-end">→ {fmt(p.ancienne_fin)}</span>
                    </div>
                    <div className="ag-tl-arrow">→</div>
                    <div className={`ag-prop-time-block ${isBloquee ? 'proposed-blocked' : 'proposed-free'}`}>
                        <span className="ag-tl-label">PROPOSÉ</span>
                        <span className="ag-tl-main">{fmt(p.nouveau_debut)}</span>
                        <span className="ag-tl-end">→ {fmt(p.nouvelle_fin)}</span>
                    </div>
                </div>

                {/* Raison du blocage */}
                {isBloquee && (
                    <div className={`ag-prop-blocage ${isChargeConfl ? 'blocage-charge' : 'blocage-fixe'}`}>
                        <span className="ag-blocage-icon">{isChargeConfl ? '⚠️' : '🔒'}</span>
                        <div className="ag-blocage-text">
                            <span className="ag-blocage-title">
                                {isChargeConfl
                                    ? 'Conflit — Chargé de consignation indisponible'
                                    : 'Travail non déplaçable (Transport ou P1)'}
                            </span>
                            <p className="ag-blocage-detail">
                                {isChargeConfl
                                    ? (p.detail_conflit || 'Le chargé de consignation est déjà affecté à ce créneau.')
                                    : 'Ce travail ne peut pas être rééchelonné automatiquement. Un réajustement manuel est nécessaire.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Note compatibilité (EN_ATTENTE seulement) */}
                {!isBloquee && p.note_compatibilite_types && (
                    <p className="ag-prop-note">{p.note_compatibilite_types}</p>
                )}

                {/* Actions EN_ATTENTE */}
                {p.statut === 'EN_ATTENTE' && (
                    <div className="ag-prop-actions">
                        <button
                            className="ag-btn-validate"
                            disabled={actionLoading === p.id}
                            onClick={() => onAppliquer(p)}
                        >
                            <BsCheckCircleFill size={13} />
                            {actionLoading === p.id ? 'Application…' : 'Appliquer'}
                        </button>
                        <button
                            className="ag-btn-reject"
                            disabled={actionLoading === p.id}
                            onClick={() => onRefuser(p)}
                        >
                            <RiCloseCircleLine size={15} /> Refuser
                        </button>
                    </div>
                )}

                {/* CTA manuel BLOQUEE */}
                {isBloquee && (
                    <div className="ag-prop-manual-cta">
                        <span className="ag-manual-label">Résolution manuelle requise</span>
                        <button className="ag-btn-manual" onClick={onReajuster}>
                            <AiOutlineTool size={13} /> Réajuster manuellement
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Composant principal ────────────────────────────────────────────────────────
export default function AdvancedGantt() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const groupe    = location.state?.groupe           || null;
    const propState = location.state?.propositionsGroupe ?? null;

    const [propositions,  setPropositions]  = useState([]);
    const [loading,       setLoading]       = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [message,       setMessage]       = useState(null);

    useEffect(() => {
        if (!groupe) return;

        if (propState !== null) {
            setPropositions(propState);
            return;
        }

        const pid = groupe.planning_id || groupe.travaux?.[0]?.planning_id;
        if (!pid) return;

        setLoading(true);
        fetchPropositions(pid, 'EN_ATTENTE')
            .then(data => setPropositions(Array.isArray(data) ? data : []))
            .catch(() => setPropositions([]))
            .finally(() => setLoading(false));
    }, [groupe?.id_groupe]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAppliquer = async (p) => {
        const pid = p.planning;
        if (!pid) return;
        setActionLoading(p.id);
        try {
            await appliquerProposition(pid, p.id);
            setPropositions(prev => prev.filter(x => x.id !== p.id));
            setMessage({ type: 'ok', text: 'Proposition appliquée avec succès.' });
        } catch {
            setMessage({ type: 'err', text: "Erreur lors de l'application." });
        } finally {
            setActionLoading(null);
        }
    };

    const handleRefuser = async (p) => {
        const pid = p.planning;
        if (!pid) return;
        setActionLoading(p.id);
        try {
            await refuserProposition(pid, p.id);
            setPropositions(prev => prev.filter(x => x.id !== p.id));
            setMessage({ type: 'ok', text: 'Proposition refusée.' });
        } catch {
            setMessage({ type: 'err', text: 'Erreur lors du refus.' });
        } finally {
            setActionLoading(null);
        }
    };

    const goReajuster = () =>
        navigate('/dashboard/reajustement-avance', { state: { groupe } });

    if (!groupe) {
        return (
            <div className="ag-page">
                <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                    <FaExclamationTriangle size={32} style={{ marginBottom: 12 }} />
                    <p>Aucune alerte sélectionnée.</p>
                    <button className="ag-btn-adjust" style={{ marginTop: 16 }}
                        onClick={() => navigate('/dashboard/alertes')}>
                        ← Retour aux alertes
                    </button>
                </div>
            </div>
        );
    }

    const nbLibres   = propositions.filter(p => p.statut === 'EN_ATTENTE').length;
    const nbBloquees = propositions.filter(p => p.statut === 'BLOQUEE').length;
    const isConflit  = groupe.type === 'CONFLIT';

    return (
        <div className="ag-page">

            {/* Retour */}
            <button className="ag-btn-back" onClick={() => navigate('/dashboard/alertes')}>
                ← Retour aux alertes
            </button>

            {/* Feedback */}
            {message && (
                <div className={`ag-feedback ${message.type === 'ok' ? 'ag-feedback-ok' : 'ag-feedback-err'}`}>
                    {message.text}
                    <button onClick={() => setMessage(null)}>✕</button>
                </div>
            )}

            {/* 1 ── Bannière alerte ── */}
            <div className="ag-alert-banner">
                <FaExclamationTriangle className="ag-alert-icon" />
                <div className="ag-alert-content">
                    <h3>
                        {isConflit
                            ? 'Diagnostic : Alerte de Co-activité'
                            : "Opportunité d'harmonisation détectée"}
                    </h3>
                    <p>
                        <span className="ag-highlight">{groupe.nb_travaux} travaux</span>{' '}
                        {isConflit
                            ? `en chevauchement sur : ${groupe.ressources_communes.join(', ')}.`
                            : `sur la même ressource : ${groupe.ressources_communes.join(', ')}.`}
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
                                <td>{t.debut}</td>
                                <td>{t.fin}</td>
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

                {/* Résumé rapide */}
                {!loading && propositions.length > 0 && (
                    <div className="ag-prop-summary">
                        <span className="ag-sum-item sum-libre">
                            ✅ {nbLibres} applicable{nbLibres !== 1 ? 's' : ''}
                        </span>
                        <span className="ag-sum-item sum-bloquee">
                            🔒 {nbBloquees} bloquée{nbBloquees !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}

                {loading && (
                    <p style={{ color: '#94a3b8', padding: '12px 0' }}>Chargement…</p>
                )}

                {!loading && propositions.length === 0 && (
                    <p style={{ color: '#94a3b8', fontSize: 13, padding: '8px 0' }}>
                        Aucune proposition disponible — réajustement manuel requis.
                    </p>
                )}

                {!loading && propositions.map(p => (
                    <PropCard
                        key={p.id}
                        p={p}
                        actionLoading={actionLoading}
                        onAppliquer={handleAppliquer}
                        onRefuser={handleRefuser}
                        onReajuster={goReajuster}
                    />
                ))}
            </div>

            {/* 4 ── Actions globales ── */}
            <div className="ag-actions">
                <div className="ag-actions-left">
                    <button className="ag-btn-adjust" onClick={goReajuster}>
                        <AiOutlineTool size={14} /> Réajuster manuellement
                    </button>
                </div>
                <div className="ag-actions-right">
                    <button className="ag-btn-reject" onClick={() => navigate('/dashboard/alertes')}>
                        <RiCloseCircleLine size={16} /> Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
