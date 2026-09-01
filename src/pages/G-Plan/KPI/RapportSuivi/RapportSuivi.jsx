import React, { useCallback, useEffect, useState } from 'react';
import { RapportSuiviService } from '../../../../services/RapportSuiviService';
import { s } from './components/styles';
import { MOIS_LIBELLES, dateDuJour } from './components/format';
import Tuiles from './components/Tuiles';
import {
  TableauMatrice,
  TableauEvolution,
  TableauInterruptions,
  TableauAlignement,
} from './components/Tableaux';

/**
 * Rapport « Suivi des travaux prévisionnels ».
 *
 * Reproduit le rapport de référence du gestionnaire de planification
 * (src/assets/kpi.png) : 12 tuiles de synthèse + 5 tableaux, alimentés par un
 * unique appel GET /travaux/rapport-suivi/?annee=&mois=.
 *
 * Le sélecteur pilote le « Mois M » : les tuiles mensuelles portent sur ce
 * mois, les tableaux sur le cumul du 1er janvier à la fin de ce mois.
 */

const ANNEE_COURANTE = new Date().getFullYear();
const ANNEES = [ANNEE_COURANTE + 1, ANNEE_COURANTE, ANNEE_COURANTE - 1, ANNEE_COURANTE - 2];

export default function RapportSuivi() {
  const maintenant = new Date();
  const [annee, setAnnee] = useState(maintenant.getFullYear());
  const [mois, setMois] = useState(maintenant.getMonth() + 1);

  const [rapport, setRapport] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const charger = useCallback(async () => {
    try {
      setChargement(true);
      setErreur(null);
      const data = await RapportSuiviService.getRapportSuivi({ annee, mois });
      setRapport(data);
    } catch (err) {
      console.error('Erreur de chargement du rapport de suivi', err);
      const detail = err?.response?.data?.error || err?.response?.data?.detail;
      setErreur(
        err?.response?.status === 403
          ? "Vous n'avez pas les droits nécessaires pour consulter ce rapport."
          : detail || "Impossible de charger le rapport de suivi des travaux prévisionnels."
      );
      setRapport(null);
    } finally {
      setChargement(false);
    }
  }, [annee, mois]);

  useEffect(() => {
    charger();
  }, [charger]);

  const imprimer = () => window.print();

  const periode = rapport?.periode;

  return (
    <div style={s.page}>
      <div style={s.bandeau}>
        <h1 style={s.bandeauTitre}>Rapport suivi des travaux prévisionnels</h1>
        <span style={s.bandeauDate}>Données au {dateDuJour()}</span>
      </div>

      <div style={s.toolbar} className="no-print">
        <span style={s.toolbarLabel}>Mois M</span>
        <select
          style={s.select}
          value={mois}
          onChange={(e) => setMois(Number(e.target.value))}
          aria-label="Mois de référence"
        >
          {MOIS_LIBELLES.map((libelle, i) => (
            <option key={libelle} value={i + 1}>
              {libelle.charAt(0).toUpperCase() + libelle.slice(1)}
            </option>
          ))}
        </select>

        <select
          style={s.select}
          value={annee}
          onChange={(e) => setAnnee(Number(e.target.value))}
          aria-label="Année de référence"
        >
          {ANNEES.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <button style={s.bouton} onClick={charger} disabled={chargement}>
          {chargement ? 'Chargement…' : 'Actualiser'}
        </button>
        <button
          style={{ ...s.bouton, background: '#475569' }}
          onClick={imprimer}
          disabled={chargement || !rapport}
        >
          Imprimer / PDF
        </button>
      </div>

      {erreur && <div style={s.etatErreur}>{erreur}</div>}

      {chargement && !rapport && (
        <div style={s.etat}>Chargement du rapport…</div>
      )}

      {rapport && (
        <div style={{ ...s.corps, opacity: chargement ? 0.55 : 1, transition: 'opacity .15s' }}>
          <Tuiles tuiles={rapport.tuiles ?? {}} periode={periode} />

          <div style={s.colonnes}>
            <div>
              <TableauEvolution donnees={rapport.evolution_tp_par_segment} />
              <TableauMatrice
                titre="Nombre TP/segment et mois"
                cleLigne="segment"
                enteteLigne="Segment"
                donnees={rapport.nombre_tp_par_segment_et_mois}
              />
              <TableauInterruptions donnees={rapport.duree_interruptions_par_segment} />
            </div>

            <div>
              <TableauMatrice
                titre="Total TP par région et Mois"
                cleLigne="region"
                enteteLigne="Région"
                donnees={rapport.total_tp_par_region_et_mois}
              />
              <TableauAlignement donnees={rapport.travaux_executes_en_alignement} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
