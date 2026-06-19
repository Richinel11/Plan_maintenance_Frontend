# Rôle : Opérateur de saisie

**Code rôle :** `operateur_de_saisie`  
**Société concernée :** ENEO ou SONATREL selon l'entité métier assignée  
**Responsabilité :** Créer et gérer les plannings de travaux. Saisir les demandes de travaux manuellement ou via import Excel.

---

## Routes accessibles

| URL | Page | Description |
|-----|------|-------------|
| `/dashboard/OP-home` | Dashboard opérateur | Vue d'ensemble avec métriques |
| `/dashboard/Planning` | Liste des plannings | Consultation, création, import |
| `/dashboard/Planning/:id` | Détail d'un planning | Gestion des travaux d'un planning |
| `/dashboard/CreerTravail` | Créer un travail | Formulaire multi-étapes |

> Les routes des autres modules (`/dashboard/Accueil`, `/dashboard/ccr-*`, etc.) ne sont **pas** dans son menu, mais l'accès direct par URL doit être testé.

---

## Fonctionnalités disponibles

### Plannings
- Lister tous les plannings de son entité métier
- Créer un nouveau planning
- Modifier un planning existant
- Supprimer un planning (si statut non clôturé)
- Filtrer par segment, statut, période

### Travaux
- Créer un travail en 4 étapes (formulaire `Creer_Travail`)
- Modifier un travail existant
- Supprimer un travail

### Import Excel
- Importer un fichier `.xlsx` contenant plusieurs travaux (`/Importer_Plannings`)
- Mapping automatique des colonnes vers les champs Travail

---

## Endpoints API appelés

### Plannings
```
GET    /planning/plannings/                    Liste des plannings
GET    /planning/plannings/:id/                Détail d'un planning
POST   /planning/plannings/                    Créer un planning
PUT    /planning/plannings/:id/                Modifier un planning
DELETE /planning/plannings/:id/                Supprimer un planning
GET    /planning/plannings/:id/travaux/        Travaux d'un planning
```

### Travaux
```
POST   /planning/travaux/                      Créer un travail
PUT    /planning/travaux/:id/                  Modifier un travail
DELETE /planning/travaux/:id/                  Supprimer un travail
```

### Référentiel
```
GET    /referentiel/references/                Liste des références (ouvrages)
GET    /referentiel/references/:id/            Détail d'une référence
POST   /referentiel/references/                Créer une référence
GET    /referentiel/types-referentiel/         Types d'items (Ouvrage, Poste, Départ…)
POST   /referentiel/items/                     Créer un item de référentiel
GET    /referentiel/types-activite/            Types d'activité
GET    /referentiel/charges-consignation/      Chargés de consignation
GET    /referentiel/unites/                    Unités demanderesses
```

---

## Données accessibles

| Donnée | Lecture | Création | Modification | Suppression |
|--------|---------|----------|-------------|-------------|
| Plannings (son entité) | ✅ | ✅ | ✅ | ✅ |
| Travaux | ✅ | ✅ | ✅ | ✅ |
| Références (ouvrages) | ✅ | ✅ | ❌ | ❌ |
| DDR | ❌ | ❌ | ❌ | ❌ |
| NAPT | ❌ | ❌ | ❌ | ❌ |
| Utilisateurs | ❌ | ❌ | ❌ | ❌ |

---

## Points d'attention sécurité

- **Isolation par entité métier** : vérifier qu'il ne peut pas lire/modifier les plannings d'une autre entité métier.
- **Import Excel** : le parser côté frontend lit les cellules brutes — vérifier qu'un fichier malveillant ne peut pas injecter du contenu côté serveur.
- **Création de référence** : l'opérateur peut créer des `Reference` et des `ReferentielItem` — vérifier les validations côté backend (longueur, caractères spéciaux).
- **Suppression** : vérifier que la suppression d'un planning auquel une DDR est rattachée est correctement gérée côté backend (cascade ou blocage).
- **Accès direct URL** : naviguer vers `/dashboard/ccr/ddr/:id` ou `/dashboard/Accueil` en étant connecté comme opérateur doit être bloqué ou rediriger.
