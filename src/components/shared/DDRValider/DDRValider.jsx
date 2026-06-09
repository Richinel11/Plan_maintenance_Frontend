import React, { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { getDDR } from '../../../services/exploitationService';
import './DDRValider.css';

/**
 * DDRValider — composant partagé : aperçu DDR + import de documents justificatifs.
 *
 * Props :
 *   ddrId        {string}   — identifiant de la DDR à afficher
 *   onRetour     {function} — action du bouton RETOUR  (ex: navigate(-1))
 *   onSoumettre  {function} — reçoit { files, motif } en paramètre
 *   titre        {string}   — titre affiché en en-tête (défaut : "Planning Valider")
 *   submitLabel  {string}   — libellé du bouton soumettre (défaut : "SOUMETTRE")
 *   showMotif    {boolean}  — affiche la zone de texte motif (défaut : false)
 */
const DDRValider = ({
  ddrId,
  onRetour,
  onSoumettre,
  titre       = 'Planning Valider',
  submitLabel = 'SOUMETTRE',
  showMotif   = false,
}) => {
  const [ddr, setDdr]           = useState(null);
  const [files, setFiles]       = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [motif, setMotif]       = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!ddrId) return;
    getDDR(ddrId)
      .then(res => setDdr(res.data))
      .catch(() => toast.error('Impossible de charger la DDR.'));
  }, [ddrId]);

  const addFiles = useCallback((newFiles) => {
    setFiles(prev => [...prev, ...Array.from(newFiles)].slice(0, 10));
  }, []);

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSoumettre = async () => {
    if (showMotif && !motif.trim() && files.length === 0) {
      toast.error('Veuillez saisir un motif ou joindre un document.');
      return;
    }
    setLoading(true);
    try {
      await onSoumettre?.({ files, motif });
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="ddrv-page">

      {/* ── EN-TÊTE ─── */}
      <div className="ddrv-header">
        <h1 className="ddrv-title">{titre}</h1>
        <p className="ddrv-ref">
          Référence : <strong>{ddr?.reference ?? '—'}</strong>
        </p>
      </div>

      {/* ── APERÇU DDR ─── */}
      <div className="ddrv-card">
        <div className="ddrv-card-header">
          <div className="ddrv-card-title">
            <span className="material-symbols-outlined">description</span>
            Main DDR Document (System Generated)
          </div>
          <button className="ddrv-apercu-btn" onClick={() => onRetour?.()}>
            Aperçu
          </button>
        </div>

        <div className="ddrv-preview-wrap">
          <div className="ddrv-doc-box">
            <div className="ddrv-doc-top">
              <div>
                <div className="ddrv-doc-name">DDR DOCUMENT</div>
                <div className="ddrv-doc-sub">AUTOMATIC GENERATION</div>
              </div>
              <div className="ddrv-doc-meta">
                <div>{ddr?.reference ?? '—'}</div>
                <div>{fmtDate(ddr?.date_emission)}</div>
              </div>
            </div>

            <div className="ddrv-lines">
              <div /><div /><div />
            </div>
            <div className="ddrv-lines ddrv-lines-short">
              <div /><div />
            </div>

            <div className="ddrv-seal">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
          </div>

          <p className="ddrv-caption">
            Ce document est automatiquement généré à partir des informations de planification validées.
          </p>
        </div>
      </div>

      {/* ── DOCUMENTS ─── */}
      <div className="ddrv-docs-grid">

        {/* Zone upload */}
        <div className="ddrv-card">
          <div className="ddrv-section-label">JUSTIFICATIONS COMPLÉMENTAIRES</div>

          <div
            className={`ddrv-drop${dragging ? ' ddrv-drop--active' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="material-symbols-outlined ddrv-upload-icon">cloud_upload</span>
            <p className="ddrv-drop-main">Glissez-déposez vos fichiers ici</p>
            <span className="ddrv-drop-sub">ou cliquez pour parcourir vos documents</span>
            <div className="ddrv-formats">
              <span>PDF</span>
              <span>PNG</span>
              <span>JPG</span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={e => addFiles(e.target.files)}
          />
        </div>

        {/* Liste des documents */}
        <div className="ddrv-card">
          <div className="ddrv-section-label">Listes des Documents</div>

          {files.length === 0 ? (
            <p className="ddrv-empty">Aucun document ajouté</p>
          ) : (
            <div className="ddrv-file-list">
              {files.map((f, i) => (
                <div key={i} className="ddrv-file-item">
                  <span className="material-symbols-outlined ddrv-file-icon">attach_file</span>
                  <span className="ddrv-file-name">{f.name}</span>
                  <button className="ddrv-file-remove" onClick={() => removeFile(i)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── ZONE MOTIF (rejet) ─── */}
      {showMotif && (
        <div className="ddrv-card">
          <div className="ddrv-section-label">MOTIF DE REFUS</div>
          <div className="ddrv-motif-body">
            <textarea
              className="ddrv-motif-textarea"
              rows={4}
              placeholder="Rédigez ici le motif du refus… (optionnel si un document est joint)"
              value={motif}
              onChange={e => setMotif(e.target.value)}
            />
            <p className="ddrv-motif-hint">
              Vous pouvez saisir un motif textuel, joindre un document ci-dessus, ou les deux.
            </p>
          </div>
        </div>
      )}

      {/* ── FOOTER ─── */}
      <div className="ddrv-footer">
        <button className="ddrv-btn-retour" onClick={() => onRetour?.()}>
          <span className="material-symbols-outlined">arrow_back</span>
          RETOUR
        </button>
        <button className="ddrv-btn-soumettre" onClick={handleSoumettre} disabled={loading}>
          {loading ? 'ENVOI...' : submitLabel}
        </button>
      </div>

    </div>
  );
};

export default DDRValider;
