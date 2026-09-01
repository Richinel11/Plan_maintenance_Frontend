// Formatage FR aligné sur le rapport de référence : espace insécable comme
// séparateur de milliers, virgule décimale (2 451 — 2 235,50 — 41,29 %).

const nfEntier = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const nfDecimal = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const estVide = (v) => v === null || v === undefined || v === '';

/** Entier : 2451 -> "2 451". Une cellule à zéro reste vide, comme dans le rapport. */
export const fmtEntier = (v, { zeroVide = false } = {}) => {
  if (estVide(v)) return '';
  if (zeroVide && Number(v) === 0) return '';
  return nfEntier.format(Number(v));
};

/** Décimal : 2235.5 -> "2 235,50". */
export const fmtDecimal = (v) => (estVide(v) ? '' : nfDecimal.format(Number(v)));

/** Pourcentage : 41.29 -> "41,29 %". */
export const fmtPct = (v) => (estVide(v) ? '' : `${nfDecimal.format(Number(v))} %`);

export const MOIS_LIBELLES = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

/** (2026, 5) -> "Mois de mai 2026". */
export const libelleMois = (annee, mois) =>
  !annee || !mois ? '' : `Mois de ${MOIS_LIBELLES[mois - 1]} ${annee}`;

/** Date du jour au format long, pour le bandeau « Données au ... ». */
export const dateDuJour = () =>
  new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
