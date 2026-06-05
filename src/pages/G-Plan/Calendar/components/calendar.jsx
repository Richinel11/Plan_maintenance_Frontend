import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import SegmentFilterBar from '../../components/SegmentFilterBar';
import { SEGMENT_COLORS, STATUT_META } from '../../components/segmentConfig';
import "./calendar.css";

/* ─── Bandeau d'alertes (semaine / jour) ────────────────────────────────────── */
const AlertBandeaux = ({ groupes, dateDebut, dateFin }) => {
    const navigate = useNavigate();

    const alertesDuPeriode = groupes.filter(g => {
        if (g.statut === 'RESOLU') return false;
        return g.travaux.some(t => {
            const d = new Date(t.debut);
            return d >= dateDebut && d < dateFin;
        });
    });

    if (alertesDuPeriode.length === 0) return null;

    const handleClick = (groupe) => {
        navigate('/dashboard/advanced-gantt', { state: { groupe } });
    };

    return (
        <div className="al-bandeaux">
            {alertesDuPeriode.map(g => (
                <button
                    key={g.id_groupe}
                    className={`al-chip ${g.type === 'CONFLIT' ? 'al-chip-conflit' : 'al-chip-opportunite'}`}
                    onClick={() => handleClick(g)}
                    title={`${g.ressources_communes.join(' · ')} — cliquer pour harmoniser`}
                >
                    <span className="al-chip-icon">{g.type === 'CONFLIT' ? '⚠️' : '💡'}</span>
                    <span className="al-chip-label">
                        {g.ressources_communes[0] || 'Ressource commune'}
                    </span>
                    <span className="al-chip-count">{g.nb_travaux} travaux</span>
                    {g.type === 'CONFLIT' && g.chevauchement && (
                        <span className="al-chip-detail">{g.chevauchement}</span>
                    )}
                    {g.type === 'OPPORTUNITE' && g.semaine && (
                        <span className="al-chip-detail">{g.semaine}</span>
                    )}
                </button>
            ))}
        </div>
    );
};

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

/* ─── Helpers vue semaine Gantt ─────────────────────────────────────────────── */
const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const DAY_ABBR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const LANE_H   = 30;
const LANE_GAP = 4;
const ROW_PAD  = 8;

const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
    d.setHours(0, 0, 0, 0);
    return d;
};

const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate();

const getTasksForDay = (day, tasks) => {
    const s = new Date(day); s.setHours(0, 0, 0, 0);
    const e = new Date(day); e.setHours(23, 59, 59, 999);
    return tasks.filter(t => {
        const ts = new Date(t.start);
        const te = t.end ? new Date(t.end) : new Date(ts.getTime() + 3_600_000);
        return ts <= e && te >= s;
    });
};

const assignLanes = (tasks, day) => {
    const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
    const DAY_MS   = 86_400_000;

    const items = tasks.map(t => {
        const ts = new Date(t.start);
        const te = t.end ? new Date(t.end) : new Date(ts.getTime() + 3_600_000);
        return {
            task:    t,
            startMs: Math.max(ts.getTime(), dayStart.getTime()),
            endMs:   Math.min(te.getTime(), dayStart.getTime() + DAY_MS),
        };
    }).sort((a, b) => a.startMs - b.startMs);

    const laneEnds = [];
    return items.map(({ task, startMs, endMs }) => {
        let li = laneEnds.findIndex(le => le <= startMs);
        if (li === -1) { li = laneEnds.length; laneEnds.push(endMs); }
        else           { laneEnds[li] = endMs; }
        return {
            task,
            lane:  li,
            left:  (startMs - dayStart.getTime()) / DAY_MS * 100,
            width: Math.max((endMs - startMs) / DAY_MS * 100, 0.4),
        };
    });
};

/* ─── Vue semaine style Gantt ───────────────────────────────────────────────── */
const WeekGanttView = ({ tasks, groupes = [], onTaskClick }) => {
    const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

    const goBack  = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
    const goNext  = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
    const goToday = () => setWeekStart(getWeekStart(new Date()));

    const weekLabel = (() => {
        const end = new Date(weekStart); end.setDate(weekStart.getDate() + 6);
        const o = { day: 'numeric', month: 'long', year: 'numeric' };
        return `${weekStart.toLocaleDateString('fr-FR', o)} – ${end.toLocaleDateString('fr-FR', o)}`;
    })();

    return (
        <div className="wg-container">
            {/* ── Navigation ── */}
            <div className="wg-nav">
                <button className="wg-nav-btn" onClick={goBack}>‹</button>
                <button className="wg-nav-btn wg-today-btn" onClick={goToday}>Aujourd'hui</button>
                <button className="wg-nav-btn" onClick={goNext}>›</button>
                <span className="wg-week-label">{weekLabel}</span>
            </div>

            {/* ── Bandeaux d'alertes de la semaine ── */}
            <AlertBandeaux
                groupes={groupes}
                dateDebut={weekStart}
                dateFin={new Date(weekStart.getTime() + 7 * 86400000)}
            />

            {/* ── Grille ── */}
            <div className="wg-grid-wrap">

                {/* En-tête : heures sur l'axe horizontal */}
                <div className="wg-header">
                    <div className="wg-day-col" />
                    <div className="wg-timeline-header">
                        {HOURS_24.map(h => (
                            <div key={h} className="wg-hour-label">
                                {String(h).padStart(2, '0')}h
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lignes : jours sur l'axe vertical */}
                {days.map((day, di) => {
                    const isToday  = isSameDay(day, today);
                    const dayTasks = getTasksForDay(day, tasks);
                    const laned    = assignLanes(dayTasks, day);
                    const numLanes = laned.length > 0 ? Math.max(...laned.map(l => l.lane)) + 1 : 1;
                    const rowH     = numLanes * (LANE_H + LANE_GAP) + ROW_PAD * 2;

                    return (
                        <div key={di} className={`wg-row ${isToday ? 'wg-row-today' : ''}`}>
                            {/* Label jour */}
                            <div className="wg-day-col wg-day-label">
                                <span className="wg-day-name">{DAY_ABBR[di]}</span>
                                <span className={`wg-day-num ${isToday ? 'wg-day-num-today' : ''}`}>
                                    {day.getDate()}
                                </span>
                            </div>

                            {/* Timeline horizontale */}
                            <div className="wg-timeline" style={{ height: rowH }}>
                                {/* Séparateurs verticaux heures */}
                                {HOURS_24.map(h => (
                                    <div key={h} className="wg-vline" style={{ left: `${(h / 24) * 100}%` }} />
                                ))}

                                {/* Barres travaux */}
                                {laned.map(({ task, lane, left, width }) => {
                                    const seg   = task.extendedProps?.segment;
                                    const isCon = task.extendedProps?.conflit;
                                    const isHar = task.extendedProps?.harmonise;

                                    const c = isCon
                                        ? { bg: '#fef2f2', text: '#b91c1c', border: '#ef4444' }
                                        : isHar
                                        ? { bg: '#f5f3ff', text: '#7c3aed', border: '#7c3aed' }
                                        : SEGMENT_COLORS[seg]
                                        ? { bg: SEGMENT_COLORS[seg].bg, text: SEGMENT_COLORS[seg].text, border: SEGMENT_COLORS[seg].dot }
                                        : { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' };

                                    const icon = isCon ? '⚠️' : isHar ? '🔗' : null;

                                    return (
                                        <div
                                            key={task.id || `${di}-${lane}`}
                                            className="wg-task-bar"
                                            style={{
                                                left:       `${left}%`,
                                                width:      `${width}%`,
                                                top:        ROW_PAD + lane * (LANE_H + LANE_GAP),
                                                height:     LANE_H,
                                                background: c.bg,
                                                color:      c.text,
                                                borderLeft: `3px solid ${c.border}`,
                                            }}
                                            title={task.title}
                                            onClick={() => onTaskClick(task)}
                                        >
                                            {icon && <span className="wg-task-icon">{icon}</span>}
                                            <span className="wg-task-title">{task.title}</span>
                                        </div>
                                    );
                                })}

                                {/* Ligne heure actuelle */}
                                {isToday && (() => {
                                    const n   = new Date();
                                    const pct = (n.getHours() * 60 + n.getMinutes()) / 1440 * 100;
                                    return <div className="wg-now-line" style={{ left: `${pct}%` }} />;
                                })()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ─── Vue jour style Gantt ──────────────────────────────────────────────────── */
const DayGanttView = ({ tasks, groupes = [], onTaskClick }) => {
    const [currentDay, setCurrentDay] = useState(() => {
        const d = new Date(); d.setHours(0, 0, 0, 0); return d;
    });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const isToday = isSameDay(currentDay, today);

    const goBack  = () => { const d = new Date(currentDay); d.setDate(d.getDate() - 1); setCurrentDay(d); };
    const goNext  = () => { const d = new Date(currentDay); d.setDate(d.getDate() + 1); setCurrentDay(d); };
    const goToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); setCurrentDay(d); };

    const dayLabel = currentDay.toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    const dayTasks = getTasksForDay(currentDay, tasks);
    const laned    = assignLanes(dayTasks, currentDay);
    const numLanes = laned.length > 0 ? Math.max(...laned.map(l => l.lane)) + 1 : 1;
    const bodyH    = numLanes * (LANE_H + LANE_GAP) + ROW_PAD * 2;

    return (
        <div className="wg-container">
            {/* ── Navigation ── */}
            <div className="wg-nav">
                <button className="wg-nav-btn" onClick={goBack}>‹</button>
                <button className="wg-nav-btn wg-today-btn" onClick={goToday}>Aujourd'hui</button>
                <button className="wg-nav-btn" onClick={goNext}>›</button>
                <span className="wg-week-label">{dayLabel}</span>
            </div>

            {/* ── Bandeaux d'alertes du jour ── */}
            <AlertBandeaux
                groupes={groupes}
                dateDebut={currentDay}
                dateFin={new Date(currentDay.getTime() + 86400000)}
            />

            {/* ── Grille ── */}
            <div className="wg-grid-wrap">

                {/* En-tête : heures sur l'axe horizontal, sans colonne jour */}
                <div className="wg-header dg-header">
                    <div className="wg-timeline-header">
                        {HOURS_24.map(h => (
                            <div key={h} className="wg-hour-label">
                                {String(h).padStart(2, '0')}h
                            </div>
                        ))}
                    </div>
                </div>

                {/* Corps : toutes les barres du jour */}
                <div className={isToday ? 'wg-row-today' : ''}>
                    {dayTasks.length === 0 ? (
                        <div className="dg-empty">Aucun travail ce jour.</div>
                    ) : (
                        <div className="wg-timeline" style={{ height: bodyH, minWidth: 600 }}>
                            {HOURS_24.map(h => (
                                <div key={h} className="wg-vline" style={{ left: `${(h / 24) * 100}%` }} />
                            ))}

                            {laned.map(({ task, lane, left, width }) => {
                                const seg   = task.extendedProps?.segment;
                                const isCon = task.extendedProps?.conflit;
                                const isHar = task.extendedProps?.harmonise;

                                const c = isCon
                                    ? { bg: '#fef2f2', text: '#b91c1c', border: '#ef4444' }
                                    : isHar
                                    ? { bg: '#f5f3ff', text: '#7c3aed', border: '#7c3aed' }
                                    : SEGMENT_COLORS[seg]
                                    ? { bg: SEGMENT_COLORS[seg].bg, text: SEGMENT_COLORS[seg].text, border: SEGMENT_COLORS[seg].dot }
                                    : { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' };

                                const icon = isCon ? '⚠️' : isHar ? '🔗' : null;

                                return (
                                    <div
                                        key={task.id || lane}
                                        className="wg-task-bar"
                                        style={{
                                            left:       `${left}%`,
                                            width:      `${width}%`,
                                            top:        ROW_PAD + lane * (LANE_H + LANE_GAP),
                                            height:     LANE_H,
                                            background: c.bg,
                                            color:      c.text,
                                            borderLeft: `3px solid ${c.border}`,
                                        }}
                                        title={task.title}
                                        onClick={() => onTaskClick(task)}
                                    >
                                        {icon && <span className="wg-task-icon">{icon}</span>}
                                        <span className="wg-task-title">{task.title}</span>
                                    </div>
                                );
                            })}

                            {isToday && (() => {
                                const n   = new Date();
                                const pct = (n.getHours() * 60 + n.getMinutes()) / 1440 * 100;
                                return <div className="wg-now-line" style={{ left: `${pct}%` }} />;
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Composant principal ──────────────────────────────────────────────────────
const CalendarView = ({ tasks = [], groupes = [] }) => {
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

            {/* ── Vue semaine Gantt ── */}
            {currentView === 'timeGridWeek' && (
                <WeekGanttView
                    tasks={filteredTasks}
                    groupes={groupes}
                    onTaskClick={(task) => {
                        const p = task.extendedProps;
                        alert(
                            `Référence : ${task.title}\n` +
                            `Segment : ${p.segment || 'N/A'}\n` +
                            `Statut : ${STATUT_META[p.status]?.label || p.status || 'N/A'}\n` +
                            `Début : ${task.start}\n` +
                            `Fin : ${task.end || 'N/A'}`
                        );
                    }}
                />
            )}

            {/* ── Vue jour Gantt ── */}
            {currentView === 'timeGridDay' && (
                <DayGanttView
                    tasks={filteredTasks}
                    groupes={groupes}
                    onTaskClick={(task) => {
                        const p = task.extendedProps;
                        alert(
                            `Référence : ${task.title}\n` +
                            `Segment : ${p.segment || 'N/A'}\n` +
                            `Statut : ${STATUT_META[p.status]?.label || p.status || 'N/A'}\n` +
                            `Début : ${task.start}\n` +
                            `Fin : ${task.end || 'N/A'}`
                        );
                    }}
                />
            )}

            {/* ── Calendrier FullCalendar (Mois uniquement) ── */}
            <div className={`calendar-container ${(currentView === 'liste' || currentView === 'timeGridWeek' || currentView === 'timeGridDay') ? 'cal-hidden' : ''}`}>
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
