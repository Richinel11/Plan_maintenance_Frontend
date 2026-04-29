import { useState} from 'react';
// import { useNavigate } from "react-router-dom";

import './search.css';   // ← Import external CSS

const SearchBar = () => {
// const navigate = useNavigate();
const [searchTerm, setSearchTerm] = useState('');


  // Reset to first page when search changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    
  };

        return(
            <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
            />
            </div>
        );
};

export default SearchBar;