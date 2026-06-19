# Guide de test de sécurité — EneoPlan

Ce dossier contient la documentation par rôle destinée à l'équipe de sécurité.  
Chaque fichier décrit exactement ce qu'un utilisateur peut faire, quels endpoints il appelle, et quelles données il peut accéder ou modifier.

---

## Architecture générale

| Couche | Technologie |
|--------|------------|
| Frontend | React 19 + Vite (port 5173 en dev) |
| Backend | Django REST Framework (port 8000 en dev) |
| Auth | JWT (access token + refresh token dans les cookies) |
| API | `http://localhost:8000/` (variable `VITE_API_BASE_URL`) |

---

## Authentification

### Flux de connexion

```
POST /auth/login/
  Body : { username, password }
  Réponse : { access, refresh, user: { id, username, roles: [...] } }
```

Les tokens sont stockés en **cookie** (`accessToken`, `refreshToken`) et en **localStorage** (`user`).  
Chaque requête API inclut automatiquement le header :

```
Authorization: Bearer <accessToken>
```

### Sélection de rôle

Si un utilisateur a plusieurs rôles, il est redirigé vers `/select-role` après la connexion.  
Le rôle actif est stocké dans le cookie `activeRole`.

### Déconnexion

```
Suppression des cookies : accessToken, refreshToken, activeRole, activeRoleName
Suppression localStorage : user
Redirection vers /login
```

---

## Rôles disponibles

| Fichier | Rôle | Code |
|---------|------|------|
| [01_operateur_de_saisie.md](roles/01_operateur_de_saisie.md) | Opérateur de saisie | `operateur_de_saisie` |
| [02_gestionnaire_de_planification.md](roles/02_gestionnaire_de_planification.md) | Gestionnaire de planification | `gestionnaire_de_planification` |
| [03_responsable_exploitation.md](roles/03_responsable_exploitation.md) | Responsable d'exploitation | `resp_exploit` |
| [04_ccr.md](roles/04_ccr.md) | Centre de Conduite Réseau | `ccr` |
| [05_equipe_communication.md](roles/05_equipe_communication.md) | Équipe communication | `eq_comm` |
| [06_audit_regulation.md](roles/06_audit_regulation.md) | Audit / Régulation | `reg_audit` |
| [07_administrateur.md](roles/07_administrateur.md) | Administrateur | `admin` |

---

## Points d'attention généraux

- **Élévation de privilèges** : vérifier qu'un utilisateur ne peut pas accéder aux routes d'un autre rôle en naviguant directement par URL.
- **IDOR** : les endpoints acceptent des IDs (UUID) en paramètre de route — vérifier qu'un utilisateur ne peut pas lire/modifier les données d'une autre entité.
- **Tokens** : vérifier l'expiration, la rotation et la révocation des tokens JWT.
- **Upload de fichiers** : le composant `DDRValider` accepte PDF/PNG/JPG — vérifier les contrôles côté backend.
- **Injection** : les champs texte libres (observations, motif de rejet, mesures de sécurité) doivent être vérifiés pour XSS et injection.
- **Segments** : les données sont cloisonnées par segment (DISTRIBUTION / TRANSPORT / PRODUCTION) — vérifier qu'un utilisateur d'un segment ne voit pas les données d'un autre.
