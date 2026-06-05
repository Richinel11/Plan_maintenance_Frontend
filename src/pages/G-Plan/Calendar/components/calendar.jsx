import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import "./calendar.css";
// Tu peux ajouter "La création de la chorale pour enfants de 6 - 12 ans" mets sa ou tu a mis la liste donc apres marie reine tu ajoute une icone pour le chant et tu ajoute Chorale pour enfant de 6 - 12 ans
const CalendarView = ({ tasks = [] }) => {
    const calendarRef = useRef(null);

    const handleEventClick = (info) => {
        const props = info.event.extendedProps;

        alert(
            `Travaux: ${info.event.title}\nStatut: ${props.status || 'N/A'}`
        );
    };

    const handleDateClick = (info) => {
        console.log("Date clicked:", info.dateStr);
    };

// Custom renderer to style events with icons just like the image
    const renderEventContent = (eventInfo) => {
        const title = eventInfo.event.title;
        let icon = null;
        let customClass = "event-default";

        // Assign classes and icons based on event titles or types
        if (title.includes("Production")) {
            customClass = "event-production";
        } else if (title.includes("Logistics")) {
            customClass = "event-logistics";
        } else if (title.includes("Conflict")) {
            customClass = "event-conflict";
            icon = <span className="event-icon">⚠️</span>;
        } else if (title.includes("Overlap")) {
            customClass = "event-overlap";
            icon = <span className="event-icon">🚫</span>;
        } else if (title.includes("Batch Release")) {
            customClass = "event-batch";
        }

        return (
            <div className={`custom-calendar-event ${customClass}`}>
                {icon}
                <span className="event-title-text">{title}</span>
            </div>
        );
    }

    
    return (
        <div className="calendar-container bg-white rounded-xl border border-gray-200 p-4">
            <div className="filter-bar">
                <span>Filtres:</span>

                <div className="filter-pill">
                    <span className="dot1"></span>

                    <select>
                        <option>Production</option>
                        <option>Distribution</option>
                        <option>Transport</option>
                        <option>Tous</option>
                    </select>
                </div>
            </div>
            
            {/* Calendar */}
            <FullCalendar
                ref={calendarRef}
                plugins={[
                    dayGridPlugin,
                    timeGridPlugin,
                    listPlugin,
                    interactionPlugin
                ]}
                initialView="dayGridMonth"
                locale={frLocale}
                firstDay={0} // 0 = Sunday, 1 = Monday. Forces Sunday as the first day of the week
                 customButtons={{
                        enregistrer: {
                            text: 'Enregistrer',
                            click: () => {
                                alert('Save clicked');
                            }
                        }
                    }}
                headerToolbar={{
                    left: 'title dayGridMonth,timeGridWeek,timeGridDay,listMonth',
                    center: 'filter-bar',
                    right: 'prev,today,next enregistrer'
                }}
                buttonText={{
                    today: "Aujourd'hui",
                    month: 'Mois',
                    week: 'Semaine',
                    day: 'Jour',
                    list: 'Liste'
                }}
                events={tasks}
                editable={true}
                selectable={true}
                dayMaxEvents={true}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                eventContent={renderEventContent} // Injects our custom event design
                height="auto"
                
            />

        </div>
    );
};

export default CalendarView;