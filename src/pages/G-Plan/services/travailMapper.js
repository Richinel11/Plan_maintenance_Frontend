/**
 * Transforme un objet Travail (backend Django) en event FullCalendar.
 *
 * Champs backend utilisés :
 *   id, reference.valeur, segment, statut_travaux,
 *   heure_debut_planifie, heure_fin_planifie,
 *   travail_en_alignement, entite_metier.name,
 *   planning.id, planning.nom
 *
 * @param {Object}  travail    - Objet Travail sérialisé par Django
 * @param {Set}     conflitIds - Set des IDs de travaux en conflit
 * @returns {Object|null} - Event FullCalendar, ou null si dates absentes
 */
export const travailToCalendarEvent = (travail, conflitIds = new Set()) => {
    // Un travail sans date de début ne peut pas s'afficher sur un calendrier
    if (!travail.heure_debut_planifie) return null;

    const title = travail.reference?.valeur
        || travail.consistance_travaux?.slice(0, 40)
        || `Travail ${travail.id.slice(0, 8)}`;

    return {
        id:    travail.id,
        title,
        start: travail.heure_debut_planifie,
        // Si heure_fin absente on pose = début (événement ponctuel sur le calendrier)
        end:   travail.heure_fin_planifie || travail.heure_debut_planifie,
        extendedProps: {
            segment:     travail.segment,
            status:      travail.statut_travaux,
            harmonise:   travail.travail_en_alignement === true,
            conflit:     conflitIds.has(travail.id),
            entite:      travail.entite_metier?.name || '—',
            planningId:  travail.planning?.id   || null,
            planningNom: travail.planning?.nom  || '—',
            // Champs bruts conservés pour affichage dans les détails (future modale)
            priorite:    travail.priorite       || null,
            typeReseau:  travail.type_reseau    || null,
            duree:       travail.duree          || null,
            uniteDuree:  travail.unite_duree    || 'HEURES',
        },
    };
};

/**
 * Mappe un tableau de travaux vers des events FullCalendar.
 * Les travaux sans date sont silencieusement ignorés.
 *
 * @param {Array}  travaux    - Liste de Travail depuis le backend
 * @param {Set}    conflitIds - Set des IDs en conflit
 * @returns {Array} - Events FullCalendar prêts à l'emploi
 */
export const mapTravauxToCalendarEvents = (travaux, conflitIds = new Set()) =>
    travaux
        .map(t => travailToCalendarEvent(t, conflitIds))
        .filter(Boolean);


/**
 * Transforme un tableau de travaux en lignes pour le diagramme de Gantt.
 * Les travaux sont groupés par référence réseau (reference.valeur).
 * Un groupe = une ligne dans la sidebar du Gantt.
 *
 * Format de sortie attendu par GanttTimeline.jsx :
 * {
 *   id, name, type, ref, alert,
 *   tasks: [{ start, end, color }]
 * }
 *
 * @param {Array}  travaux    - Liste de Travail depuis le backend
 * @param {Set}    conflitIds - Set des IDs en conflit
 * @param {Date}   startDate  - Premier jour de la période affichée
 * @returns {Array} - Lignes Gantt
 */
export const mapTravauxToGanttRows = (travaux, conflitIds = new Set(), startDate = new Date()) => {
    const SEGMENT_TYPE = { PRODUCTION: 'PRD', TRANSPORT: 'TRP', DISTRIBUTION: 'DST' };
    const SEGMENT_COLOR = { PRODUCTION: 'green', TRANSPORT: 'blue', DISTRIBUTION: 'gray' };

    // Grouper par référence (une référence = une ligne Gantt)
    const groups = new Map();

    for (const travail of travaux) {
        if (!travail.heure_debut_planifie || !travail.heure_fin_planifie) continue;

        const refKey  = travail.reference?.valeur || travail.id;
        const refId   = travail.reference?.id     || travail.id;

        if (!groups.has(refKey)) {
            groups.set(refKey, {
                id:    refId,
                name:  refKey,
                type:  SEGMENT_TYPE[travail.segment] || 'GEN',
                ref:   refKey,
                alert: false,
                tasks: [],
            });
        }

        const row = groups.get(refKey);
        const debut = new Date(travail.heure_debut_planifie);
        const fin   = new Date(travail.heure_fin_planifie);

        // Convertit les dates en numéros de colonnes (jours depuis startDate)
        const msPerDay = 86_400_000;
        const startCol = Math.round((debut - startDate) / msPerDay) + 1;
        const endCol   = Math.round((fin   - startDate) / msPerDay) + 1;

        const isConflit = conflitIds.has(travail.id);
        if (isConflit) row.alert = true;

        row.tasks.push({
            start:       startCol,
            end:         endCol,
            color:       isConflit ? 'red' : SEGMENT_COLOR[travail.segment] || 'gray',
            travailId:   travail.id,
            statut:      travail.statut_travaux,
        });
    }

    return Array.from(groups.values());
};
