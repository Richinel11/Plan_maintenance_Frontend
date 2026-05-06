// Mode MOCK : Données fausses (bouchons) pour tester le design Frontend
// La partie authService.js du Login N'EST PAS impactée, elle communique bien avec le backend cible.

let mockPermissions = [
    { id: 1, category: 'Plannings', action: 'Lecture', description: 'Voir les plannings' },
    { id: 2, category: 'Plannings', action: 'Création', description: 'Créer de nouveaux travaux/plannings' },
    { id: 3, category: 'Plannings', action: 'Validation', description: 'Valider un planning' },
    { id: 4, category: 'DDR et NAPT', action: 'Lecture', description: 'Voir les documents' },
    { id: 5, category: 'DDR et NAPT', action: 'Soumission', description: 'Générer DDR/NAPT' },
    { id: 6, category: 'Administration', action: 'Configuration', description: 'Gérer les rôles et entités' },
];

let mockRoles = [
    { id: 1, nom: 'Administrateur', description: 'Accès complet au système', nbUsers: 3, permissions: [1, 2, 3, 4, 5, 6] },
    { id: 2, nom: 'Opérateur Saisie', description: 'Import et création des travaux', nbUsers: 15, permissions: [1, 2, 4] },
    { id: 3, nom: 'Gestionnaire Planification', description: 'Aperçu Gantt et conflits', nbUsers: 5, permissions: [1, 4] }
];

let mockUsers = [
    { id: 1, nom: 'Dupont', prenom: 'Jean', username: 'jdupont', email: 'j.dupont@mjn.fr', roles: [{id: 1, nom: 'Administrateur'}], is_active: true, entite: 1 },
    { id: 2, nom: 'Martin', prenom: 'Alice', username: 'amartin', email: 'a.martin@mjn.fr', roles: [{id: 2, nom: 'Opérateur Saisie'}], is_active: true, entite: 2 },
    { id: 3, nom: 'Lefebvre', prenom: 'Marc', username: 'mlefe', email: 'm.lefe@mjn.fr', roles: [{id: 3, nom: 'Gestionnaire Planification'}], is_active: false, entite: 1 },
];

let mockEntites = [
    { id: 1, nom: 'Direction Opérations' },
    { id: 2, nom: 'Service Maintenance' }
];

// --- Simulateurs de requêtes --- //

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getUsers = async () => {
    await delay(600);
    return mockUsers;
};

export const getUserById = async (id) => {
    await delay(300);
    return mockUsers.find(u => u.id === id);
};

export const createUser = async (userData) => {
    await delay(800);
    const newUser = {
        ...userData,
        id: Math.max(...mockUsers.map(u => u.id)) + 1,
        // On mock les rôles pour l'affichage visuel
        roles: mockRoles.filter(r => userData.roles.includes(r.id)),
        is_active: true
    };
    mockUsers.push(newUser);
    return newUser;
};

export const updateUser = async (id, userData) => {
    await delay(800);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
        mockUsers[index] = { 
            ...mockUsers[index], 
            ...userData,
            roles: mockRoles.filter(r => userData.roles.includes(r.id))
        };
        return mockUsers[index];
    }
    throw new Error('Utilisateur non trouvé');
};

export const toggleUserStatus = async (id) => {
    await delay(500);
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
        // Gère la logique des 2 formats possibles `actif` ou `is_active`
        const currentStatus = mockUsers[index].is_active !== undefined ? mockUsers[index].is_active : mockUsers[index].actif;
        mockUsers[index] = { ...mockUsers[index], is_active: !currentStatus, actif: !currentStatus };
        return mockUsers[index];
    }
    throw new Error('Utilisateur non trouvé');
};

export const getRoles = async () => {
    await delay(400);
    return mockRoles;
};

export const getPermissions = async () => {
    await delay(400);
    return mockPermissions;
};

export const getEntites = async () => {
    await delay(400);
    return mockEntites;
};

// API Rôles :
export const createRole = async (roleData) => {
    await delay(800);
    const newRole = {
        ...roleData,
        id: Math.max(...mockRoles.map(r => r.id)) + 1,
        nbUsers: 0
    };
    mockRoles.push(newRole);
    return newRole;
};

export const updateRole = async (id, roleData) => {
    await delay(800);
    const index = mockRoles.findIndex(r => r.id === id);
    if (index !== -1) {
        mockRoles[index] = { ...mockRoles[index], ...roleData };
        return mockRoles[index];
    }
    throw new Error('Rôle non trouvé');
};

export const deleteRole = async (id) => {
    await delay(600);
    const index = mockRoles.findIndex(r => r.id === id);
    if (index === -1) {
        throw new Error('Rôle non trouvé');
    }
    
    const roleToDelete = mockRoles[index];
    
    // Vérifier si le rôle est lié à un ou plusieurs utilisateurs
    const isLinkedToUsers = mockUsers.some(user => user.roles.some(r => r.id === id)) || roleToDelete.nbUsers > 0;
    
    if (isLinkedToUsers) {
        throw new Error("Impossible de supprimer ce rôle car il est lié à un ou plusieurs utilisateurs.");
    }
    
    // Suppression
    mockRoles.splice(index, 1);
    return true;
};

// API Permissions :
export const createPermission = async (permData) => {
    await delay(600);
    const newPerm = {
        ...permData,
        id: Math.max(...mockPermissions.map(p => p.id)) + 1
    };
    mockPermissions.push(newPerm);
    return newPerm;
};

export const deletePermission = async (id) => {
    await delay(600);
    const index = mockPermissions.findIndex(p => p.id === id);
    if (index !== -1) {
        // Also remove this permission from any role that has it
        mockRoles.forEach(role => {
            role.permissions = role.permissions.filter(permId => permId !== id);
        });
        mockPermissions.splice(index, 1);
        return true;
    }
    throw new Error('Permission non trouvée');
};
