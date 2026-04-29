import { useState } from "react";
import "./Progress.css";
import Etape2 from '../Etape2/etape2';
import Etape3 from "../etape3/etape3";
import Recap from "../Recap/recap";

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  
    const steps = [
    {
      title: "Identification & Organisation",
      content: <StepOne />,
    },
    {
      title: "Localisation & Consistance",
      subtitle: "Dernière étape de la soumission",
      content: <StepTwo />,
    },
    {
      title: "Programmation & Impact",
      content: <StepThree />,
    },
    {
      title: "Recapitulatif de votre proposition de planning",
      content: <StepFour />,
    },
  ];

  const total = steps.length;
  const percent = ((step + 1) / total) * 100;

  const next = () => step < total - 1 && setStep(step + 1);
  const prev = () => step > 0 && setStep(step - 1);

  return (
     <div className="wrapper">
      {/* Progress Header */}
      <div className="top">
        <div>
          <small className="blue">
            ÉTAPE {step + 1} SUR {total}
          </small>
          <h2>{steps[step].title}</h2>
        </div>

        <span className="blue">{Math.round(percent)}%</span>
      </div>

      {/* Progress Bar */}
      <div className="bar">
        <div className="fill" style={{ width: `${percent}%` }}></div>
      </div>

      {/* Dynamic Step Content */}
      <div className="card">{steps[step].content}</div>

      {/* Buttons */}
      <div className="buttons">
        {step > 0 && (
          <button className="light" onClick={prev}>
            Précédent
          </button>
        )}

        <button onClick={next}>
          {step === total - 1 ? "Terminer" : "Suivant →"}
        </button>
      </div>
    </div>
  );
}

/* STEP 1 */
function StepOne() {




  // const handleAutoFill = (selectedService, selectedRef) => {
  //   const found = mockDatabase.find(
  //     item =>
  //       item.service === selectedService &&
  //       item.reference === selectedRef
  //   );

  //   if (found) {
  //     setData(found);
  //     setAutoFilled(true);
  //   } else {
  //     setAutoFilled(false);
  //   }
  // };

  return (
    <>
      <label>Services</label>
      <select className="service">
        <option>Sélectionner un Service</option>
      </select>
    
      <label>Référence</label>
    <div className="search-container">
      <span>🔍</span>
      {/* <select onChange={(e)=>setReference(e.target.value)} /> */}
    </div>

      <div className="grid">
        <Box title="Segment" />
        <Box title="Ouvrages"   />
        {/* <Box title="Départ"  text ="text" filled={autoFilled}/> */}
        <Box title="Départ"  tex ="text" />
      </div> 

    <div className="grid2">
        <div>
          <label>Unité demanderesse</label>
          <select>
            <option>Sélectionner une unité</option>
          </select>
        </div>

        <div>
          <label>Exploitations</label>
          <select>
            <option>Choisir l'exploitation</option>
          </select>
        </div>

        <div>
          <label>Types de travaux</label>
          <select>
            <option>Nature des travaux</option>
          </select>
        </div>

        <div>
          <label>Types de réseau</label>
          <select>
            <option>Sélectionner le réseau</option>
          </select>
        </div>
    </div>


    </>
  );
}

/* STEP 2 */
function StepTwo() {
  return (
    <>
       <Etape2 />
    </>
  );
}

/* STEP 3 */
function StepThree() {
  return (
    <>
    

      < Etape3 />
    </>
  );
}

function StepFour() {
  return (
    <>
    

      < Recap />
    </>
  );
}

/* REUSABLE BOX */
function Box({ title, text, filled }) {
  return (
    <div className="miniBoxWrap">
      <div className="miniTop">
        <small>{title}</small>

        <span className={`tag ${filled ? "done" : ""}`}>
          {filled ? "✔ AUTO-REMPLI" : "AUTO-REMPLI"}
        </span>
      </div>

      <div className="miniBox">
        <p>{text}</p>
      </div>
    </div>
  );
}