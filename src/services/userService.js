import api from '../API/axiosInstance';

// ============ UTILISATEURS ============
// App Django "user" montée sous le préfixe "users/" dans core/urls.py

export const getUsers = async () => {
    const { data } = await api.get('users/all-users');
    return data;
};

export const getEntites = async () => {
    const { data } = await api.get('users/entites/');
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

// Désactiver un utilisateur : passe is_active à False (route: DELETE users/delete-user/<uuid>)
export const deactivateUser = async (user_id) => {
    await api.delete(`users/delete-user/${user_id}`);
    return true;
};

// Réactiver un utilisateur : passe is_active à True (route: PATCH users/restore-user/<uuid>)
export const activateUser = async (user_id) => {
    const { data } = await api.patch(`users/restore-user/${user_id}`);
    return data;
};

// Alias pour rétrocompatibilité
export const deleteUser = deactivateUser;
export const restoreUser = activateUser;
export const update_userrole = async (id, userData) => {
    const { data } = await api.put(`user/${id}/update-user-role`, userData);
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

export const deleteRole = async (code_role) => {
    await api.delete(`roles/delete-role/${code_role}`);
    return true;
};

// ============ PERMISSIONS ============

export const getPermissions = async () => {
    const { data } = await api.get('permissions/all-permission');
    return data;
};

// Récupère les choix de modules définis dans le backend (MODULES_CHOICES)
// Endpoint attendu : GET /permissions/modules/
export const getPermissionModules = async () => {
    const { data } = await api.get('permissions/modules/');
    return data; // Attendu : [{ value: 'PLAN', label: 'Planning' }, ...]
};

export const createPermission = async (permData) => {
    const { data } = await api.post('permissions/create-permission', permData);
    return data;
};

export const updatePermission = async (code_permission, permData) => {
    const { data } = await api.put(`permissions/update-permission/${code_permission}`, permData);
    return data;
};

export const deletePermission = async (code_permission) => {
    await api.delete(`permission/delete-permission/${code_permission}`);
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