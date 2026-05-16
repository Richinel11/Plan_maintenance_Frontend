import { useState, useEffect } from "react";

import {
  ArrowRight,
} from "lucide-react";

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
} from "../../../../services/referencetielService";



import {
  mapPlanningPayload,
} from "../../../../utils/planningMapper";

import {
  getPlannings, // ✅ NEW IMPORT
  createPlanning,
} from "../../../../API/planningService";

export default function MultiStepForm() {
  const [plannings, setPlannings] = useState([]); // ✅ FIXED FEATURE

  const [step, setStep] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  /* ---------------- STATES ---------------- */

  const [references, setReferences] =
    useState([]);

  const [typesActivite, setTypesActivite] =
    useState([]);

  const [ouvrages, setOuvrages] =
    useState([]);

  const [postes, setPostes] =
    useState([]);

  const [departs, setDeparts] =
    useState([]);

  const [troncons, setTroncons] =
    useState([]);


  // const [ setPlannings] = useState([]); // ✅ NEW STATE
  /* ---------------- SERVICE ROLE ---------------- */

  const {
    service,
    setService,
    fields,
    options,
    referenceConfig,
  } = useServiceRole();

  /* ---------------- FORM DATA ---------------- */

  const [formData, setFormData] =
    useState({
      Reference: "",
      reference_id: null,
      planning_id: null, // ✅ NEW FIELD ADDED (IMPORTANT)
      ouvrage_id: null,
      poste_id: null,
      depart_id: null,
      troncon_id: null,

      Segments: "",
      Ouvrages: "",
      Poste: "",
      Departs: "",

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
    });

  /* ---------------- LOAD REFERENTIEL ---------------- */

  useEffect(() => {

    const fetchReferentielData =
      async () => {

        try {

          const [
            ouvragesData,
            postesData,
            departsData,
            tronconsData,
            referencesData,
            typesData,
            planningsData,
          ] = await Promise.all([
            getOuvrages(),
            getPostes(),
            getDeparts(),
            getTroncons(),
            getReferences(),
            getTypesActivite(),
            getPlannings(), // ✅ IMPORTANT
          ]);

         setOuvrages(ouvragesData);
        setPostes(postesData);
        setDeparts(departsData);
        setTroncons(tronconsData);
        setReferences(referencesData);
        setTypesActivite(typesData);
        setPlannings(planningsData);

        } catch (error) {

          console.error(
            "Erreur chargement référentiel :",
            error
          );
        }
      };

    fetchReferentielData();

  }, []);

  /* ---------------- LOAD REFERENCES ---------------- */

  useEffect(() => {

    const fetchNetworkReferences =
      async () => {

        try {

          const data =
            await getReferences();

          setReferences(data);

        } catch (error) {

          console.error(
            "Erreur chargement références :",
            error
          );
        }
      };

    fetchNetworkReferences();

  }, []);

  /* ---------------- LOAD TYPES ACTIVITE ---------------- */

  useEffect(() => {

    const fetchTypes =
      async () => {

        try {

          const data =
            await getTypesActivite();

          setTypesActivite(data);

        } catch (error) {

          console.error(
            "Erreur chargement types activité :",
            error
          );
        }
      };

    fetchTypes();

  }, []);

  /* ---------------- UPDATE SERVICE ---------------- */

  useEffect(() => {

    setFormData((prev) => ({
      ...prev,
      service,
    }));

  }, [service]);

  /* ---------------- AUTO GENERATE REFERENCE ---------------- */

  useEffect(() => {

    if (!referenceConfig?.length)
      return;

    const fieldValues = {

      ouvrage_id:
        ouvrages.find(
          (o) =>
            o.id === Number(
              formData.ouvrage_id
            )
        )?.nom || "",

      poste_id:
        postes.find(
          (p) =>
            p.id === Number(
              formData.poste_id
            )
        )?.nom || "",

      troncon_id:
        troncons.find(
          (t) =>
            t.id === Number(
              formData.troncon_id
            )
        )?.nom || "",

      depart_id:
        departs.find(
          (d) =>
            d.id === Number(
              formData.depart_id
            )
        )?.nom || "",

      Segments:
        formData.Segments || "",

      Ouvrages:
        formData.Ouvrages || "",

      Poste:
        formData.Poste || "",

      Departs:
        formData.Departs || "",
    };

    const values =
      referenceConfig
        .map((field) =>
          fieldValues[field]
        )
        .filter(Boolean);

    const newRef =
      values.join("-");

    if (
      newRef !==
      formData.Reference
    ) {

      setFormData((prev) => ({
        ...prev,
        Reference: newRef,
      }));
    }

  }, [
    referenceConfig,

    formData.ouvrage_id,
    formData.poste_id,
    formData.troncon_id,
    formData.depart_id,

    formData.Segments,
    formData.Ouvrages,
    formData.Poste,
    formData.Departs,
    formData.Reference,

    ouvrages,
    postes,
    departs,
    troncons,
  ]);

  /* ---------------- HANDLE CHANGE ---------------- */

  const handleInputChange =
    (field, value) => {

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  /* ---------------- HANDLE REFERENCE ---------------- */



  /* ---------------- SUBMIT ---------------- */

  const handleSubmitPlanning =
    async () => {

      try {

        setLoading(true);

        const payload =
          mapPlanningPayload(
            formData
          );

        console.log(
          "PAYLOAD =>",
          payload
        );

        await createPlanning(
          payload
        );

        alert(
          "Planning créé avec succès"
        );

      } catch (error) {

        console.error(error);

        console.log(
          "BACKEND ERROR =>",
          error.response?.data
        );

        alert(
          "Erreur lors de la création du planning"
        );

      } finally {

        setLoading(false);
      }
    };

  /* ---------------- STEPS ---------------- */

/* ---------------- STEPS ---------------- */

 const steps = [
    {
      title: "Identification & Organisation",
      content: (
        <>
          {/* ✅ NEW PLANNING SELECT FIELD */}
          <div style={{ marginBottom: 20 }}>
            <label>Associer à un planning existant</label>

            <select
              value={formData.planning_id || ""}
              onChange={(e) =>
                handleInputChange("planning_id", e.target.value)
              }
              style={{
                width: "100%",
                padding: "10px",
                marginTop: 8,
              }}
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
            onReferenceChange={(val) =>
              handleInputChange("reference_id", val)
            }
            typesActivite={typesActivite}
            service={service}
            fields={fields}
            options={options}
          />
        </>
      ),
    },

    {
      title: "Localisation & Consistance",
      content:
        service === "distribution" ? (
          <Etape2
            formData={formData}
            onChange={handleInputChange}
            // fields={fields}
            // options={options}
          />
        ) : (
          <div style={{ padding: 40, textAlign: "center" }}>
            Étape non nécessaire pour {service}
          </div>
        ),
    },

    {
      title: "Programmation & Impact",
      content: (
        <Etape3
          formData={formData}
          onChange={handleInputChange}
          // fields={fields}
          // options={options}
        />
      ),
    },

    {
      title: "Récapitulatif",
      content: <Recap formData={formData} />,
    },
  ];


  /* ---------------- NAVIGATION ---------------- */

  const total =
    steps.length;

  const percent =
    ((step + 1) / total) *
    100;

  const next = () => {
    setStep((prev) => Math.min(prev + 1, total - 1));
  }

  const prev = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="wrapper">

      {/* SERVICE SWITCHER */}

      <div
        style={{
          padding: "10px",
          background: "#f8d7da",
          color: "#721c24",
          marginBottom: "15px",
          borderRadius: "5px",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          border:
            "1px solid #f5c6cb",
        }}
      >

        <strong>
          🛠️ Outil de Test :
          Changer le Service
        </strong>

        <select
          value={service}
          onChange={(e) =>
            setService(
              e.target.value
            )
          }
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            border:
              "1px solid #ccc",
            cursor: "pointer",
          }}
        >

          <option value="transport">
            Transport
          </option>

          <option value="distribution">
            Distribution
          </option>

          <option value="production">
            Production
          </option>

        </select>

      </div>

      {/* HEADER */}

      <div className="progress-header">

        <div className="header-top">

          <div className="step-info">

            <span className="step-count">
              ÉTAPE {step + 1} SUR{" "}
              {total}
            </span>

            <h2 className="step-title">
              {steps[step]?.title}
            </h2>

          </div>

          <span className="step-percent">
            {Math.round(percent)}%
          </span>

        </div>

        <div className="progress-bar-container">

          <div
            className="progress-bar-fill"
            style={{
              width: `${percent}%`,
            }}
          />

        </div>

      </div>

      {/* CONTENT */}

      <div className="main-content">
        {steps[step]?.content}
      </div>

      {/* FOOTER */}

      <div className="footer-actions">

        {step > 0 && (
          <button
            className="btn-prev"
            onClick={prev}
          >
            Précédent
          </button>
        )}

        <button
          className="btn-next"
          onClick={
            step === total - 1
              ? handleSubmitPlanning
              : next
          }
          disabled={loading}
        >

          {loading
            ? "Création..."
            : step === total - 1
            ? "Créer Planning"
            : "Suivant"}

          <ArrowRight size={18} />

        </button>

      </div>

    </div>
  );
}