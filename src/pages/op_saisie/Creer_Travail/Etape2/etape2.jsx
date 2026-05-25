import React, { useState, useEffect, useRef } from "react";
import "./etape2.css";
import { X, Check } from "lucide-react";
import SearchableSelect from "../components/SearchableSelect";

const Etape2 = ({ formData, onChange, fields = [], options = {}, errors = {} }) => {
  const isFieldVisible = (field) => fields && fields.includes(field);
  const safeOptions = (key) => (options && options[key] ? options[key] : []);

  const [isTronconOpen, setIsTronconOpen] = useState(false);
  const tronconWrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tronconWrapperRef.current && !tronconWrapperRef.current.contains(e.target)) {
        setIsTronconOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tronconsList = safeOptions("Troncons");
  const currentTypedVal = formData.Troncons || "";

  const filteredTroncons = tronconsList.filter((opt) => {
    const label = typeof opt === "object"
      ? opt.libelle || opt.nom || opt.code || opt.name || ""
      : opt;
    return String(label).toLowerCase().includes(currentTypedVal.toLowerCase());
  });

  return (
    <div className="etape-container">
      <div className="etape-title">
        <span>Détails Techniques</span>
        <h1>Localisation &amp; Consistance</h1>
      </div>

      {/* ── Tronçons ── */}
      {isFieldVisible("Troncons") && (
        <div className="part1" ref={tronconWrapperRef}>
          <label className="field-label">
            Tronçons / Consignes<span className="required-star">*</span>
          </label>
          <div className={`creatable-select-container${errors.Troncons ? " input-error" : ""}`}>
            <div className="creatable-select-input-wrapper">
              <input
                type="text"
                placeholder="Rechercher ou saisir un tronçon..."
                value={formData.Troncons || ""}
                onChange={(e) => {
                  onChange("Troncons", e.target.value);
                  onChange("troncon_id", null);
                  setIsTronconOpen(true);
                }}
                onFocus={() => setIsTronconOpen(true)}
                className={errors.Troncons ? "input-error" : ""}
              />
              {formData.Troncons && (
                <button
                  type="button"
                  className="creatable-select-clear"
                  onClick={() => {
                    onChange("Troncons", "");
                    onChange("troncon_id", null);
                    setIsTronconOpen(false);
                  }}
                  title="Effacer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {isTronconOpen && (
              <div className="creatable-select-dropdown">
                {filteredTroncons.length === 0 ? (
                  currentTypedVal.trim() === "" && (
                    <div style={{ padding: "12px 14px", color: "#94A3B8", fontStyle: "italic", fontSize: 13, textAlign: "center" }}>
                      Aucun tronçon disponible. Saisissez pour en créer un.
                    </div>
                  )
                ) : (
                  filteredTroncons.map((opt) => {
                    const id = typeof opt === "object" ? opt.id : opt;
                    const label = typeof opt === "object"
                      ? opt.libelle || opt.nom || opt.code || opt.name || ""
                      : opt;
                    const isSelected = String(formData.troncon_id) === String(id);

                    return (
                      <div
                        key={id}
                        className={`creatable-select-option ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          onChange("troncon_id", id);
                          onChange("Troncons", label);
                          setIsTronconOpen(false);
                        }}
                      >
                        <span>{label}</span>
                        {isSelected && <Check size={14} style={{ color: "#1B75BB", flexShrink: 0 }} />}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
          {errors.Troncons && <span className="field-error">⚠️ {errors.Troncons}</span>}
        </div>
      )}

      {/* ── Consistances des travaux ── */}
      {isFieldVisible("Consistances_Des_Travaux") && (
        <div className="part2">
          <label className="field-label">
            Consistances des travaux<span className="required-star">*</span>
          </label>
          <textarea
            placeholder="Décrivez en détail la nature technique de l'intervention..."
            value={formData.Consistances_Des_Travaux || ""}
            onChange={(e) => onChange("Consistances_Des_Travaux", e.target.value)}
            className={errors.Consistances_Des_Travaux ? "input-error" : ""}
          />
          {errors.Consistances_Des_Travaux && (
            <span className="field-error">⚠️ {errors.Consistances_Des_Travaux}</span>
          )}
        </div>
      )}

      {/* ── Localités impactées ── */}
      {isFieldVisible("Localites_impactees") && (
        <div className="part3">
          <label className="field-label">
            Localités impactées<span className="required-star">*</span>
          </label>
          <input
            type="text"
            placeholder="Listez les quartiers ou zones impactés..."
            value={formData.Localites_impactees || ""}
            onChange={(e) => onChange("Localites_impactees", e.target.value)}
            className={errors.Localites_impactees ? "input-error" : ""}
          />
          {errors.Localites_impactees && (
            <span className="field-error">⚠️ {errors.Localites_impactees}</span>
          )}
        </div>
      )}

      {/* ── Moyens + Charges (grille 2 colonnes) ── */}
      <div className="part4">
        {isFieldVisible("Moyens_mis_en_oeuvre") && (
          <div className="part-child">
            <SearchableSelect
              label={<>Moyens mis en œuvre <span className="required-star" style={{ color: "#EF4444" }}>*</span></>}
              value={formData.Moyens_mis_en_oeuvre || ""}
              options={safeOptions("Moyens_mis_en_oeuvre")}
              placeholder="Sélectionner les ressources"
              onChange={(val) => onChange("Moyens_mis_en_oeuvre", val)}
              hasError={!!errors.Moyens_mis_en_oeuvre}
            />
            {errors.Moyens_mis_en_oeuvre && (
              <span className="field-error">⚠️ {errors.Moyens_mis_en_oeuvre}</span>
            )}
          </div>
        )}

        {isFieldVisible("Charges_de_consignation") && (
          <div className="part-child">
            <SearchableSelect
              label={<>Charge de consignation <span className="required-star" style={{ color: "#EF4444" }}>*</span></>}
              value={formData.charge_consignation_id || ""}
              options={safeOptions("Charges_de_consignation")}
              placeholder="Sélectionner une charge"
              onChange={(val) => onChange("charge_consignation_id", val)}
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
};

export default Etape2;