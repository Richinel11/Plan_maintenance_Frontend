import React from 'react';
import '../createProccess/createproccess.css';

const GeneralInfo = ({ 
    type = "Processus", // "Processus" ou "Workflow"
    name, 
    code, 
    description, 
    selectedPlanning,
    onNameChange, 
    onCodeChange, 
    onDescriptionChange,
    onPlanningChange,
    showIsActive = false,
    isActive = true,
    onIsActiveChange,
    isReadOnly = false,
    plannings = [], // Liste réelle des plannings venant du backend
    wrapperClassName = "info-card",
    formClassName = "form-container"
}) => {

    return (
        <section className={wrapperClassName} style={{ marginBottom: '15px' }}>
            <div className="card-header" style={{ padding: '10px 15px', minHeight: 'auto' }}>
                <div className="status-icon-container info-theme" style={{ width: '30px', height: '30px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {isReadOnly ? 'check_circle' : 'info'}
                    </span>
                </div>
                <div className="card-titles">
                    <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Informations Générales</h2>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>
                        {isReadOnly ? `Informations du ${type.toLowerCase()} (Mode Configuration)` : `Nommez et décrivez l'usage de ce ${type.toLowerCase()}.`}
                    </p>
                </div>
            </div>

            <div className={formClassName} style={{ padding: '15px' }}>
                <div className="form-row" style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                    <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label className="field-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                            NOM DU {type.toUpperCase()} <span className="required-star">*</span>
                        </label>
                        <input 
                            type="text" 
                            className="form-input"
                            placeholder={`Ex: ${type === "Workflow" ? 'Maintenance Préventive' : 'Validation de Factures'}`}
                            value={name} 
                            onChange={(e) => onNameChange(e.target.value)}
                            disabled={isReadOnly}
                            style={{ padding: '6px 10px', fontSize: '0.9rem', height: '32px', backgroundColor: isReadOnly ? '#f5f5f5' : '' }}
                        />
                    </div>
                    <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label className="field-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                            CODE DU {type.toUpperCase()} <span className="required-star">*</span>
                        </label>
                        <input 
                            type="text" 
                            className="form-input"
                            placeholder={`Ex: ${type === "Workflow" ? 'WF_MAINT_PREV' : 'VAL_FACT'}`}
                            value={code} 
                            onChange={(e) => onCodeChange(e.target.value)}
                            disabled={isReadOnly}
                            style={{ padding: '6px 10px', fontSize: '0.9rem', height: '32px', backgroundColor: isReadOnly ? '#f5f5f5' : '' }}
                        />
                    </div>
                    <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label className="field-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
                            PLANNING ASSOCIÉ (OPTIONNEL)
                        </label>
                        <select 
                            className="form-input"
                            value={selectedPlanning || ''} 
                            onChange={(e) => onPlanningChange && onPlanningChange(e.target.value)}
                            disabled={isReadOnly}
                            style={{ padding: '6px 10px', fontSize: '0.9rem', height: '32px', backgroundColor: isReadOnly ? '#f5f5f5' : '' }}
                        >
                            <option value="">-- Aucun --</option>
                            {plannings.map(p => (
                                <option key={p.id} value={p.id}>{p.nom || p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="input-group full-width" style={{ marginBottom: 0 }}>
                    <label className="field-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>DESCRIPTION DÉTAILLÉE</label>
                    <textarea 
                        className="form-textarea" 
                        rows="2" 
                        placeholder="Décrivez les objectifs..."
                        value={description} 
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        disabled={isReadOnly}
                        style={{ width: '100%', resize: 'vertical', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '0.9rem', minHeight: '50px', backgroundColor: isReadOnly ? '#f5f5f5' : '' }}
                    ></textarea>
                </div>
                {showIsActive && (
                    <div className="form-row" style={{ marginTop: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: isReadOnly ? 'default' : 'pointer', fontSize: '0.85rem', color: '#333' }}>
                            <input 
                                type="checkbox" 
                                checked={isActive} 
                                onChange={(e) => !isReadOnly && onIsActiveChange(e.target.checked)} 
                                disabled={isReadOnly}
                                style={{ marginRight: '8px', width: '16px', height: '16px', cursor: isReadOnly ? 'default' : 'pointer' }}
                            />
                            <strong>Activer ce {type.toLowerCase()} dès la création</strong>
                        </label>
                    </div>
                )}
            </div>
        </section>
    );
};

export default GeneralInfo;
