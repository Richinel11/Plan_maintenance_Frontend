import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../../../services/Authservice';
import { createWorkflow } from '../../../../services/workflowService';
import GeneralInfo from '../components/GeneralInfo';
import { 
    DndContext, 
    useDraggable, 
    useDroppable, 
    PointerSensor, 
    useSensor, 
    useSensors,
    closestCenter
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    useSortable, 
    verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './createworkflo.css';

/**
 * Composant pour un processus déplaçable (Source - Colonne Gauche)
 */
const DraggableProcess = ({ process }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `source-${process.id}`,
        data: { process, type: 'new' }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 1000 : 1,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab'
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...listeners} 
            {...attributes} 
            className={`process-card-item ${isDragging ? 'dragging' : ''}`}
        >
            <div className="process-icon-box">{process.icon}</div>
            <div className="process-details">
                <h5>{process.name}</h5>
                <p>{process.desc}</p>
            </div>
            <span className="material-symbols-outlined drag-indicator">drag_indicator</span>
        </div>
    );
};

/**
 * Composant pour une étape de la séquence (Réorganisable - Colonne Droite)
 */
const SortableStep = ({ step, index, total, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ 
        id: step.instanceId,
        data: { type: 'sortable' }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : 1,
        opacity: isDragging ? 0.6 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={`sequence-step-item ${isDragging ? 'sorting' : ''}`}>
            <div className="step-number-active">{index + 1}</div>
            <div className="step-content-card">
                <div className="step-info" {...listeners} {...attributes} style={{ cursor: 'grab', flex: 1 }}>
                    <span className="material-symbols-outlined step-icon">settings</span>
                    <h5>{step.name}</h5>
                </div>
                <button 
                    className="btn-remove-step"
                    onClick={() => onRemove(step.instanceId)}
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            {index < total - 1 && <div className="step-connector"></div>}
        </div>
    );
};

/**
 * Zone de dépôt (Droppable)
 */
const DroppableSequence = ({ children, isOver }) => {
    const { setNodeRef } = useDroppable({
        id: 'sequence-drop-area',
    });

    return (
        <div 
            ref={setNodeRef} 
            className={`sequence-drop-area ${isOver ? 'drop-active' : ''}`}
        >
            {children}
        </div>
    );
};

/**
 * Orchestrateur de Workflow - Nouveau Design Séquentiel (ENEO Style)
 */
const CreateGlobalWorkflow = () => {
    const navigate = useNavigate();

    const [workflowName, setWorkflowName] = useState('');
    const [workflowCode, setWorkflowCode] = useState('');
    const [workflowDesc, setWorkflowDesc] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOverDropZone, setIsOverDropZone] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const [availableProcesses, setAvailableProcesses] = useState([]);

    const [sequence, setSequence] = useState([]);

    const filteredProcesses = availableProcesses.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDragOver = (event) => {
        const { over } = event;
        setIsOverDropZone(over && over.id === 'sequence-drop-area');
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setIsOverDropZone(false);

        if (!over) return;

        // CAS 1 : AJOUT D'UN NOUVEAU PROCESSUS (Depuis la gauche)
        if (active.id.toString().startsWith('source-') && over.id === 'sequence-drop-area') {
            const draggedProcess = active.data.current.process;
            const newStep = {
                ...draggedProcess,
                instanceId: `inst-${Date.now()}` // ID unique pour la séquence
            };
            setSequence([...sequence, newStep]);
            return;
        }

        // CAS 2 : RÉORGANISATION (Au sein de la séquence)
        if (active.id !== over.id && active.data.current?.type === 'sortable') {
            setSequence((items) => {
                const oldIndex = items.findIndex(i => i.instanceId === active.id);
                const newIndex = items.findIndex(i => i.instanceId === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const removeStep = (instanceId) => {
        setSequence(sequence.filter(step => step.instanceId !== instanceId));
    };

    const handleSave = async () => {
        const currentUser = getCurrentUser();
        const payload = {
            nom: workflowName,
            code: workflowCode,
            description: workflowDesc,
            is_active: isActive,
            created_by: currentUser ? currentUser.id : null,
            sequence: sequence
        };
        console.log("Données envoyées à l'API :", payload);

        try {
            await createWorkflow(payload);
            alert("Workflow créé avec succès (Mock)");
            navigate('/dashboard/workflow/historique');
        } catch (error) {
            console.error("Erreur lors de la création du workflow :", error);
            alert("Erreur lors de la création : la route backend n'est probablement pas prête.");
        }
    };

    return (
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="wf-container">
                <header className="wf-header">
                    <h1 className="wf-title">Créer un Nouveau Workflow</h1>
                    <p className="wf-subtitle">Assemblez vos processus existants pour définir une séquence de maintenance complète et automatisée.</p>
                </header>

                <main className="wf-content">
                    <GeneralInfo 
                        type="Workflow"
                        name={workflowName}
                        code={workflowCode}
                        description={workflowDesc}
                        onNameChange={setWorkflowName}
                        onCodeChange={setWorkflowCode}
                        onDescriptionChange={setWorkflowDesc}
                        showIsActive={true}
                        isActive={isActive}
                        onIsActiveChange={setIsActive}
                    />

                    <div className="wf-builder-grid">
                        
                        {/* COLONNE GAUCHE */}
                        <div className="wf-column processes-column">
                            <div className="column-header">
                                <div className="header-top">
                                    <span className="material-symbols-outlined icon-blue">inventory_2</span>
                                    <h4>Processus Disponibles</h4>
                                    <span className="badge-count">{filteredProcesses.length} DISPO</span>
                                </div>
                                <div className="wf-search-wrapper">
                                    <span className="material-symbols-outlined search-icon">search</span>
                                    <input 
                                        type="text" 
                                        placeholder="Rechercher un processus..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="list-scroll-area">
                                {filteredProcesses.map(p => (
                                    <DraggableProcess key={p.id} process={p} />
                                ))}
                            </div>
                        </div>

                        {/* COLONNE DROITE (SORTABLE) */}
                        <div className="wf-column sequence-column">
                            <div className="column-header">
                                <div className="header-top">
                                    <span className="material-symbols-outlined icon-blue">account_tree</span>
                                    <h4>Séquence du Workflow</h4>
                                    {sequence.length > 0 && (
                                        <span className="badge-count">{sequence.length} ÉTAPES</span>
                                    )}
                                </div>
                            </div>

                            <DroppableSequence isOver={isOverDropZone}>
                                {sequence.length === 0 ? (
                                    <div className="empty-step">
                                        <div className="step-number-empty">1</div>
                                        <div className="drop-box">
                                            <span className="material-symbols-outlined">add_circle</span>
                                            <p>Glissez un processus ici pour l'ajouter</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="active-sequence">
                                        <SortableContext 
                                            items={sequence.map(s => s.instanceId)} 
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {sequence.map((step, index) => (
                                                <SortableStep 
                                                    key={step.instanceId} 
                                                    step={step} 
                                                    index={index} 
                                                    total={sequence.length}
                                                    onRemove={removeStep}
                                                />
                                            ))}
                                        </SortableContext>
                                        
                                        <div className="next-step-indicator">
                                            <span className="material-symbols-outlined">add</span>
                                            <p>Déposer l'étape suivante</p>
                                        </div>
                                    </div>
                                )}
                            </DroppableSequence>
                        </div>
                    </div>

                    <footer className="wf-actions-footer">
                        <button className="btn-cancel-wf" onClick={() => navigate(-1)}>Annuler</button>
                        <button 
                            className="btn-submit-wf" 
                            onClick={handleSave}
                            disabled={sequence.length === 0 || workflowName.trim() === ''}
                            title={sequence.length === 0 ? "Ajoutez au moins une étape" : workflowName.trim() === '' ? "Donnez un nom au workflow" : ""}
                        >
                            Soumettre le Workflow
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </footer>
                </main>
            </div>
        </DndContext>
    );
};

export default CreateGlobalWorkflow;


