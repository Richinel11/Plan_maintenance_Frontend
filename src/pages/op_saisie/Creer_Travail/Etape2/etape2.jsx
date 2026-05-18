import React from "react";
import "./etape2.css";
import { ChevronDown } from "lucide-react";

/* ---------------- SELECT FIELD ---------------- */
function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
}) {
  const isObjectArray =
    options &&
    options.length > 0 &&
    typeof options[0] ===
      "object";

  return (
    <div className="select-group" style={{ width: '100%' }}>
      <label className="field-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        {label}
      </label>
      <div className="select-wrapper" style={{ position: 'relative' }}>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            appearance: 'none'
          }}
        >
          <option value="">{placeholder}</option>
          {options &&
            options.map((opt) => {
              if (isObjectArray) {
                return (
                  <option key={opt.id} value={opt.id}>
                    {opt.libelle || opt.nom || opt.name || 
                     `${opt.first_name || ""} ${opt.last_name || ""}`.trim()}
                  </option>
                );
              }
              return (
                <option key={opt} value={opt}>{opt}</option>
              );
            })}
        </select>
        <ChevronDown
          className="chevron"
          size={18}
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}

const Etape2 = ({ formData, onChange, fields = [], options = {} }) => {
    const isFieldVisible = (field) => fields && fields.includes(field);

    const safeOptions = (key) => options && options[key] ? options[key] : [];

    return(
    <div className="etape-container">
        <div className="etape-title">
            <span>Détails Techniques</span>
            <h1>Localisation & Consistance</h1>
        </div>

        {isFieldVisible("Troncons") && (
            <div className="part1">
                <h2>Tronçons / Consignes</h2>
                <input 
                    type="text" 
                    placeholder="Précisez les tronçons concernés..." 
                    value={formData.Troncons || ""}
                    onChange={(e) => onChange("Troncons", e.target.value)}
                />
            </div>
        )}

        {isFieldVisible("Consistances_Des_Travaux") && (
            <div className="part2">
                <h2>Consistances des travaux</h2>
                <textarea 
                    placeholder="Décrivez en détail la nature technique de l'intervention..." 
                    value={formData.Consistances_Des_Travaux || ""}
                    onChange={(e) => onChange("Consistances_Des_Travaux", e.target.value)}
                    className="form-textarea"
                    style={{ minHeight: '100px', width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #dbe2ea' }}
                />
            </div>
        )}

        {isFieldVisible("Localites_impactees") && (
            <div className="part3">
                <h2>Localités impactées</h2>
                <input 
                    placeholder="Listez les quartiers ou zones impactés..."
                    value={formData.Localites_impactees || ""}
                    onChange={(e) => onChange("Localites_impactees", e.target.value)}
                />
            </div>
        )}

        <div className="part4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            {isFieldVisible("Moyens_mis_en_oeuvre") && (
                <div className="part-child">
                    <h2>Moyens mis en oeuvre</h2>
                    <select 
                        value={formData.Moyens_mis_en_oeuvre || ""}
                        onChange={(e) => onChange("Moyens_mis_en_oeuvre", e.target.value)}
                        style={{ width: '100%', height: '52px', borderRadius: '10px', border: '1px solid #dbe2ea', padding: '0 16px' }}
                    >
                        <option value="">Sélectionner les ressources</option>
                        {safeOptions("Moyens_mis_en_oeuvre").map(opt => (
                            <option key={typeof opt === 'object' ? opt.id : opt} value={typeof opt === 'object' ? opt.id : opt}>
                                {typeof opt === 'object' ? (opt.libelle || opt.nom) : opt}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            
            {isFieldVisible("Charges_de_consignation") && (
                <div className="part-child">
                    <SelectField
                        label="Charge de consignation"
                        value={formData.charge_consignation_id}
                        options={safeOptions("Charges_de_consignation")}
                        placeholder="Sélectionner un charge"
                        onChange={(val) => onChange("charge_consignation_id", val)}
                    />
                </div>
            )}
        </div>
    </div>
    );
};

export default Etape2;