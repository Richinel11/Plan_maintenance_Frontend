import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
    createReference,
    updateReference,
    deleteReference,
    getReferences,
    getTypesReferentiel,
    createReferentielItem,
    updateReferentielItem,
    deleteReferentielItem,
    getReferentielItemsByType,
} from '../../../../services/referencetielService';
import CreatableSearchInput from './CreatableSearchInput';
import PaginationControls from '../../../../components/shared/PaginationControls/PaginationControls';
import '../../UserManagement/components/UsersTable.css';

const emptyForm = { segment: '', ouvrage: '', poste: '', depart: '' };
const ITEMS_PER_PAGE = 10;

// Correspondance champ du formulaire ↔ nom du TypeReferentiel en base
// (le type backend "Depart" est sans accent — voir security/seed_all.py).
const TYPE_NAMES = { segment: 'Segment', ouvrage: 'Ouvrage', poste: 'Poste', depart: 'Depart' };

const ReferenceTab = ({ entiteId, entiteName }) => {
    const [typesReferentiel, setTypesReferentiel] = useState([]);
    // Suggestions existantes par champ, utilisées pour la recherche/anti-doublon.
    const [suggestions, setSuggestions] = useState({ segment: [], ouvrage: [], poste: [], depart: [] });
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState(emptyForm);
    // Référence en cours de modification (null = mode création).
    const [editingRef, setEditingRef] = useState(null);

    const [references, setReferences] = useState([]);
    const [loadingRefs, setLoadingRefs] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const isDistribution = (entiteName || '').toLowerCase() === 'distribution';

    const findType = (types, key) =>
        types.find((t) => (t.nom || '').toLowerCase() === TYPE_NAMES[key].toLowerCase());

    // Types canoniques d'une référence, dans l'ordre logique de construction
    // (Segment → Ouvrage → Poste → Départ). La base contient aussi des items
    // TYPE_POSTE et RAME issus de l'import Excel : ils ne sont pas gérés par le
    // formulaire et ne sont donc PAS affichés ici.
    // Production / Transport : 3 items ; Distribution : 4 (avec Départ).
    const CANONICAL_TYPES = ['segment', 'ouvrage', 'poste', 'depart'];

    const displayItems = (items) => {
        const order = isDistribution ? CANONICAL_TYPES : CANONICAL_TYPES.slice(0, 3);
        return (items || [])
            .filter((it) => order.includes((it.type?.nom || '').toLowerCase()))
            .sort(
                (a, b) =>
                    order.indexOf((a.type?.nom || '').toLowerCase()) -
                    order.indexOf((b.type?.nom || '').toLowerCase())
            );
    };

    const fetchData = async () => {
        try {
            setLoadingRefs(true);
            const [types, refsData] = await Promise.all([
                getTypesReferentiel(),
                getReferences(entiteId),
            ]);
            const typesArray = Array.isArray(types) ? types : (types?.results || []);
            setTypesReferentiel(typesArray);
            setReferences(Array.isArray(refsData) ? refsData : (refsData?.results || []));

            // Charge, pour chaque champ, la liste des valeurs déjà utilisées
            // (sert aux suggestions et à la détection de doublon).
            const keys = ['segment', 'ouvrage', 'poste', 'depart'];
            const itemLists = await Promise.all(
                keys.map((key) => getReferentielItemsByType(findType(typesArray, key)?.id, entiteId))
            );
            const next = {};
            keys.forEach((key, idx) => {
                next[key] = itemLists[idx].map((it) => it.valeur);
            });
            setSuggestions(next);
        } catch (error) {
            console.error('Erreur lors du chargement des données du référentiel', error);
        } finally {
            setLoadingRefs(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredReferences = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return references.filter((ref) => !q || (ref.valeur || '').toLowerCase().includes(q));
    }, [references, searchQuery]);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, references.length]);

    const totalPages = Math.ceil(filteredReferences.length / ITEMS_PER_PAGE);
    const paginatedReferences = filteredReferences.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Aperçu en direct : concatène les items renseignés au fur et à mesure de la saisie.
    const composedValue = useMemo(() => {
        const parts = [form.segment, form.ouvrage, form.poste];
        if (isDistribution) parts.push(form.depart);
        return parts.map((p) => p.trim()).filter(Boolean).join('_');
    }, [form, isDistribution]);

    const handleFieldChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // Champs canoniques éditables du formulaire, selon l'entité.
    const formKeys = isDistribution ? ['segment', 'ouvrage', 'poste', 'depart'] : ['segment', 'ouvrage', 'poste'];

    // Retrouve, sur une référence, l'item existant d'un type canonique donné.
    const findItem = (ref, key) =>
        (ref?.items || []).find((it) => (it.type?.nom || '').toLowerCase() === TYPE_NAMES[key].toLowerCase());

    const resetForm = () => {
        setForm(emptyForm);
        setEditingRef(null);
    };

    // Passe en mode édition : recharge les items canoniques de la référence
    // dans le formulaire du haut.
    const handleEdit = (ref) => {
        setForm({
            segment: findItem(ref, 'segment')?.valeur || '',
            ouvrage: findItem(ref, 'ouvrage')?.valeur || '',
            poste: findItem(ref, 'poste')?.valeur || '',
            depart: findItem(ref, 'depart')?.valeur || '',
        });
        setEditingRef(ref);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (ref) => {
        toast(`Supprimer la référence « ${ref.valeur} » ?`, {
            description: 'Ses items seront également supprimés. Cette action est irréversible.',
            action: {
                label: 'Supprimer',
                onClick: async () => {
                    try {
                        await deleteReference(ref.id);
                        toast.success('Référence supprimée.');
                        if (editingRef?.id === ref.id) resetForm();
                        fetchData();
                    } catch (err) {
                        toast.error(err.response?.data?.detail || err.message || 'Erreur lors de la suppression.');
                    }
                },
            },
            cancel: { label: 'Annuler' },
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!composedValue) return;
        setSaving(true);
        try {
            if (editingRef) {
                // 1) Mise à jour de la valeur composée de la référence.
                await updateReference(editingRef.id, { valeur: composedValue });

                // 2) Synchronisation des items canoniques (création / mise à jour /
                //    suppression selon le champ vidé ou rempli). Les items non
                //    canoniques (TYPE_POSTE, RAME) sont laissés intacts.
                for (const key of formKeys) {
                    const type = findType(typesReferentiel, key);
                    if (!type) continue;
                    const existing = findItem(editingRef, key);
                    const newVal = form[key].trim();

                    if (existing && newVal && existing.valeur !== newVal) {
                        await updateReferentielItem(existing.id, { valeur: newVal });
                    } else if (existing && !newVal) {
                        await deleteReferentielItem(existing.id);
                    } else if (!existing && newVal) {
                        await createReferentielItem({ valeur: newVal, reference_id: editingRef.id, type_id: type.id });
                    }
                }

                toast.success('Référence modifiée.');
            } else {
                const newRef = await createReference({
                    valeur: composedValue,
                    entite_metier_id: entiteId || null,
                });

                const itemsToCreate = formKeys
                    .map((key) => ({ valeur: form[key], key }))
                    .filter((it) => it.valeur.trim());

                for (const item of itemsToCreate) {
                    const type = findType(typesReferentiel, item.key);
                    if (type) {
                        await createReferentielItem({
                            valeur: item.valeur.trim(),
                            reference_id: newRef.id,
                            type_id: type.id,
                        });
                    }
                }

                toast.success(`Référence créée avec ${itemsToCreate.length} item${itemsToCreate.length > 1 ? 's' : ''}.`);
            }

            resetForm();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.valeur?.[0] || err.response?.data?.detail || err.message || 'Erreur lors de l\'enregistrement.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
        <div className="ref-builder-card">
            <h2 className="ref-builder-title">
                <span className="material-symbols-outlined">{editingRef ? 'edit' : 'construction'}</span>
                {editingRef ? 'Modifier la Référence' : 'Construire une nouvelle Référence'}
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="ref-fields-grid">
                    <CreatableSearchInput
                        label="Segment"
                        placeholder="Ex: Segment A"
                        value={form.segment}
                        options={suggestions.segment}
                        onChange={(v) => handleFieldChange('segment', v)}
                    />
                    <CreatableSearchInput
                        label="Ouvrage"
                        placeholder="Ex: Ligne 30kV"
                        value={form.ouvrage}
                        options={suggestions.ouvrage}
                        onChange={(v) => handleFieldChange('ouvrage', v)}
                    />
                    <CreatableSearchInput
                        label="Poste"
                        placeholder="Ex: Poste Bassa"
                        value={form.poste}
                        options={suggestions.poste}
                        onChange={(v) => handleFieldChange('poste', v)}
                    />
                    {isDistribution && (
                        <CreatableSearchInput
                            label="Départ"
                            placeholder="Ex: Départ Nord"
                            value={form.depart}
                            options={suggestions.depart}
                            onChange={(v) => handleFieldChange('depart', v)}
                        />
                    )}
                </div>

                <div className="ref-preview-box" style={{ margin: '18px 0' }}>
                    <span className="ref-preview-label">Valeur de la référence</span>
                    <span className={`ref-preview-value ${!composedValue ? 'empty' : ''}`}>
                        {composedValue || 'Remplissez les champs ci-dessus pour construire la référence...'}
                    </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button type="button" className="secondary-btn" onClick={resetForm} disabled={saving}>
                        {editingRef ? 'Annuler' : 'Réinitialiser'}
                    </button>
                    <button type="submit" className="primary-btn" disabled={saving || !composedValue}>
                        {saving ? 'Enregistrement...' : (editingRef ? 'Enregistrer' : 'Créer la référence')}
                    </button>
                </div>
            </form>
        </div>

        <div className="filters-bar" style={{ marginTop: 20 }}>
            <div className="filter-input-group">
                <span className="material-symbols-outlined filter-icon">search</span>
                <input
                    type="text"
                    placeholder="Rechercher une référence..."
                    className="filter-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        <div className="table-wrapper">
            {loadingRefs ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Chargement des références...</p>
                </div>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>RÉFÉRENCE</th>
                                <th>ITEMS</th>
                                <th className="th-actions">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedReferences.length > 0 ? (
                                paginatedReferences.map((ref) => (
                                    <tr key={ref.id}>
                                        <td className="font-medium text-dark">{ref.valeur}</td>
                                        <td>
                                            <div className="ref-items-pills">
                                                {displayItems(ref.items).length > 0 ? displayItems(ref.items).map((it) => (
                                                    <span key={it.id} className="ref-item-pill">
                                                        <span className="ref-item-pill-type">{it.type?.nom}:</span> {it.valeur}
                                                    </span>
                                                )) : <span className="text-gray">—</span>}
                                            </div>
                                        </td>
                                        <td className="td-actions">
                                            <button
                                                className="action-btn edit-btn"
                                                title="Modifier"
                                                onClick={() => handleEdit(ref)}
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                title="Supprimer"
                                                onClick={() => handleDelete(ref)}
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="empty-state">Aucune référence configurée.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredReferences.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                        itemLabel="référence(s)"
                    />
                </div>
            )}
        </div>
        </>
    );
};

export default ReferenceTab;
