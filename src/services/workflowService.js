import api from '../API/axiosInstance';

export const createProcess = async (processData) => {
    // Fausse route en attendant le backend
    const { data } = await api.post('workflow/processes/create/', processData);
    return data;
};

export const createWorkflow = async (workflowData) => {
    // Fausse route en attendant le backend
    const { data } = await api.post('workflow/workflows/create/', workflowData);
    return data;
};