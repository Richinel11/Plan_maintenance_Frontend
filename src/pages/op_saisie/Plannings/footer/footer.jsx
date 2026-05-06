import {useState} from 'react';
import './footer.css';
import ExcelDisplay from '../Planning';


const Footer = ()  => {

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalItems = ExcelDisplay.length || 24;   // ← This comes from your data

    const startIndex = (currentPage - 1) * itemsPerPage;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    return(
                    // {/* FOOTER - Pagination */}
       <div className="table-footer">
            <p className="pagination-info">
                Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, totalItems)} sur <strong>{totalItems}</strong> plannings
            </p>

            <div className="pagination-buttons">
                {/* Previous Button */}
                <button 
                className="page-btn"
                onClick={goToPrevious}
                disabled={currentPage === 1}
                >
                ‹
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                    key={page}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                >
                    {page}
                </button>
                ))}

                {/* Next Button */}
                <button 
                className="page-btn"
                onClick={goToNext}
                disabled={currentPage === totalPages}
                >
                ›
                </button>
            </div>
        </div>

    );
};

export default Footer;