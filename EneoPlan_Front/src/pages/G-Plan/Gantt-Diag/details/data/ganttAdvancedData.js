const data = [
  {
    id: 1,
    name: "Acier Laminé - Batch #203",
    ref: "PRD-2023-A92",
    type: "PRD",
    tasks: [
      { start: 1, end: 3, color: "green" },
    ],
  },
  {
    id: 2,
    name: "Unite demanderesse",
    ref: "TRP-FR-59-11",
    type: "TRP",
    alert: true,
    tasks: [
      { start: 2, end: 4, color: "gray" },
      { start: 2, end: 4, color: "blue" },
    ],
  },
  {
    id: 3,
    name: "Déploiement Retail Lyon",
    ref: "DST-L-012",
    type: "DST",
    tasks: [
      { start: 2, end: 4, color: "green" },
    ],
  },
  {
    id: 4,
    name: "Assemblage Unité C-1",
    ref: "PRD-2023-B14",
    type: "PRD",
    tasks: [
      { start: 0, end: 2, color: "light-green" },
    ],
  },
  {
    id: 5,
    name: "Transit Maritime Le Havre",
    ref: "TRP-MAR-920",
    type: "TRP",
    alert: true,
    tasks: [
      { start: 2, end: 4, color: "gray" },
      { start: 2, end: 4, color: "blue" },
    ],
  },
  {
    id: 6,
    name: "Réseau Distribution Ouest",
    ref: "DST-W-440",
    type: "DST",
    tasks: [
      { start: 1, end: 4, color: "gray" },
    ],
  },
];

export default data;