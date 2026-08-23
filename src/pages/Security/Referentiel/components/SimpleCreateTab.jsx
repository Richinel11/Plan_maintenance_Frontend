import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import SimpleListTable from './SimpleListTable';
import '../../UserManagement/components/UsersTable.css';

const isSameValeur = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Onglet générique « création + liste » calqué sur ReferenceTab :
 * une carte de création intégrée (un seul champ, sans popup) au-dessus
 * d'un tableau de consultation filtrable et paginé.
 *
 * Chaque appelant fournit les fonctions d'accès (fetchItems / createItem
 * et, optionnellement, updateItem / deleteItem) et l'accesseur de valeur
 * (getItemValue) propres à son endpoint. Les éléments récupérés sont
 * normalisés en { id, valeur } pour être affichés par SimpleListTable,
 * quel que soit le nom réel du champ en base (nom, libelle, valeur...).
 *
 * La modification se fait sans popup : un clic sur « modifier » recharge
 * la ligne dans le formulaire du haut, qui passe en mode édition.
 */
const SimpleCreateTab = ({
    title,
    subtitle,
    icon = 'list_alt',
    fieldLabel,
    placeholder,
    searchPlaceholder = 'Rechercher...',
    columnLabel,
    itemLabel,
    emptyLabel,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    getItemValue = (it) => it.valeur,
    duplicateMessage = 'Cet élément existe déjà.',
    successMessage = 'Élément ajouté avec succès.',
}) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [value, setValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await fetchItems();
            const list = Array.isArray(data) ? data : (data?.results || []);
            setItems(list.map((it) => ({ id: it.id, valeur: getItemValue(it) })));
        } catch (error) {
            console.error('Erreur lors du chargement de la liste', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return items.filter((it) => !q || (it.valeur || '').toLowerCase().includes(q));
    }, [items, searchQuery]);

    const cancelEdit = () => {
        setEditingId(null);
        setValue('');
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setValue(item.valeur);
        // Ramène l'utilisateur au formulaire du haut.
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) return;

        // Doublon : on ignore la ligne en cours d'édition dans la comparaison.
        const duplicate = items.some(
            (it) => it.id !== editingId && isSameValeur(it.valeur, trimmed)
        );
        if (duplicate) {
            toast.error(duplicateMessage);
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                await updateItem(editingId, trimmed);
                toast.success('Modification enregistrée.');
            } else {
                await createItem(trimmed);
                toast.success(successMessage);
            }
            cancelEdit();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.detail || err.message || 'Erreur lors de l\'enregistrement.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (item) => {
        toast(`Supprimer « ${item.valeur} » ?`, {
            description: 'Cette action est irréversible.',
            action: {
                label: 'Supprimer',
                onClick: async () => {
                    try {
                        await deleteItem(item.id);
                        toast.success('Élément supprimé.');
                        if (editingId === item.id) cancelEdit();
                        fetchData();
                    } catch (err) {
                        toast.error(err.response?.data?.detail || err.message || 'Erreur lors de la suppression.');
                    }
                },
            },
            cancel: { label: 'Annuler' },
        });
    };

    const canManage = Boolean(updateItem && deleteItem);

    return (
        <>
            <div className="ref-builder-card">
                <h2 className="ref-builder-title">
                    <span className="material-symbols-outlined">{editingId ? 'edit' : icon}</span>
                    {editingId ? 'Modifier l\'élément' : title}
                </h2>
                {subtitle && !editingId && (
                    <p className="page-subtitle" style={{ marginTop: -6, marginBottom: 18 }}>{subtitle}</p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: 18 }}>
                        <label>{fieldLabel} <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            required
                            className="form-input"
                            placeholder={placeholder}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={cancelEdit}
                            disabled={saving}
                        >
                            {editingId ? 'Annuler' : 'Réinitialiser'}
                        </button>
                        <button type="submit" className="primary-btn" disabled={saving || !value.trim()}>
                            {saving ? 'Enregistrement...' : (editingId ? 'Enregistrer' : 'Ajouter')}
                        </button>
                    </div>
                </form>
            </div>

            <div className="filters-bar" style={{ marginTop: 20 }}>
                <div className="filter-input-group">
                    <span className="material-symbols-outlined filter-icon">search</span>
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="filter-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Chargement...</p>
                    </div>
                ) : (
                    <SimpleListTable
                        items={filtered}
                        columnLabel={columnLabel}
                        itemLabel={itemLabel}
                        emptyLabel={emptyLabel}
                        readOnly={!canManage}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>
        </>
    );
};

export default SimpleCreateTab;
