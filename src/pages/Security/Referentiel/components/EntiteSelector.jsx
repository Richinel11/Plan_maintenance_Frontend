import React from 'react';

const ENTITE_ICONS = {
    transport: 'power',
    production: 'factory',
    distribution: 'hub',
};

const getIcon = (name) => ENTITE_ICONS[(name || '').toLowerCase()] || 'business';

const EntiteCard = ({ entite, onSelect }) => (
    <button type="button" className="entite-card entite-card-lg" onClick={() => onSelect(entite)}>
        <span className="entite-card-icon entite-card-icon-lg material-symbols-outlined">
            {getIcon(entite.name)}
        </span>
        <span className="entite-card-label entite-card-label-lg">{entite.name}</span>
    </button>
);

const EntiteSelector = ({ entites, loading, onSelect }) => {
    const [top, ...rest] = entites;

    return (
        <div>
            <div className="page-header" style={{ justifyContent: 'center', textAlign: 'center' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '1.3rem' }}>Choisissez une entité métier</h1>
                    <p className="page-subtitle">
                        Les listes déroulantes à gérer dépendent de l'entité sélectionnée.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Chargement des entités...</p>
                </div>
            ) : (
                <div className="entite-triangle">
                    {top && (
                        <div className="entite-triangle-top">
                            <EntiteCard entite={top} onSelect={onSelect} />
                        </div>
                    )}
                    <div className="entite-triangle-bottom">
                        {rest.map((ent) => (
                            <EntiteCard key={ent.id} entite={ent} onSelect={onSelect} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EntiteSelector;
