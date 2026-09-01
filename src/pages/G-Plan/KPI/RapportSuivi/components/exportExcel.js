import * as XLSX from 'xlsx';
import { MOIS_LIBELLES } from './format';

/**
 * Export Excel du rapport « Suivi des travaux prévisionnels ».
 *
 * Un classeur, six feuilles : la synthèse (les 12 tuiles) puis les 5 tableaux,
 * dans le même ordre que la page.
 *
 * Les valeurs sont écrites en **nombres**, pas en texte formaté : le rapport
 * reste exploitable dans Excel (tris, formules, TCD). Le formatage FR est une
 * affaire d'affichage, il n'a pas à contaminer le fichier exporté.
 */

/** Cellule numérique : null plutôt que 0 pour laisser la case vide, comme le rapport. */
const num = (v, { zeroVide = false } = {}) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  if (zeroVide && n === 0) return null;
  return n;
};

/** Largeurs de colonnes : première colonne large (libellés), le reste régulier. */
const largeurs = (nbColonnes, premiere = 26, autres = 13) => [
  { wch: premiere },
  ...Array.from({ length: nbColonnes - 1 }, () => ({ wch: autres })),
];

function feuilleSynthese(tuiles, periode) {
  const lignes = [
    ['Indicateur', 'Valeur', 'Unité'],
    ['Travaux Planifiés (TP) — cumul', num(tuiles.travaux_planifies_total_ytd), 'travaux'],
    ['TP M-1 / YTD M-1', num(tuiles.tp_m1_ytd_m1), 'travaux'],
    ['Exécuté mois M', num(tuiles.execute_mois_m), 'travaux'],
    ["Taux d'exécution TP", num(tuiles.taux_execution_tp_pct), '%'],
    ['Taux de conformité mois M', num(tuiles.taux_conformite_mois_m_pct), '%'],
    ['Durée moyenne prévue', num(tuiles.duree_moyenne_prevue_h), 'heures'],
    ['Durée moyenne réalisée', num(tuiles.duree_moyenne_realisee_mois_m_h), 'heures'],
    ['TP exécuté en alignement', num(tuiles.tp_execute_alignement_ytd), 'travaux'],
    ['TP non exécuté', num(tuiles.tp_non_executes_ytd), 'travaux'],
    ['TP annulé', num(tuiles.tp_annules_ytd), 'travaux'],
    ['END évitée TPD alignés', num(tuiles.end_evitee_tpd_alignes_ytd_mwh), 'MWh'],
    ['Réalisation END alignée (mois M)', num(tuiles.realisation_end_alignee_mois_m_mwh), 'MWh'],
  ];

  const entete = [
    ['RAPPORT SUIVI DES TRAVAUX PREVISIONNELS'],
    [`Période : ${periode?.mois_libelle ?? ''}`],
    ['Tableaux en cumul du 1er janvier à la fin du mois M'],
    [],
  ];

  const ws = XLSX.utils.aoa_to_sheet([...entete, ...lignes]);
  ws['!cols'] = [{ wch: 36 }, { wch: 14 }, { wch: 10 }];
  return ws;
}

function feuilleMatrice(donnees, cleLigne, enteteLigne) {
  const colonnes = donnees?.colonnes_mois ?? [];
  const lignes = donnees?.lignes ?? [];
  const total = donnees?.total;

  const aoa = [[enteteLigne, ...colonnes, 'Total']];

  lignes.forEach((l) => {
    aoa.push([
      l[cleLigne],
      ...colonnes.map((m) => num(l.par_mois?.[m], { zeroVide: true })),
      num(l.total, { zeroVide: true }),
    ]);
  });

  if (total) {
    aoa.push([
      'Total',
      ...colonnes.map((m) => num(total.par_mois?.[m], { zeroVide: true })),
      num(total.total),
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = largeurs(colonnes.length + 2, 22, 11);
  return ws;
}

function feuilleEvolution(donnees) {
  const lignes = donnees?.lignes ?? [];
  const total = donnees?.total;

  const cellules = (l) => [
    num(l.travaux_planifies, { zeroVide: true }),
    num(l.tp_m1_ytd_m1, { zeroVide: true }),
    num(l.taux_execution_travaux_pct),
    num(l.taux_conformite_planning_reference_pct),
    num(l.gain_end_alignes_tpd_mwh),
  ];

  const aoa = [[
    'Segment',
    'Travaux planifiés',
    'TP M-1 / YTD M-1',
    "Taux exécution travaux (%)",
    'Taux conformité planning référence (%)',
    'Gain en END TPD alignés (MWh)',
  ]];

  lignes.forEach((l) => aoa.push([l.segment, ...cellules(l)]));
  if (total) aoa.push(['Total', ...cellules(total)]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 32 }, { wch: 28 }];
  return ws;
}

function feuilleInterruptions(donnees) {
  const lignes = donnees?.lignes ?? [];
  const total = donnees?.total;

  const cellules = (l) => [
    num(l.indisponibilite_prevue_h),
    num(l.indisponibilite_realisee_h),
    num(l.duree_moyenne_prevue_h),
    num(l.duree_moyenne_realisee_h),
  ];

  const aoa = [[
    'Segment',
    'Indisponibilité prévue (h)',
    'Indisponibilité réalisée (h)',
    'Durée moyenne prévue (h)',
    'Durée moyenne réalisée (h)',
  ]];

  lignes.forEach((l) => aoa.push([l.segment, ...cellules(l)]));
  if (total) aoa.push(['Total', ...cellules(total)]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 16 }, { wch: 24 }, { wch: 24 }, { wch: 22 }, { wch: 22 }];
  return ws;
}

function feuilleAlignement(donnees) {
  const lignes = donnees?.lignes ?? [];
  const total = donnees?.total;

  const aoa = [['Segment', 'Total travaux', 'Statut', 'Durée réalisée (h)']];

  lignes.forEach((l) =>
    aoa.push([l.segment, num(l.total_travaux), l.status, num(l.duree_realisee_h)])
  );
  if (total) {
    aoa.push(['Total', num(total.total_travaux), total.status || '', num(total.duree_realisee_h)]);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 16 }, { wch: 14 }, { wch: 24 }, { wch: 18 }];
  return ws;
}

/** Nom de fichier : rapport_suivi_travaux_septembre_2026.xlsx */
function nomFichier(annee, mois) {
  const nom = MOIS_LIBELLES[mois - 1] ?? '';
  // NFD sépare la lettre de son accent, la plage ̀-ͯ retire les
  // diacritiques : "février" -> "fevrier" (nom de fichier sans accent).
  const sansAccent = nom.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return `rapport_suivi_travaux_${sansAccent}_${annee}.xlsx`;
}

/**
 * Construit et télécharge le classeur.
 * Lève une exception en cas d'échec — l'appelant gère le retour utilisateur.
 */
export function exporterRapportExcel(rapport, annee, mois) {
  if (!rapport) throw new Error('Aucune donnée à exporter');

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, feuilleSynthese(rapport.tuiles ?? {}, rapport.periode), 'Synthèse');
  XLSX.utils.book_append_sheet(wb, feuilleEvolution(rapport.evolution_tp_par_segment), 'Évolution M vs M-1');
  XLSX.utils.book_append_sheet(
    wb,
    feuilleMatrice(rapport.nombre_tp_par_segment_et_mois, 'segment', 'Segment'),
    'TP par segment et mois'
  );
  XLSX.utils.book_append_sheet(
    wb,
    feuilleMatrice(rapport.total_tp_par_region_et_mois, 'region', 'Région'),
    'TP par région et mois'
  );
  XLSX.utils.book_append_sheet(
    wb,
    feuilleInterruptions(rapport.duree_interruptions_par_segment),
    'Durées interruptions'
  );
  XLSX.utils.book_append_sheet(
    wb,
    feuilleAlignement(rapport.travaux_executes_en_alignement),
    'Exécutés en alignement'
  );

  XLSX.writeFile(wb, nomFichier(annee, mois));
}

export default exporterRapportExcel;
