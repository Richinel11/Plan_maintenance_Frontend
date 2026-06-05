# Contexte de travail — EneoPlan / Flux DDR (Demande de Retrait)

## Application
EneoPlan est une application de planification de maintenance pour ENEO.  
Stack : Django REST Framework (backend) + React/Vite (frontend).  
Auth par cookies JWT. La sidebar est pilotée par `activeRoleName` (cookie) via `src/config/menus.js`.

---

## Rôles concernés dans cette session

| Rôle | Clé BD | Normalisation sidebar |
|------|--------|-----------------------|
| Opérateur de saisie | `OPERATEUR_SAISIE` | `op_saisie` |
| Responsable d'exploitation | `RESPONSABLE_EXPLOITATION` | `resp_exploit` |
| CCR (à faire) | — | — |

---

## Ce qui a été fait

### Responsable d'exploitation — pages et sidebar
- Sidebar configurée dans `src/config/menus.js` avec des alias pour toutes les variantes du nom de rôle (`RESPONSABLE_EXPLOITATION`, `responsable_exploitation`, `responsable_d'exploitation`, etc.)
- Routes ajoutées dans `src/App.jsx` :
  - `/dashboard/Accueil` → `src/pages/Responsable/Accueil/accueil.jsx`
  - `/dashboard/Notifications` → `src/pages/Responsable/Planning/Notifications.jsx`
  - `/dashboard/ddr/:ddrId` → `src/pages/Responsable/DDR/DDRDetailPage.jsx`

### Composants partagés créés
- `src/components/shared/PlanningTable/PlanningTable.jsx` — tableau réutilisable (opérateur + responsable)
- `src/components/shared/DDRView/DDRView.jsx` — **coquille vide** qui doit accueillir le document DDR (à implémenter)

### Page Notifications (`src/pages/Responsable/Planning/Notifications.jsx`)
- Affiche les plannings filtrés par `entite_metier` de l'utilisateur connecté
- Clic sur un planning → navigue vers `/dashboard/Planning/:id` (même page que l'opérateur)

### Page DDRDetailPage (`src/pages/Responsable/DDR/DDRDetailPage.jsx`)
- Page de visualisation de la DDR générée
- Boutons : Annuler (navigate(-1)) et Valider (branchement API à compléter)
- Utilise `DDRView` comme zone d'affichage (actuellement vide)

### Flux DDR dans Planning.jsx (`src/pages/op_saisie/Plannings/Planning.jsx`)
- Détection du rôle responsable via cookie `activeRoleName` → constante `isResponsable`
- Si `isResponsable` : bouton "VALIDER" au lieu de "Sauvegarder" en mode édition
- Fonction `handleValiderTravail` : PATCH travail + appel `genererDDR` + redirect `/dashboard/ddr/:id`
- Badge 🔒 sur les travaux dont `row.__travail?.demande_retrait` existe (DDR déjà générée)

### Service exploitation (`src/services/exploitationService.js`)
```js
genererDDR(travailId)   → POST /exploitation/ddr/generer/{travailId}/
deciderDDR(ddrId, data) → POST /exploitation/ddr/{ddrId}/decision/
diffuserNAPT(naptId)    → POST /exploitation/napt/{naptId}/diffuser/
getDDR(ddrId)           → GET  /exploitation/ddr/{ddrId}/
```

---

## Flux cible (design validé)

```
Notifications (liste plannings)
  → Planning/:id (détail planning, tableau des travaux)
    → clic ✏️ sur un travail (modal pré-rempli)
      → bouton "VALIDER" (au lieu de "Sauvegarder")
        → PATCH travail (mise à jour des données)
        → POST /exploitation/ddr/generer/{travail_id}/  ← POINT BLOQUANT
          → redirect /dashboard/ddr/{ddrId}
            → DDRDetailPage (visualisation DDR + boutons Annuler/Valider)
```

Un travail dont la DDR a déjà été générée affiche un badge 🔒 — il ne peut plus être modifié ni supprimé.

---

## Points bloquants

### 1. Erreur `statut_travaux` : "CREER" is not a valid choice
**Cause** : `src/utils/planningMapper.js` utilisait `"  CREER"` comme valeur de fallback pour `statut_travaux`. Or le modèle Django ne connaît que : `BROUILLON`, `SOUMIS`, `VALIDE`, `EN_COURS`, `TERMINE`, `REPORTE`.  
**État** : Non résolu — les tentatives de fix ont provoqué une erreur 404 et ont été annulées.  
**Piste** : Ne pas envoyer `statut_travaux` dans les requêtes PATCH (édition), car les transitions de statut sont gérées par des endpoints dédiés (`/travaux/<id>/actions/`). Supprimer ce champ du payload avant l'envoi :
```js
const payload = mapPlanningPayload({ ...planningFormData, service });
delete payload.planning_id;
delete payload.statut_travaux; // ne pas envoyer lors d'un PATCH
```
Mais attention : la valeur `"  CREER"` stockée en base sur certains travaux existants (créés avant la correction) doit d'abord être migrée en `BROUILLON` côté backend, sinon l'erreur continuera à la lecture.

### 2. Erreur 404 sur `POST /exploitation/ddr/generer/{travailId}/`
**Cause** : L'endpoint n'est peut-être pas encore implémenté ou accessible dans l'environnement de développement actuel.  
**À vérifier côté backend** :
- L'app `exploitation` est bien dans `INSTALLED_APPS` et ses urls incluses dans `core/urls.py`
- Le `travail_id` passé est bien un UUID valide (pas un entier)
- L'utilisateur connecté a bien la permission `GENERATE_DDR`
- URL exacte : vérifier si le slash final est requis ou non (`/generer/{id}` vs `/generer/{id}/`)

### 3. DDRView est une coquille vide
Le composant `src/components/shared/DDRView/DDRView.jsx` n'affiche rien.  
Le client a fourni un modèle Excel à implémenter. Le chemin du fichier n'a pas encore été communiqué dans cette session.  
**À faire** : Obtenir le chemin du fichier Excel modèle → lire sa structure → implémenter le rendu DDR.

### 4. Badge 🔒 conditionnel à la sérialisation backend
Le verrou sur les travaux déjà traités repose sur `row.__travail?.demande_retrait`.  
**À vérifier** : Le serializer Django du `Travail` doit inclure le champ `demande_retrait` (ou au moins son ID) dans sa réponse. Si ce n'est pas le cas, le badge ne s'affichera jamais.

### 5. Pages CCR non commencées
Deux pages CCR identifiées mais pas encore créées :
- `traitement-ddr` : le CCR consulte et approuve/refuse les DDR
- `validation-napt` : le CCR diffuse les NAPT auto-générées

---

## Fichiers clés à connaître

| Fichier | Rôle |
|---------|------|
| `src/config/menus.js` | Config sidebar par rôle |
| `src/App.jsx` | Toutes les routes |
| `src/pages/op_saisie/Plannings/Planning.jsx` | Page principale travaux (opérateur + responsable) |
| `src/utils/planningMapper.js` | Mappe formData → payload API (source du bug statut) |
| `src/services/exploitationService.js` | Appels API DDR/NAPT |
| `src/components/shared/DDRView/DDRView.jsx` | Composant DDR (vide, à implémenter) |
| `src/pages/Responsable/DDR/DDRDetailPage.jsx` | Page de visualisation DDR |
| `plan-maintenance/Plan_maintenance_Backend/planning/models.py` | Modèle Travail (l.88 : STATUT_TRAVAUX) |
| `plan-maintenance/Plan_maintenance_Backend/exploitation/` | App backend DDR/NAPT |

---

## Modèle backend — rappel

```python
# planning/models.py
STATUT_TRAVAUX = [
    ('BROUILLON', 'Brouillon'),
    ('SOUMIS', 'Soumis'),
    ('VALIDE', 'Validé'),
    ('EN_COURS', 'En cours'),
    ('TERMINE', 'Terminé'),
    ('REPORTE', 'Reporté'),
]
# "CREER" n'existe PAS — valeur par défaut Django : 'BROUILLON'

# exploitation/models.py
# DemandeRetrait : OneToOne avec Travail, statuts EN_ATTENTE/AUTORISE/REFUSE/REPORTE
# NoteArret      : OneToOne avec Travail, statuts GENEREE/DIFFUSEE (générée quand CCR approuve DDR)
```

---

## Endpoints exploitation (backend)

```
POST /exploitation/ddr/generer/{travail_id}/   permission: GENERATE_DDR
POST /exploitation/ddr/{ddr_id}/decision/      permission: DECIDE_DDR
POST /exploitation/napt/{napt_id}/diffuser/    permission: DIFFUSE_NAPT
```
