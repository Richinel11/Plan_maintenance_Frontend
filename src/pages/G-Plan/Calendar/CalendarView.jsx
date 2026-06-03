import React, { useState, useEffect } from 'react';
import CalendarComponent from './components/calendar';
import { fetchAllTravaux, fetchConflitIds } from '../services/gplanService';
import { mapTravauxToCalendarEvents } from '../services/travailMapper';

const CalendarView = () => {
    const [events,  setEvents]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                // Les deux appels sont indépendants — on les lance en parallèle
                const [travaux, conflitIds] = await Promise.all([
                    fetchAllTravaux(),
                    fetchConflitIds(),
                ]);

                if (cancelled) return;
                setEvents(mapTravauxToCalendarEvents(travaux, conflitIds));
            } catch (err) {
                if (cancelled) return;
                console.error('[CalendarView] Erreur de chargement :', err);
                setError(err?.response?.data?.detail || err.message || 'Erreur inconnue');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, []);

    /* ── États de chargement ── */

    if (loading) {
        return (
            <div style={styles.center}>
                <div style={styles.spinner} />
                <p style={styles.loadingText}>Chargement des travaux…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.center}>
                <div style={styles.errorBox}>
                    <span style={{ fontSize: 28 }}>⚠️</span>
                    <p style={styles.errorTitle}>Impossible de charger les données</p>
                    <p style={styles.errorMsg}>{error}</p>
                    <button
                        style={styles.retryBtn}
                        onClick={() => window.location.reload()}
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return <CalendarComponent tasks={events} />;
};

/* ── Styles inline minimaux pour les états loading/error ── */
const styles = {
    center: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 16,
    },
    spinner: {
        width: 40,
        height: 40,
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #1B75BB',
        borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
    },
    loadingText: {
        color: '#64748b',
        fontWeight: 500,
        fontSize: 14,
    },
    errorBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        background: '#fff',
        border: '1px solid #fecaca',
        borderRadius: 14,
        padding: '32px 40px',
        textAlign: 'center',
        maxWidth: 400,
    },
    errorTitle: {
        fontWeight: 700,
        fontSize: 16,
        color: '#1e293b',
        margin: 0,
    },
    errorMsg: {
        fontSize: 13,
        color: '#64748b',
        margin: 0,
    },
    retryBtn: {
        marginTop: 8,
        padding: '8px 20px',
        background: '#1B75BB',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        fontWeight: 600,
        fontSize: 13,
        cursor: 'pointer',
    },
};

export default CalendarView;
