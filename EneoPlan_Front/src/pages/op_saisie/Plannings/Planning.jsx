import React, { useState } from 'react';
import FileInput from '../Importer_Plannings/importation';
import readExcel from './readFile';
import './Planning.css';
import SearchBar from '../components/Filter_search/search';
import { useNavigate } from "react-router-dom";
import Filter from './filterCards/filter';




  
  const   ExcelDisplay = () => {
    
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");
  const [excelData, setExcelData] = useState([]);  // [] change la data a null , mais setExcelData change la donnees quand le fichier est importer
  const [showImport, setShowImport] = useState(true);
  const [fade, setFade] = useState("fade-in");
  
  
  const handleContinue = () => {
  setFade("fade-out");
 

  setTimeout(() => {
    setShowImport(false);
  }, 300); // match animation duration
   };


  // handleContinue();

  const handleFileSelect = async (file) => {
    try{
      console.log("File selected:", file.name);
      // Save the file name
      setFileName(file.name);

      const data = await readExcel(file);
      setExcelData(data);
    }  catch (error) {
      console.error('Error reading Excel file:', error);
    }
  };

  return(
      <div className="excel-container">
      {showImport &&(
        <div className={fade}>
          <FileInput 
            onFileSelect={handleFileSelect} 
            onContinue={handleContinue}
            />
      </div>
      )}
    {!showImport &&(  // montre la table apres que j'ai cliquer sur continuer
      <div className="fade-in">
              <div className='header-text'>
                <div className='text'>
                    <h1>📄{fileName}</h1>
                    <p>Veuillez verifier et ajuster les donnees extraites du fichier source avant la validation finale</p>
                </div>

                  <SearchBar />
              </div>


                  <Filter />
        <form action={''} method=''>    
          <table className="excel-table">
            <tbody>
              {excelData.map((row, rowIndex) => ( 
                <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                </tr>
              ))}
            </tbody>


          </table>
            <div className='btn'>
              <button className='btn-brouillon' type='submit'>Enregistrer un bouillon</button>
              <button className='btn-validation' onClick={() => navigate("/dashboard/Tableaux_De_Bord")}>Soumettre par validation</button>
            </div>
          </form>
      </div>
      )}
    </div>
  );

};

export default ExcelDisplay;