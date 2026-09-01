import React from 'react';
// `.cp-*` est le vocabulaire commun de l'enveloppe « document » (grille deux
// colonnes + blocs de l'aside). Il vit dans ConsultationPage.css, que ce
// composant importe lui-même pour rester autonome quelle que soit la page hôte.
import '../../../pages/Responsable/Consultation/ConsultationPage.css';
import './DDRContextAside.css';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const fmtTaille = (octets) => {
  if (!octets) return '';
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
};

const statusMeta = {
  EN_ATTENTE: { label: 'En attente', color: 'orange' },
  COMPLETEE:  { label: 'En attente', color: 'green'  },
  AUTORISE:   { label: 'Autorisé',   color: 'green'  },
  REFUSE:     { label: 'Refusé',     color: 'red'    },
  REPORTE:    { label: 'Reporté',    color: 'orange' },
};

/**
 * Panneau de contexte d'une DDR — colonne gauche de l'enveloppe `cp-layout`.
 *
 * Il est `position: sticky` : le contexte reste sous les yeux pendant que
 * l'utilisateur fait défiler le document, ce qui compte particulièrement quand
 * il corrige un refus et doit garder le motif visible.
 *
 * Props :
 *   ddr         {object}   — la DDR (null pendant le chargement)
 *   titre       {string}   — titre de la colonne (ex : "TRAITEMENT DDR")
 *   retourLabel {string}   — libellé du bouton retour
 *   onRetour    {function} — action du bouton retour
 *   children    {node}     — blocs supplémentaires, ajoutés en bas de l'aside
 */
const DDRContextAside = ({
  ddr,
  titre,
  retourLabel = 'Retour',
  onRetour,
  children,
}) => {
  if (!ddr) return null;

  const travail  = ddr.travail;
  const planning = travail?.planning;
  const statut   = statusMeta[ddr.statut] || { label: ddr.statut, color: 'grey' };

  // Une DDR refusée montre le refus en cours ; une DDR corrigée et resoumise
  // (COMPLETEE avec un motif conservé) en montre la trace, sur un ton plus doux.
  const refusEnCours   = ddr.statut === 'REFUSE';
  const refusPrecedent = ddr.statut === 'COMPLETEE' && !!ddr.motif_refus;
  const afficherRefus  = refusEnCours || refusPrecedent;

  return (
    <aside className="cp-aside">

      <button className="cp-retour" onClick={onRetour}>
        <span className="material-symbols-outlined">arrow_back</span>
        {retourLabel}
      </button>

      {titre && <div className="cp-aside-title">{titre}</div>}

      {/* Statut */}
      <div className="cp-block">
        <div className="cp-block-label">STATUT DU DOCUMENT</div>
        <div className={`cp-statut cp-statut--${statut.color}`}>
          <span className="cp-statut-dot" />
          {statut.label}
        </div>
        <div className="cp-statut-date">Émis le {fmtDate(ddr.date_emission)}</div>
        {ddr.decide_par_nom && (
          <div className="cp-statut-date">Décidé par {ddr.decide_par_nom}</div>
        )}
      </div>

      {/* Refus : en cours, ou trace d'un refus déjà corrigé */}
      {afficherRefus && (
        <div className={`ddr-ctx-refus ddr-ctx-refus--${refusEnCours ? 'actif' : 'historique'}`}>
          <div className="ddr-ctx-refus-head">
            <span className="material-symbols-outlined ddr-ctx-refus-icon">
              {refusEnCours ? 'block' : 'history'}
            </span>
            <span className="ddr-ctx-refus-titre">
              {refusEnCours ? 'DDR refusée' : 'Refus précédent — corrigée et resoumise'}
            </span>
          </div>

          <div className="ddr-ctx-refus-label">Motif</div>
          <p className="ddr-ctx-refus-motif">{ddr.motif_refus || '—'}</p>

          {ddr.date_decision && (
            <div className="ddr-ctx-refus-date">
              Refusée le {fmtDate(ddr.date_decision)}
              {ddr.decide_par_nom ? ` par ${ddr.decide_par_nom}` : ''}
            </div>
          )}

          {ddr.pieces_jointes?.length > 0 && (
            <>
              <div className="ddr-ctx-refus-label">Documents justificatifs</div>
              <ul className="ddr-ctx-refus-files">
                {ddr.pieces_jointes.map(p => (
                  <li key={p.id}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      <span className="material-symbols-outlined">attach_file</span>
                      {p.nom_original}
                    </a>
                    <span className="ddr-ctx-refus-taille">{fmtTaille(p.taille)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {refusPrecedent && (
            <p className="ddr-ctx-refus-hint">
              Vérifiez que les corrections apportées répondent à ce motif avant de décider.
            </p>
          )}
        </div>
      )}

      {/* Métadonnées */}
      <div className="cp-block">
        <div className="cp-block-label">MÉTADONNÉES</div>
        <div className="cp-meta-list">
          <div className="cp-meta-item">
            <span className="cp-meta-key">Référence</span>
            <span className="cp-meta-val">{ddr.reference || '—'}</span>
          </div>
          <div className="cp-meta-item">
            <span className="cp-meta-key">Segment</span>
            <span className="cp-meta-val">{travail?.segment || '—'}</span>
          </div>
          <div className="cp-meta-item">
            <span className="cp-meta-key">Émis par</span>
            <span className="cp-meta-val">{ddr.emis_par_nom || '—'}</span>
          </div>
        </div>
      </div>

      {/* Planning lié */}
      <div className="cp-block">
        <div className="cp-block-label">PLANNING LIÉ</div>
        {planning ? (
          <div className="cp-doc-item">
            <div className="cp-doc-icon">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <div className="cp-doc-info">
              <div className="cp-doc-name">{planning.nom || 'Planning'}</div>
              <div className="cp-doc-sub">Code : {planning.code || '—'}</div>
              <div className="cp-doc-sub">Créé le {fmtDate(planning.date_creation)}</div>
            </div>
          </div>
        ) : (
          <p className="cp-doc-empty">Aucun planning associé</p>
        )}
      </div>

      {children}

    </aside>
  );
};

export default DDRContextAside;
