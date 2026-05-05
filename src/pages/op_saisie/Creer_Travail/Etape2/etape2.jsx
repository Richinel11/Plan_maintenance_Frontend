import React from "react";
import "./etape2.css";

const Etape = ({ formData, onChange, fields, options }) => {
    const isFieldVisible = (field) => fields.includes(field);

    return(
    <>
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

        <div className="part4">
            {isFieldVisible("Moyens_mis_en_oeuvre") && (
                <div className="part-child">
                    <h2>Moyens mis en oeuvre</h2>
                    <select 
                        value={formData.Moyens_mis_en_oeuvre || ""}
                        onChange={(e) => onChange("Moyens_mis_en_oeuvre", e.target.value)}
                    >
                        <option value="">Sélectionner les ressources</option>
                        {options.Moyens_mis_en_oeuvre.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            )}
            
            {isFieldVisible("Charges_de_consignations") && (
                <div className="part-child">
                    <h2>Charges de consignations</h2>
                    <input 
                        type="text" 
                        placeholder="Nom du chargé de consignation..." 
                        value={formData.Charges_de_consignations || ""}
                        onChange={(e) => onChange("Charges_de_consignations", e.target.value)}
                    />
                </div>
            )}
        </div>
    </>
    );
};

export default Etape;