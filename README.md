# EneoPlan — Frontend Documentation

> Documentation complète à destination des sessions Claude Code futures.
> Dernière mise à jour : juin 2026.

---

## Table des matières

1. [Contexte métier](#1-contexte-métier)
2. [Stack technique](#2-stack-technique)
3. [Structure du projet](#3-structure-du-projet)
4. [Authentification et rôles](#4-authentification-et-rôles)
5. [Architecture des routes](#5-architecture-des-routes)
6. [Modules applicatifs](#6-modules-applicatifs)
7. [Composants partagés](#7-composants-partagés)
8. [Couche services (API)](#8-couche-services-api)
9. [Documents clés : DDR et NAPT](#9-documents-clés--ddr-et-napt)
10. [Patterns récurrents](#10-patterns-récurrents)
11. [CSS et styles](#11-css-et-styles)
12. [Configuration et variables d'environnement](#12-configuration-et-variables-denvironnement)

---

## 1. Contexte métier

**EneoPlan** est une application web de planification et de gestion des arrêts de travaux sur le réseau électrique camerounais. Elle sert deux sociétés :

| Société | Segments couverts | Logo |
|---------|------------------|------|
| **ENEO** | DISTRIBUTION, PRODUCTION | `/public/eneo.png` |
| **SONATREL** | TRANSPORT | `/public/logosonarel.png` |

### Workflow documentaire principal

```
Opérateur         Responsable          CCR                    Communication
   │                   │                │                          │
   │ Crée un Travail    │                │                          │
   │──────────────────>│                │                          │
   │ Génère une DDR    │                │                          │
   │ (genererDDR)      │                │                          │
   │                   │ Soumet la DDR  │                          │
   │                   │──────────────>│                          │
   │                   │               │ Valide (deciderDDR)       │
   │                   │               │ → génère NAPT auto        │
   │                   │               │ Édite la NAPT             │
   │                   │               │ Diffuse (diffuserNAPT)    │
   │                   │               │──────────────────────────>│
   │                   │               │                   Reçoit NAPT DIFFUSEE
```

### Concepts métier essentiels

- **Travail** : unité de travail planifié sur le réseau (rattaché à un Planning)
- **Planning** : regroupement de travaux pour une période donnée
- **DDR** (Demande de Retrait) : document émis par le responsable pour demander l'autorisation de retrait d'un ouvrage
- **NAPT** (Note d'Arrêt Programmée de Travaux) : document officiel généré automatiquement par le backend lors de la validation d'une DDR ; il est ensuite complété et diffusé par le CCR
- **Ouvrage** : installation électrique à retirer de la conduite (ligne HTB, poste, transformateur…) — stocké comme `ReferentielItem` de `type.nom === 'ouvrage'` dans `Travail.reference.items`
- **ENF** (Énergie Non Fournie) : indicateur de l'impact d'un arrêt en MWh — valeur **globale** par document, pas par rôle
- **Tronçons consignés** (`troncons_consignes`) : sections spécifiques à consigner dans le Travail ; champ distinct du nom de l'ouvrage

### Segments et différences de workflow

| Segment | Société | Particularités NAPT |
|---------|---------|-------------------|
| DISTRIBUTION | ENEO | Tableau de rôles plat + bloc ENF global + zones impactées |
| PRODUCTION | ENEO | Idem DISTRIBUTION + indicateurs de production (MW, fuel, centrale) |
| TRANSPORT | SONATREL | Multi-chantiers, colonne Entreprise, tableau ENF par phase (consignation/réalisation/déconsignation) |

---

## 2. Stack technique

| Couche | Technologie | Version |
|--------|------------|---------|
| Framework | React | 19.2.5 |
| Routing | React Router DOM | 7.14.1 |
| Build | Vite | 8.0.10 |
| Styling | Tailwind CSS + CSS modules par composant | 4.3.0 |
| Formulaires | React Hook Form + Zod | 7.76 / 4.4 |
| HTTP | Axios | 1.14.0 |
| Calendrier | FullCalendar React | 6.1.20 |
| Gantt | DHTMLX Trial React Gantt | 9.1.4 |
| Graphe workflow | XYFlow React | 12.10.2 |
| Excel | xlsx | 0.18.5 |
| Export PDF | html2pdf.js | 0.14.0 |
| Drag & Drop | dnd-kit | 6.3 / 10.0 |
| Notifications | Sonner | 2.0.7 |
| Cookies | js-cookie | 3.0.5 |
| Icons | Lucide React + Material Symbols Outlined | — |

**Pas de state manager global** (pas de Redux, pas de Zustand, pas de Context API). L'état est local à chaque page via `useState`. L'authentification passe par les cookies et `localStorage`.

---

## 3. Structure du projet

```
src/
├── API/
│   └── axiosInstance.js          # Client HTTP (JWT auto-inject, 401 handler)
├── assets/
│   └── CCR/                      # Modèles Excel NAPT (référence de conception)
├── components/
│   └── shared/
│       ├── DDRValider/           # Composant de validation DDR avec upload fichier
│       ├── DDRView/              # Viewer/éditeur document DDR
│       ├── NAPTView/             # Viewer/éditeur document NAPT
│       └── PlanningTable/        # Tableau réutilisable de plannings
├── config/
│   └── menus.js                  # Configuration des menus par rôle
├── layouts/
│   └── DashboardLayout/          # Layout principal (Sidebar + Header + Outlet)
│       └── components/
│           ├── Header/           # Breadcrumb + déconnexion
│           └── Sidebar/          # Menu dynamique selon rôle actif
├── pages/
│   ├── CCR/                      # Module Centre de Conduite Réseau
│   ├── Communication/            # Module équipe communication
│   ├── ComponentsRole/           # Utilitaires rôles/segments
│   ├── DashboardHome/            # Page d'accueil admin
│   ├── G-Plan/                   # Module gestionnaire de planification
│   ├── Login/                    # Pages d'authentification
│   ├── Responsable/              # Module responsable d'exploitation
│   ├── Security/                 # Gestion users/rôles/permissions
│   ├── Workflow/                 # Éditeur de workflow
│   └── op_saisie/                # Module opérateur de saisie
├── services/                     # Couche API (voir §8)
├── styles/
│   └── toasts.css                # Style notifications Sonner
├── utils/
│   └── planningMapper.js         # Mappers FullCalendar / Gantt
├── App.jsx                       # Déclaration de toutes les routes
├── index.css                     # Variables CSS globales + reset
└── main.jsx                      # Point d'entrée React
```

---

## 4. Authentification et rôles

### Stockage de session

| Donnée | Stockage | Clé |
|--------|---------|-----|
| Token d'accès JWT | Cookie | `accessToken` |
| Token de rafraîchissement | Cookie | `refreshToken` |
| Données utilisateur | Cookie + localStorage | `user` |
| Rôle actif (code) | Cookie | `activeRole` |
| Rôle actif (nom affiché) | Cookie | `activeRoleName` |

### Rôles applicatifs

| Code rôle | Libellé | Module principal |
|-----------|---------|-----------------|
| `operateur_de_saisie` | Opérateur de saisie | `op_saisie/` |
| `gestionnaire_de_planification` | Gestionnaire de planification | `G-Plan/` |
| `resp_exploit` | Responsable d'exploitation | `Responsable/` |
| `ccr` | Centre de Conduite Réseau | `CCR/` |
| `eq_comm` | Équipe communication | `Communication/` |
| `reg_audit` | Audit/régulation | — |
| `admin` | Administrateur | `Security/` |

Le menu de la Sidebar est entièrement déterminé par le rôle actif via `config/menus.js`.

### Flux d'authentification

```
/login → POST /auth/login/ → cookies (accessToken, refreshToken, user)
       → /select-role (si l'utilisateur a plusieurs rôles)
       → /dashboard/home
```

Le `axiosInstance` injecte automatiquement le header `Authorization: Bearer <accessToken>` sur chaque requête. En cas de 401, la session est effacée et l'utilisateur est redirigé vers `/login`.

---

## 5. Architecture des routes

Toutes les routes sont déclarées dans `src/App.jsx`. Les routes du dashboard sont imbriquées sous `/dashboard` et utilisent `DashboardLayout` comme wrapper.

```
/
├── /login
├── /change-password
├── /select-role
└── /dashboard  (DashboardLayout)
    ├── home
    ├── users / roles / permissions          (Admin)
    ├── workflow/historique
    ├── workflow/:id
    ├── workflow/Workflow/creer
    ├── planning-audit
    ├── planning-audit/:planningId
    ├── OP-home / Planning / Planning/:id / CreerTravail    (Opérateur)
    ├── dashboard-plan / Calendar / alertes                 (G-Plan)
    ├── advanced-gantt / reajustement-avance
    ├── Accueil / Notifications / historique                (Responsable)
    ├── consultation/ddr/:id
    ├── consultation/napt/:id
    ├── ddr/:ddrId
    ├── ddr/:ddrId/valider
    ├── ccr-accueil                                         (CCR)
    ├── traitement-ddr
    ├── ccr-historique
    ├── ccr/ddr/:ddrId          → CcrDDRActionPage
    └── ccr/napt/:naptId        → CcrNAPTPage
```

---

## 6. Modules applicatifs

### 6.1 Module Opérateur de saisie (`op_saisie/`)

| Fichier | Rôle |
|---------|------|
| `Accuiel/Dashboard.jsx` | Tableau de bord avec métriques |
| `Plannings/Planning.jsx` | Liste des plannings avec filtres, création, import Excel |
| `Importer_Plannings/importation.jsx` | Import en masse via fichier Excel (.xlsx) |
| `Creer_Travail/Nouveau_Travail.jsx` | Création d'un travail en 4 étapes |
| `Creer_Travail/ProgressBar/ProgressBar.jsx` | Barre de progression des étapes |
| `Creer_Travail/components/PlanningForm.jsx` | Formulaire principal de création |
| `Creer_Travail/Recap/recap.jsx` | Récapitulatif avant soumission |

**Point clé :** L'ouvrage est sélectionné via `reference.items` de type `"ouvrage"`. Les champs `Ouvrages`, `Poste`, `Départ`, `Segment` sont tous des `ReferentielItem` typés sous une même `Reference`.

### 6.2 Module G-Plan (`G-Plan/`)

| Fichier | Rôle |
|---------|------|
| `Dashboard/Dashboard.jsx` | Vue d'ensemble des plannings et conflits |
| `Alertes/AlertesView.jsx` | Conflits et opportunités d'harmonisation |
| `Calendar/CalendarView.jsx` | Vue calendrier FullCalendar |
| `Gantt-Diag/details/AdvancedGantt.jsx` | Diagramme Gantt DHTMLX avec conflits colorés |
| `Gantt-Diag/details/ReajustementAvance.jsx` | Réajustement planifié |

Les couleurs des conflits dans le Gantt et le calendrier proviennent de `gplanService.fetchConflitIds()` et `travailMapper.js`.

### 6.3 Module Responsable d'exploitation (`Responsable/`)

| Fichier | Rôle |
|---------|------|
| `Accueil/accueil.jsx` | Accueil avec indicateurs |
| `Planning/Notifications.jsx` | Liste des plannings soumis |
| `DDR/DDRDetailPage.jsx` | Détail d'une DDR + génération |
| `DDRdisplay/DDRValiderPage.jsx` | Page de validation DDR avec upload |
| `Consultation/ConsultationPage.jsx` | Lecture seule DDR ou NAPT selon `type` prop |
| `Historique/Historique.jsx` | Liste unifiée DDR + NAPT avec filtres et pagination |

**`ConsultationPage`** : layout réutilisable (aside + main, classes CSS préfixées `cp-`) utilisé également dans les pages CCR. Props : `type="DDR"` ou `type="NAPT"`.

**`Historique`** : accepte deux props optionnelles :
- `ddrOnly={true}` → n'affiche que les DDR (utilisé par `TraitementDDR` du CCR)
- `onRowClick={(item) => ...}` → override du comportement de clic (utilisé pour la navigation CCR)

### 6.4 Module CCR (`CCR/`)

C'est le module le plus récemment développé. Flux complet :

```
TraitementDDR (liste Historique)
    │
    ├── DDR EN_ATTENTE → /ccr/ddr/:ddrId → CcrDDRActionPage
    │       ├── Bouton "Valider" → deciderDDR(AUTORISE) → /ccr/napt/:naptId
    │       └── Bouton "Rejeter" → panel inline motif → deciderDDR(REFUSE)
    │
    ├── DDR autre statut → /consultation/ddr/:id (lecture seule)
    └── NAPT → /consultation/napt/:id (lecture seule)

/ccr/napt/:naptId → CcrNAPTPage
    └── NAPTView readOnly={false} (ÉDITABLE)
    └── Bouton "Diffuser" → diffuserNAPT() → /traitement-ddr
```

| Fichier | Rôle |
|---------|------|
| `Accueil/CcrAccueil.jsx` | Tableau de bord CCR |
| `TraitementDDR/TraitementDDR.jsx` | Réutilise `<Historique ddrOnly onRowClick={...} />` |
| `DDRAction/CcrDDRActionPage.jsx` | Vue DDR + boutons Valider/Rejeter (visibles si `EN_ATTENTE`) |
| `DDRAction/CcrDDRActionPage.css` | `.ccr-btn-valider` (vert), `.ccr-btn-rejeter` (rouge), `.ccr-rejet-panel` |
| `NAPT/CcrNAPTPage.jsx` | Édition NAPT + bouton Diffuser |
| `NAPT/CcrNAPTPage.css` | `.napt-btn-diffuser` (bleu #1B75BB), `.napt-edit-info` |
| `Historique/Historique.jsx` | Stub (à construire) |

### 6.5 Module Communication (`Communication/`)

| Fichier | Rôle |
|---------|------|
| `Accueil/CommAccueil.jsx` | Accueil équipe communication |
| `NAPT/CommNAPTPage.jsx` | Consultation et gestion des NAPT diffusées |

### 6.6 Module Sécurité (`Security/`)

Gestion des utilisateurs, rôles et permissions. CRUD complet via modales. Utilise `userService.js`.

### 6.7 Module Workflow (`Workflow/`)

Éditeur visuel de workflow basé sur **XYFlow** (graphe nœuds/arêtes). Permet de définir les états et transitions d'un planning. Utilise `workflowService.js`.

---

## 7. Composants partagés

### 7.1 `DDRView` — `src/components/shared/DDRView/`

Viewer/éditeur complet du document DDR. Utilise `forwardRef`.

```jsx
<DDRView ref={myRef} ddrId="uuid" readOnly={false} />
// myRef.current.getFormData() → { fields, roles }
```

**Structure du document DDR :**
1. En-tête : logo société + numéro DDR + dates
2. Titre : "DEMANDE DE RETRAIT"
3. Section demandeur : unité, nom demandeur, N° fiche problème, date réception
4. Installation / **Ouvrage** : `t.reference.items.find(it => it.type.nom.toLowerCase() === 'ouvrage')?.valeur`
5. Consistance des travaux
6. Planning : dates début/fin consignation, délai de restitution
7. Tableau des rôles (ajout/suppression dynamique)
8. Observations
9. Mesures de sécurité (texte par défaut modifiable)
10. Bloc signature

**Logo dynamique** selon `t.segment` :
- `TRANSPORT` → `/logosonarel.png` (SONATREL)
- Autre → `/eneo.png` (ENEO)

### 7.2 `NAPTView` — `src/components/shared/NAPTView/`

Viewer/éditeur complet du document NAPT. Utilise `forwardRef`. Importe `DDRView.css` pour la cohérence visuelle.

```jsx
<NAPTView ref={myRef} naptId="uuid" readOnly={false} />
// myRef.current.getFormData() → { fields, rolesFlat, chantiers }
```

**Structure du document NAPT — Distribution / Production :**
1. En-tête : logo + N° note d'arrêt + N° DDR lié
2. Identification : unité demanderesse, date réception, nom demandeur
3. Installation / **Ouvrage** (même logique que DDRView)
4. Consistance des travaux (Distribution/Production seulement)
5. Planning : consignation, retour exploitation, début/fin travaux, délai restitution
6. Tableau de rôles plat (sans colonnes ENF — l'ENF est global)
7. **Bloc ENF global** : `previsionEnfMwh` (MWh) + `previsionEnfPct` (%) — valeur unique par document
8. Zones impactées / dans le noir
9. Observations + Mesures de sécurité
10. Signature

**Structure NAPT — Transport :**
- Pas de section Consistance globale (chaque chantier a la sienne)
- Multi-chantiers : chaque chantier a son propre tableau de rôles (avec colonne Entreprise)
- Bloc ENF par phase : Prévision Consignation / Réalisation / Déconsignation (total calculé automatiquement)

**État local `fields` (champs éditables) :**

```js
{
  dateReceptionDemande, nomDemandeur,
  debutConsignationDate, debutConsignationHeure,
  retourExploitationDate, retourExploitationHeure,
  delaiRestitution, observations, securite, nomSignataire,
  // Transport uniquement :
  previsionConsignation, previsionRealisation, previsionDeconsignation,
  // Distribution/Production :
  zonesImpactees, previsionEnfMwh, previsionEnfPct,
}
```

**`makeRole(role, extra)` :** crée un objet rôle avec `{ id, role, personne, unite, entreprise, telephone }`.

**`makeChantier(num, ccNom)` :** crée un chantier Transport avec ses rôles par défaut (`ROLES_TRANSPORT`).

### 7.3 `DDRValider` — `src/components/shared/DDRValider/`

Composant de validation DDR avec upload de fichiers joints (PDF, PNG, JPG, max 10).

```jsx
<DDRValider
  ddrId="uuid"
  onRetour={() => navigate(-1)}
  onSoumettre={({ files, motif }) => handleSubmit(files, motif)}
  titre="Valider la DDR"
  submitLabel="Valider"
  showMotif={false}
/>
```

### 7.4 `PlanningTable` — `src/components/shared/PlanningTable/`

Tableau réutilisable de liste de plannings avec recherche, badges de statut et actions.

```jsx
<PlanningTable
  plannings={[]}
  loading={false}
  onRowClick={(p) => navigate(`/planning/${p.id}`)}
  onEdit={(p) => openEditModal(p)}
  onDelete={(p) => confirmDelete(p)}
/>
```

---

## 8. Couche services (API)

Tous les services utilisent `src/API/axiosInstance.js`. L'URL de base est `VITE_API_BASE_URL` (défaut : `http://localhost:8000/`).

### `exploitationService.js` — DDR et NAPT

```js
getDDRList()                           // GET  /exploitation/ddr/
getDDR(ddrId)                          // GET  /exploitation/ddr/:id
genererDDR(travailId)                  // POST /exploitation/ddr/generer
deciderDDR(ddrId, { decision, motif }) // POST /exploitation/ddr/:id/decision
// decision : 'AUTORISE' | 'REFUSE' | 'REPORTE'
// retour AUTORISE : { decision, ddr, napt: { id, reference, ... } }

getNAPTList()                          // GET  /exploitation/napt/
getNAPT(naptId)                        // GET  /exploitation/napt/:id
diffuserNAPT(naptId)                   // POST /exploitation/napt/:id/diffuser
```

### `planningService.js` — Plannings et Travaux

```js
getPlannings(page)
getPlanningById(planningId)
getPlanningsBySegment(segment, page)   // segment : DISTRIBUTION|TRANSPORT|PRODUCTION
createPlanning(data)
deletePlanning(id)
getTravaux(planningId, filters)
createTravail(data)
updateTravail(travailId, data)
deleteTravail(travailId)
createPlanningBatch(payloads)
getCentrales()
getOptionsByService(service)
getReferenceDetails(id)
```

### `referencetielService.js` — Référentiel

```js
getReferences(entiteMetierId)
getReferenceById(id)
createReference({ valeur, entite_metier_id })
getTypesReferentiel()                  // TypeReferentiel : Ouvrage, Poste, Départ, Segment...
createReferentielItem({ valeur, reference_id, type_id })
getTypesActivite()
getChargesConsignation(entiteMetierId)
getUnites(entiteMetierId)
getUniteById(id)
// getOuvrages/getPostes/etc. → retournent [] (DEPRECATED)
```

### `gplanService.js` — Gestion de planification

```js
fetchAllTravaux()                      // Pagination automatique
fetchConflitIds()                      // IDs des travaux en conflit
buildGroupes(travaux, conflitIds)
fetchAlertes()
analyserChevauchements(planningId)
fetchPropositions(planningId, statut)
appliquerProposition(planningId, propositionId)
refuserProposition(planningId, propositionId)
```

### `userService.js` — Utilisateurs, rôles, permissions

Fonctions CRUD complètes pour utilisateurs, rôles et permissions. Inclut les fonctions d'assignation rôle↔utilisateur et permission↔rôle.

### `workflowService.js` — Workflows

CRUD pour workflows, états (steps) et transitions. Fonctions d'exécution de transitions pour le pilotage des plannings.

### `Authservice.js` — Authentification

```js
login(username, password)    // Stocke tokens dans cookies
logout()                     // Efface cookies + localStorage
getCurrentUser()             // Lit depuis cookie/localStorage
changePassword(password)
```

---

## 9. Documents clés : DDR et NAPT

### Modèle de données backend (simplifié)

```
Reference
  ├── valeur (str)           ← référence globale de l'ouvrage
  └── items: ReferentielItem[]
        ├── type: TypeReferentiel { nom }   ← "Ouvrage", "Poste", "Départ", "Segment"
        └── valeur (str)                    ← valeur de cet item

Travail
  ├── segment (DISTRIBUTION | TRANSPORT | PRODUCTION)
  ├── reference → Reference              ← l'ouvrage principal
  ├── troncons_consignes (TextField)     ← sections à consigner (≠ nom ouvrage)
  ├── consistance_travaux (TextField)
  ├── heure_debut_planifie / heure_fin_planifie
  ├── unite_demanderesse → UniteDemanderesse
  └── charge_consignation → Utilisateur

DemandeRetrait (DDR)
  ├── reference (auto: "DDR-{travail.reference}")
  ├── travail → Travail
  ├── statut : EN_ATTENTE | AUTORISE | REFUSE | REPORTE
  ├── emis_par → User
  └── decide_par → User

NoteArret (NAPT)
  ├── reference (auto: "NAPT-{travail.reference}")
  ├── travail → Travail (même que la DDR)
  ├── statut : GENEREE | DIFFUSEE
  ├── charge_consignation → User
  └── genere_par → User
```

### Récupération du nom d'ouvrage (pattern universel)

```js
// Dans DDRView et NAPTView :
const nomOuvrage = t?.reference?.items
  ?.find(it => it.type?.nom?.toLowerCase() === 'ouvrage')
  ?.valeur || '—';
```

### Dérivation de la référence DDR depuis une NAPT

```js
const ddrRef = napt.reference.replace('NAPT-', 'DDR-');
// Ex: "NAPT-LHB-2024-001" → "DDR-LHB-2024-001"
```

---

## 10. Patterns récurrents

### Layout ConsultationPage (aside + main)

Utilisé par `ConsultationPage`, `CcrDDRActionPage`, `CcrNAPTPage`. Classes CSS préfixées `cp-`.

```jsx
<div className="cp-layout">
  <aside className="cp-aside">
    <button className="cp-retour">Retour</button>
    <div className="cp-aside-title">TITRE</div>
    <div className="cp-block">
      <div className="cp-block-label">STATUT</div>
      <div className="cp-statut cp-statut--orange">...</div>
    </div>
    <div className="cp-block">
      <div className="cp-block-label">MÉTADONNÉES</div>
      <div className="cp-meta-list">
        <div className="cp-meta-item">
          <span className="cp-meta-key">Référence</span>
          <span className="cp-meta-val">DDR-XXX</span>
        </div>
      </div>
    </div>
  </aside>
  <main className="cp-main">
    <div className="cp-toolbar no-print">...</div>
    <div className="cp-print-zone">
      <DDRView ... />
    </div>
  </main>
</div>
```

### Composant document forwardRef

```jsx
const MonDoc = forwardRef(({ id, readOnly }, ref) => {
  const [fields, setFields] = useState({ champA: '', champB: '' });
  useImperativeHandle(ref, () => ({ getFormData: () => ({ ...fields }) }));
  const setField = (k, v) => setFields(p => ({ ...p, [k]: v }));
  const EditField = ({ fieldKey, placeholder = '' }) =>
    readOnly
      ? <span className="ddr-ro">{fields[fieldKey] || '—'}</span>
      : <input className="ddr-input" value={fields[fieldKey]}
          onChange={e => setField(fieldKey, e.target.value)}
          placeholder={placeholder} />;
  // ...
});
```

### Historique réutilisable avec navigation custom (CCR)

```jsx
// Comportement par défaut (ConsultationPage)
<Historique />

// Override navigation pour le CCR
<Historique
  ddrOnly
  onRowClick={(item) => {
    if (item.type === 'DDR' && item.statut === 'EN_ATTENTE')
      navigate(`/dashboard/ccr/ddr/${item.id}`);
    else if (item.type === 'DDR')
      navigate(`/dashboard/consultation/ddr/${item.id}`);
    else
      navigate(`/dashboard/consultation/napt/${item.id}`);
  }}
/>
```

---

## 11. CSS et styles

### Variables globales (`index.css`)

```css
--primary:                  #005c98
--primary-container:        #1B75BB
--surface-container-low:    #f6f3f1
--surface-container-lowest: #ffffff
--surface-container-high:   #eae8e5
--outline-variant:          #c0c7d2
--industrial-gray:          #939597
--on-surface:               #1c1c1b
--on-surface-variant:       #404751
```

### Architecture CSS

Chaque composant a son propre fichier `.css` colocalisé. Pas de CSS-in-JS. Tailwind est disponible mais peu utilisé en pratique (majorité en CSS custom).

| Fichier CSS | Scope |
|-------------|-------|
| `DDRView/DDRView.css` | Styles du document DDR (classes `ddr-*`) — **aussi importé par NAPTView** |
| `NAPTView/NAPTView.css` | Surcharges légères + styles spécifiques NAPT (classes `napt-*`) |
| `Responsable/Consultation/ConsultationPage.css` | Layout aside+main (classes `cp-*`) — importé par CCR pages |
| `CCR/DDRAction/CcrDDRActionPage.css` | Boutons CCR (`.ccr-btn-valider`, `.ccr-btn-rejeter`, `.ccr-rejet-panel`) |
| `CCR/NAPT/CcrNAPTPage.css` | Bouton diffuser (`.napt-btn-diffuser`), info box (`.napt-edit-info`) |
| `Responsable/Historique/Historique.css` | Tableau historique (classes `hist-*`) |

### Classes CSS importantes

```
ddr-doc            — conteneur principal document
ddr-doc--readonly  — mode lecture seule
ddr-section        — section du document
ddr-input          — champ éditable standard
ddr-input-sm       — champ éditable compact (dans tableaux)
ddr-ro             — valeur en lecture seule (span)
ddr-label          — libellé de champ
ddr-roles-table    — tableau des rôles
ddr-btn-add        — bouton "Ajouter un rôle"
ddr-btn-remove     — bouton "✕ Supprimer"

napt-enf-global    — bloc ENF global (Distribution/Production)
napt-chantier-block — bloc chantier (Transport)
napt-input-narrow  — input numérique étroit (ENF, %)

cp-layout / cp-aside / cp-main — layout consultation
cp-block / cp-block-label      — bloc sidebar
cp-statut / cp-statut--{color} — badge statut (orange/green/red/blue)
cp-meta-item / cp-meta-key / cp-meta-val — métadonnées
```

---

## 12. Configuration et variables d'environnement

### `.env` (à créer à la racine du projet)

```env
VITE_API_BASE_URL=http://localhost:8000/
```

### Scripts

```bash
npm run dev      # Serveur de développement Vite (hot reload)
npm run build    # Build production
npm run preview  # Preview du build production
npm run lint     # ESLint
```

### Images publiques

| Fichier | Usage |
|---------|-------|
| `/public/eneo.png` | Logo ENEO (Distribution + Production) |
| `/public/logosonarel.png` | Logo SONATREL (Transport) |

---

## État d'avancement du module CCR (juin 2026)

| Fonctionnalité | Statut |
|---------------|--------|
| Liste DDR avec navigation custom | ✅ Terminé |
| Page action DDR (Valider/Rejeter) | ✅ Terminé |
| Génération NAPT via backend | ✅ Terminé |
| Page édition NAPT (readOnly=false) | ✅ Terminé |
| Diffusion NAPT | ✅ Terminé |
| ENF global (pas par rôle) | ✅ Corrigé |
| Logo dynamique ENEO/SONATREL | ✅ Terminé |
| Ouvrage depuis ReferentielItem | ✅ Corrigé |
| Historique CCR | ⏳ Stub (à construire) |
| Module Communication | ⏳ Partiel |
