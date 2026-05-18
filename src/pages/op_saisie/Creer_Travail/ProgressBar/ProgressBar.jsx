import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import "./Progress.css";

import Etape2 from "../Etape2/etape2";
import Etape3 from "../etape3/etape3";
import Recap from "../Recap/recap";
import PlanningForm from "../components/PlanningForm";

import useServiceRole from "../../../ComponentsRole/ServiceRole";

import {
  getReferences,
  getTypesActivite,
  getOuvrages,
  getPostes,
  getDeparts,
  getTroncons,
  getLocalisations,
  getChargesConsignation,
} from "../../../../services/referencetielService";

import { mapPlanningPayload } from "../../../../utils/planningMapper";

import {
  getPlannings,
  createPlanning,
} from "../../../../API/planningService";

export default function MultiStepForm() {
  const [plannings, setPlannings] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ---------------- STATES ---------------- */
  const [references, setReferences] = useState([]);
  const [typesActivite, setTypesActivite] = useState([]);
  const [ouvrages, setOuvrages] = useState([]);
  const [postes, setPostes] = useState([]);
  const [departs, setDeparts] = useState([]);
  const [troncons, setTroncons] = useState([]);
  const [segments, setSegments] = useState([]);
  const [chargesConsignation, setChargesConsignation] = useState([]);

  const {
    service,
    setService,
    fields,
    options: initialOptions,
  } = useServiceRole();

  const options = {
    ...initialOptions,
    Segments: segments,
    Ouvrages: ouvrages,
    Poste: postes,
    Departs: departs,
    Charges_de_consignation: chargesConsignation,
  };

  /* ---------------- FORM DATA ---------------- */
  const [formData, setFormData] = useState({
    Reference: "",
    reference_id: null,
    planning_id: null,
    segment_id: null,
    ouvrage_id: null,
    poste_id: null,
    depart_id: null,
    troncon_id: null,

    Unite_demanderesse: "",
    Exploitations: "",
    Type_de_travaux: "",
    Types_de_reseau: "",
    type_travaux_id: null,
    service: service,

    /* ETAPE 2 */
    Troncons: "",
    Consistances_Des_Travaux: "",
    Localites_impactees: "",
    Moyens_mis_en_oeuvre: "",
    charge_consignation_id: null,

    /* ETAPE 3 */
    Debut_planifiee: "",
    Duree: "",
    Fin_planifiee: "",
    Date_programmee: "",
    Prevision_puissance_sollicite: "",
    Prevision_puissance_interrompue: "",
    Prevision_ENF: "",
    Centrale_thermique: "",
    Qte_de_fuel: "",
    Observations: "",
    Jour_avant_travaux: null,
  });

  /* ---------------- LOAD REFERENTIEL ---------------- */
  useEffect(() => {
    const fetchReferentielData = async () => {
      try {
        const [
          ouvragesData,
          postesData,
          departsData,
          tronconsData,
          referencesData,
          typesData,
          planningsData,
          segmentsData,
          chargesData,
        ] = await Promise.all([
          getOuvrages(),
          getPostes(),
          getDeparts(),
          getTroncons(),
          getReferences(),
          getTypesActivite(),
          getPlannings(),
          getLocalisations(),
          getChargesConsignation(),
        ]);

        setOuvrages(ouvragesData);
        setPostes(postesData);
        setDeparts(departsData);
        setTroncons(tronconsData);
        setReferences(referencesData);
        setTypesActivite(typesData);
        setPlannings(planningsData);
        setSegments(segmentsData);
        setChargesConsignation(chargesData);
      } catch (error) {
        console.error("Erreur chargement référentiel :", error);
      }
    };
    fetchReferentielData();
  }, []);

  /* ---------------- UPDATE SERVICE ---------------- */
  useEffect(() => {
    setFormData((prev) => ({ ...prev, service }));
  }, [service]);

  /* ---------------- AUTO GENERATE REFERENCE ---------------- */
  useEffect(() => {
    const getLabel = (list, id) => {
      if (!id) return "";
      const item = list.find((i) => String(i.id) === String(id));
      return item ? (item.nom || item.libelle || item.ville || "") : "";
    };

    let parts = [];
    const segmentLabel = getLabel(segments, formData.segment_id);
    const ouvrageLabel = getLabel(ouvrages, formData.ouvrage_id);
    const posteLabel = getLabel(postes, formData.poste_id);
    const departLabel = getLabel(departs, formData.depart_id);

    if (service === "distribution") {
      parts = [segmentLabel, ouvrageLabel, posteLabel, departLabel];
    } else {
      parts = [segmentLabel, ouvrageLabel, posteLabel];
    }

    const newRef = parts.filter(Boolean).join("-");
    if (newRef !== formData.Reference) {
      setFormData((prev) => ({ ...prev, Reference: newRef }));
    }
  }, [
    service,
    formData.segment_id,
    formData.ouvrage_id,
    formData.poste_id,
    formData.depart_id,
    segments,
    ouvrages,
    postes,
    departs,
  ]);

  /* ---------------- AUTO CALCULATE DATES ---------------- */

  useEffect(() => {
    const calculateDates = () => {
      let updates = {};

      // 1. Calculate Fin_planifiee
      if (formData.Debut_planifiee && formData.Duree) {
        const start = new Date(formData.Debut_planifiee);
        const end = new Date(start.getTime() + formData.Duree * 60 * 60 * 1000);
        const endStr = end.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        if (formData.Fin_planifiee !== endStr) {
          updates.Fin_planifiee = endStr;
        }
      }

      // 2. Calculate Jour_avant_travaux
      if (formData.Debut_planifiee && formData.Date_programmee) {
        const start = new Date(formData.Debut_planifiee);
        const programmed = new Date(formData.Date_programmee);
        
        // Reset hours for date comparison
        start.setHours(0, 0, 0, 0);
        programmed.setHours(0, 0, 0, 0);

        const diffTime = start.getTime() - programmed.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (formData.Jour_avant_travaux !== diffDays) {
          updates.Jour_avant_travaux = diffDays;
        }
      }

      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({ ...prev, ...updates }));
      }
    };

    calculateDates();
  }, [formData.Debut_planifiee, formData.Duree, formData.Date_programmee, formData.Fin_planifiee, formData.Jour_avant_travaux]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitPlanning = async () => {
    try {
      setLoading(true);
      const payload = mapPlanningPayload(formData);
      await createPlanning(payload);
      alert("Planning créé avec succès");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création du planning");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Identification & Organisation",
      content: (
        <>
          <div style={{ marginBottom: 20 }}>
            <label>Associer à un planning existant</label>
            <select
              value={formData.planning_id || ""}
              onChange={(e) => handleInputChange("planning_id", e.target.value)}
              style={{ width: "100%", padding: "10px", marginTop: 8 }}
            >
              <option value="">-- Aucun planning --</option>
              {plannings.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.reference || p.nom || `Planning #${p.id}`}
                </option>
              ))}
            </select>
          </div>
          <PlanningForm
            formData={formData}
            onChange={handleInputChange}
            references={references}
            onReferenceChange={(val) => handleInputChange("reference_id", val)}
            typesActivite={typesActivite}
            service={service}
            fields={fields}
            options={options}
          />
        </>
      ),
    },
    // Only show Etape 2 for Distribution
    ...(service === "distribution" ? [{
      title: "Localisation & Consistance",
      content: (
        <Etape2
          formData={formData}
          onChange={handleInputChange}
          fields={fields}
          options={options}
        />
      ),
    }] : []),
    {
      title: "Programmation & Impact",
      content: (
        <Etape3
          formData={formData}
          onChange={handleInputChange}
          fields={fields}
          options={options}
        />
      ),
    },
    {
      title: "Récapitulatif",
      content: <Recap formData={formData} />,
    },
  ];

  const total = steps.length;
  const percent = ((step + 1) / total) * 100;
  const next = () => setStep((prev) => Math.min(prev + 1, total - 1));
  const prev = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="wrapper">
      <div style={{
        padding: "10px",
        background: "#f8d7da",
        color: "#721c24",
        marginBottom: "15px",
        borderRadius: "5px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #f5c6cb",
      }}>
        <strong>🛠️ Outil de Test : Changer le Service</strong>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #ccc", cursor: "pointer" }}
        >
          <option value="transport">Transport</option>
          <option value="distribution">Distribution</option>
          <option value="production">Production</option>
        </select>
      </div>

      <div className="progress-header">
        <div className="header-top">
          <div className="step-info">
            <span className="step-count">ÉTAPE {step + 1} SUR {total}</span>
            <h2 className="step-title">{steps[step]?.title}</h2>
          </div>
          <span className="step-percent">{Math.round(percent)}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="main-content">{steps[step]?.content}</div>

      <div className="footer-actions">
        {step > 0 && <button className="btn-prev" onClick={prev}>Précédent</button>}
        <button
          className="btn-next"
          onClick={step === total - 1 ? handleSubmitPlanning : next}
          disabled={loading}
        >
          {loading ? "Création..." : step === total - 1 ? "Créer Planning" : "Suivant"}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
