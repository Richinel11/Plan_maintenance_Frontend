import './filter.css';

const Filter = () => {
  return (
    <div className="filters">

      {/* TYPE DE TRAVAUX */}
      <div className="filter-card">
        <label>
          <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          Type de travaux
        </label>
        <div className="filter-select-wrapper">
          <select defaultValue="">
            <option value="">Tous les types</option>
            <option value="maintenance">Maintenance</option>
            <option value="renovation">Rénovation</option>
            <option value="inspection">Inspection</option>
          </select>
        </div>
      </div>

      {/* TYPE DE RÉSEAU */}
      <div className="filter-card">
        <label>
          <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="2" y="2" width="6" height="6" rx="1"/>
            <rect x="16" y="2" width="6" height="6" rx="1"/>
            <rect x="9" y="16" width="6" height="6" rx="1"/>
            <path d="M5 8v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/>
            <line x1="12" y1="14" x2="12" y2="16"/>
          </svg>
          Type de réseau
        </label>
        <div className="filter-select-wrapper">
          <select defaultValue="">
            <option value="">Tous les réseaux</option>
            <option value="hta">HTA</option>
            <option value="htb">HTB</option>
            <option value="bt">BT</option>
          </select>
        </div>
      </div>

      {/* STATUT */}
      <div className="filter-card">
        <label>
          <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Statut
        </label>
        <div className="filter-select-wrapper">
          <select defaultValue="">
            <option value="">Tous les statuts</option>
            <option value="planifie">Planifié</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
            <option value="annule">Annulé</option>
          </select>
        </div>
      </div>

      {/* PÉRIODE */}
      <div className="filter-card">
        <label>
          <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Période
        </label>
        <div className="filter-date-wrapper">
          <input type="date" />
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
          <input type="date" />
        </div>
      </div>

    </div>
  );
};

export default Filter;