// import { useNavigate } from "react-router-dom";

import './search.css';   // ← Import external CSS

const SearchBar = ({ value, onChange }) => {
        return(
            <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
                type="text"
                placeholder="Rechercher..."
                value={value ?? ''}
                onChange={onChange}
                className="search-input"
            />
            </div>
        );
};

export default SearchBar;