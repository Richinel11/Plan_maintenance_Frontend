import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../API/axiosInstance';
import './PlanningAudit.css';

/**
 * Page PlanningAudit
 * Liste tous les plannings engagés dans un workflow pour l'administrateur
 */
const PlanningAudit = () => {
    const [plannings, setPlannings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlannings = async () => {
            try {
                // On récupère la liste des plannings (ceux qui ont un workflow associé)
                const { data } = await api.get('/plannings/');
                // On filtre pour ne garder que ceux qui sont dans un workflow (si le backend ne le fait pas déjà)
                const workflowPlannings = data.filter(p => p.workflow !== null);
                setPlannings(workflowPlannings);
            } catch (error) {
                console.error("Erreur lors de la récupération des plannings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlannings();
    }, []);

    const filteredPlannings = plannings.filter(p => 
        p.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewDetail = (planningId) => {
        navigate(`/dashboard/planning-audit/${planningId}`);
    };

    if (loading) return <div className="audit-loading">Chargement des données d'audit...</div>;

    return (
        <div className="planning-audit-container">
            <header className="audit-header">
                <h1>Audit des Workflows Plannings</h1>
                <p>Suivi global de l'avancement des dossiers DDR et NAPT</p>
            </header>

            <div className="audit-controls">
                <input 
                    type="text" 
                    placeholder="Rechercher un planning (Code ou Nom)..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="audit-search"
                />
            </div>

            <div className="audit-table-container">
                <table className="audit-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Désignation Planning</th>
                            <th>Entité Métier</th>
                            <th>Étape Actuelle</th>
                            <th>Dernière Modif.</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPlannings.length > 0 ? (
                            filteredPlannings.map((p) => (
                                <tr key={p.id}>
                                    <td className="code-cell">{p.code}</td>
                                    <td>{p.nom}</td>
                                    <td>{p.entite_metier?.name || "N/A"}</td>
                                    <td>
                                        <span className="status-badge">
                                            {p.current_step?.name || "Initialisation"}
                                        </span>
                                    </td>
                                    <td>{new Date(p.date_modification).toLocaleDateString()}</td>
                                    <td>
                                        <button 
                                            className="btn-view-path"
                                            onClick={() => handleViewDetail(p.id)}
                                        >
                                            Voir le parcours
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data">Aucun planning sous workflow trouvé</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PlanningAudit;
