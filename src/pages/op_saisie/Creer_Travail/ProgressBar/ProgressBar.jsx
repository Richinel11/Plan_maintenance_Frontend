import { useState, useEffect } from "react";
import { Search, FileText, MapPin, Zap, ChevronDown, ArrowRight, ClipboardCheck, Building2 } from "lucide-react";
import "./Progress.css";
import Etape2 from '../Etape2/etape2';
import Etape3 from "../etape3/etape3";
import Recap from "../Recap/recap";
import useServiceRole from "../../../../ComponentsRole/ServiceRole";

export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const { service, fields, options, referenceConfig } = useServiceRole();
  
  const [formData, setFormData] = useState({
    Reference: '',
    Segments: '',
    Ouvrages: '',
    Poste: '',
    Departs: '',
    Unite_demanderesse: '',
    Exploitations: '',
    Type_de_travaux: '',
    Types_de_reseau: '',
    service: service
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, service }));
  }, [service]);

  useEffect(() => {
    if (referenceConfig && referenceConfig.length > 0) {
      const values = referenceConfig.map(field => formData[field] || '').filter(v => v !== '');
      const newRef = values.join('-');
      if (newRef !== formData.Reference) {
        setFormData(prev => ({ ...prev, Reference: newRef }));
      }
    }
  }, [formData, referenceConfig]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    {
      title: "Identification & Organisation",
      content: <StepOne formData={formData} onChange={handleInputChange} fields={fields} options={options} />,
    },
    {
      title: "Localisation & Consistance",
      content: <Etape2 formData={formData} onChange={handleInputChange} fields={fields} options={options} />,
    },
    {
      title: "Programmation & Impact",
      content: <Etape3 formData={formData} onChange={handleInputChange} fields={fields} options={options} />,
    },
    {
      title: "Recapitulatif",
      content: <Recap formData={formData} />,
    },
  ];

  const total = steps.length;
  const percent = ((step + 1) / total) * 100;

  const next = () => step < total - 1 && setStep(step + 1);
  const prev = () => step > 0 && setStep(step - 1);

  return (
    <div className="wrapper">
      {/* Progress Header */}
      <div className="progress-header">
        <div className="header-top">
          <div className="step-info">
            <span className="step-count">ÉTAPE {step + 1} SUR {total}</span>
            <h2 className="step-title">{steps[step].title}</h2>
          </div>
          <span className="step-percent">{Math.round(percent)}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="main-content">
        {steps[step].content}
      </div>

      {/* Footer Actions */}
      <div className="footer-actions">
        {step > 0 && (
          <button className="btn-prev" onClick={prev}>
            Précédent
          </button>
        )}
        <button className="btn-next" onClick={next}>
          {step === total - 1 ? "Terminer" : "Suivant"}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

/* STEP 1 COMPONENT */
function StepOne({ formData, onChange, fields, options }) {
  const isFieldVisible = (field) => fields.includes(field);

  return (
    <div className="step-one-container">
      {/* Référence Section */}
      <div className="ref-section">
        <label className="label-main">Référence</label>
        <div className="ref-input-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            value={formData.Reference} 
            readOnly 
            placeholder="Ex: MAINT-2023-089..."
          />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="form-card">
        {/* Auto-filled Fields */}
        <div className="auto-fields-section">
          {isFieldVisible("Segments") && (
            <DisplayField 
              label="Segment" 
              value={formData.Segments} 
              icon={<FileText size={20} />} 
              isAuto 
            />
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {isFieldVisible("Ouvrages") && (
              <DisplayField 
                label="Ouvrages" 
                value={formData.Ouvrages} 
                icon={<MapPin size={20} />} 
                isAuto 
              />
            )}
            {isFieldVisible("Poste") && (
              <DisplayField 
                label="Poste" 
                value={formData.Poste} 
                icon={<Building2 size={20} />} 
                isAuto 
              />
            )}
          </div>

          {isFieldVisible("Departs") && (
             <DisplayField 
             label="Départ" 
             value={formData.Departs} 
             icon={<Zap size={20} />} 
             isAuto 
           />
          )}
        </div>

        {/* Grid for Selects */}
        <div className="fields-grid">
          {isFieldVisible("Unite_demanderesse") && (
            <SelectField 
              label="Unité demanderesse" 
              value={formData.Unite_demanderesse} 
              options={options.Unite_demanderesse}
              placeholder="Sélectionner une unité"
              onChange={(val) => onChange("Unite_demanderesse", val)}
            />
          )}
          {isFieldVisible("Exploitations") && (
            <SelectField 
              label="Exploitations" 
              value={formData.Exploitations} 
              options={options.Exploitations}
              placeholder="Choisir l'exploitation"
              onChange={(val) => onChange("Exploitations", val)}
            />
          )}
          {isFieldVisible("Type_de_travaux") && (
            <SelectField 
              label="Types de travaux" 
              value={formData.Type_de_travaux} 
              options={options.Type_de_travaux}
              placeholder="Nature des travaux"
              onChange={(val) => onChange("Type_de_travaux", val)}
            />
          )}
          {isFieldVisible("Types_de_reseau") && (
            <SelectField 
              label="Types de réseau" 
              value={formData.Types_de_reseau} 
              options={options.Types_de_reseau}
              placeholder="Sélectionner le réseau"
              onChange={(val) => onChange("Types_de_reseau", val)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* REUSABLE COMPONENTS */
function DisplayField({ label, value, icon, isAuto }) {
  return (
    <div className="field-group" style={{ marginBottom: '16px' }}>
      <div className="field-row">
        <span className="field-label">{label}</span>
        {isAuto && (
          <div className="badge-auto">
            <ClipboardCheck size={12} />
            <span>AUTO-REMPLI</span>
          </div>
        )}
      </div>
      <div className="display-box">
        <div className="icon-wrap">{icon}</div>
        <span className="value">{value || "Non spécifié"}</span>
      </div>
    </div>
  );
}

function SelectField({ label, value, options, placeholder, onChange }) {
  return (
    <div className="select-group">
      <label className="field-label">{label}</label>
      <div className="select-wrapper">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{placeholder}</option>
          {options && options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="chevron" size={18} />
      </div>
    </div>
  );
}