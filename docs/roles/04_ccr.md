# Rôle : Centre de Conduite Réseau (CCR)

**Code rôle :** `ccr`  
**Société concernée :** ENEO (Distribution/Production) ou SONATREL (Transport)  
**Responsabilité :** Traiter les DDR soumises, décider de les valider ou rejeter, éditer et diffuser les NAPT générées automatiquement.

---

## Routes accessibles

| URL | Page | Description |
|-----|------|-------------|
| `/dashboard/ccr-accueil` | Accueil CCR | Tableau de bord |
| `/dashboard/traitement-ddr` | Traitement DDR | Liste des DDR à traiter |
| `/dashboard/ccr-historique` | Historique CCR | Historique (stub) |
| `/dashboard/ccr/ddr/:ddrId` | Action DDR | Voir DDR + boutons Valider/Rejeter |
| `/dashboard/consultation/ddr/:id` | Consultation DDR | Lecture seule (DDR déjà traitée) |
| `/dashboard/ccr/napt/:naptId` | Édition NAPT | Compléter et diffuser la NAPT |
| `/dashboard/consultation/napt/:id` | Consultation NAPT | Lecture seule |

---

## Fonctionnalités disponibles

### Traitement des DDR
- Lister toutes les DDR (via `Historique` avec `ddrOnly=true`)
- Consulter le document complet d'une DDR
- **Valider** une DDR (`EN_ATTENTE` → `AUTORISE`) : déclenche la génération automatique d'une NAPT côté backend
- **Rejeter** une DDR (`EN_ATTENTE` → `REFUSE`) : avec saisie obligatoire d'un motif

### Édition et diffusion de la NAPT
- Accéder à la NAPT générée automatiquement après validation
- Compléter les champs éditables de la NAPT :
  - Date réception demande, nom du demandeur
  - Dates/heures de consignation et retour à l'exploitation
  - Délai de restitution d'urgence
  - Tableau des rôles (personne désignée, unité, téléphone)
  - Zones impactées (Distribution/Production)
  - ENF prévisionnel global (MWh, %) — valeur unique par document
  - Observations, mesures de sécurité, nom du signataire
  - Prévisions par phase (Transport : consignation/réalisation/déconsignation)
  - Multi-chantiers (Transport)
- **Diffuser** la NAPT complétée (`GENEREE` → `DIFFUSEE`)

---

## Workflow documentaire CCR

```
TraitementDDR (liste)
      │
      ├── DDR statut EN_ATTENTE
      │     └── /ccr/ddr/:id → CcrDDRActionPage
      │           ├── Valider → POST /exploitation/ddr/:id/decision {decision: 'AUTORISE'}
      │           │             → Réponse : { napt: { id } }
      │           │             → Redirect /ccr/napt/:naptId
      │           │
      │           └── Rejeter → POST /exploitation/ddr/:id/decision {decision: 'REFUSE', motif}
      │                         → Redirect /traitement-ddr
      │
      └── DDR autre statut → /consultation/ddr/:id (lecture seule)

/ccr/napt/:naptId → CcrNAPTPage (NAPT éditable)
      └── Diffuser → POST /exploitation/napt/:id/diffuser
                     → Redirect /traitement-ddr
```

---

## Endpoints API appelés

### DDR
```
GET    /exploitation/ddr/                      Liste des DDR
GET    /exploitation/ddr/:id/                  Détail d'une DDR

POST   /exploitation/ddr/:id/decision/         Décision sur une DDR
  Body (validation) : { decision: "AUTORISE" }
  Body (rejet)      : { decision: "REFUSE", motif: "texte" }
  Réponse validation: { decision, ddr, napt: { id, reference, statut, ... } }
```

### NAPT
```
GET    /exploitation/napt/                     Liste des NAPT
GET    /exploitation/napt/:id/                 Détail d'une NAPT

POST   /exploitation/napt/:id/diffuser/        Diffuser une NAPT
  Réponse : { id, statut: "DIFFUSEE", date_diffusion }
```

---

## Données accessibles

| Donnée | Lecture | Création | Modification | Suppression |
|--------|---------|----------|-------------|-------------|
| DDR (toutes) | ✅ | ❌ | Décision (statut) | ❌ |
| NAPT | ✅ | ❌ (auto par backend) | Statut (diffuser) | ❌ |
| Travaux | ✅ (via DDR/NAPT) | ❌ | ❌ | ❌ |
| Utilisateurs | ❌ | ❌ | ❌ | ❌ |

---

## Points d'attention sécurité

- **Double validation** : vérifier que `deciderDDR` ne peut pas être appelé deux fois sur la même DDR (ex : valider une DDR déjà `AUTORISE` ou déjà `REFUSE`).
- **Génération multiple de NAPT** : valider une DDR génère automatiquement une NAPT — vérifier qu'une deuxième validation ne crée pas une deuxième NAPT.
- **Motif de rejet vide** : le frontend bloque l'envoi si le motif est vide, mais vérifier la validation côté backend.
- **IDOR sur décision** : l'ID de la DDR est dans l'URL — vérifier qu'un agent CCR ne peut pas valider/rejeter une DDR d'un autre segment ou d'une autre entité.
- **IDOR sur diffusion** : l'ID de la NAPT est dans l'URL — vérifier qu'il ne peut pas diffuser la NAPT d'un autre CCR.
- **Statut NAPT** : vérifier que `diffuserNAPT` est bloqué si la NAPT est déjà `DIFFUSEE`.
- **Champs NAPT éditables** : les champs libres (observations, mesures de sécurité, motifs) doivent être vérifiés pour XSS — ils apparaissent dans un document imprimable.
- **Accès direct URL** : un utilisateur CCR ne doit pas pouvoir accéder aux pages de création/modification de plannings ou de travaux.
- **Segment** : vérifier que le CCR ENEO ne peut pas traiter les DDR SONATREL (Transport) et vice versa.
