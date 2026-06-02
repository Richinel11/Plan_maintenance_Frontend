import CalendarView from './components/calendar';

function PlanningPage() {
    // This data will come from your backend API later
    const tasks = [
        {
            id: 1,
            title: "Maintenance Transformateur",
            start: "2026-06-05",
            end: "2026-06-07",
            status: "En cours",
            color: "#f59e0b"
        },
        // ... more tasks
    ];

    return (
        <div>
            {/* <h1>Planning - Calendrier</h1> */}
            <CalendarView tasks={tasks} />
        </div>
    );
}

export default PlanningPage;