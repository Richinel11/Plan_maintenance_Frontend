/**
 * Fichier de configuration centralisé.
 * Il définit quels liens doivent apparaître dans la Sidebar selon le Rôle actif.
 * Très simple à comprendre, et extrêmement facile à maintenir si l'on veut ajouter un bouton.
 */

export const menuConfig = {
    // Profils liés à la conception
    op_saisie: [
        // { path: '/dashboard/OP-home', name: 'Accueil', icon: 'event_note' },
        { path: '/dashboard/plannings', name: 'Plannings', icon: 'event_note' },
        { path: '/dashboard/import', name: 'Importer Planning', icon: 'upload_file' },
        { path: '/dashboard/create-job', name: 'Nouveau Travail', icon: 'add_box' },
    ],
    gest_planif: [
        { path: '/dashboard/gantt', name: 'Diagramme Gantt', icon: 'bar_chart' },
        { path: '/dashboard/calendrier', name: 'Calendrier', icon: 'calendar_month' },
        { path: '/dashboard/alertes', name: 'Alertes Conflits', icon: 'warning' },
        { path: '/dashboard/effectifs', name: 'Plannings Effectifs', icon: 'done_all' },
        { path: '/dashboard/historique', name: 'Historique', icon: 'history' },
        { path: '/dashboard/rapports', name: 'Rapports & KPI', icon: 'assessment' },
    ],
    resp_exploit: [
        { path: '/dashboard/validations', name: 'Validation Plannings', icon: 'rule' },
        { path: '/dashboard/ddr', name: 'Demandes DDR', icon: 'assignment' },
        { path: '/dashboard/napt', name: 'Documents NAPT', icon: 'description' },
    ],
    ccr: [
        { path: '/dashboard/traitement-ddr', name: 'Traitement DDR', icon: 'task' },
        { path: '/dashboard/validation-napt', name: 'Validation NAPT', icon: 'verified_user' },
    ],
    reg_audit: [
        { path: '/dashboard/audit-plannings', name: 'Plannings', icon: 'visibility' },
        { path: '/dashboard/audit-ddr', name: 'Liste des DDR', icon: 'fact_check' },
        { path: '/dashboard/audit-napt', name: 'Liste des NAPT', icon: 'policy' },
        { path: '/dashboard/export', name: 'Export Global', icon: 'download' },
    ],
    eq_comm: [
        { path: '/dashboard/alertes-publiques', name: 'Alertes Publiques', icon: 'campaign' },
    ],
    // Profil Administrateur Système (Gestion Permissions)
    admin: [
        { path: '/dashboard/users', name: 'Utilisateurs', icon: 'group' },
        { path: '/dashboard/roles', name: 'Rôles', icon: 'security' },
        { path: '/dashboard/permissions', name: 'Permissions', icon: 'shield_locked' },
    ]
};

// --- Mappings de compatibilité (Backend Django) ---
menuConfig['Ad1'] = menuConfig['admin'];
menuConfig['ad1'] = menuConfig['admin'];
menuConfig['Administrateur'] = menuConfig['admin'];
