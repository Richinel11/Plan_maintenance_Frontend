import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
    getAvailableTransitionsForPlanning, 
    executeWorkflowTransition, 
    rejectWorkflowTransition,
    getPlanningCurrentStep 
} from '../../services/workflowService';

/**
 * Composant WorkflowControlBar
 * Affiche dynamiquement le statut et les boutons d'action (Valider, Rejeter, DDR, NAPT, etc.)
 */
const WorkflowControlBar = ({ planningId, onActionSuccess }) => {
    const [currentStep, setCurrentStep] = useState(null);
    const [transitions, setTransitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTransition, setSelectedTransition] = useState(null);
    const [comment, setComment] = useState("");
    const [isReject, setIsReject] = useState(false);

    // Charger les données initiales
    const fetchData = async () => {
        setLoading(true);
        try {
            const [stepData, transitionsData] = await Promise.all([
                getPlanningCurrentStep(planningId),
                getAvailableTransitionsForPlanning(planningId)
            ]);
            setCurrentStep(stepData.current_step);
            setTransitions(transitionsData);
        } catch (error) {
            console.error("Erreur lors du chargement du workflow:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (planningId) fetchData();
    }, [planningId]);

    // Gérer le clic sur un bouton d'action
    const handleActionClick = (transition, rejectMode = false) => {
        setSelectedTransition(transition);
        setIsReject(rejectMode);
        
        // Si un commentaire est requis ou si c'est un rejet, on ouvre la modale
        if (transition.comment_required || rejectMode) {
            setShowModal(true);
        } else {
            submitAction(transition.id, "", false);
        }
    };

    // Envoyer l'action au backend
    const submitAction = async (transitionId, text, rejectMode) => {
        try {
            setLoading(true);
            if (rejectMode) {
                await rejectWorkflowTransition(planningId, transitionId, text);
            } else {
                await executeWorkflowTransition(planningId, transitionId, text);
            }
            
            setShowModal(false);
            setComment("");
            // Rafraîchir les données locales et notifier le parent
            await fetchData();
            if (onActionSuccess) onActionSuccess();
            
        } catch (error) {
            toast.error("Erreur lors de l'exécution de l'action: " + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading && !currentStep) return <div className="workflow-loading">Chargement du statut...</div>;

    return (
        <div className="workflow-control-bar" style={styles.container}>
            <div className="workflow-status" style={styles.statusSection}>
                <span style={styles.label}>Statut actuel :</span>
                <span style={styles.statusBadge}>
                    {currentStep?.name || "Brouillon"}
                </span>
            </div>

            <div className="workflow-actions" style={styles.actionSection}>
                {transitions.map((t) => (
                    <div key={t.id} style={styles.buttonGroup}>
                        <button 
                            onClick={() => handleActionClick(t, false)}
                            style={{...styles.button, ...styles.btnPrimary}}
                            disabled={loading}
                        >
                            {t.name}
                        </button>
                        
                        {/* Optionnel: bouton de rejet si la transition permet un retour en arrière */}
                        {/* Note: Dans certains designs, le "Rejeter" est une transition à part entière envoyée par le back */}
                    </div>
                ))}
                
                {/* Bouton de rejet générique si nécessaire par l'étape */}
                {currentStep && transitions.length > 0 && (
                     <button 
                        onClick={() => handleActionClick(transitions[0], true)}
                        style={{...styles.button, ...styles.btnDanger}}
                        disabled={loading}
                     >
                        Rejeter / Modifier
                     </button>
                )}
            </div>

            {/* Modale de commentaire/motif */}
            {showModal && (
                <div className="workflow-modal-overlay" style={styles.overlay}>
                    <div className="workflow-modal" style={styles.modal}>
                        <h3>{isReject ? "Motif du rejet" : "Ajouter un commentaire"}</h3>
                        <p>Action : {selectedTransition?.name}</p>
                        <textarea 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            style={styles.textarea}
                            placeholder="Saisissez votre message ici..."
                            rows={4}
                        />
                        <div style={styles.modalActions}>
                            <button onClick={() => setShowModal(false)} style={styles.btnSecondary}>Annuler</button>
                            <button 
                                onClick={() => submitAction(selectedTransition.id, comment, isReject)}
                                style={isReject ? styles.btnDanger : styles.btnPrimary}
                                disabled={isReject && !comment.trim()}
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
        borderRadius: '8px',
        marginBottom: '20px'
    },
    statusSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    label: {
        fontWeight: 'bold',
        color: '#495057'
    },
    statusBadge: {
        padding: '6px 12px',
        backgroundColor: '#007bff',
        color: 'white',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: '600'
    },
    actionSection: {
        display: 'flex',
        gap: '10px'
    },
    buttonGroup: {
        display: 'flex',
        gap: '5px'
    },
    button: {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'opacity 0.2s'
    },
    btnPrimary: {
        backgroundColor: '#28a745',
        color: 'white'
    },
    btnDanger: {
        backgroundColor: '#dc3545',
        color: 'white'
    },
    btnSecondary: {
        padding: '8px 16px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modal: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '8px',
        width: '400px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    },
    textarea: {
        width: '100%',
        marginTop: '10px',
        marginBottom: '20px',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ced4da',
        fontFamily: 'inherit'
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px'
    }
};

export default WorkflowControlBar;
