import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlanningById } from '../../services/planningService';
import { getWorkflowById, getPlanningWorkflowHistory, getPlanningCurrentStep } from '../../services/workflowService';
import './PlanningWorkflowDetail.css';

/**
 * Page PlanningWorkflowDetail
 * Affiche le stepper visuel et l'historique complet pour un planning spécifique
 */
const PlanningWorkflowDetail = () => {
    const { planningId } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [planning, setPlanning] = useState(null);
    const [history, setHistory] = useState([]);
    const [allSteps, setAllSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(null);

    useEffect(() => {
        const fetchAuditData = async () => {
            setLoading(true);
            try {
                // 1. Récupérer les détails du planning et son étape actuelle
                const planningData = await getPlanningById(planningId);
                setPlanning(planningData);
                
                const stepData = await getPlanningCurrentStep(planningId);
                setCurrentStep(stepData.current_step);

                // 2. Récupérer l'historique des transitions
                const historyData = await getPlanningWorkflowHistory(planningId);
                setHistory(historyData);

                // 3. Récupérer TOUTES les étapes du workflow pour le stepper
                // On récupère le workflow lié au planning pour avoir ses étapes ordonnées
                if (planningData.workflow && planningData.workflow.id) {
                    const workflowData = await getWorkflowById(planningData.workflow.id);
                    setAllSteps(workflowData.steps || []);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données d'audit:", error);
            } finally {
                setLoading(false);
            }
        };

        if (planningId) fetchAuditData();
    }, [planningId]);

    if (loading) return <div className="audit-loading">Analyse du parcours en cours...</div>;
    if (!planning) return <div className="audit-error">Planning introuvable</div>;

    // Déterminer l'état d'une étape pour le stepper
    const getStepStatus = (step) => {
        if (!currentStep) return 'pending';
        if (step.id === currentStep.id) return 'current';
        
        // Une étape est "terminée" si elle apparaît dans l'historique comme une étape de DESTINATION
        const isCompleted = history.some(h => h.to_step?.id === step.id);
        if (isCompleted) return 'completed';
        
        // Si l'étape a un numéro inférieur à l'étape actuelle, on la considère aussi comme passée
        if (step.number < currentStep.number) return 'completed';
        
        return 'pending';
    };

    return (
        <div className="audit-detail-container">
            <header className="audit-detail-header">
                <button className="btn-back" onClick={() => navigate(-1)}>← Retour à la liste</button>
                <div className="header-info">
                    <h1>Parcours du Planning : {planning.nom}</h1>
                    <span className="planning-code">{planning.code}</span>
                </div>
            </header>

            {/* SECTION 1: LE STEPPER VISUEL */}
            <section className="audit-section stepper-section">
                <h2>Progression du Workflow</h2>
                <div className="stepper-wrapper">
                    {allSteps.map((step, index) => {
                        const status = getStepStatus(step);
                        return (
                            <div key={step.id} className={`step-item ${status}`}>
                                <div className="step-node">
                                    {status === 'completed' ? '✓' : index + 1}
                                </div>
                                <div className="step-label">
                                    <span className="step-name">{step.name}</span>
                                    {status === 'current' && <span className="current-tag">En cours</span>}
                                </div>
                                {index < allSteps.length - 1 && <div className="step-line"></div>}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* SECTION 2: RÉSUMÉ DU STATUT */}
            <div className="status-summary-card">
                <div className="summary-item">
                    <label>Étape actuelle</label>
                    <p className="highlight">{currentStep?.name || "Non défini"}</p>
                </div>
                <div className="summary-item">
                    <label>Entité Responsable</label>
                    <p>{planning.entite_metier?.name || "N/A"}</p>
                </div>
                <div className="summary-item">
                    <label>Dernière action</label>
                    <p>{history.length > 0 ? new Date(history[0].transitioned_at).toLocaleString() : "Aucune"}</p>
                </div>
            </div>

            {/* SECTION 3: JOURNAL DÉTAILLÉ (HISTORIQUE) */}
            <section className="audit-section history-section">
                <h2>Journal des Transitions (Piste d'audit)</h2>
                <div className="history-timeline">
                    {history.length > 0 ? (
                        history.map((entry, index) => (
                            <div key={entry.id} className="timeline-entry">
                                <div className="entry-date">
                                    <span className="date">{new Date(entry.transitioned_at).toLocaleDateString()}</span>
                                    <span className="time">{new Date(entry.transitioned_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div className="entry-marker"></div>
                                <div className="entry-content">
                                    <div className="entry-header">
                                        <span className="entry-action">{entry.transition?.name || "Transition"}</span>
                                        <span className="entry-user">par <strong>{entry.performed_by?.username || "Système"}</strong></span>
                                    </div>
                                    <div className="entry-path">
                                        <span className="path-from">{entry.from_step?.name || "Début"}</span>
                                        <span className="path-arrow">→</span>
                                        <span className="path-to">{entry.to_step?.name}</span>
                                    </div>
                                    {entry.comment && (
                                        <div className="entry-comment">
                                            <label>Commentaire / Motif :</label>
                                            <p>"{entry.comment}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-history">Aucun historique disponible pour ce planning.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default PlanningWorkflowDetail;
