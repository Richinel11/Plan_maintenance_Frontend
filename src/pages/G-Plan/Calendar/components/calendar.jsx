import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import SegmentFilterBar from '../../components/SegmentFilterBar';
import { SEGMENT_COLORS, STATUT_META } from '../../components/segmentConfig';
import "./calendar.css";

const VIEWS = [
    { key: 'dayGridMonth', label: 'Mois'    },
    { key: 'timeGridWeek', label: 'Semaine' },
    { key: 'timeGridDay',  label: 'Jour'    },
    { key: 'liste',        label: 'Liste'   },
];

/* ─── Constantes ──────────────────────────────────────────────────────────── */

const PAGE_SIZE = 20;

const COLUMNS = [
    { key: 'title',    label: 'RÉFÉRENCE'     },
    { key: 'planning', label: 'PLANNING'       },
    { key: 'segment',  label: 'SEGMENT'        },
    { key: 'start',    label: 'DÉBUT PLANIFIÉ' },
    { key: 'end',      label: 'FIN PLANIFIÉE'  },
];

const getSortValue = (task, key) => {
    switch (key) {
        case 'title':    return task.title || '';
        case 'planning': return task.extendedProps?.planningNom || '';
        case 'segment':  return task.extendedProps?.segment     || '';
        case 'start':    return task.start || '';
        case 'end':      return task.end   || '';
        default:         return '';
    }
};

const fmt = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

/* ─── Icône de tri ─────────────────────────────────────────────────────────── */
const SortIcon = ({ col, sortKey, sortDir }) => {
    if (sortKey !== col) return <span className="lv-sort-icon neutral">↕</span>;
    return <span className="lv-sort-icon active">{sortDir === 'asc' ? '↑' : '↓'}</span>;
};

/* ─── Vue liste ────────────────────────────────────────────────────────────── */
const ListView = ({ tasks }) => {
    const [search,  setSearch]  = useState('');
    const [sortKey, setSortKey] = useState('start');
    const [sortDir, setSortDir] = useState('asc');
    const [page,    setPage]    = useState(1);

    // Reset page quand la recherche change
    useEffect(() => { setPage(1); }, [search]);

    /* ── Filtrage ── */
    const filtered = tasks.filter(t => {
        const q = search.toLowerCase();
        return (
            (t.title                       || '').toLowerCase().includes(q) ||
            (t.extendedProps?.segment      || '').toLowerCase().includes(q) ||
            (t.extendedProps?.planningNom  || '').toLowerCase().includes(q)
        );
    });

    /* ── Tri ── */
    const sorted = [...filtered].sort((a, b) => {
        const va = getSortValue(a, sortKey);
        const vb = getSortValue(b, sortKey);
        const cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
    });

    /* ── Pagination ── */
    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const safePage   = Math.min(page, totalPages);
    const paginated  = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    /* ── Stats footer ── */
    const nbConflits   = filtered.filter(t => t.extendedProps?.conflit).length;
    const nbHarmonises = filtered.filter(t => t.extendedProps?.harmonise).length;

    const handleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
        setPage(1);
    };

    return (
        <div className="list-card">

            {/* ── En-tête ── */}
            <div className="list-header">
                <div>
                    <h2 className="list-title">Liste des travaux</h2>
                    <p className="list-subtitle">
                        {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
                        {search && ` pour "${search}"`}
                    </p>
                </div>
                <div className="list-search-wrap">
                    <span className="material-symbols-outlined list-search-icon">search</span>
                    <input
                        className="list-search"
                        placeholder="Référence, planning, segment, statut…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="list-search-clear" onClick={() => setSearch('')} title="Effacer">✕</button>
                    )}
                </div>
            </div>

            {/* ── Tableau ── */}
            <div className="list-table-wrap">
                <table className="list-table">
                    <thead>
                        <tr>
                            {COLUMNS.map(col => (
                                <th
                                    key={col.key}
                                    className="lv-th-sortable"
                                    onClick={() => handleSort(col.key)}
                                >
                                    {col.label}
                                    <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length > 0 ? paginated.map((t, i) => {
                            const seg       = t.extendedProps?.segment;
                            const isConflit = t.extendedProps?.conflit;
                            const isHarmo   = t.extendedProps?.harmonise;
                            const segMeta   = SEGMENT_COLORS[seg] || { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' };

                            return (
                                <tr key={t.id || i} className={isConflit ? 'lv-row-conflit' : ''}>

                                    {/* Référence */}
                                    <td className="list-ref-cell">
                                        <div className="lv-ref-wrap">
                                            {isConflit && (
                                                <span className="lv-indicator conflit" title="Conflit de chevauchement détecté">⚠️</span>
                                            )}
                                            {isHarmo && !isConflit && (
                                                <span className="lv-indicator harmonise" title="Travail harmonisé">🔗</span>
                                            )}
                                            <span className="list-ref">{t.title || '—'}</span>
                                        </div>
                                    </td>

                                    {/* Planning */}
                                    <td className="lv-planning">
                                        {t.extendedProps?.planningNom || '—'}
                                    </td>

                                    {/* Segment */}
                                    <td>
                                        <span className="list-badge" style={{ background: segMeta.bg, color: segMeta.text }}>
                                            <span className="list-badge-dot" style={{ background: segMeta.dot }} />
                                            {seg ? seg.charAt(0) + seg.slice(1).toLowerCase() : '—'}
                                        </span>
                                    </td>

                                    {/* Dates */}
                                    <td className="list-date">{fmt(t.start)}</td>
                                    <td className="list-date">{fmt(t.end)}</td>

                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={COLUMNS.length} className="list-empty">
                                    {search
                                        ? `Aucun résultat pour "${search}".`
                                        : 'Aucun travail à afficher.'
                                    }
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Footer : stats + pagination ── */}
            <div className="list-footer">

                {/* Compteurs */}
                <div className="lv-stats">
                    <span className="lv-stat-total">
                        {filtered.length} travail{filtered.length > 1 ? 'x' : ''}
                    </span>
                    {nbConflits > 0 && (
                        <span className="lv-stat-chip lv-chip-conflit">
                            ⚠️ {nbConflits} conflit{nbConflits > 1 ? 's' : ''}
                        </span>
                    )}
                    {nbHarmonises > 0 && (
                        <span className="lv-stat-chip lv-chip-harmonise">
                            🔗 {nbHarmonises} harmonisé{nbHarmonises > 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="lv-pagination">
                        <button
                            className="lv-page-btn"
                            disabled={safePage === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            ← Précédent
                        </button>
                        <span className="lv-page-info">
                            Page {safePage} / {totalPages}
                        </span>
                        <button
                            className="lv-page-btn"
                            disabled={safePage === totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Suivant →
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

// ─── Composant principal ──────────────────────────────────────────────────────
const CalendarView = ({ tasks = [] }) => {
    const calendarRef  = useRef(null);
    const [currentView,    setCurrentView]    = useState('dayGridMonth');
    const [segmentFilter,  setSegmentFilter]  = useState('TOUS');

    const filteredTasks = segmentFilter === 'TOUS'
        ? tasks
        : segmentFilter === 'HARMONISE'
            ? tasks.filter(t => t.extendedProps?.harmonise === true)
            : tasks.filter(t => t.extendedProps?.segment === segmentFilter);

    const handleViewChange = (viewKey) => {
        setCurrentView(viewKey);
        if (viewKey !== 'liste' && calendarRef.current) {
            calendarRef.current.getApi().changeView(viewKey);
        }
    };

    const renderEventContent = (eventInfo) => {
        const segment     = eventInfo.event.extendedProps?.segment;
        const isHarmonise = eventInfo.event.extendedProps?.harmonise;
        const isConflict  = eventInfo.event.extendedProps?.conflit;
        const viewType    = eventInfo.view.type;
        const isTimeGrid  = viewType === 'timeGridWeek' || viewType === 'timeGridDay';

        const colors = isConflict  ? { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444', solid: '#ef4444' }
                     : isHarmonise ? { ...SEGMENT_COLORS.HARMONISE, solid: '#7c3aed' }
                     : SEGMENT_COLORS[segment]
                         ? { ...SEGMENT_COLORS[segment], solid: SEGMENT_COLORS[segment].dot }
                         : { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af', solid: '#9ca3af' };

        const icon = isConflict ? '⚠️' : isHarmonise ? '🔗' : null;

        /* ── Vue mois : pill horizontal compact ── */
        if (!isTimeGrid) {
            return (
                <div className="cal-event cal-event-month" style={{
                    background: colors.bg,
                    color:      colors.text,
                    borderLeft: `3px solid ${colors.dot}`,
                }}>
                    {icon && <span className="cal-event-icon">{icon}</span>}
                    <span className="cal-event-title">{eventInfo.event.title}</span>
                </div>
            );
        }

        /* ── Vues semaine / jour : carte verticale style Teams ── */
        return (
            <div className="cal-tg-card" style={{
                background:  colors.bg,
                borderLeft:  `4px solid ${colors.solid}`,
                color:       colors.text,
            }}>
                {/* Heure */}
                <div className="cal-tg-time">{eventInfo.timeText}</div>

                {/* Titre */}
                <div className="cal-tg-title">
                    {icon && <span className="cal-tg-icon">{icon}</span>}
                    {eventInfo.event.title}
                </div>

            </div>
        );
    };

    const handleEventClick = (info) => {
        const p = info.event.extendedProps;
        alert(
            `Référence : ${info.event.title}\n` +
            `Segment : ${p.segment || 'N/A'}\n` +
            `Statut : ${STATUT_META[p.status]?.label || p.status || 'N/A'}\n` +
            `Début : ${info.event.startStr}\n` +
            `Fin : ${info.event.endStr}`
        );
    };

    return (
        <div className="calendar-wrapper">

            {/* ── Barre de contrôles ── */}
            <SegmentFilterBar value={segmentFilter} onChange={setSegmentFilter}>
                {/* Toggle vues — injecté dans le slot droite */}
                <div className="cal-view-toggle">
                    {VIEWS.map(({ key, label }) => (
                        <button
                            key={key}
                            className={`cal-view-btn ${currentView === key ? 'active' : ''}`}
                            onClick={() => handleViewChange(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </SegmentFilterBar>

            {/* ── Vue liste custom ── */}
            {currentView === 'liste' && (
                <ListView tasks={filteredTasks} />
            )}

            {/* ── Calendrier FullCalendar ── */}
            <div className={`calendar-container ${currentView === 'liste' ? 'cal-hidden' : ''}`}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    locale={frLocale}
                    firstDay={1}
                    height="auto"

                    headerToolbar={{
                        left:   'prev,next today',
                        center: 'title',
                        right:  'enregistrer',
                    }}

                    buttonText={{ today: "Aujourd'hui" }}

                    customButtons={{
                        enregistrer: {
                            text: 'Enregistrer',
                            click: () => alert('Enregistrement…'),
                        },
                    }}

                    events={filteredTasks}
                    editable={true}
                    selectable={true}
                    dayMaxEvents={3}
                    eventClick={handleEventClick}
                    eventContent={renderEventContent}
                    noEventsContent="Aucun travail sur cette période"
                />
            </div>

        </div>
    );
};

export default CalendarView;
