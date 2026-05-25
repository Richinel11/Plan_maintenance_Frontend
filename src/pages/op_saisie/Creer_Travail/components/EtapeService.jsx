import { CheckCircle2 } from "lucide-react";

/* ─── Données des entités métier ──────────────────────────────── */
const SERVICES = [
  {
    id: "transport",
    label: "Transport",
    subtitle: "Réseau Haute Tension & Lignes THT",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <path d="M8 36L24 8L40 36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 26H34" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="8" cy="36" r="3" fill="currentColor"/>
        <circle cx="40" cy="36" r="3" fill="currentColor"/>
        <circle cx="24" cy="8" r="3" fill="currentColor"/>
      </svg>
    ),
    color: "#1B75BB",
    lightColor: "#EBF5FF",
    borderColor: "#BFD9F2",
    gradient: "linear-gradient(135deg, #1B75BB 0%, #4DA6E8 100%)",
    fields: ["Segment", "Ouvrage", "Poste"],
    description: "Planification des travaux sur le réseau de transport d'électricité haute tension (HTB / THT).",
  },
  {
    id: "distribution",
    label: "Distribution",
    subtitle: "Réseau HTA/BT & Postes Sources",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <rect x="6" y="6" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="3"/>
        <rect x="26" y="6" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="3"/>
        <rect x="16" y="26" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="3"/>
        <path d="M14 22V29" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M34 22V29" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <path d="M14 29H34" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    color: "#059669",
    lightColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    gradient: "linear-gradient(135deg, #059669 0%, #34D399 100%)",
    fields: ["Segment", "Ouvrage", "Poste", "Départ"],
    description: "Planification des travaux sur le réseau de distribution moyenne et basse tension (HTA / BT).",
  },
  {
    id: "production",
    label: "Production",
    subtitle: "Centrales & Groupes de Production",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <path d="M24 6L28 18H40L30 26L34 38L24 30L14 38L18 26L8 18H20L24 6Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "#D97706",
    lightColor: "#FFFBEB",
    borderColor: "#FDE68A",
    gradient: "linear-gradient(135deg, #D97706 0%, #FBBF24 100%)",
    fields: ["Segment", "Ouvrage", "Poste"],
    description: "Planification des arrêts et travaux de maintenance sur les groupes de production thermique ou hydraulique.",
  },
];

/* ─── Composant principal ──────────────────────────────────────── */
export default function EtapeService({ service, onSelect }) {
  return (
    <div className="service-step-wrapper">

      {/* En-tête */}
      <div className="service-step-header">
        <div className="service-step-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#1B75BB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h2 className="service-step-title">Choisissez votre entité métier</h2>
          <p className="service-step-subtitle">
            Ce choix détermine les champs et les étapes disponibles pour votre travail.
          </p>
        </div>
      </div>

      {/* Grille des cartes */}
      <div className="service-cards-grid">
        {SERVICES.map((s) => {
          const isSelected = service === s.id;
          return (
            <button
              key={s.id}
              className={`service-card ${isSelected ? "service-card--selected" : ""}`}
              onClick={() => onSelect(s.id)}
              style={{
                "--card-color": s.color,
                "--card-light": s.lightColor,
                "--card-border": s.borderColor,
                "--card-gradient": s.gradient,
              }}
            >
              {/* Badge sélectionné */}
              {isSelected && (
                <div className="service-card-check">
                  <CheckCircle2 size={18} />
                </div>
              )}

              {/* Icône */}
              <div className="service-card-icon">
                {s.icon}
              </div>

              {/* Texte */}
              <div className="service-card-body">
                <span className="service-card-label">{s.label}</span>
                <span className="service-card-sub">{s.subtitle}</span>
                <p className="service-card-desc">{s.description}</p>
              </div>

              {/* Tags des champs inclus */}
              <div className="service-card-tags">
                {s.fields.map((f) => (
                  <span key={f} className="service-tag">{f}</span>
                ))}
              </div>

              {/* Barre de couleur en bas */}
              <div className="service-card-bar" />
            </button>
          );
        })}
      </div>

      {/* Message si aucun service sélectionné */}
      {!service && (
        <p className="service-hint">
          👆 Sélectionnez une entité pour continuer vers l'étape suivante.
        </p>
      )}
    </div>
  );
}
