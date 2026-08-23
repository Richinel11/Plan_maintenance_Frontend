import React, { useState, useEffect } from 'react';
import '../UserManagement/UserManagement.css';
import './ReferentielManagement.css';
import { getEntites } from '../../../services/userService';
import {
    getUnites, createUnite, updateUnite, deleteUnite,
    getTypesActivite, createTypeActivite, updateTypeActivite, deleteTypeActivite,
    getTroncons, createTroncon, updateTroncon, deleteTroncon,
} from '../../../services/referencetielService';
import { getCentrales, createCentrale, updateCentrale, deleteCentrale } from '../../../services/planningService';
import EntiteSelector from './components/EntiteSelector';
import CategoryTabs, { getCategoriesForEntite } from './components/CategoryGrid';
import ReferenceTab from './components/ReferenceTab';
import SimpleCreateTab from './components/SimpleCreateTab';

const ReferentielManagement = () => {
    const [entites, setEntites] = useState([]);
    const [loadingEntites, setLoadingEntites] = useState(true);
    const [selectedEntite, setSelectedEntite] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);

    useEffect(() => {
        const fetchEntites = async () => {
            try {
                setLoadingEntites(true);
                const data = await getEntites();
                setEntites(Array.isArray(data) ? data : (data?.results || []));
            } catch (error) {
                console.error('Erreur lors du chargement des entités métier', error);
            } finally {
                setLoadingEntites(false);
            }
        };
        fetchEntites();
    }, []);

    const handleSelectEntite = (entite) => {
        setSelectedEntite(entite);
        const categories = getCategoriesForEntite(entite.name);
        setActiveCategory(categories[0]?.key || null);
    };

    const renderCategoryContent = () => {
        const entiteId = selectedEntite.id;

        switch (activeCategory) {
            case 'reference':
                return <ReferenceTab entiteId={entiteId} entiteName={selectedEntite.name} />;

            case 'unites':
                return (
                    <SimpleCreateTab
                        key={`unites-${entiteId}`}
                        title="Ajouter une unité demanderesse"
                        subtitle="Liste utilisée dans le formulaire de création d'un travail."
                        icon="groups"
                        fieldLabel="Nom de l'unité demanderesse"
                        placeholder="Ex: Direction Exploitation..."
                        searchPlaceholder="Rechercher une unité..."
                        columnLabel="UNITÉ DEMANDERESSE"
                        itemLabel="unité(s)"
                        emptyLabel="Aucune unité demanderesse configurée."
                        fetchItems={() => getUnites(entiteId)}
                        createItem={(nom) => createUnite({ nom, entite_metier_id: entiteId })}
                        updateItem={(id, nom) => updateUnite(id, { nom })}
                        deleteItem={(id) => deleteUnite(id)}
                        getItemValue={(it) => it.nom}
                        duplicateMessage="Cette unité demanderesse existe déjà."
                        successMessage="Unité demanderesse ajoutée avec succès."
                    />
                );

            case 'types-travaux':
                return (
                    <SimpleCreateTab
                        key={`types-travaux-${entiteId}`}
                        title="Ajouter un type de travaux"
                        subtitle="Liste utilisée dans le formulaire de création d'un travail."
                        icon="category"
                        fieldLabel="Libellé du type de travaux"
                        placeholder="Ex: Maintenance préventive..."
                        searchPlaceholder="Rechercher un type de travaux..."
                        columnLabel="TYPE DE TRAVAUX"
                        itemLabel="type(s)"
                        emptyLabel="Aucun type de travaux configuré."
                        fetchItems={() => getTypesActivite(entiteId)}
                        createItem={(libelle) => createTypeActivite({ libelle, entite_metier_id: entiteId })}
                        updateItem={(id, libelle) => updateTypeActivite(id, { libelle })}
                        deleteItem={(id) => deleteTypeActivite(id)}
                        getItemValue={(it) => it.libelle}
                        duplicateMessage="Ce type de travaux existe déjà."
                        successMessage="Type de travaux ajouté avec succès."
                    />
                );

            case 'centrales':
                return (
                    <SimpleCreateTab
                        key="centrales"
                        title="Ajouter une centrale thermique"
                        subtitle="Liste utilisée dans le formulaire de création d'un travail Transport (centrale sollicitée)."
                        icon="bolt"
                        fieldLabel="Nom de la centrale"
                        placeholder="Ex: Centrale de Logbaba..."
                        searchPlaceholder="Rechercher une centrale..."
                        columnLabel="CENTRALE THERMIQUE"
                        itemLabel="centrale(s)"
                        emptyLabel="Aucune centrale configurée."
                        fetchItems={() => getCentrales()}
                        createItem={(valeur) => createCentrale({ valeur })}
                        updateItem={(id, valeur) => updateCentrale(id, { valeur })}
                        deleteItem={(id) => deleteCentrale(id)}
                        duplicateMessage="Cette centrale existe déjà."
                        successMessage="Centrale ajoutée avec succès."
                    />
                );

            case 'troncons':
                return (
                    <SimpleCreateTab
                        key="troncons"
                        title="Ajouter un tronçon"
                        subtitle="Liste indépendante utilisée dans le formulaire de création d'un travail Distribution."
                        icon="route"
                        fieldLabel="Nom du tronçon"
                        placeholder="Ex: Tronçon A, Section B..."
                        searchPlaceholder="Rechercher un tronçon..."
                        columnLabel="TRONÇON"
                        itemLabel="tronçon(s)"
                        emptyLabel="Aucun tronçon configuré."
                        fetchItems={() => getTroncons()}
                        createItem={(valeur) => createTroncon(valeur)}
                        updateItem={(id, valeur) => updateTroncon(id, { valeur })}
                        deleteItem={(id) => deleteTroncon(id)}
                        duplicateMessage="Ce tronçon existe déjà."
                        successMessage="Tronçon ajouté avec succès."
                    />
                );

            default:
                return null;
        }
    };

    if (!selectedEntite) {
        return (
            <div className="referentiel-management-container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Gestion du référentiel</h1>
                        <p className="page-subtitle">
                            Alimentez les listes déroulantes utilisées dans les formulaires de création de travaux.
                        </p>
                    </div>
                </div>
                <EntiteSelector entites={entites} loading={loadingEntites} onSelect={handleSelectEntite} />
            </div>
        );
    }

    const categories = getCategoriesForEntite(selectedEntite.name);

    return (
        <div className="referentiel-management-container">
            <div className="ref-breadcrumb">
                <button type="button" className="ref-breadcrumb-link" onClick={() => setSelectedEntite(null)}>
                    {selectedEntite.name}
                </button>
                <span className="ref-breadcrumb-sep material-symbols-outlined">chevron_right</span>
                <span className="ref-breadcrumb-current">Référentiel</span>
            </div>

            <CategoryTabs categories={categories} active={activeCategory} onSelect={setActiveCategory} />

            {renderCategoryContent()}
        </div>
    );
};

export default ReferentielManagement;
