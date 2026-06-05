import { useState, useRef, useCallback } from "react";
import "./display.css";

const API_BASE = import.meta?.env?.VITE_API_BASE ?? "https://api.example.com";

const Icon = {
  Doc: () => <span>📄</span>,
  Upload: () => <span>⬆️</span>,
  X: () => <span>✕</span>,
  ArrowLeft: () => <span>←</span>,
  Alert: () => <span>⚠</span>,
  Shield: () => <span>🛡</span>,
  File: () => <span>📎</span>,
};

export default function RefusDDR({
  ddrId = "DDR-2023-0892",
  onBack = () => window.history.back(),
  onSuccess = () => {},
}) {
  const [motif, setMotif] = useState("");
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  /* FILES */
  const addFiles = useCallback((newFiles) => {
    setFiles((prev) => [...prev, ...Array.from(newFiles)].slice(0, 10));
  }, []);

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* SUBMIT */
  const handleSubmit = async () => {
    if (!motif.trim()) return alert("Motif obligatoire");

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
      alert("Refus envoyé avec succès");
    }, 800);
  };

  const previewDoc = () => {
    alert("Preview document (API hook here)");
  };

  return (
    <>
      <div className="page">
        <div className="content">

          {/* HEADER */}
          <div className="page-header">
            <div>
              <h1>
                Refus de la DDR – <span>{ddrId}</span>
              </h1>
              <p>
                Vous allez rejeter cette demande. Ajoutez une justification.
              </p>
            </div>

            <div className="badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert-icon lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> 
              ACTION REQUISE
            </div>
          </div>

          {/* DOCUMENT CARD */}
          <div className="card">
            <div className="card-header">
              <div className="title">
                <Icon.Doc /> Document DDR
              </div>

              <button className="btn" onClick={previewDoc}>
                Aperçu
              </button>
            </div>

            <div className="doc">
              <div className="doc-box">
                <div className="doc-top">
                  <div>
                    <div className="doc-title">DDR DOCUMENT</div>
                    <div className="doc-sub">AUTO GENERATED</div>
                  </div>
                  <div className="doc-meta">
                    <div>RDF-2024-001</div>
                    <div>02/10/2024</div>
                  </div>
                </div>

                <div className="lines">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>

                    <div className="seal">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check-icon lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
                    </div>
              </div>

              <p className="caption">
                Document généré automatiquement
              </p>
            </div>
          </div>

          {/* MOTIF */}
          <div className="card">
            <div className="section">MOTIF DU REFUS *</div>

            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Expliquez la raison du refus..."
              maxLength={1000}
            />

            <div className="count">{motif.length}/1000</div>
          </div>

          {/* GRID */}
          <div className="grid">

            {/* UPLOAD */}
            <div className="card">
              <div className="section">JUSTIFICATIONS COMPLÉMENTAIRES</div>

              <div
                className={`drop ${dragging ? "active" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  addFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-icon lucide-download"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
                <p>Glissez vos fichiers</p>
                <span>ou cliquez pour importer</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={(e) => addFiles(e.target.files)}
              />

              <div className="files">
                {files.map((f, i) => (
                  <div className="file" key={i}>
                    
                    <span>{f.name}</span>
                    <button onClick={() => removeFile(i)}>
                      
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="card side">
              <div className="section">LISTE DES DOCUMENTS</div>

              <div className="docItem">
               <input type="text" placeholder="Document"></input>
              </div>
              <div className="docItem">
                <input type="text" placeholder="Document"></input>
              </div>
              <div className="docItem">
                <input type="text" placeholder="Document"></input>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <button className="back" onClick={onBack}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-corner-down-left-icon lucide-corner-down-left"><path d="M20 4v7a4 4 0 0 1-4 4H4"/><path d="m9 10-5 5 5 5"/></svg>
          RETOUR
        </button>

        <button className="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "ENVOI..." : "SOUMETTRE LE REFUS"}
        </button>
      </div>
    </>
  );
}