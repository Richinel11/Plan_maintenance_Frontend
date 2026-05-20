import api from '../API/axiosInstance';

// ─── WORKFLOWS ───────────────────────────────────────────────────────────────

/** Récupérer la liste de tous les workflows */
export const getWorkflows = async () => {
    const { data } = await api.get('/workflows/');
    return data;
};


/** Récupérer, modifier ou supprimer un workflow */
export const getWorkflowById = async (workflowId) => {
    const { data } = await api.get(`/workflows/${workflowId}/`);
    return data;
};

export const updateWorkflow = async (workflowId, workflowData) => {
    const { data } = await api.put(`/workflows/${workflowId}/`, workflowData);
    return data;
};

/** Créer un nouveau workflow */
export const createWorkflow = async (workflowData) => {
    const { data } = await api.post('/workflows/', workflowData);
    return data;
};

/** Supprimer un workflow */
export const deleteWorkflow = async (workflowId) => {
    const { data } = await api.delete(`/workflows/${workflowId}/`);
    return data;
};

// ─── STEPS (ÉTATS) ────────────────────────────────────────────────────────────

/** Récupérer les steps d'un workflow particulier */
export const getStepsByWorkflow = async (workflowId) => {
    const { data } = await api.get(`/workflows/${workflowId}/steps/`);
    return data;
};

/** Créer un step (état) lié à un workflow */
export const createStep = async (stepData, workflowId) => {
    const { data } = await api.post(`/workflows/${workflowId}/steps/`, stepData);
    return data;
};

// afficher les detail d'un step 
export const getStepById = async (workflowId, stepId) => {
    const { data } = await api.get(`/workflows/${workflowId}/steps/${stepId}/`);
    return data;
};

// update un step
export const updateStep = async (stepData, workflowId, stepId) => {
    const { data } = await api.put(`/workflows/${workflowId}/steps/${stepId}/`, stepData);
    return data;
};

/** Supprimer un step */
export const deleteStep = async (workflowId, stepId) => {
    const { data } = await api.delete(`/workflows/${workflowId}/steps/${stepId}/`);
    return data;
};

// ─── TRANSITIONS ─────────────────────────────────────────────────────────────

/** Récupérer la liste de toutes les transitions */
export const getTransitions = async (workflowId) => {
    const { data } = await api.get(`/workflows/${workflowId}/transitions/`);
    return data;
};

/** Créer une transition liée à un workflow */
export const createTransition = async (transitionData, workflowId) => {
    const { data } = await api.post(`/workflows/${workflowId}/transitions/`, transitionData);
    return data;
};

// detail de la transition 
export const getTransitionById = async (workflowId, transitionId) => {
    const { data } = await api.get(`/workflows/${workflowId}/transitions/${transitionId}/`);
    return data;
};

// update transition 
export const updateTransition = async (transitionData, workflowId, transitionId) => {
    const { data } = await api.put(`/workflows/${workflowId}/transitions/${transitionId}/`, transitionData);
    return data;
};

/** Supprimer une transition */
export const deleteTransition = async (workflowId, transitionId) => {
    const { data } = await api.delete(`/workflows/${workflowId}/delete-transition/${transitionId}/`);
    return data;
};

// ─── PLANNINGS ASSOCIÉS AU WORKFLOW ──────────────────────────────────────────

/** Récupérer la liste de tous les plannings (pour sélection) */
export const getAllPlannings = async () => {
    // On suppose que l'endpoint est 'plannings/' comme vu dans Planning.jsx
    const { data } = await api.get('plannings/');
    return data;
};

/** Récupérer les plannings associés à un workflow particulier */
export const getPlanningsByWorkflow = async (workflowId) => {
    const { data } = await api.get(`workflows/${workflowId}/all-plannings`);
    return data;
};

/** Associer un planning à un workflow */
export const associatePlanningToWorkflow = async (workflowId, planningId) => {
    const { data } = await api.post(`/plannings/${planningId}/assigner-workflow/`, { workflow_id: workflowId });
    return data;
};

/** Dissocier un planning d'un workflow */
export const dissociatePlanningFromWorkflow = async (workflowId, planningId) => {
    // Pour dissocier, on peut simplement mettre le workflow à null via un PATCH sur le planning
    const { data } = await api.patch(`/plannings/${planningId}/`, { workflow_id: null, current_step_id: null });
    return data;
};

// ─── EXÉCUTION DU WORKFLOW (OPÉRATIONNEL) ───────────────────────────────────

/** Récupérer l'étape actuelle d'un planning spécifique */
export const getPlanningCurrentStep = async (planningId) => {
    const { data } = await api.get(`/planning/${planningId}/current-step/`);
    return data;
};

/** Récupérer les actions (transitions) autorisées pour un planning et l'utilisateur actuel */
export const getAvailableTransitionsForPlanning = async (planningId) => {
    const { data } = await api.get(`/planning/${planningId}/transitions/`);
    return data;
};

/** Exécuter une transition (Approuver / Faire avancer) */
export const executeWorkflowTransition = async (planningId, transitionId, comment = "") => {
    const { data } = await api.post(`/planning/${planningId}/transition/execute/`, {
        transition_id: transitionId,
        comment: comment
    });
    return data;
};

/** Rejeter une transition (Refuser / Faire reculer) */
export const rejectWorkflowTransition = async (planningId, transitionId, motif = "") => {
    const { data } = await api.post(`/planning/${planningId}/transition/reject/`, {
        transition_id: transitionId,
        motif: motif
    });
    return data;
};

/** Récupérer l'historique complet (audit trail) d'un planning */
export const getPlanningWorkflowHistory = async (planningId) => {
    const { data } = await api.get(`/planning/${planningId}/history/`);
    return data;
};

