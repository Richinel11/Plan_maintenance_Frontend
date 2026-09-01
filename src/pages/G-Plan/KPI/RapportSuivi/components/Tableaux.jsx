import React from 'react';
import { s } from './styles';
import { fmtEntier, fmtDecimal, fmtPct } from './format';

/** Bloc encadré avec bandeau de titre, comme dans le rapport de référence. */
export function Bloc({ titre, children, style }) {
  // Les classes `rs-bloc` / `rs-scroll` ne servent qu'à l'impression : elles
  // permettent d'éviter les coupures de page au milieu d'un tableau et de
  // désactiver le défilement horizontal, qui sinon rogne les colonnes.
  return (
    <div className="rs-bloc" style={{ ...s.bloc, ...style }}>
      <div style={s.blocTitre}>{titre}</div>
      <div className="rs-scroll" style={s.scroll}>{children}</div>
    </div>
  );
}

function LigneVide({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ ...s.td, textAlign: 'center', color: '#94a3b8', padding: '18px 10px' }}>
        Aucune donnée sur la période
      </td>
    </tr>
  );
}

/**
 * Tableau matriciel « entité x mois » (Total TP par région et Mois,
 * Nombre TP/segment et mois).
 *
 * Les colonnes sont pilotées par `colonnes_mois` renvoyé par l'API, et non par
 * les clés de `par_mois` : la ligne Total est sérialisée depuis un dict simple
 * côté Django, son ordre de clés n'est pas garanti.
 */
export function TableauMatrice({ titre, cleLigne, enteteLigne, donnees }) {
  const colonnes = donnees?.colonnes_mois ?? [];
  const lignes = donnees?.lignes ?? [];
  const total = donnees?.total;
  const nbColonnes = colonnes.length + 2;

  return (
    <Bloc titre={titre}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={{ ...s.th, ...s.thGauche }}>{enteteLigne}</th>
            {colonnes.map((m) => (
              <th key={m} style={s.th}>{m}</th>
            ))}
            <th style={s.th}>Total</th>
          </tr>
        </thead>
        <tbody>
          {lignes.length === 0 ? (
            <LigneVide colSpan={nbColonnes} />
          ) : (
            lignes.map((ligne, i) => (
              <tr key={`${ligne[cleLigne]}-${i}`}>
                <td style={{ ...s.td, fontWeight: 600 }}>{ligne[cleLigne]}</td>
                {colonnes.map((m) => (
                  <td key={m} style={{ ...s.td, ...s.tdNum }}>
                    {fmtEntier(ligne.par_mois?.[m], { zeroVide: true })}
                  </td>
                ))}
                <td style={{ ...s.td, ...s.tdNum, fontWeight: 600 }}>
                  {fmtEntier(ligne.total, { zeroVide: true })}
                </td>
              </tr>
            ))
          )}
          {total && (
            <tr style={s.ligneTotal}>
              <td style={s.td}>Total</td>
              {colonnes.map((m) => (
                <td key={m} style={{ ...s.td, ...s.tdNum }}>
                  {fmtEntier(total.par_mois?.[m], { zeroVide: true })}
                </td>
              ))}
              <td style={{ ...s.td, ...s.tdNum }}>{fmtEntier(total.total)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </Bloc>
  );
}

/** Table B : Evolution des TP mois en cours Vs M-1. */
export function TableauEvolution({ donnees }) {
  const lignes = donnees?.lignes ?? [];
  const total = donnees?.total;

  const cellules = (l) => (
    <>
      <td style={{ ...s.td, ...s.tdNum }}>{fmtEntier(l.travaux_planifies, { zeroVide: true })}</td>
      <td style={{ ...s.td, ...s.tdNum }}>{fmtEntier(l.tp_m1_ytd_m1, { zeroVide: true })}</td>
      <td style={{ ...s.td, ...s.tdNum }}>{fmtPct(l.taux_execution_travaux_pct)}</td>
      <td style={{ ...s.td, ...s.tdNum }}>{fmtPct(l.taux_conformite_planning_reference_pct)}</td>
      <td style={{ ...s.td, ...s.tdNum }}>{fmtDecimal(l.gain_end_alignes_tpd_mwh)}</td>
    </>
  );

  return (
    <Bloc titre="Evolution des TP mois en cours Vs M-1">
      <table style={s.table}>
        <thead>
          <tr>
            <th style={{ ...s.th, ...s.thGauche }}>Segment</th>
            <th style={s.th}>Travaux planifiés</th>
            <th style={s.th}>TP M-1 / YTD M-1</th>
            <th style={s.th}>Taux exécution travaux</th>
            <th style={s.th}>Taux conformité planning référence</th>
            <th style={s.th}>Gain en END TPD alignés (MWH)</th>
          </tr>
        </thead>
        <tbody>
          {lignes.length === 0 ? (
            <LigneVide colSpan={6} />
          ) : (
            lignes.map((l) => (
              <tr key={l.segment}>
                <td style={{ ...s.td, fontWeight: 600 }}>{l.segment}</td>
                {cellules(l)}
              </tr>
            ))
          )}
          {total && (
            <tr style={s.ligneTotal}>
              <td style={s.td}>Total</td>
              {cellules(total)}
            </tr>
          )}
        </tbody>
      </table>
    </Bloc>
  );
}

/** Table D : Durée des interruptions TP par segment. */
export function TableauInterruptions({ donnees }) {
  const lignes = donnees?.lignes ?? [];
  const total = donnees?.total;

  const cellules = (l) => (
    <>
      <td style={{ ...s.td, ...s.tdNum }}>{fmtDecimal(l.indisponibilite_prevue_h)}</td>
      <td style={{ ...s.td, ...s.tdNum }}>{fmtDecimal(l.indisponibilite_realisee_h)}</td>
      <td style={{ ...s.td, ...s.tdNum }}>{fmtDecimal(l.duree_moyenne_prevue_h)}</td>
      <td style={{ ...s.td, ...s.tdNum }}>{fmtDecimal(l.duree_moyenne_realisee_h)}</td>
    </>
  );

  return (
    <Bloc titre="Durée des interruptions TP par segment">
      <table style={s.table}>
        <thead>
          <tr>
            <th style={{ ...s.th, ...s.thGauche }}>Segment</th>
            <th style={s.th}>Indisponibilité prévue (h)</th>
            <th style={s.th}>Indisponibilité Réalisée (h)</th>
            <th style={s.th}>Durée Moyenne prévue</th>
            <th style={s.th}>Durée Moyenne Réalisée</th>
          </tr>
        </thead>
        <tbody>
          {lignes.length === 0 ? (
            <LigneVide colSpan={5} />
          ) : (
            lignes.map((l) => (
              <tr key={l.segment}>
                <td style={{ ...s.td, fontWeight: 600 }}>{l.segment}</td>
                {cellules(l)}
              </tr>
            ))
          )}
          {total && (
            <tr style={s.ligneTotal}>
              <td style={s.td}>Total</td>
              {cellules(total)}
            </tr>
          )}
        </tbody>
      </table>
    </Bloc>
  );
}

/** Table E : Travaux exécutés en alignement. */
export function TableauAlignement({ donnees }) {
  const lignes = donnees?.lignes ?? [];
  const total = donnees?.total;

  return (
    <Bloc titre="Travaux exécutés en alignement">
      <table style={s.table}>
        <thead>
          <tr>
            <th style={{ ...s.th, ...s.thGauche }}>Segment</th>
            <th style={s.th}>Total Travaux</th>
            <th style={{ ...s.th, ...s.thGauche }}>Status</th>
            <th style={s.th}>Durée Réalisée (h)</th>
          </tr>
        </thead>
        <tbody>
          {lignes.length === 0 ? (
            <LigneVide colSpan={4} />
          ) : (
            lignes.map((l) => (
              <tr key={l.segment}>
                <td style={{ ...s.td, fontWeight: 600 }}>{l.segment}</td>
                <td style={{ ...s.td, ...s.tdNum }}>{fmtEntier(l.total_travaux)}</td>
                <td style={s.td}>{l.status}</td>
                <td style={{ ...s.td, ...s.tdNum }}>{fmtDecimal(l.duree_realisee_h)}</td>
              </tr>
            ))
          )}
          {total && (
            <tr style={s.ligneTotal}>
              <td style={s.td}>Total</td>
              <td style={{ ...s.td, ...s.tdNum }}>{fmtEntier(total.total_travaux)}</td>
              <td style={s.td}>{total.status}</td>
              <td style={{ ...s.td, ...s.tdNum }}>{fmtDecimal(total.duree_realisee_h)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </Bloc>
  );
}
