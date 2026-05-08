import api from '../API/axiosInstance';

export const createProcess = async (processData) => {
    const { data } = await api.post('pilotage/workflows/', processData);
    return data;
};

export const createWorkflow = async (workflowData) => {
    const { data } = await api.post('pilotage/workflows/', workflowData);
    return data;
};

// Créer une étape (Step) liée à un workflow
export const createStep = async (stepData) => {
    // stepData = { workflow, name, code, number, description, is_terminal }
    const { data } = await api.post('pilotage/steps/', stepData);
    return data;
};

// Créer une transition liée à un workflow
export const createTransition = async (transitionData) => {
    // transitionData = { workflow, name, from_step, to_step, can_go_back, comment_required }
    const { data } = await api.post('pilotage/transitions/', transitionData);
    return data;
};