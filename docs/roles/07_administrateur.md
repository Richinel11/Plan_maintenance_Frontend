# Rôle : Administrateur

**Code rôle :** `admin`  
**Société concernée :** Toutes  
**Responsabilité :** Gérer les utilisateurs, les rôles, les permissions et les workflows. Accès complet au système.

---

## Routes accessibles

| URL | Page | Description |
|-----|------|-------------|
| `/dashboard/home` | Dashboard admin | Vue d'ensemble système |
| `/dashboard/users` | Gestion utilisateurs | CRUD utilisateurs |
| `/dashboard/roles` | Gestion rôles | CRUD rôles + assignation permissions |
| `/dashboard/permissions` | Gestion permissions | CRUD permissions |
| `/dashboard/workflow/historique` | Workflows | Liste des workflows |
| `/dashboard/workflow/:id` | Détail workflow | Édition graphique du workflow |
| `/dashboard/workflow/Workflow/creer` | Créer workflow | Formulaire de création |
| `/dashboard/planning-audit` | Audit plannings | Vue audit des plannings |
| `/dashboard/planning-audit/:planningId` | Détail audit | Exécution des transitions de workflow |

---

## Fonctionnalités disponibles

### Gestion des utilisateurs
- Lister tous les utilisateurs
- Créer un utilisateur (username, password, entité métier, rôle initial)
- Modifier un utilisateur (informations, rôle)
- Désactiver / réactiver un utilisateur
- Assigner / retirer un rôle à un utilisateur

### Gestion des rôles
- Lister tous les rôles
- Créer un rôle (code, nom, description)
- Modifier un rôle
- Supprimer un rôle
- Assigner / retirer des permissions à un rôle

### Gestion des permissions
- Lister toutes les permissions
- Créer une permission (module, code, description)
- Modifier une permission
- Supprimer une permission

### Workflows
- Créer un workflow (états + transitions)
- Modifier un workflow via éditeur graphique (XYFlow)
- Associer un workflow à un planning
- Piloter l'avancement d'un planning dans son workflow (exécuter/rejeter des transitions)

---

## Endpoints API appelés

### Utilisateurs
```
GET    /security/users/                        Liste des utilisateurs
GET    /security/users/:id/                    Détail
POST   /security/users/                        Créer
PUT    /security/users/:id/                    Modifier
PATCH  /security/users/:id/                    Modifier partiellement
POST   /security/users/:id/deactivate/         Désactiver
POST   /security/users/:id/activate/           Réactiver
POST   /security/users/:id/assign-role/        Assigner un rôle
POST   /security/users/:id/remove-role/        Retirer un rôle
GET    /security/users/:id/roles/              Rôles d'un utilisateur
```

### Rôles
```
GET    /security/roles/                        Liste des rôles
POST   /security/roles/                        Créer
PUT    /security/roles/:code/                  Modifier
PATCH  /security/roles/:code/                  Modifier partiellement
DELETE /security/roles/:code/                  Supprimer
POST   /security/roles/:code/assign-permission/    Assigner une permission
POST   /security/roles/:code/remove-permission/    Retirer une permission
GET    /security/roles/:code/permissions/          Permissions d'un rôle
```

### Permissions
```
GET    /security/permissions/                  Liste
POST   /security/permissions/                  Créer
PUT    /security/permissions/:code/            Modifier
DELETE /security/permissions/:code/            Supprimer
GET    /security/permission-modules/           Modules disponibles
```

### Workflows
```
GET    /pilotage/workflows/                    Liste des workflows
POST   /pilotage/workflows/                    Créer
GET    /pilotage/workflows/:id/                Détail
PUT    /pilotage/workflows/:id/                Modifier
DELETE /pilotage/workflows/:id/                Supprimer

GET    /pilotage/workflows/:id/steps/          États
POST   /pilotage/workflows/:id/steps/          Créer un état
PUT    /pilotage/workflows/:id/steps/:sid/     Modifier un état
DELETE /pilotage/workflows/:id/steps/:sid/     Supprimer un état

GET    /pilotage/workflows/:id/transitions/    Transitions
POST   /pilotage/workflows/:id/transitions/    Créer une transition
PUT    /pilotage/workflows/:id/transitions/:tid/  Modifier
DELETE /pilotage/workflows/:id/transitions/:tid/  Supprimer

GET    /pilotage/plannings/:id/current-step/         Étape courante
GET    /pilotage/plannings/:id/available-transitions/ Transitions disponibles
POST   /pilotage/plannings/:id/transitions/:tid/execute/   Exécuter
POST   /pilotage/plannings/:id/transitions/:tid/reject/    Rejeter
GET    /pilotage/plannings/:id/history/              Historique du workflow
```

---

## Données accessibles

| Donnée | Lecture | Création | Modification | Suppression |
|--------|---------|----------|-------------|-------------|
| Utilisateurs | ✅ | ✅ | ✅ | Désactivation |
| Rôles | ✅ | ✅ | ✅ | ✅ |
| Permissions | ✅ | ✅ | ✅ | ✅ |
| Workflows | ✅ | ✅ | ✅ | ✅ |
| Plannings (audit) | ✅ | ❌ | Transition | ❌ |
| DDR / NAPT | ❌ | ❌ | ❌ | ❌ |

---

## Points d'attention sécurité (CRITIQUE)

- **Création d'utilisateur** : vérifier la robustesse des mots de passe (complexité, longueur minimale) — le frontend n'impose pas de règles strictes côté formulaire.
- **Élévation de privilèges** : un admin peut s'assigner n'importe quel rôle — vérifier qu'il ne peut pas créer un super-admin non prévu par le système.
- **Suppression de rôle actif** : supprimer un rôle utilisé par des utilisateurs connectés doit invalider leurs sessions — vérifier le comportement.
- **Suppression de permission** : retirer une permission peut briser le comportement d'autres rôles — vérifier les impacts en cascade.
- **Injection dans les champs** : les champs `nom`, `code_role`, `code_permission` sont utilisés dans des requêtes backend — vérifier les validations.
- **Workflow malveillant** : un workflow mal configuré (boucle infinie de transitions, état terminal manquant) peut bloquer un planning — vérifier les validations à la création.
- **Token admin** : le token d'un admin a une surface d'attaque maximale — vérifier la durée de vie du `accessToken` et la politique de rotation du `refreshToken`.
- **API directe** : toutes les opérations admin sont des appels REST directs — vérifier que les endpoints backend imposent bien la permission `admin` et ne se fient pas uniquement au cookie frontend.
