import React from 'react';
import { s } from './styles';
import { fmtEntier, fmtDecimal, fmtPct, libelleMois } from './format';

/** Tuile de synthèse : surtitre optionnel, valeur, libellé. */
export function Tuile({ surtitre, valeur, libelle, highlight = false }) {
  return (
    <div style={s.tuile(highlight)}>
      <div style={s.tuileSurtitre(highlight)}>{surtitre || ''}</div>
      <div style={s.tuileValeur(highlight)}>{valeur}</div>
      <div style={s.tuileLibelle(highlight)}>{libelle}</div>
    </div>
  );
}

/**
 * Les 12 tuiles de synthèse du rapport, sur deux rangées (7 puis 5).
 *
 * `tuiles` et `periode` proviennent tels quels de GET /travaux/rapport-suivi/.
 * Les durées moyennes sont affichées en heures décimales (`*_h`) : le rapport
 * de référence libelle « Heure, Minutes » mais la valeur y est bien décimale
 * (13 649,12 / 2 451 = 5,57). Le backend expose aussi `*_hhmm` si le métier
 * tranche dans l'autre sens.
 */
export default function Tuiles({ tuiles, periode }) {
  const moisM = libelleMois(periode?.annee, periode?.mois);
  const moisM1 = libelleMois(periode?.annee_m1, periode?.mois_m1);

  const rangee1 = [
    { surtitre: `Cumul au ${periode?.mois_libelle ?? ''}`, valeur: fmtEntier(tuiles.travaux_planifies_total_ytd), libelle: 'Travaux Planifiés (TP)' },
    { surtitre: moisM1, valeur: fmtEntier(tuiles.tp_m1_ytd_m1), libelle: 'TP M-1 / YTD M-1', highlight: true },
    { valeur: fmtEntier(tuiles.execute_mois_m), libelle: 'Exécuté mois M' },
    { valeur: fmtPct(tuiles.taux_execution_tp_pct), libelle: 'Taux exécution TP' },
    { valeur: fmtPct(tuiles.taux_conformite_mois_m_pct), libelle: 'Taux Conformité mois M' },
    { surtitre: 'Heures', valeur: fmtDecimal(tuiles.duree_moyenne_prevue_h), libelle: 'Durée Moyenne prévue' },
    { surtitre: 'Heures', valeur: fmtDecimal(tuiles.duree_moyenne_realisee_mois_m_h), libelle: 'Durée Moy Réalisée' },
  ];

  const rangee2 = [
    { valeur: fmtEntier(tuiles.tp_execute_alignement_ytd), libelle: 'TP exécuté Align' },
    { valeur: fmtEntier(tuiles.tp_non_executes_ytd), libelle: 'TP non exécuté' },
    { valeur: fmtEntier(tuiles.tp_annules_ytd), libelle: 'TP Annulé' },
    { valeur: fmtDecimal(tuiles.end_evitee_tpd_alignes_ytd_mwh), libelle: 'END évitée TPD alignés (MWH)' },
    { surtitre: moisM, valeur: fmtDecimal(tuiles.realisation_end_alignee_mois_m_mwh), libelle: 'Réalisation END Alignée', highlight: true },
  ];

  return (
    <>
      <div style={{ ...s.tuilesRangee, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        {rangee1.map((t, i) => <Tuile key={i} {...t} />)}
      </div>
      <div style={{ ...s.tuilesRangee, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 16 }}>
        {rangee2.map((t, i) => <Tuile key={i} {...t} />)}
      </div>
    </>
  );
}
