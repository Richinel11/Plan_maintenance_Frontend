import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getAllPlannings } from '../../../../services/workflowService';
import './Modals.css';

const AssociatePlanningModal = ({ onSave, onClose, loading, existingPlanningIds = [] }) => {
  const [allPlannings, setAllPlannings] = useState([]);
  const [selectedPlanningId, setSelectedPlanningId] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchPlannings = async () => {
      try {
        const data = await getAllPlannings();
        setAllPlannings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur lors du chargement des plannings :", error);
      } finally {
        setFetching(false);
      }
    };
    fetchPlannings();
  }, []);

  const handleSubmit = () => {
    if (!selectedPlanningId) {
      toast.warning('Veuillez sélectionner un planning.');
      return;
    }
    onSave(selectedPlanningId);
  };

  // Filtrer les plannings déjà associés
  const availablePlannings = allPlannings.filter(p => !existingPlanningIds.includes(p.id));

  return (
    <div className="wfh-overlay" onClick={onClose}>
      <div className="wfh-modal-card" onClick={e => e.stopPropagation()}>
        <div className="wfh-modal-header">
          <h3>📅 Associer un Planning</h3>
          <button className="wfh-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="wfh-modal-body">
          <div className="wfh-form-row">
            <div className="wfh-form-field wfh-field-full">
              <label>CHOISIR UN PLANNING <span className="wfh-req">*</span></label>
              {fetching ? (
                <p>Chargement des plannings...</p>
              ) : (
                <select 
                  className="wfh-form-input" 
                  value={selectedPlanningId} 
                  onChange={e => setSelectedPlanningId(e.target.value)}
                >
                  <option value="">-- Sélectionner un planning --</option>
                  {availablePlannings.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nom || p.name} ({p.code})
                    </option>
                  ))}
                </select>
              )}
              {!fetching && availablePlannings.length === 0 && (
                <p style={{ color: '#c62828', fontSize: '12px', marginTop: '5px' }}>
                  Aucun planning disponible pour association.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="wfh-modal-footer">
          <button className="wfh-btn-secondary" onClick={onClose} disabled={loading}>Annuler</button>
          <button className="wfh-btn-primary" onClick={handleSubmit} disabled={loading || !selectedPlanningId}>
            {loading ? '⏳ Association...' : '✔ Associer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssociatePlanningModal;
