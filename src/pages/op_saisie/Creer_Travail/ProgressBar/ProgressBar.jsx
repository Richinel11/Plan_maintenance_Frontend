import { useState, useEffect } from "react";
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft } from "lucide-react";
import "./Progress.css";

import Etape2 from "../Etape2/etape2";
import Etape3 from "../etape3/etape3";
import Recap from "../Recap/recap";
import PlanningForm from "../components/PlanningForm";
import SearchableSelect from "../components/SearchableSelect";

import useServiceRole from "../../../ComponentsRole/ServiceRole";

import {
  getReferences,
  getTypesActivite,
  getChargesConsignation,
} from "../../../../services/referencetielService";

import { mapPlanningPayload } from "../../../../utils/planningMapper";

import {
  getPlannings,
  createPlanning,
  getOptionsByService,
} from "../../../../API/planningService";

import { getEntites } from "../../../../services/userService";

export default function MultiStepForm() {
  const [plannings, setPlannings] = useState([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);

  /* ---------------- STATES RÉFÉRENTIEL ---------------- */
  const [references, setReferences] = useState([]);
  const [typesActivite, setTypesActivite] = useState([]);
  // ouvrages/postes/departs/troncons: ces données sont désormais
  // auto-remplies depuis les items de la Référence (plus d'endpoints dédiés)
  const [ouvrages] = useState([]);
  const [postes] = useState([]);
  const [departs] = useState([]);
  const [troncons] = useState([]);
  const [segments, setSegments] = useState([]);
  const [chargesConsignation, setChargesConsignation] = useState([]);
  /* Options dynamiques chargées selon le service choisi */
  const [serviceOptions, setServiceOptions] = useState({});

  const {
    service,
    setService,
    fields,
  } = useServiceRole();

  const options = {
    ...serviceOptions,
    Segments: segments,
    Ouvrages: ouvrages,
    Poste: postes,
    Departs: departs,
    Charges_de_consignation: chargesConsignation,
    Troncons: troncons,
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

  /* ---------------- LOAD RÉFÉRENTIEL AU CHANGEMENT DE SERVICE ---------------- */
  useEffect(() => {
    if (!service) return;

    const fetchReferentielData = async () => {
      try {
        // Chargement parallèle des données de base
        // Note: ouvrages/postes/departs/troncons sont déduits des items de la Référence

        const entitemetier_id = await getEntites().then((ents) => {
          const ent = ents.find((e) => {
            console.log("Comparaison entité métier:", e.name, "avec service:", service);
            return e.name.toLocaleLowerCase() === service.toLocaleLowerCase(); //
          });
          return ent ? ent.id : null;
        });
        console.log("Entité métier ID pour le service", service, ":", entitemetier_id);
        const [
          referencesData,
          typesData,
          planningsResponse,
          chargesData,
        ] = await Promise.all([
          getReferences(entitemetier_id),
          getTypesActivite(),
          getPlannings(),
          getChargesConsignation(),
        ]);

        setReferences(referencesData?.results || referencesData || []);
        setTypesActivite(typesData?.results || typesData || []);
        // getPlannings retourne { results, count, next, previous } ou un tableau brut
        setPlannings(planningsResponse?.results || planningsResponse || []);
        setChargesConsignation(chargesData?.results || chargesData || []);
      } catch (error) {
        console.error("Erreur chargement référentiel :", error);
      }

      // Chargement des options spécifiques au service (Unite_demanderesse, etc.)
      try {
        setOptionsLoading(true);
        const data = await getOptionsByService(service);
        setServiceOptions(data || {});
      } catch (error) {
        console.error("Erreur chargement options du service :", error);
        setServiceOptions({});
      } finally {
        setOptionsLoading(false);
      }
    };

    fetchReferentielData();
  }, [service]);

  /* ---------------- SYNC SERVICE → FORM DATA ---------------- */
  useEffect(() => {
    setFormData((prev) => ({ ...prev, service }));
  }, [service]);

  /* ---------------- AUTO CALCULATE DATES ---------------- */
  useEffect(() => {
    const calculateDates = () => {
      let updates = {};

      if (formData.Debut_planifiee && formData.Duree) {
        const start = new Date(formData.Debut_planifiee);
        const end = new Date(start.getTime() + formData.Duree * 60 * 60 * 1000);
        const endStr = end.toLocaleString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        if (formData.Fin_planifiee !== endStr) {
          updates.Fin_planifiee = endStr;
        }
      }

      if (formData.Debut_planifiee && formData.Date_programmee) {
        const start = new Date(formData.Debut_planifiee);
        const programmed = new Date(formData.Date_programmee);
        start.setHours(0, 0, 0, 0);
        programmed.setHours(0, 0, 0, 0);
        const diffTime = start.getTime() - programmed.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (formData.Jour_avant_travaux !== diffDays) {
          updates.Jour_avant_travaux = diffDays;
        }
      }

      if (Object.keys(updates).length > 0) {
        setFormData((prev) => ({ ...prev, ...updates }));
      }
    };
    calculateDates();
  }, [
    formData.Debut_planifiee,
    formData.Duree,
    formData.Date_programmee,
    formData.Fin_planifiee,
    formData.Jour_avant_travaux,
  ]);

  /* ---------------- AUTO RESOLVE TEXT LABELS FOR RECAP ---------------- */
  useEffect(() => {
    const getLabel = (list, id) => {
      if (!id) return "";
      const item = list.find((i) => String(i.id) === String(id));
      return item ? (item.nom || item.libelle || item.ville || item.name || "") : "";
    };

    const fieldValues = {
      Ouvrages: getLabel(ouvrages, formData.ouvrage_id),
      Poste: getLabel(postes, formData.poste_id),
      Departs: getLabel(departs, formData.depart_id),
      Segments: getLabel(segments, formData.segment_id),
    };

    let updates = {};
    if (fieldValues.Ouvrages !== formData.Ouvrages) updates.Ouvrages = fieldValues.Ouvrages;
    if (fieldValues.Poste !== formData.Poste) updates.Poste = fieldValues.Poste;
    if (fieldValues.Departs !== formData.Departs) updates.Departs = fieldValues.Departs;
    if (fieldValues.Segments !== formData.Segments) updates.Segments = fieldValues.Segments;

    if (Object.keys(updates).length > 0) {
      setFormData((prev) => ({ ...prev, ...updates }));
    }
  }, [
    formData.ouvrage_id,
    formData.poste_id,
    formData.depart_id,
    formData.segment_id,
    ouvrages,
    postes,
    departs,
    segments,
    formData.Ouvrages,
    formData.Poste,
    formData.Departs,
    formData.Segments,
  ]);

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ dès que l'utilisateur le remplit
    setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleSubmitPlanning = async () => {
    try {
      setLoading(true);
      const payload = mapPlanningPayload(formData);
      await createPlanning(payload);
      toast.success("Planning créé avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la création du planning");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VALIDATION DES ÉTAPES ---------------- */
  const validateStep = () => {
    const newErrors = {};
    const isActive = (field) => fields.includes(field);
    const req = (key, value) => {
      if (isActive(key) && !value && value !== 0)
        newErrors[key] = "Ce champ est obligatoire";
    };

    if (step === 0) {
      // Référence (et champs dérivés auto-remplis)
      if (!formData.Reference && !formData.reference_id)
        newErrors.Reference = "Ce champ est obligatoire";
      // Les champs Segments, Ouvrages, Poste, Departs sont liés à la référence
      if ((isActive("Segments") || isActive("Ouvrages") || isActive("Poste")) && !formData.reference_id)
        newErrors.Reference = "Veuillez sélectionner une référence pour remplir les champs liés";

      req("Unite_demanderesse",        formData.Unite_demanderesse);
      req("Type_de_travaux",           formData.type_travaux_id);
      req("Types_de_reseau",           formData.Types_de_reseau);
      req("Consistances_Des_Travaux",  formData.Consistances_Des_Travaux);
      req("Charges_de_consignation",   formData.charge_consignation_id);
      req("Disponibilite_mecanique",   formData.Disponibilite_mecanique);
    }

    // Étape 2 — Localisation (Distribution uniquement, step 1)
    if (service === "distribution" && step === 1) {
      req("Troncons",                formData.Troncons);
      req("Consistances_Des_Travaux",formData.Consistances_Des_Travaux);
      req("Localites_impactees",     formData.Localites_impactees);
      req("Moyens_mis_en_oeuvre",    formData.Moyens_mis_en_oeuvre);
      req("Charges_de_consignation", formData.charge_consignation_id);
    }

    // Étape 3 — Programmation
    const etape3Step = service === "distribution" ? 2 : 1;
    if (step === etape3Step) {
      req("Debut_planifiee",                   formData.Debut_planifiee);
      req("Duree",                              formData.Duree);
      req("Date_programmee",                   formData.Date_programmee);
      req("Prevision_puissance_sollicite",     formData.Prevision_puissance_sollicite);
      req("Prevision_puissance_interrompue",   formData.Prevision_puissance_interrompue);
      req("Prevision_ENF",                     formData.Prevision_ENF);
      req("Centrale_thermique",                formData.Centrale_thermique);
      req("Qte_de_fuel",                       formData.Qte_de_fuel);
      req("Observations",                      formData.Observations || formData.Obervations);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- DÉFINITION DES ÉTAPES ---------------- */
  const steps = [
    {
      title: "Identification & Organisation",
      content: (
        <>
          {/* ── Sélection de l'entité métier ── */}
          <div className="associate-card">
            <div className="associate-card-label">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Entité métier
            </div>
            <div className="associate-select-wrapper">
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                <option value="">-- Sélectionner une entité --</option>
                <option value="Transport">Transport</option>
                <option value="Distribution">Distribution</option>
                <option value="Production">Production</option>
              </select>
              <svg className="chevron" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* ── Associer à un planning existant ── */}
          <div className="associate-card">
            <div className="associate-card-label">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path d="M6 2a1 1 0 000 2h1v1a1 1 0 002 0V4h2v1a1 1 0 002 0V4h1a1 1 0 000-2H6zM3 7a1 1 0 011-1h12a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
              Associer à un planning existant
            </div>
            <div className="associate-select-wrapper" style={{ marginTop: 8 }}>
              <SearchableSelect
                value={formData.planning_id || ""}
                options={plannings}
                placeholder="Rechercher ou sélectionner un planning"
                onChange={(val) => handleInputChange("planning_id", val)}
              />
            </div>
          </div>

          {/* ── Formulaire principal ── */}
          <PlanningForm
            formData={formData}
            onChange={handleInputChange}
            references={references}
            typesActivite={typesActivite}
            service={service}
            fields={fields}
            options={options}
            segments={segments}
            ouvrages={ouvrages}
            postes={postes}
            departs={departs}
            errors={errors}
          />
        </>
      ),
    },
    ...(service === "distribution"
      ? [
          {
            title: "Localisation & Consistance",
            content: (
              <Etape2
                formData={formData}
                onChange={handleInputChange}
                fields={fields}
                options={options}
                errors={errors}
              />
            ),
          },
        ]
      : []),
    {
      title: "Programmation & Impact",
      content: (
        <Etape3
          formData={formData}
          onChange={handleInputChange}
          fields={fields}
          options={options}
          errors={errors}
        />
      ),
    },
    {
      title: "Récapitulatif",
      content: <Recap formData={formData} fields={fields} />,
    },
  ];

  const total = steps.length;
  const percent = ((step + 1) / total) * 100;
  const next = () => {
    if (validateStep()) {
      setErrors({});
      setStep((prev) => Math.min(prev + 1, total - 1));
    }
  };
  const prev = () => {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="wrapper">

      {/* ── EN-TÊTE PROGRESSION ── */}
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

      {/* ── CONTENU DE L'ÉTAPE ── */}
      <div className="main-content">{steps[step]?.content}</div>

      {/* ── NAVIGATION ── */}
      <div className="footer-actions">
        {step > 0 && (
          <button className="btn-prev" onClick={prev}>
            <ArrowLeft size={16} />
            Précédent
          </button>
        )}
        <button
          className="btn-next"
          onClick={step === total - 1 ? handleSubmitPlanning : next}
          disabled={loading}
        >
          {loading
            ? "Création..."
            : step === total - 1
            ? "Créer le Planning"
            : "Suivant"}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
