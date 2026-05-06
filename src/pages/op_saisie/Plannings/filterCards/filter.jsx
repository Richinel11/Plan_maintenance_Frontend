import './filter.css';

const filter = () => {
    return(
                    <div className="filters">
                <div className="filter-card">
                    <label>TYPE DE TRAVAUX</label>
                    <select>
                    <option>Tous les types</option>
                    </select>
                </div>

                <div className="filter-card">
                    <label>TYPE DE RÉSEAU</label>
                    <select>
                    <option>Tous les réseaux</option>
                    </select>
                </div>

                <div className="filter-card">
                    <label>STATUT</label>
                    <select>
                    <option>Tous les statuts</option>
                    </select>
                </div>

                <div className="filter-card">
                    <label>PÉRIODE</label>
                    <input type="date" />
                </div>

            </div>
    );
};

export default filter;