
const mockData = [
  {
    id: 1,
    name: 'Acier Laminé - Batch #203',
    type: 'PRD',
    ref: 'PRD-2023-A92',
    alert: false,
    tasks: [
      { start: 1, end: 4, color: 'green' }
    ]
  },
  {
    id: 2,
    name: 'Unité demanderesse',
    type: 'TRP',
    ref: 'TRP-FR-59-11',
    alert: true,
    tasks: [
      { start: 2, end: 5, color: 'light-green' },
      { start: 3, end: 6, color: 'blue' }
    ]
  },
  {
    id: 3,
    name: 'Déploiement Retail Lyon',
    type: 'DST',
    ref: 'DST-L-012',
    alert: false,
    tasks: [
      { start: 3, end: 6, color: 'blue' }
    ]
  },
  {
    id: 4,
    name: 'Assemblage Unité C-1',
    type: 'PRD',
    ref: 'PRD-2023-B14',
    alert: false,
    tasks: [
      { start: 1, end: 3, color: 'green' }
    ]
  },
  {
    id: 5,
    name: 'Transit Maritime Le Havre',
    type: 'TRP',
    ref: 'TRP-MAR-920',
    alert: true,
    tasks: [
      { start: 0, end: 4, color: 'light-green' },
      { start: 3, end: 5, color: 'gray' }
    ]
  },
  {
    id: 6,
    name: 'Réseau Distribution Ouest',
    type: 'DST',
    ref: 'DST-W-440',
    alert: false,
    tasks: [
      { start: 2, end: 6, color: 'gray' },
      { start: 3, end: 6, color: 'blue' }
    ]
  }
];

export default mockData;
