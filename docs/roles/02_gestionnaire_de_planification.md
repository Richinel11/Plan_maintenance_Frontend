# Rôle : Gestionnaire de planification

**Code rôle :** `gestionnaire_de_planification`  
**Société concernée :** ENEO ou SONATREL selon l'entité métier  
**Responsabilité :** Superviser et analyser l'ensemble des plannings. Détecter et résoudre les conflits entre travaux. Visualiser le Gantt et le calendrier.

---

## Routes accessibles

| URL | Page | Description |
|-----|------|-------------|
| `/dashboard/dashboard-plan` | Dashboard G-Plan | Vue d'ensemble plannings et conflits |
| `/dashboard/Calendar` | Calendrier | Vue FullCalendar des travaux |
| `/dashboard/alertes` | Alertes | Conflits et opportunités d'harmonisation |
| `/dashboard/advanced-gantt` | Gantt avancé | Diagramme Gantt DHTMLX |
| `/dashboard/reajustement-avance` | Réajustement | Réajustement planifié des travaux |

---

## Fonctionnalités disponibles

### Visualisation
- Consulter tous les plannings et travaux (lecture seule)
- Vue calendrier avec code couleur (conflits = rouge, opportunités = vert, normal = bleu)
- Vue Gantt avec surlignage des conflits

### Gestion des conflits
- Détecter les chevauchements de travaux (`analyserChevauchements`)
- Consulter les alertes de conflits
- Consulter les propositions d'harmonisation
- Appliquer ou refuser une proposition d'harmonisation

---

## Endpoints API appelés

### Plannings et travaux
```
GET    /planning/plannings/                    Liste complète des plannings
GET    /planning/plannings/:id/travaux/        Travaux d'un planning
GET    /planning/travaux/                      Tous les travaux (paginé)
```

### Conflits et harmonisation
```
GET    /planning/conflits/ids/                 IDs des travaux en conflit
GET    /planning/alertes/                      Alertes de conflits
POST   /planning/plannings/:id/analyser/       Analyser les chevauchements
GET    /planning/plannings/:id/propositions/   Propositions d'harmonisation
POST   /planning/plannings/:id/propositions/:pid/appliquer/   Appliquer une proposition
POST   /planning/plannings/:id/propositions/:pid/refuser/     Refuser une proposition
```

---

## Données accessibles

| Donnée | Lecture | Création | Modification | Suppression |
|--------|---------|----------|-------------|-------------|
| Plannings (tous) | ✅ | ❌ | ❌ | ❌ |
| Travaux (tous) | ✅ | ❌ | ❌ | ❌ |
| Conflits / alertes | ✅ | ❌ | ❌ | ❌ |
| Propositions d'harmonisation | ✅ | ❌ | Appliquer/Refuser | ❌ |
| DDR / NAPT | ❌ | ❌ | ❌ | ❌ |

---

## Points d'attention sécurité

- **Lecture transverse** : ce rôle a accès à tous les plannings, tous segments confondus — vérifier que le backend filtre bien par entité métier si nécessaire.
- **Application de proposition** : l'action `appliquer` modifie des dates de travaux — vérifier l'autorisation côté backend (est-ce que n'importe quel gestionnaire peut modifier les travaux d'une autre entité ?).
- **Exposition des IDs** : les IDs de conflits et de propositions sont des UUIDs exposés dans les réponses — vérifier les contrôles d'accès sur les endpoints d'action.
- **Accès direct URL** : naviguer vers les pages DDR/NAPT/CCR doit être bloqué.
