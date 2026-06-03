# Implémentation du filtre Région / Entité Métier sur les Plannings

## Contexte

L'objectif est de permettre à l'opérateur de saisie de filtrer la liste des plannings
par **région géographique** et par **entité métier** (Distribution, Transport, Production).
Le filtre doit être cascadant : sélectionner une région restreint automatiquement
les entités métier disponibles dans le second dropdown.

---

## État actuel du code

### Backend
| Élément | État |
|---|---|
| `Planning.entite_metier` (FK vers `EntiteMetier`) | ✅ existe |
| `EntiteMetier.name` et `EntiteMetier.type` (PROD/TRANS/DIST) | ✅ existe |
| `EntiteMetier.region` | ❌ absent |
| Filtre `entite_metier_id` dans `PlanningViewSet` | ❌ absent |
| Filtre `region` dans `PlanningViewSet` | ❌ absent |
| Endpoint pour lister les régions disponibles | ❌ absent |

### Frontend
| Élément | État |
|---|---|
| `getPlannings()` dans `planningService.js` | ✅ existe mais sans paramètres de filtre |
| Dropdowns région / entité dans `Dashboard.jsx` | ❌ absents |
| Chargement des régions et entités depuis l'API | ❌ absent |
| Comportement cascadant région → entité | ❌ absent |

---

## BACKEND — Ce qu'il faut faire

### Étape 1 — Ajouter le champ `region` sur `EntiteMetier`

Fichier : `user/models.py`

```python
class EntiteMetier(models.Model):
    TYPE_CHOICES = [
        ('PROD', 'Production'),
        ('TRANS', 'Transport'),
        ('DIST', 'Distribution'),
    ]

    # Adapter cette liste aux régions réelles utilisées dans le système
    REGION_CHOICES = [
        ('LITTORAL',         'Littoral'),
        ('CENTRE',           'Centre'),
        ('NORD',             'Nord'),
        ('SUD',              'Sud'),
        ('EST',              'Est'),
        ('OUEST',            'Ouest'),
        ('ADAMAOUA',         'Adamaoua'),
        ('NORD_OUEST',       'Nord-Ouest'),
        ('SUD_OUEST',        'Sud-Ouest'),
        ('EXTREME_NORD',     'Extrême-Nord'),
    ]

    id     = models.UUIDField(...)    # inchangé
    name   = models.CharField(...)    # inchangé
    type   = models.CharField(...)    # inchangé
    region = models.CharField(       # ← NOUVEAU
        max_length=20,
        choices=REGION_CHOICES,
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(...)  # inchangé
```

Puis générer et appliquer la migration :
```bash
python manage.py makemigrations user
python manage.py migrate
```

---

### Étape 2 — Exposer `region` dans le serializer de `EntiteMetier`

Fichier : `user/serializers.py` (ou le fichier qui contient `EntiteMetierSerializer`)

```python
class EntiteMetierSerializer(serializers.ModelSerializer):
    class Meta:
        model  = EntiteMetier
        fields = ['id', 'name', 'type', 'region']  # ajouter 'region'
```

---

### Étape 3 — Ajouter les filtres dans `PlanningViewSet`

Fichier : `planning/views.py`

Dans la classe `PlanningViewSet`, ajouter la méthode `get_queryset` :

```python
class PlanningViewSet(ModelViewSet):
    # ... code existant inchangé ...

    def get_queryset(self):
        qs = super().get_queryset()

        entite_id = self.request.query_params.get('entite_metier_id')
        region    = self.request.query_params.get('region')

        if entite_id:
            qs = qs.filter(entite_metier_id=entite_id)

        if region:
            qs = qs.filter(entite_metier__region=region)

        return qs
```

**Résultat** : les appels suivants deviennent fonctionnels :
```
GET /plannings/                                          → tous les plannings
GET /plannings/?region=LITTORAL                          → plannings du Littoral
GET /plannings/?entite_metier_id=<uuid>                  → plannings d'une entité
GET /plannings/?region=LITTORAL&entite_metier_id=<uuid>  → combinaison des deux
```

---

### Étape 4 — Vérifier l'endpoint `EntiteMetier` (liste)

Le frontend a besoin de récupérer la liste complète des entités métier (avec leur région)
pour peupler les dropdowns. Vérifier que l'endpoint suivant est accessible et retourne
bien le champ `region` dans sa réponse :

```
GET /users/entites-metier/
```

Réponse attendue (exemple) :
```json
[
  { "id": "uuid-1", "name": "Distribution Littoral", "type": "DIST", "region": "LITTORAL" },
  { "id": "uuid-2", "name": "Transport Centre",      "type": "TRANS", "region": "CENTRE"  },
  { "id": "uuid-3", "name": "Production Nord",       "type": "PROD",  "region": "NORD"    }
]
```

Si cet endpoint n'existe pas encore, l'ajouter dans `user/views.py` et `user/urls.py`.

---

## FRONTEND — Ce qu'il faut faire

### Étape 1 — Modifier `getPlannings()` dans `planningService.js`

Fichier : `src/API/planningService.js`

```js
// Avant
export const getPlannings = async (page = 1) => {
  const response = await api.get(`plannings/?page=${page}`);
  return response.data;
};

// Après
export const getPlannings = async (page = 1, filters = {}) => {
  const params = new URLSearchParams({ page });
  if (filters.entite_metier_id) params.append('entite_metier_id', filters.entite_metier_id);
  if (filters.region)           params.append('region', filters.region);
  const response = await api.get(`plannings/?${params.toString()}`);
  return response.data;
};
```

---

### Étape 2 — Modifier `Dashboard.jsx`

Fichier : `src/pages/op_saisie/Accuiel/Dashboard.jsx`

#### 2a — Ajouter les états pour les filtres

```jsx
const [filterRegion,  setFilterRegion]  = useState("");
const [filterEntite,  setFilterEntite]  = useState("");
const [entites,       setEntites]       = useState([]);   // toutes les entités
```

#### 2b — Charger les entités au montage

```jsx
useEffect(() => {
  getEntites().then(data => {
    setEntites(Array.isArray(data) ? data : (data?.results || []));
  });
}, []);
```

#### 2c — Recalculer les entités filtrées par région (cascading)

```jsx
const entitesFiltrees = useMemo(() => {
  if (!filterRegion) return entites;
  return entites.filter(e => e.region === filterRegion);
}, [entites, filterRegion]);
```

#### 2d — Rendre `fetchPlannings` réactif aux filtres

```jsx
const fetchPlannings = async (region = filterRegion, entiteId = filterEntite) => {
  try {
    setLoading(true);
    const filters = {};
    if (region)   filters.region           = region;
    if (entiteId) filters.entite_metier_id = entiteId;

    const data = await getPlannings(1, filters);
    // ... reste du traitement inchangé
  } catch (error) {
    // ...
  } finally {
    setLoading(false);
  }
};
```

#### 2e — Re-fetcher quand les filtres changent

```jsx
useEffect(() => {
  fetchPlannings(filterRegion, filterEntite);
}, [filterRegion, filterEntite]);
```

#### 2f — Ajouter les dropdowns dans le JSX

Ajouter dans le header du Dashboard, avant ou après la barre de recherche :

```jsx
{/* Filtre Région */}
<select
  value={filterRegion}
  onChange={(e) => {
    setFilterRegion(e.target.value);
    setFilterEntite("");  // reset entité quand région change
  }}
>
  <option value="">Toutes les régions</option>
  {[...new Set(entites.map(e => e.region).filter(Boolean))].map(region => (
    <option key={region} value={region}>{region}</option>
  ))}
</select>

{/* Filtre Entité Métier — cascadé sur la région */}
<select
  value={filterEntite}
  onChange={(e) => setFilterEntite(e.target.value)}
>
  <option value="">Toutes les entités</option>
  {entitesFiltrees.map(e => (
    <option key={e.id} value={e.id}>{e.name}</option>
  ))}
</select>
```

---

## Résumé des fichiers à modifier

### Backend
| Fichier | Modification |
|---|---|
| `user/models.py` | Ajouter champ `region` sur `EntiteMetier` |
| `user/serializers.py` | Ajouter `region` dans les fields de `EntiteMetierSerializer` |
| `planning/views.py` | Ajouter `get_queryset()` avec filtres dans `PlanningViewSet` |
| — | `makemigrations user` + `migrate` |

### Frontend
| Fichier | Modification |
|---|---|
| `src/API/planningService.js` | Ajouter paramètre `filters` dans `getPlannings()` |
| `src/pages/op_saisie/Accuiel/Dashboard.jsx` | États filtres, chargement entités, dropdowns, re-fetch |

---

## Points d'attention

- **Remplir les données** : après la migration, les entités métier existantes auront `region = null`. Il faudra les mettre à jour en base (via l'admin Django ou un script) pour que les filtres fonctionnent.
- **Cascading** : quand l'utilisateur change de région, l'entité sélectionnée doit être remise à zéro pour éviter d'envoyer une combinaison région/entité incohérente.
- **Pagination** : si la liste des plannings est paginée côté backend, s'assurer que les filtres sont bien transmis à chaque changement de page.
- **Entité métier dans `userService.js`** : la fonction `getEntites()` qui existe déjà dans `src/services/userService.js` peut être réutilisée telle quelle côté frontend — elle devra juste retourner le champ `region` une fois que le serializer backend sera mis à jour.
