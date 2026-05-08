# Documentation d'Intégration du Workflow (Module Pilotage)

Cette documentation explique la logique implémentée par le backend dans le module `pilotage` pour gérer les workflows des plannings (`PlanningTravaux`), et comment le frontend doit s'y connecter.

## 1. Concepts et Modèles de Données

Le système est basé sur une machine à états (State Machine) configurée dynamiquement.

*   **Workflow** : Définit un processus global (ex: "Validation de Planning").
*   **WorkflowStep (Étape)** : Représente un état précis dans le workflow (ex: "Brouillon", "En attente de validation Manager", "Validé"). Les étapes sont ordonnées par un `number` et peuvent être terminales (`is_terminal`).
*   **WorkflowTransition** : Le chemin pour passer d'une étape `from_step` à une `to_step`. Configure si un commentaire est obligatoire (`comment_required`) ou si l'on peut revenir en arrière en cas de rejet (`can_go_back`).
*   **WorkflowValidation** : Définit **qui** (quel `Role`) a le droit d'effectuer ou de valider une transition. Gère les statuts (`PENDING`, `APPROVED`, `REJECTED`).
*   **WorkflowHistory** : L'historique immuable de chaque action (qui a fait quoi, quand, de quelle étape vers quelle étape, avec quel commentaire).

> [!NOTE]
> Le `PlanningTravaux` possède un champ `current_step` (clé étrangère vers `WorkflowStep`) qui définit son état actuel, et un lien `workflow` vers le `Workflow` qu'il suit.

---

## 2. Intégration Frontend : Les Endpoints d'Exécution

Pour l'interface utilisateur, une fois qu'un planning est créé et soumis à un workflow, voici les endpoints que le frontend doit utiliser. Toutes ces routes sont préfixées par la configuration principale (ex: `/api/pilotage/`).

### A. Récupérer l'état actuel d'un planning
**`GET /planning/<uuid:planning_id>/current-step`**
Permet d'afficher à l'utilisateur l'état actuel du dossier.
*   **Permission** : `IsAuthenticated`
*   **Réponse (200 OK)** :
```json
{
  "planning_id": "uuid-du-planning",
  "workflow": "Nom du Workflow",
  "current_step": {
    "code": "CODE_ETAPE",
    "name": "Nom de l'étape",
    "number": 2
  }
}
```

### B. Obtenir les actions (transitions) possibles
**`GET /planning/<uuid:planning_id>/transitions`**
Permet de générer dynamiquement les boutons d'action (ex: "Valider", "Rejeter", "Demander modification") en fonction de l'étape actuelle du planning.
*   **Logique Backend** : Le backend vérifie l'étape actuelle et ne renvoie que les transitions actives qui partent de cette étape. **Attention :** ce endpoint liste toutes les transitions possibles depuis cette étape, le frontend ou backend (lors de l'action) vérifiera si l'utilisateur a les droits.
*   **Permission** : `IsAuthenticated`
*   **Réponse (200 OK)** : Liste d'objets `WorkflowTransition`.
```json
[
  {
    "id": "uuid-de-la-transition",
    "name": "Validation Manager",
    "from_step": { "id": "...", "name": "Brouillon", "code": "..." },
    "to_step": { "id": "...", "name": "En attente RH", "code": "..." },
    "can_go_back": false,
    "comment_required": true,
    "is_active": true
  }
]
```
> [!TIP]
> **UX Frontend** : Utilisez le champ `comment_required` pour savoir si vous devez afficher un champ de texte obligatoire dans une modale avant que l'utilisateur ne confirme son action.

### C. Exécuter / Valider une transition (Avancer dans le workflow)
**`POST /planning/<uuid:planning_id>/transition/execute`**
L'utilisateur clique sur un bouton d'action (ex: "Approuver") pour faire avancer le planning.
*   **Permission** : `IsAuthenticated` + Rôle global `WORKFLOW_TRANSITION` (en plus du rôle spécifique requis par la transition).
*   **Payload (JSON)** :
```json
{
  "transition_id": "uuid-de-la-transition-choisie",
  "comment": "Commentaire de validation optionnel ou obligatoire"
}
```
*   **Logique Backend** :
    1.  Vérifie que la transition part bien de l'étape actuelle du planning.
    2.  Vérifie que l'utilisateur a le bon rôle (défini dans `WorkflowValidation` pour cette transition).
    3.  Vérifie la présence du `comment` si `comment_required` est `true`.
    4.  Mise à jour de `current_step` du planning.
    5.  Création de l'historique et validation.
*   **Réponses** :
    *   `200 OK` : Succès, renvoie les infos du passage de `from_step` à `to_step`.
    *   `400 Bad Request` : Erreurs logiques (`"Vous n'avez pas les droits..."`, `"Un commentaire est requis..."`).

### D. Refuser une transition (Rejet)
**`POST /planning/<uuid:planning_id>/transition/reject`**
L'utilisateur a le droit d'évaluer une transition mais décide de la refuser.
*   **Permission** : `IsAuthenticated` + Rôle global `WORKFLOW_REJECT`.
*   **Payload (JSON)** :
```json
{
  "transition_id": "uuid-de-la-transition-evaluee",
  "motif": "Raison du refus"
}
```
*   **Logique Backend** :
    1. Vérifie les droits de l'utilisateur.
    2. Enregistre le rejet (statut `REJECTED`) avec le motif.
    3. **Action spéciale** : Si la transition possède `can_go_back = true`, le planning recule à l'étape précédente (`from_step` de la transition). Sinon, il reste à l'étape actuelle (bloqué ou en attente d'une autre validation).
*   **Réponses** : `200 OK` ou `400 Bad Request`.

### E. Consulter l'historique (Audit Trail)
**`GET /planning/<uuid:planning_id>/history`**
Pour afficher le fil d'Ariane ou l'historique des validations dans un tiroir ou un onglet de détail.
*   **Permission** : `IsAuthenticated`
*   **Réponse (200 OK)** :
```json
[
  {
    "id": "uuid-historique",
    "transition_name": "Soumission initiale",
    "from_step": { "name": "Création" },
    "to_step": { "name": "Validation N+1" },
    "performed_by": {
      "id": "uuid-user",
      "full_name": "Jean Dupont",
      "username": "jdupont"
    },
    "comment": "Merci de valider",
    "transitioned_at": "2026-05-08T10:00:00Z"
  }
]
```

---

## 3. Configuration & Administration du Workflow (CRUD)

Ces routes sont généralement utilisées par un administrateur système via des écrans de paramétrage (ceux développés dans le "Process Editor" visuel).
Toutes ces routes nécessitent la permission `MANAGE_WORKFLOW`.

*   **Workflows** : `GET / POST / PUT / DELETE` sur `/workflows/all-workflows`, `/workflows/create-workflow`, `/workflows/find-workflow/<id>`, etc.
*   **Étapes (Steps)** : `GET / POST / PUT / DELETE` sur `/workflows/<workflow_id>/all-steps`, `.../create-step`, `.../find-step/<step_id>`, etc.
*   **Transitions** : `GET / POST / PUT / DELETE` sur `/workflows/<workflow_id>/all-transitions`, etc.
*   **Validations (Définition des rôles)** : `GET / POST / PUT / DELETE` sur `/transitions/<transition_id>/all-validations`, etc. Lors de la création d'une validation (`POST .../create-validation`), le payload attendu est :
    ```json
    {
      "step": "uuid-du-step",
      "role": "uuid-du-role",
      "status": "PENDING", 
      "motif": ""
    }
    ```

## 4. Résumé de la mécanique de Sécurité

Pour qu'un utilisateur voit et puisse cliquer sur un bouton d'action :
1. L'action (Transition) doit être possible (partir de l'étape actuelle).
2. Son rôle (via `UserRole`) doit correspondre à l'un des rôles requis dans les entrées `WorkflowValidation` avec `status="PENDING"` liées à cette transition. (cf. `services.py:can_user_transition`)
3. L'utilisateur doit avoir les permissions globales `WORKFLOW_TRANSITION` et/ou `WORKFLOW_REJECT` selon l'action.

> [!WARNING]
> Avant d'exécuter la requête POST vers le backend, assurez-vous de bien vérifier si `comment_required` est à `true` sur la transition choisie. Si c'est le cas, affichez un champ obligatoire dans le Front pour ne pas subir un `400 Bad Request` du serveur !
