import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import {
  getAvailableTransitionsForPlanning,
  executeWorkflowTransition,
} from '../../services/workflowService';

/**
 * Barre de validation du Gestionnaire de planification.
 *
 * Ne s'affiche QUE si :
 *   - l'utilisateur connecté a le rôle Gestionnaire, ET
 *   - le planning est à l'étape de départ (CREER).
 *
 * « Valider » exécute la transition CREER → EN_ATTENTE (le planning part chez
 * le responsable). « Annuler » revient en arrière sans rien changer.
 *
 * La permission réelle est vérifiée côté serveur (rôle requis sur la transition) ;
 * ce composant ne fait que masquer le bouton pour les autres rôles.
 */
const PlanningValidationBar = ({ planningId, currentStepCode, onValidated }) => {
  const navigate = useNavigate();
  const [transition, setTransition] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const activeRoleName = (Cookies.get('activeRoleName') || '')
    .toUpperCase()
    .replace(/[\s']/g, '_');
  const isGestionnaire = activeRoleName.includes('GESTIONNAIRE');

  const isAtCreer = currentStepCode === 'CREER';
  const visible = isGestionnaire && isAtCreer;

  useEffect(() => {
    if (!visible || !planningId) return;
    let cancelled = false;
    (async () => {
      try {
        const transitions = await getAvailableTransitionsForPlanning(planningId);
        // Depuis CREER, la seule transition sortante est « Valider » (-> EN_ATTENTE)
        const valider = Array.isArray(transitions) ? transitions[0] : null;
        if (!cancelled) setTransition(valider);
      } catch (e) {
        if (!cancelled) setTransition(null);
      }
    })();
    return () => { cancelled = true; };
  }, [visible, planningId]);

  if (!visible) return null;

  const handleValider = async () => {
    if (!transition) {
      toast.error("Aucune transition de validation disponible pour ce planning.");
      return;
    }
    setSubmitting(true);
    try {
      await executeWorkflowTransition(planningId, transition.id);
      toast.success("Planning validé et transmis au responsable d'exploitation.");
      if (onValidated) onValidated();
      else navigate('/dashboard/dashboard-plan');
    } catch (error) {
      toast.error(
        "Échec de la validation : " +
        (error.response?.data?.error || error.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnnuler = () => {
    // Le planning reste à l'état CREER, aucun changement de statut.
    navigate('/dashboard/dashboard-plan');
  };

  return (
    <div style={styles.bar}>
      <span style={styles.label}>
        Ce planning est en attente de votre validation.
      </span>
      <div style={styles.actions}>
        <button
          type="button"
          onClick={handleAnnuler}
          style={styles.btnCancel}
          disabled={submitting}
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleValider}
          style={{ ...styles.btnValidate, opacity: submitting ? 0.6 : 1 }}
          disabled={submitting}
        >
          {submitting ? 'Validation…' : 'Valider'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  bar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 18px',
    margin: '0 0 16px',
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
  },
  label: { fontWeight: 600, color: '#0369a1' },
  actions: { display: 'flex', gap: '10px' },
  btnCancel: {
    padding: '8px 18px',
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#475569',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  btnValidate: {
    padding: '8px 22px',
    border: 'none',
    background: '#16a34a',
    color: '#fff',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 700,
  },
};

export default PlanningValidationBar;
