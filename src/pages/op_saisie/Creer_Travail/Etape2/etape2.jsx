import React from "react";
import "./etape2.css";

const Etape = () => {

    return(
    <>
                   
        <div className="part1">
            <h2>Tronçons / Consignes</h2>
            <input type="text" placeholder="Rechercher un poste (ex: Logbaba, Oyomabang...)" />
        </div>

        <div className="part2">
            <h2>Consistances des travaux</h2>
            <input placeholder="Décrivez en détail la nature technique de l'intervention..." ></input>
        </div>

        <div className="part3">
            <h2>Localités impactées</h2>
            <input placeholder="Rechercher localités impactées"></input>
        </div>

        <div className="part4">
            <div className="part-child">
                <h2>Moyens mis en oeuvre</h2>
                <select className="">
                    <option >Sélectionner les ressources</option>
                </select>
            </div>
            
            <div className="part-child">
                <h2>Charges de consignations</h2>
                <input type="text" placeholder="Nom du chargé de consignation..." />
            </div>
            Filtré selon le segment selectionné
        </div>
        
    </>
    );
};

export default Etape;