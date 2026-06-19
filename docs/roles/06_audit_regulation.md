# Rôle : Audit / Régulation

**Code rôle :** `reg_audit`  
**Société concernée :** ENEO et/ou SONATREL (accès transverse)  
**Responsabilité :** Accès en lecture seule à l'ensemble des documents (plannings, DDR, NAPT) à des fins d'audit, de conformité et de régulation. Peut exporter les données.

---

## Routes accessibles

| URL | Page | Description |
|-----|------|-------------|
| `/dashboard/Planning` | Plannings | Liste de tous les plannings |
| `/dashboard/historique` | Historique | Liste DDR + NAPT |
| `/dashboard/consultation/ddr/:id` | Consultation DDR | Lecture seule |
| `/dashboard/consultation/napt/:id` | Consultation NAPT | Lecture seule |

> **Note :** Le menu de ce rôle inclut également des fonctionnalités d'export (DDR List, NAPT List, Export) selon la configuration `config/menus.js`.

---

## Fonctionnalités disponibles

- Consulter tous les plannings de toutes les entités
- Consulter l'historique complet des DDR et NAPT (tous segments)
- Lire les documents DDR et NAPT en détail (lecture seule)
- Exporter les listes (fonctionnalité selon implémentation)

---

## Endpoints API appelés

```
GET    /planning/plannings/                    Liste de tous les plannings
GET    /planning/plannings/:id/travaux/        Travaux d'un planning
GET    /exploitation/ddr/                      Liste de toutes les DDR
GET    /exploitation/ddr/:id/                  Détail d'une DDR
GET    /exploitation/napt/                     Liste de toutes les NAPT
GET    /exploitation/napt/:id/                 Détail d'une NAPT
```

---

## Données accessibles

| Donnée | Lecture | Création | Modification | Suppression |
|--------|---------|----------|-------------|-------------|
| Plannings (tous segments) | ✅ | ❌ | ❌ | ❌ |
| Travaux (tous) | ✅ | ❌ | ❌ | ❌ |
| DDR (toutes) | ✅ | ❌ | ❌ | ❌ |
| NAPT (toutes) | ✅ | ❌ | ❌ | ❌ |
| Utilisateurs | ❌ | ❌ | ❌ | ❌ |

---

## Points d'attention sécurité

- **Accès transverse** : ce rôle a potentiellement accès à tous les segments (DISTRIBUTION, TRANSPORT, PRODUCTION) — vérifier que le backend l'autorise explicitement et qu'il ne s'agit pas d'un contournement des contrôles d'accès normaux.
- **Lecture seule** : vérifier qu'aucune action de modification (deciderDDR, diffuserNAPT, updateTravail…) n'est accessible depuis ce rôle.
- **Export de données** : si une fonctionnalité d'export est implémentée, vérifier les contrôles sur le volume de données exportables (risque d'exfiltration massive).
- **Données sensibles** : les documents NAPT contiennent des noms de personnes (chargés de travaux, signataires) et des informations sur le réseau électrique — vérifier que l'accès est bien restreint aux auditeurs autorisés.
- **Accès direct URL** : naviguer vers les pages de création/modification ou les pages CCR d'édition doit être bloqué.
