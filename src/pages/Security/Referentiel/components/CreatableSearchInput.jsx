import React, { useState, useRef, useEffect } from 'react';

/**
 * Champ texte libre + suggestions issues du référentiel existant.
 * On peut cliquer une suggestion pour reprendre exactement sa valeur
 * (évite doublons/fautes de frappe), ou continuer à taper une valeur
 * inédite : elle sera créée comme nouvel item à la soumission.
 */
const CreatableSearchInput = ({ label, value, onChange, options = [], placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const query = (value || '').trim().toLowerCase();
    const filtered = (options || []).filter((opt) => {
        const lower = opt.toLowerCase();
        return (!query || lower.includes(query)) && lower !== query;
    });

    return (
        <div className="form-group creatable-search-wrapper" ref={wrapperRef}>
            {label && <label>{label}</label>}
            <input
                type="text"
                className="form-input"
                placeholder={placeholder}
                value={value || ''}
                autoComplete="off"
                onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
                onFocus={() => setIsOpen(true)}
            />
            {isOpen && filtered.length > 0 && (
                <div className="creatable-suggestions">
                    {filtered.slice(0, 8).map((opt, idx) => (
                        <div
                            key={idx}
                            className="creatable-suggestion-item"
                            onMouseDown={() => { onChange(opt); setIsOpen(false); }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CreatableSearchInput;
