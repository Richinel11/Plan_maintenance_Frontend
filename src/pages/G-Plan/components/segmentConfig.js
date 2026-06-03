export const SEGMENT_COLORS = {
    PRODUCTION:   { bg: '#eff6ff', text: '#2563eb', dot: '#2563eb' },
    TRANSPORT:    { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a' },
    DISTRIBUTION: { bg: '#fff7ed', text: '#ea580c', dot: '#ea580c' },
    HARMONISE:    { bg: '#f5f3ff', text: '#7c3aed', dot: '#7c3aed' },
};

export const SEGMENTS = [
    { key: 'TOUS',         label: 'Tous'         },
    { key: 'PRODUCTION',   label: 'Production'   },
    { key: 'TRANSPORT',    label: 'Transport'    },
    { key: 'DISTRIBUTION', label: 'Distribution' },
    { key: 'HARMONISE',    label: 'Harmonisés', icon: '🔗' },
];

export const STATUT_META = {
    BROUILLON: { label: 'Brouillon', bg: '#dbeafe', text: '#1e40af' },
    SOUMIS:    { label: 'Soumis',    bg: '#dbeafe', text: '#1e40af' },
    VALIDE:    { label: 'Validé',    bg: '#d1fae5', text: '#065f46' },
    EN_COURS:  { label: 'En cours',  bg: '#d1fae5', text: '#065f46' },
    TERMINE:   { label: 'Terminé',   bg: '#f1f5f9', text: '#475569' },
    REPORTE:   { label: 'Reporté',   bg: '#fef3c7', text: '#92400e' },
};
