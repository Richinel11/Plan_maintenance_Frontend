import React from 'react';
import { useNavigate } from "react-router-dom";
import SearchBar from '../../components/Filter_search/search';
import './Tableaux.css';
import Filter from '../filterCards/filter';
import Footer from '../footer/footer';
// import FileInput from '../../Importer_Plannings/importation';

const Tableaux = () => {
    const navigate = useNavigate();


    return (
        <div className='Container'>

            <div className='Header'>
                <SearchBar />
                <div className='Header-inputs'>
                    <button 
                        className="btn-create" 
                        onClick={() => navigate("/dashboard/CreerTravail")}
                    >
                        + Créer un travail
                    </button>
                    <button 
                        className="btn-import" 
                        onClick={() => navigate("/dashboard/Planning")}
                    >
                        ↻ Importer un planning
                    </button>
                </div>
            </div>

            <Filter />

            {/* Table */}
            <table className="excel-table">
                <tbody>
                    <p>No table</p>
                </tbody>
            </table>

            {/* Footer */}
            <Footer />

        </div>
    );
};

export default Tableaux;