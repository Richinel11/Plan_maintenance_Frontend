import { useState} from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import './Importation.css';


const FileInput = ({ onFileSelect, onContinue }) => {

// Importer les fichiers
  //   const handleFileChange = (e) => {
  //     const file = e.target.files[0];
  //     if (onFileSelect) {
  //     onFileSelect(file);
  //   }
  // }

  const [fileName, setFileName] = useState("");
  const [fileSelected, setFileSelected] = useState(false);
  const [fileType, setFileType] = useState("");

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
    
    setFileName(file.name); // ✅ store file name
    setFileSelected(true); // ✅ track selection

      // ✅ Detect file type
  if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
    setFileType("Excel");
  } else if (file.name.endsWith(".csv")) {
    setFileType("CSV");
  } else if (file.name.endsWith(".pdf")) {
    setFileType("PDF");
  } else {
    setFileType("Fichier");
  }
    onFileSelect?.(file);   // send file to parent
  };
  // const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  // const [isUploading, setIsUploading] = useState(false);
  console.log(fileName);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);



  return (
    <div className="import-container">

        <div className="import-header">
          <h1 className="import-title">Importer un planning</h1>
          <p className="import-subtitle">
            Configurez et téléchargez vos fichiers de planification industrielle.
          </p>
        </div>
          <div className="import-card">

            {!fileSelected ? (
              /* ================= DROPZONE ================= */
              <div
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="cloud-icon">
                  <Upload size={36} />
                </div>

                <div className="drop-text">Zone de dépôt de fichier</div>

                <div className="drop-subtext">
                  Glissez-déposez votre fichier <strong>.xlsx</strong> ou <strong>.csv</strong>
                </div>

                <input 
                  type="file"
                  id="fileInput"
                  hidden
                  onChange={handleFileChange}
                />

                <label htmlFor="fileInput" className="browse-btn">
                  <Upload size={20} />
                  Parcourir les fichiers
                </label>

                <div className="supported-formats">
                  Formats supportés : .xlsx, .csv
                </div>
              </div>

          ) : (
            /* ================= FILE INFO VIEW ================= */
            <div className="file-preview fade-in">
              <div className="file-card">
                <div className="file-icon-large">📄</div>

                <div className="file-details">
                  <h3>{fileName}</h3>
                  <p>Type : {fileType}</p>
                </div>

                <button 
                  className="remove-btn"
                  onClick={() => {
                    setFileSelected(false);
                    setFileName("");
                    setFileType("");
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* FOOTER stays same */}
          <div className="footer">
            <button className="btn btn-cancel">
              Annuler
            </button>

            <button 
              className="btn btn-continue"
              onClick={() => {
                if (!fileSelected) {
                  alert("⚠️ Veuillez sélectionner un fichier d'abord !");
                  return;
                }
                onContinue?.();
              }}
              disabled={!fileSelected}
            >
              Continuer
            </button>
          </div>

        </div>

      </div>
   
  );
};

export default FileInput;