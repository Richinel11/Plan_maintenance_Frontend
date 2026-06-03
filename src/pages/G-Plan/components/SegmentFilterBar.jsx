import React from 'react';
import { SEGMENTS, SEGMENT_COLORS } from './segmentConfig';
import './SegmentFilterBar.css';

/**
 * Barre de filtres par segment réutilisable pour les vues G-Plan.
 *
 * Props :
 *   value     {string}   - clé du segment actif ('TOUS' | 'PRODUCTION' | ...)
 *   onChange  {function} - appelé avec la nouvelle clé quand l'utilisateur clique
 *   children  {node}     - slot optionnel pour ajouter des éléments à droite (ex: toggle de vues)
 */
const SegmentFilterBar = ({ value = 'TOUS', onChange, children }) => {
    return (
        <div className="sfb-wrapper">

            {/* Filtres segment */}
            <div className="sfb-filters">
                <span className="sfb-label">Segment :</span>

                {SEGMENTS.map(({ key, label, icon }) => {
                    const colors   = SEGMENT_COLORS[key];
                    const isActive = value === key;

                    return (
                        <button
                            key={key}
                            className={`sfb-btn ${isActive ? 'active' : ''}`}
                            style={isActive && colors
                                ? { background: colors.bg, color: colors.text, borderColor: colors.dot }
                                : {}
                            }
                            onClick={() => onChange(key)}
                        >
                            {colors && (
                                <span className="sfb-dot" style={{ background: colors.dot }} />
                            )}
                            {icon && <span className="sfb-icon">{icon}</span>}
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Slot droite (ex : toggle Mois/Semaine/Jour/Liste) */}
            {children && (
                <div className="sfb-right">
                    {children}
                </div>
            )}

        </div>
    );
};

export default SegmentFilterBar;
