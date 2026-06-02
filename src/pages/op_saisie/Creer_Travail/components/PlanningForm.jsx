import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  CheckCircle2,
  X,
  MapPin,
  Zap,
  Building2,
  Navigation,
  Loader2,
} from "lucide-react";
import { getReferenceById } from "../../../../services/referencetielService";
import SearchableSelect from "./SearchableSelect";

/* ────────────────────────────────────────────────────────────
   Composant champ lecture seule (auto-rempli)
 ──────────────────────────────────────────────────────────── */
function AutoFilledField({ label, value, icon }) {
  const isEmpty = !value;
  return (
    <div className="select-group">
      <label className="field-label">{label}</label>
      <div
        className="autofill-value"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "11px 14px",
          background: isEmpty ? "#F8FAFC" : "#F0FDF4",
          border: `1px solid ${isEmpty ? "#E2E8F0" : "#BBF7D0"}`,
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 500,
          color: isEmpty ? "#94A3B8" : "#166534",
          minHeight: 44,
          fontFamily: "Inter, sans-serif",
          transition: "all 0.25s ease",
        }}
      >
        {icon && (
          <span style={{ color: isEmpty ? "#CBD5E1" : "#16A34A", flexShrink: 0 }}>
            {icon}
          </span>
        )}
        {isEmpty ? (
          <span style={{ fontStyle: "italic", fontWeight: 400 }}>
            — sélectionnez une référence —
          </span>
        ) : (
          <span>{value}</span>
        )}
        {!isEmpty && (
          <CheckCircle2
            size={14}
            style={{ marginLeft: "auto", color: "#16A34A", flexShrink: 0 }}
          />
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Composant principal PlanningForm
 ──────────────────────────────────────────────────────────── */
export default function PlanningForm({
  formData,
  onChange,
  references = [],
  typesActivite,
  fields = [],
  options = {},
  errors = {},
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRef, setSelectedRef] = useState(null);
  const [refLoading, setRefLoading] = useState(false);
  const [uniteDemanderesseOptions, setUniteDemanderesseOptions] = useState([]);
  const wrapperRef = useRef(null);

  const getOptionLabel = (opt) => {
    if (!opt) return "";
    if (typeof opt === "object") {
      return (
        opt.valeur ||
        opt.nom ||
        opt.libelle ||
        opt.name ||
        opt.username ||
        `${opt.first_name || ""} ${opt.last_name || ""}`.trim() ||
        `ID: ${opt.id || ""}`
      );
    }
    return String(opt);
  };

  const buildUniteDemanderesseOptions = useCallback((details = {}) => {
    const explicitUnits = [];
    if (Array.isArray(details.unites_demanderesses)) explicitUnits.push(...details.unites_demanderesses);
    if (Array.isArray(details.unite_demanderesses)) explicitUnits.push(...details.unite_demanderesses);
    if (explicitUnits.length > 0) {
      return explicitUnits.map((item, index) => ({
        id: item.id ?? `reference-unite-${index}`,
        valeur: getOptionLabel(item),
      }));
    }

    if (!Array.isArray(details.items)) return [];
    return details.items
      .filter((item) => {
        const typeName = (item.type?.nom || item.type?.name || "").toString().toLowerCase();
        return (
          typeName.includes("unite") ||
          typeName.includes("unité") ||
          typeName.includes("demander") ||
          typeName.includes("demanderesse")
        );
      })
      .map((item, index) => ({
        id: item.id ?? `reference-item-unite-${index}`,
        valeur: getOptionLabel(item),
      }));
  }, []);

  const isFieldVisible = (field) => fields.includes(field);

  /* Ferme le dropdown si on clique ailleurs */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* Filtre les références selon la saisie */
  const filteredRefs = references.filter((ref) => {
    const label = ref.valeur || ref.code || ref.reference || ref.nom || ref.libelle || `REF-${ref.id}`;
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  /* Synchronise selectedRef au montage ou changement de reference_id */
  useEffect(() => {
    if (formData.reference_id && references.length > 0) {
      const ref = references.find((r) => String(r.id) === String(formData.reference_id));
      if (ref) {
        setSelectedRef(ref);
        const label = ref.valeur || ref.code || ref.reference || ref.nom || ref.libelle || `REF-${ref.id}`;
        setSearchTerm(label);
      }
    } else if (!formData.reference_id) {
      setSelectedRef(null);
      setSearchTerm("");
    }
  }, [formData.reference_id, references]);

  /* Charge les détails complets (avec items) de la référence */
  useEffect(() => {
    if (formData.reference_id) {
      const fetchDetails = async () => {
        try {
          const details = await getReferenceById(formData.reference_id);
          setSelectedRef(details);
          setUniteDemanderesseOptions(buildUniteDemanderesseOptions(details));
        } catch (err) {
          console.error("Erreur initialisation référence:", err);
        }
      };
      fetchDetails();
    }
  }, [formData.reference_id, buildUniteDemanderesseOptions]);

  /**
   * Correspondance flexible entre les noms de TypeReferentiel du backend
   * et les champs du formulaire frontend.
   */
  const FIELD_ALIASES = {
    Segments: ["segment", "segments", "localisation", "zone", "secteur", "localité", "localite"],
    Ouvrages: ["ouvrage", "ouvrages", "ligne", "equipement", "équipement", "installation"],
    Poste:    ["poste", "postes", "poste source", "poste hta", "poste htb"],
    Departs:  ["depart", "départ", "departs", "départs", "feeder", "alimentation"],
    Troncons: ["troncon", "tronçon", "troncons", "tronçons", "artere", "artère", "section"],
  };

  /**
   * Extrait la valeur d'un item de la référence en testant les alias.
   */
  const findItemByField = (items, fieldKey) => {
    if (!items || !Array.isArray(items)) return "";
    const aliases = FIELD_ALIASES[fieldKey] || [];
    const item = items.find((it) => {
      if (!it.type?.nom) return false;
      const nom = it.type.nom.toLowerCase().trim();
      return aliases.some((alias) => nom === alias || nom.startsWith(alias) || nom.includes(alias));
    });
    return item ? item.valeur : "";
  };

  /**
   * Applique tous les champs auto-remplis.
   */
  const applyReferenceItems = (items) => {
    if (!items || !Array.isArray(items)) return;
    onChange("Segments", findItemByField(items, "Segments"));
    onChange("Ouvrages", findItemByField(items, "Ouvrages"));
    onChange("Poste",    findItemByField(items, "Poste"));
    onChange("Departs",  findItemByField(items, "Departs"));
    onChange("Troncons", findItemByField(items, "Troncons"));
  };

  /* Sélection d'une référence → appel API pour récupérer les champs liés */
  const handleSelectReference = async (ref) => {
    const label = ref.valeur || ref.code || ref.reference || ref.nom || ref.libelle || `REF-${ref.id}`;
    setSelectedRef(ref);
    setSearchTerm(label);
    setIsOpen(false);
    setRefLoading(true);

    /* Mise à jour immédiate de la référence dans le formulaire */
    onChange("reference_id", ref.id);
    onChange("Reference", label);

    try {
      const details = await getReferenceById(ref.id);
      setSelectedRef(details);
      setUniteDemanderesseOptions(buildUniteDemanderesseOptions(details));
      console.log('[PlanningForm] items de la référence reçus du backend:', details.items);
      if (details.items) {
        details.items.forEach(it => console.log('  → type.nom:', it.type?.nom, '| valeur:', it.valeur));
      }
      applyReferenceItems(details.items);
    } catch (err) {
      console.error("Erreur chargement détails référence :", err);
      applyReferenceItems(ref.items);
      setUniteDemanderesseOptions(buildUniteDemanderesseOptions(ref));
    } finally {
      setRefLoading(false);
    }
  };

  /* Réinitialiser la référence */
  const handleClearReference = () => {
    setSelectedRef(null);
    setSearchTerm("");
    setUniteDemanderesseOptions([]);
    onChange("reference_id", null);
    onChange("Reference", "");
    onChange("Segments", "");
    onChange("Ouvrages", "");
    onChange("Poste", "");
    onChange("Departs", "");
    onChange("Troncons", "");
    onChange("unite_demanderesse_id", "");
    onChange("Unite_demanderesse", "");
  };

  // Labels affichés dans les champs auto-remplis
  const itemsForDisplay = selectedRef?.items || [];
  const segmentLabel = formData.Segments || findItemByField(itemsForDisplay, "Segments");
  const ouvrageLabel = formData.Ouvrages || findItemByField(itemsForDisplay, "Ouvrages");
  const posteLabel   = formData.Poste    || findItemByField(itemsForDisplay, "Poste");
  const departLabel  = formData.Departs  || findItemByField(itemsForDisplay, "Departs");


  const hasReference = !!formData.reference_id;

  return (
    <div className="step-one-container">

      {/* ── SECTION RECHERCHE DE RÉFÉRENCE ── */}
      <div className="ref-section">

        <div className="field-row" style={{ marginBottom: 12 }}>
          <label className="label-main">
            Référence
            <span className="required-star">*</span>
          </label>
          <div className="badge-auto" style={{ background: hasReference ? "#dcfce7" : "#f1f5f9", color: hasReference ? "#166534" : "#64748b", border: `1px solid ${hasReference ? "#bbf7d0" : "#e2e8f0"}` }}>
            <Search size={10} style={{ marginRight: 3 }} />
            <span>{hasReference ? "SÉLECTIONNÉE" : "RECHERCHE"}</span>
          </div>
        </div>

        {/* Champ de recherche */}
        <div ref={wrapperRef} style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 14px",
              background: "white",
              border: `1.5px solid ${errors.Reference ? "#EF4444" : isOpen ? "#1B75BB" : hasReference ? "#BBF7D0" : "#E2E8F0"}`,
              borderRadius: 10,
              boxShadow: errors.Reference ? "0 0 0 3px #FEF2F2" : isOpen ? "0 0 0 3px #EBF5FF" : hasReference ? "0 0 0 3px #F0FDF4" : "none",
              cursor: "text",
              transition: "all 0.2s ease",
            }}
            onClick={() => { setIsOpen(true); }}
          >
            <Search size={16} color={hasReference ? "#16A34A" : "#94A3B8"} style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
                if (!e.target.value) handleClearReference();
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Rechercher une référence (ex: Littoral-Ligne90kV-Deido)..."
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: 14,
                fontFamily: "Inter, sans-serif",
                color: hasReference ? "#166534" : "#334155",
                background: "transparent",
                fontWeight: hasReference ? 600 : 400,
              }}
            />
            {hasReference && (
              <button
                onClick={(e) => { e.stopPropagation(); handleClearReference(); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 2,
                  color: "#94A3B8",
                  flexShrink: 0,
                }}
                title="Effacer la référence"
              >
                {refLoading
                  ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  : <X size={14} />}
              </button>
            )}
          </div>

          {/* Dropdown des résultats */}
          {isOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                background: "white",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                zIndex: 1000,
                maxHeight: 280,
                overflowY: "auto",
              }}
            >
              {filteredRefs.length === 0 ? (
                <div
                  style={{
                    padding: "20px 16px",
                    textAlign: "center",
                    color: "#94A3B8",
                    fontSize: 13,
                    fontStyle: "italic",
                  }}
                >
                  Aucune référence trouvée pour « {searchTerm} »
                </div>
              ) : (
                filteredRefs.map((ref) => {
                  const label = ref.valeur || ref.code || ref.reference || ref.nom || ref.libelle || `REF-${ref.id}`;
                  const isSelected = formData.reference_id === ref.id;
                  return (
                    <div
                      key={ref.id}
                      onClick={() => handleSelectReference(ref)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        cursor: "pointer",
                        background: isSelected ? "#EBF5FF" : "white",
                        borderBottom: "1px solid #F1F5F9",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "#F8FAFC";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "white";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: isSelected ? "#1B75BB" : "#EBF5FF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <MapPin size={14} color={isSelected ? "white" : "#1B75BB"} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>
                            {label}
                          </div>
                          {ref.items && (
                            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                              {[
                                ref.items.find(it => it.type && it.type.nom.toLowerCase() === "segment")?.valeur,
                                ref.items.find(it => it.type && it.type.nom.toLowerCase() === "ouvrage")?.valeur,
                              ].filter(Boolean).join(" · ")}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={16} color="#1B75BB" style={{ flexShrink: 0 }} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Message d'aide */}
        {!hasReference && (
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#94A3B8", fontStyle: "italic" }}>
            💡 Sélectionnez une référence pour remplir automatiquement les champs ci-dessous.
          </p>
        )}
        {/* Erreur référence */}
        {errors.Reference && (
          <span className="field-error">⚠️ {errors.Reference}</span>
        )}
      </div>

      {/* ── CHAMPS DÉRIVÉS (AUTO-REMPLIS) ── */}
      <div className="form-card">
        <div className="form-card-title">
          <span className="dot" />
          Informations dérivées de la référence
          {hasReference && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                fontWeight: 600,
                color: "#16A34A",
                display: "flex",
                alignItems: "center",
                gap: 4,
                textTransform: "none",
              }}
            >
              <CheckCircle2 size={12} />
              Champs auto-remplis
            </span>
          )}
        </div>

        <div className="fields-grid">
          {isFieldVisible("Segments") && (
            <AutoFilledField
              label="Segment"
              value={segmentLabel}
              icon={<Navigation size={14} />}
            />
          )}
          {isFieldVisible("Ouvrages") && (
            <AutoFilledField
              label="Ouvrage"
              value={ouvrageLabel}
              icon={<Zap size={14} />}
            />
          )}
          {isFieldVisible("Poste") && (
            <AutoFilledField
              label="Poste"
              value={posteLabel}
              icon={<Building2 size={14} />}
            />
          )}
          {isFieldVisible("Departs") && (
            <AutoFilledField
              label="Départ"
              value={departLabel}
              icon={<MapPin size={14} />}
            />
          )}
        </div>

        {/* ── CHAMPS MANUELS (non dérivés) ── */}
        {(isFieldVisible("Unite_demanderesse") ||
          isFieldVisible("Exploitations") ||
          isFieldVisible("Type_de_travaux") ||
          isFieldVisible("Types_de_reseau") ||
          isFieldVisible("Disponibilite_mecanique")) && (
          <div
            style={{
              marginTop: 20,
              paddingTop: 20,
              borderTop: "1px solid #E2E8F0",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 16,
              }}
            >
              Informations complémentaires
            </div>
            <div className="fields-grid">
              {isFieldVisible("Unite_demanderesse") && (
                <div>
                  <SearchableSelect
                    label={<>Unité demanderesse <span className="required-star" style={{ color: "#EF4444" }}>*</span></>}
                    value={formData.unite_demanderesse_id || ""}
                    options={uniteDemanderesseOptions.length > 0 ? uniteDemanderesseOptions : (options.Unite_demanderesse || [])}
                    placeholder="Rechercher ou sélectionner une unité"
                    onChange={(val) => {
                      onChange("unite_demanderesse_id", val);
                      const sourceOptions = uniteDemanderesseOptions.length > 0 ? uniteDemanderesseOptions : (options.Unite_demanderesse || []);
                      if (val) {
                        const selectedUnit = sourceOptions.find(u => String(u.id) === String(val));
                        const label = selectedUnit ? (selectedUnit.valeur || selectedUnit.nom || selectedUnit.name) : "";
                        onChange("Unite_demanderesse", label);
                      } else {
                        onChange("Unite_demanderesse", "");
                      }
                    }}
                    hasError={!!errors.Unite_demanderesse}
                  />
                  {errors.Unite_demanderesse && <span className="field-error">⚠️ {errors.Unite_demanderesse}</span>}
                </div>
              )}
              {isFieldVisible("Exploitations") && (
                <div>
                  <SearchableSelect
                    label={<>Exploitations <span className="required-star" style={{ color: "#EF4444" }}>*</span></>}
                    value={formData.Exploitations}
                    options={options.Exploitations || []}
                    placeholder="Choisir l'exploitation"
                    onChange={(val) => onChange("Exploitations", val)}
                    hasError={!!errors.Exploitations}
                  />
                  {errors.Exploitations && <span className="field-error">⚠️ {errors.Exploitations}</span>}
                </div>
              )}
              {isFieldVisible("Type_de_travaux") && (
                <div>
                  <SearchableSelect
                    label={<>Types de travaux <span className="required-star" style={{ color: "#EF4444" }}>*</span></>}
                    value={formData.type_travaux_id || ""}
                    options={typesActivite || []}
                    placeholder="Nature des travaux"
                    onChange={(val) => {
                      onChange("type_travaux_id", val);
                      // Stocker aussi le label pour l'affichage dans le récap
                      const found = (typesActivite || []).find(
                        (t) => String(t.id) === String(val)
                      );
                      onChange(
                        "Type_de_travaux",
                        found ? (found.libelle || found.nom || found.valeur || "") : ""
                      );
                    }}
                    hasError={!!errors.Type_de_travaux}
                  />
                  {errors.Type_de_travaux && <span className="field-error">⚠️ {errors.Type_de_travaux}</span>}
                </div>
              )}
              {isFieldVisible("Types_de_reseau") && (
                <div>
                  <label className="field-label" style={{ display: "block", marginBottom: 6 }}>
                    Types de réseau <span className="required-star" style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ex: HTA, HTB, BT..."
                    value={formData.Types_de_reseau || ""}
                    onChange={(e) => onChange("Types_de_reseau", e.target.value.toUpperCase())}
                    className={`form-textarea ${errors.Types_de_reseau ? "input-error" : ""}`}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: `1.5px solid ${errors.Types_de_reseau ? "#EF4444" : "#E2E8F0"}`,
                      borderRadius: 10,
                      fontSize: 14,
                      fontFamily: "Inter, sans-serif",
                      outline: "none",
                      boxSizing: "border-box",
                      minHeight: "44px"
                    }}
                  />
                  {errors.Types_de_reseau && <span className="field-error" style={{ display: "block", marginTop: 4 }}>⚠️ {errors.Types_de_reseau}</span>}
                </div>
              )}
              {isFieldVisible("Disponibilite_mecanique") && (
                <div>
                  <label className="field-label" style={{ display: "block", marginBottom: 6 }}>
                    Disponibilité mécanique (MW) <span className="required-star" style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="ex: 150"
                    value={formData.Disponibilite_mecanique || ""}
                    onChange={(e) => onChange("Disponibilite_mecanique", e.target.value)}
                    className={`form-textarea ${errors.Disponibilite_mecanique ? "input-error" : ""}`}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: `1.5px solid ${errors.Disponibilite_mecanique ? "#EF4444" : "#E2E8F0"}`,
                      borderRadius: 10,
                      fontSize: 14,
                      fontFamily: "Inter, sans-serif",
                      outline: "none",
                      boxSizing: "border-box",
                      minHeight: "44px"
                    }}
                  />
                  {errors.Disponibilite_mecanique && (
                    <span className="field-error" style={{ display: "block", marginTop: 4 }}>⚠️ {errors.Disponibilite_mecanique}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CONSISTANCES DES TRAVAUX (Transport/Production) ── */}
        {isFieldVisible("Consistances_Des_Travaux") && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #E2E8F0" }}>
            <label className="field-label">
              Consistances des travaux<span className="required-star">*</span>
            </label>
            <textarea
              placeholder="Décrivez en détail la nature technique de l'intervention..."
              value={formData.Consistances_Des_Travaux || ""}
              onChange={(e) => onChange("Consistances_Des_Travaux", e.target.value)}
              className={`form-textarea${errors.Consistances_Des_Travaux ? " input-error" : ""}`}
              style={{ marginTop: 8 }}
            />
            {errors.Consistances_Des_Travaux && (
              <span className="field-error">⚠️ {errors.Consistances_Des_Travaux}</span>
            )}
          </div>
        )}

        {/* ── CHARGE DE CONSIGNATION (Transport) ── */}
        {isFieldVisible("Charges_de_consignation") && (
          <div style={{ marginTop: 20 }}>
            <SearchableSelect
              label={<>Charge de consignation <span className="required-star" style={{ color: "#EF4444" }}>*</span></>}
              value={formData.charge_consignation_id || ""}
              options={options.Charges_de_consignation || []}
              placeholder="Sélectionner une charge"
              onChange={(val) => {
                onChange("charge_consignation_id", val);
                // Stocker aussi le label pour l'affichage dans le récap
                const found = (options.Charges_de_consignation || []).find(
                  (c) => String(c.id) === String(val)
                );
                if (found) {
                  const lbl =
                    found.username ||
                    `${found.first_name || ""} ${found.last_name || ""}`.trim() ||
                    found.nom || found.valeur || "";
                  onChange("Charges_de_consignation_label", lbl);
                }
              }}
              hasError={!!errors.Charges_de_consignation}
            />
            {errors.Charges_de_consignation && (
              <span className="field-error">⚠️ {errors.Charges_de_consignation}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}