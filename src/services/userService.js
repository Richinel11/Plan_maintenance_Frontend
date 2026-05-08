import api from '../API/axiosInstance';

// ============ UTILISATEURS ============
// App Django "user" montée sous le préfixe "users/" dans core/urls.py

export const getUsers = async () => {
    const { data } = await api.get('users/all-users');
    return data;
};

export const getUserById = async (id) => {
    const { data } = await api.get(`users/find-user/${id}/`);
    return data;
};

export const createUser = async (userData) => {
    const { data } = await api.post('users/create-user', userData);
    return data;
};

export const updateUser = async (id, userData) => {
    const { data } = await api.put(`users/update-user/${id}`, userData);
    return data;
};

export const patchUser = async (id, userData) => {
    const { data } = await api.patch(`users/patch-user/${id}`, userData);
    return data;
};

export const deleteUser = async (id) => {
    await api.delete(`users/delete-user/${id}`);
    return true;
};

export const restoreUser = async (id) => {
    const { data } = await api.post(`users/restore-user/${id}`);
    return data;
};
export const update_userrole = async (id, userData) => {
    const { data } = await api.put(`user/${id}/update-user-role`, userData);
    return data;
};


// ============ ENTITÉS ============
// Via DefaultRouter → users/entites/
export const getEntites = async () => {
    const { data } = await api.get('users/entites/');
    return data;
};

// ============ RÔLES ============
// App Django "security" montée à la racine dans core/urls.py

export const getRoles = async () => {
    const { data } = await api.get('roles/all-roles');
    return data;
};

export const createRole = async (roleData) => {
    const { data } = await api.post('roles/create-role', roleData);
    return data;
};

export const updateRole = async (code_role, roleData) => {
    const { data } = await api.put(`roles/update-role/${code_role}`, roleData);
    return data;
};

export const patchRole = async (roleId, roleData) => {
    const { data } = await api.patch(`roles/${roleId}/`, roleData);
    return data;
};

export const deleteRole = async (roleId) => {
    await api.delete(`roles/${roleId}/`);
    return true;
};

// ============ PERMISSIONS ============

export const getPermissions = async () => {
    const { data } = await api.get('permissions/all-permission');
    return data;
};

export const createPermission = async (permData) => {
    const { data } = await api.post('permissions/create-permission', permData);
    return data;
};

export const updatePermission = async (code_permission, permData) => {
    const { data } = await api.put(`permissions/update-permission/${code_permission}`, permData);
    return data;
};



export const deletePermission = async (id) => {
    await api.delete(`permissions/${id}/`);
    return true;
};

// ============ ASSIGNATION RÔLE → UTILISATEUR ============

export const assignRoleToUser = async (userId, roleCode) => {
    const { data } = await api.post('user/assign-role', {
        user_id: userId,
        role_code: roleCode
    });
    return data;
};

export const removeRoleFromUser = async (userId, roleCode) => {
    const { data } = await api.post('user/remove-role', {
        user_id: userId,
        role_code: roleCode
    });
    return data;
};

// ============ ASSIGNATION PERMISSION → RÔLE ============

export const assignPermissionToRole = async (roleCode, permissionCode) => {
    const { data } = await api.post('roles/assign-permission', {
        role_code: roleCode,
        permission_code: permissionCode
    });
    return data;
};

export const removePermissionFromRole = async (roleCode, permissionCode) => {
    const { data } = await api.post('roles/remove-permission', {
        role_code: roleCode,
        permission_code: permissionCode
    });
    return data;
};

// ============ LECTURE ============

export const getUserRoles = async (userId) => {
    const { data } = await api.get(`user/${userId}/roles`);
    return data;
};

export const getRolePermissions = async (roleCode) => {
    const { data } = await api.get(`roles/${roleCode}/permissions`);
    return data;
};
