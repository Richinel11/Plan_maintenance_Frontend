/**
 * Transforme un objet Travail (backend Django) en event FullCalendar.
 *
 * @param {Object}  travail    - Objet Travail sérialisé par Django
 * @param {Set}     conflitIds - Set des IDs de travaux en conflit
 * @returns {Object|null}
 */
export const travailToCalendarEvent = (travail, conflitIds = new Set(), opportuniteIds = new Set()) => {
    if (!travail.heure_debut_planifie) return null;

    const title = travail.reference?.valeur
        || travail.consistance_travaux?.slice(0, 40)
        || `Travail ${travail.id.slice(0, 8)}`;

    return {
        id:    travail.id,
        title,
        start: travail.heure_debut_planifie,
        end:   travail.heure_fin_planifie || travail.heure_debut_planifie,
        extendedProps: {
            segment:     travail.segment,
            status:      travail.statut_travaux,
            harmonise:   travail.travail_en_alignement === true,
            conflit:     conflitIds.has(travail.id),
            opportunite: opportuniteIds.has(travail.id),
            entite:      travail.entite_metier?.name || '—',
            planningId:  travail.planning?.id   || null,
            planningNom: travail.planning?.nom  || '—',
            priorite:    travail.priorite       || null,
            typeReseau:  travail.type_reseau    || null,
            duree:       travail.duree          || null,
            uniteDuree:  travail.unite_duree    || 'HEURES',
        },
    };
};

/**
 * Mappe un tableau de travaux vers des events FullCalendar.
 *
 * @param {Array}  travaux
 * @param {Set}    conflitIds
 * @returns {Array}
 */
export const mapTravauxToCalendarEvents = (travaux, conflitIds = new Set(), opportuniteIds = new Set()) =>
    travaux
        .map(t => travailToCalendarEvent(t, conflitIds, opportuniteIds))
        .filter(Boolean);


/**
 * Transforme un tableau de travaux en lignes pour le diagramme de Gantt.
 * Un travail = une ligne. Les dates sont conservées brutes pour que
 * GanttTimeline calcule lui-même le positionnement selon la vue active.
 *
 * Format de sortie :
 * { id, ref, type, alert, debut: Date, fin: Date, color, statut }
 *
 * @param {Array}  travaux
 * @param {Set}    conflitIds
 * @returns {Array}
 */
export const mapTravauxToGanttRows = (travaux, conflitIds = new Set()) => {
    const SEGMENT_TYPE  = { PRODUCTION: 'PRD', TRANSPORT: 'TRP', DISTRIBUTION: 'DST' };
    const SEGMENT_COLOR = { PRODUCTION: 'green', TRANSPORT: 'blue', DISTRIBUTION: 'gray' };

    return travaux
        .filter(t => t.heure_debut_planifie && t.heure_fin_planifie)
        .map(travail => {
            const isConflit = conflitIds.has(travail.id);
            return {
                id:     travail.id,
                ref:    travail.reference?.valeur || `Travail ${travail.id.slice(0, 8)}`,
                type:   SEGMENT_TYPE[travail.segment] || 'GEN',
                alert:  isConflit,
                debut:  new Date(travail.heure_debut_planifie),
                fin:    new Date(travail.heure_fin_planifie),
                color:  isConflit ? 'red' : (SEGMENT_COLOR[travail.segment] || 'gray'),
                statut: travail.statut_travaux,
            };
        });
};
