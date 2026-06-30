/**
 * Fichier de configuration centralisé.
 * Il définit quels liens doivent apparaître dans la Sidebar selon le Rôle actif.
 */

export const menuConfig = {
    // Profils liés à la conception
    operateur_de_saisie: [
        { path: '/dashboard/OP-home', name: 'Accueil', icon: 'dashboard' },
        { path: '/dashboard/Planning', name: 'Import', icon: 'upload_file' },
        { path: '/dashboard/CreerTravail', name: 'Nouveau Travail', icon: 'add_box' },
    ],
    gestionnaire_de_planification: [
        { path: '/dashboard/dashboard-plan', name: 'Accueil',    icon: 'dashboard'      },
        { path: '/dashboard/Calendar',       name: 'Calendrier', icon: 'calendar_month' },
        { path: '/dashboard/alertes',        name: 'Alertes',    icon: 'notifications'  },
        { path: '/dashboard/historique',     name: 'Historique', icon: 'history'        },
        { path: '/dashboard/KPI',            name: 'KPI',        icon: 'analytics'      },
    ],
    resp_exploit: [
        { path: '/dashboard/Accueil',       name: 'Accueil',     icon: 'dashboard'  },
        { path: '/dashboard/Notifications', name: 'Plannings',   icon: 'assignment' },
        { path: '/dashboard/historique',    name: 'Historique',  icon: 'history'    },
    ],
    ccr: [
        { path: '/dashboard/ccr-accueil',    name: 'Accueil',    icon: 'dashboard' },
        { path: '/dashboard/traitement-ddr', name: 'DDR',        icon: 'task'      },
        { path: '/dashboard/ccr-historique', name: 'Historique', icon: 'history'   },
    ],
    reg_audit: [
        { path: '/dashboard/audit-plannings', name: 'Plannings', icon: 'visibility' },
        { path: '/dashboard/audit-ddr', name: 'Liste des DDR', icon: 'fact_check' },
        { path: '/dashboard/audit-napt', name: 'Liste des NAPT', icon: 'policy' },
        { path: '/dashboard/export', name: 'Export Global', icon: 'download' },
    ],
    eq_comm: [
        { path: '/dashboard/comm-accueil', name: 'Accueil', icon: 'dashboard' },
        { path: '/dashboard/comm-napt',    name: 'NAPT',    icon: 'policy'    },
    ],
    charge_consig: [
        { path: '/dashboard/charge-consig/travaux', name: 'Mes travaux', icon: 'engineering' },
    ],
    //rofil Administrateur Système (Gestion Permissions et workflow)
    admin: [
        { path: '/dashboard/users', name: 'Utilisateurs', icon: 'group' },
        { path: '/dashboard/roles', name: 'Rôles', icon: 'security' },
        { path: '/dashboard/permissions', name: 'Permissions', icon: 'shield_locked' },
        { path: '/dashboard/workflow/historique', name: 'Workflows', icon: 'account_tree' },
        { path: '/dashboard/planning-audit', name: 'Audit Plannings', icon: 'fact_check' },
    ]
};

console.log("Menu Configuration Loaded:", menuConfig['gest_planif']);

// --- Mappings de compatibilité (Backend Django) ---
// Codes legacy en minuscule
menuConfig['op1'] = menuConfig['operateur_de_saisie'];
menuConfig['Ad1'] = menuConfig['admin'];

// Codes réels du backend (code_role en majuscule dans les modèles Django)
menuConfig['OPERATEUR_SAISIE'] = menuConfig['operateur_de_saisie'];
menuConfig['operateur_saisie'] = menuConfig['operateur_de_saisie'];
menuConfig['opérateur_de_saisie'] = menuConfig['operateur_de_saisie'];
menuConfig['ADMIN'] = menuConfig['admin'];
menuConfig['ADMINISTRATEUR'] = menuConfig['admin'];
menuConfig['administrateur'] = menuConfig['admin'];
menuConfig['GESTIONNAIRE_PLANNING'] = menuConfig['gestionnaire_de_planification'];
menuConfig['gestionnaire de planification'] = menuConfig['gestionnaire_de_planification'];
menuConfig['gest_planification'] = menuConfig['gestionnaire_de_planification'];
menuConfig['Gestionnaire_Planification'] = menuConfig['gestionnaire_de_planification'];
menuConfig['gest_planif'] = menuConfig['gestionnaire_de_planification'];
menuConfig['RESP_EXPLOIT'] = menuConfig['resp_exploit'];
menuConfig['RESPONSABLE_EXPLOITATION'] = menuConfig['resp_exploit'];
menuConfig['responsable_exploitation'] = menuConfig['resp_exploit'];
menuConfig["responsable_d'exploitation"] = menuConfig['resp_exploit'];
menuConfig['responsable_d_exploitation'] = menuConfig['resp_exploit'];
menuConfig['CCR'] = menuConfig['ccr'];
menuConfig['REG_AUDIT'] = menuConfig['reg_audit'];
menuConfig['CHARGE_CONSIGNATION'] = menuConfig['charge_consig'];
menuConfig['charge_consignation'] = menuConfig['charge_consig'];
menuConfig['EQ_COMM']        = menuConfig['eq_comm'];
menuConfig['COMMUNICATION']  = menuConfig['eq_comm'];
menuConfig['communication']  = menuConfig['eq_comm'];
