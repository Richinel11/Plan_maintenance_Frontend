import { useState, useEffect } from "react";
import { Search, FileText, MapPin, Zap, ChevronDown, ArrowRight, ClipboardCheck, Building2 } from "lucide-react";
import "./Progress.css";
import Etape2 from '../Etape2/etape2';
import Etape3 from "../etape3/etape3";
import Recap from "../Recap/recap";
import useServiceRole from "../../../ComponentsRole/ServiceRole";

export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const { service, setService, fields, options, referenceConfig } = useServiceRole();
  
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

  const baseSteps = [
    {
      title: "Identification & Organisation",
      content: <StepOne formData={formData} onChange={handleInputChange} fields={fields} options={options} service={service} />,
    },
    {
      title: "Localisation & Consistance",
      content: <Etape2 formData={formData} onChange={handleInputChange} fields={fields} options={options} />,
      isDistributionOnly: true
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

  const steps = baseSteps.filter(step => {
    if (step.isDistributionOnly) {
      return service === 'distribution';
    }
    return true;
  });

  const total = steps.length;
  const percent = ((step + 1) / total) * 100;

  const next = () => step < total - 1 && setStep(step + 1);
  const prev = () => step > 0 && setStep(step - 1);

  return (
    <div className="wrapper">
      {/* TEMP SERVICE SWITCHER (TEMPORAIRE) */}
      <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', marginBottom: '15px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f5c6cb' }}>
        <strong>🛠️ Outil de Test : Changer le Service Applicatif</strong>
        <select 
          value={service} 
          onChange={(e) => setService(e.target.value)} 
          style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
        >
          <option value="transport">Transport</option>
          <option value="distribution">Distribution</option>
          <option value="production">Production</option>
        </select>
      </div>

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
function StepOne({ formData, onChange, fields, options, service }) {
  const isFieldVisible = (field) => fields.includes(field);

  return (
    <div className="step-one-container">
      {/* Référence Section */}
      <div className="ref-section">
        <div className="field-row" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
          <label className="label-main" style={{ margin: 0 }}>Référence</label>
          <div className="badge-auto" style={{ display: 'inline-flex', alignItems: 'center', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', marginLeft: '10px' }}>
            <ClipboardCheck size={12} style={{ marginRight: '4px' }} />
            <span>AUTO-REMPLI</span>
          </div>
        </div>
        <div className="ref-input-wrapper">
          <input 
            type="text" 
            value={formData.Reference} 
            readOnly 
            placeholder="La référence se génère automatiquement..."
            style={{ paddingLeft: '15px' }}
          />
        </div>
      </div>

      {/* Main Content Card */}
      <div className="form-card">
        {/* Grid for Selects */}
        <div className="fields-grid">
          {isFieldVisible("Segments") && (
            <SelectField 
              label="Segment" 
              value={formData.Segments} 
              options={options.Segments}
              placeholder="Sélectionner le segment"
              onChange={(val) => onChange("Segments", val)}
            />
          )}
          {isFieldVisible("Ouvrages") && (
            <SelectField 
              label="Ouvrage" 
              value={formData.Ouvrages} 
              options={options.Ouvrages}
              placeholder="Sélectionner l'ouvrage"
              onChange={(val) => onChange("Ouvrages", val)}
            />
          )}
          {isFieldVisible("Poste") && (
            <SelectField 
              label="Poste" 
              value={formData.Poste} 
              options={options.Poste}
              placeholder="Sélectionner le poste"
              onChange={(val) => onChange("Poste", val)}
            />
          )}
          {isFieldVisible("Departs") && (
            <SelectField 
              label="Départ" 
              value={formData.Departs} 
              options={options.Departs}
              placeholder="Sélectionner le départ"
              onChange={(val) => onChange("Departs", val)}
            />
          )}
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

        {/* Champs déplacés depuis l'étape 2 (Transport / Production) */}
        {isFieldVisible("Consistances_Des_Travaux") && service !== "distribution" && (
          <div style={{ marginTop: '20px' }}>
            <label className="field-label">Consistances des travaux</label>
            <textarea 
                placeholder="Décrivez en détail la nature technique de l'intervention..." 
                value={formData.Consistances_Des_Travaux || ""}
                onChange={(e) => onChange("Consistances_Des_Travaux", e.target.value)}
                className="form-textarea"
                style={{ width: '100%', padding: '12px', marginTop: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
        )}
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