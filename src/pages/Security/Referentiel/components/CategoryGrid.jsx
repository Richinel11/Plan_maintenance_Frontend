import React from 'react';

// Éléments déroulants disponibles par entité métier (clé = nom EntiteMetier en base).
const CATEGORY_CONFIG = {
    transport: [
        { key: 'reference', label: 'Référence', icon: 'construction' },
        { key: 'unites', label: 'Unité demanderesse', icon: 'groups' },
        { key: 'types-travaux', label: 'Types de travaux', icon: 'category' },
        { key: 'centrales', label: 'Centrale thermique', icon: 'bolt' },
    ],
    production: [
        { key: 'reference', label: 'Référence', icon: 'construction' },
        { key: 'unites', label: 'Unité demanderesse', icon: 'groups' },
        { key: 'types-travaux', label: 'Types de travaux', icon: 'category' },
    ],
    distribution: [
        { key: 'reference', label: 'Référence', icon: 'construction' },
        { key: 'unites', label: 'Unité demanderesse', icon: 'groups' },
        { key: 'types-travaux', label: 'Types de travaux', icon: 'category' },
        { key: 'troncons', label: 'Tronçon', icon: 'route' },
    ],
};

export const getCategoriesForEntite = (entiteName) =>
    CATEGORY_CONFIG[(entiteName || '').toLowerCase()] || [];

// Barre d'onglets (pas une page à part) : les onglets et leur contenu vivent
// sur le même écran, comme dans la toute première version de la page.
const CategoryTabs = ({ categories, active, onSelect }) => (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="ref-tabs">
            {categories.map((cat) => (
                <button
                    key={cat.key}
                    type="button"
                    className={`ref-tab-btn ${active === cat.key ? 'active' : ''}`}
                    onClick={() => onSelect(cat.key)}
                >
                    <span className="material-symbols-outlined">{cat.icon}</span>
                    {cat.label}
                </button>
            ))}
        </div>
    </div>
);

export default CategoryTabs;
