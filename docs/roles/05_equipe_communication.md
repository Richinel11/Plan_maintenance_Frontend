# Rôle : Équipe communication

**Code rôle :** `eq_comm`  
**Société concernée :** ENEO ou SONATREL  
**Responsabilité :** Recevoir les NAPT diffusées par le CCR et assurer leur communication aux parties prenantes.

---

## Routes accessibles

| URL | Page | Description |
|-----|------|-------------|
| `/dashboard/comm-accueil` | Accueil communication | Tableau de bord |
| `/dashboard/comm-napt` | NAPT communication | Liste et consultation des NAPT diffusées |

---

## Fonctionnalités disponibles

- Consulter les NAPT ayant le statut `DIFFUSEE`
- Voir le document NAPT complet (lecture seule)
- Assurer la transmission/communication des NAPT aux équipes terrain

> **Note :** Ce module est partiellement développé. Les fonctionnalités de communication (envoi email, notification terrain, etc.) sont à implémenter.

---

## Endpoints API appelés

```
GET    /exploitation/napt/                     Liste des NAPT
GET    /exploitation/napt/:id/                 Détail d'une NAPT (lecture seule)
```

---

## Données accessibles

| Donnée | Lecture | Création | Modification | Suppression |
|--------|---------|----------|-------------|-------------|
| NAPT (statut DIFFUSEE) | ✅ | ❌ | ❌ | ❌ |
| DDR | ❌ | ❌ | ❌ | ❌ |
| Travaux | ❌ | ❌ | ❌ | ❌ |

---

## Points d'attention sécurité

- **Filtrage par statut** : vérifier que l'équipe communication ne voit que les NAPT `DIFFUSEE` et pas les NAPT `GENEREE` (encore en cours d'édition par le CCR).
- **IDOR** : vérifier qu'elle ne peut pas accéder à une NAPT d'un autre segment en changeant l'UUID dans l'URL.
- **Lecture seule** : vérifier qu'aucun endpoint de modification ou de création n'est accessible depuis ce rôle.
- **Accès direct URL** : naviguer vers `/dashboard/ccr/napt/:id` (page d'édition CCR) doit être bloqué.
