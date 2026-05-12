import api from '../API/axiosInstance';

// ─── WORKFLOWS ───────────────────────────────────────────────────────────────

/** Récupérer la liste de tous les workflows */
export const getWorkflows = async () => {
    const { data } = await api.get('workflows/list-workflows/');
    return data;
};

/** Récupérer un workflow par ID */
export const getWorkflowById = async (workflowId) => {
    const { data } = await api.get(`workflows/${workflowId}/`);
    return data;
};

/** Créer un nouveau workflow */
export const createWorkflow = async (workflowData) => {
    const { data } = await api.post('workflows/create-workflow/', workflowData);
    return data;
};

/** Supprimer un workflow */
export const deleteWorkflow = async (workflowId) => {
    const { data } = await api.delete(`workflows/${workflowId}/delete/`);
    return data;
};

// ─── STEPS (ÉTATS) ────────────────────────────────────────────────────────────

/** Récupérer les steps d'un workflow particulier */
export const getStepsByWorkflow = async (workflowId) => {
    const { data } = await api.get(`workflows/${workflowId}/steps/`);
    return data;
};

/** Créer un step (état) lié à un workflow */
export const createStep = async (stepData, workflowId) => {
    const { data } = await api.post(`workflows/${workflowId}/create-step/`, stepData);
    return data;
};

// afficher les detail d'un step 
export const getStepById = async (workflowId, stepId) => {
    const { data } = await api.get(`workflows/${workflowId}/find-step/${stepId}`);
    return data;
};

// update un step
export const updateStep = async (stepData, workflowId, stepId) => {
    const { data } = await api.put(`workflows/${workflowId}/update-step/${stepId}`, stepData);
    return data;
};

/** Supprimer un step */
export const deleteStep = async (workflowId, stepId) => {
    const { data } = await api.delete(`workflows/${workflowId}/delete-step/${stepId}`);
    return data;
};

// ─── TRANSITIONS ─────────────────────────────────────────────────────────────

/** Récupérer la liste de toutes les transitions */
export const getTransitions = async (workflowId) => {
    const { data } = await api.get(`workflows/${workflowId}/all-transitions`);
    return data;
};

/** Créer une transition liée à un workflow */
export const createTransition = async (transitionData, workflowId) => {
    const { data } = await api.post(`workflows/${workflowId}/create-transition`, transitionData);
    return data;
};

// detail de la transition 
export const getTransitionById = async (workflowId, transitionId) => {
    const { data } = await api.get(`workflows/${workflowId}/find-transition/${transitionId}`);
    return data;
};

// update transition 
export const updateTransition = async (transitionData, workflowId, transitionId) => {
    const { data } = await api.put(`workflows/<uuid:workflow_id>/update-transition/<uuid:transition_id>}`, transitionData);
    return data;
};

/** Supprimer une transition */
export const deleteTransition = async (workflowId, transitionId) => {
    const { data } = await api.delete(`workflows/${workflowId}/transitions/${transitionId}/delete/`);
    return data;
};
