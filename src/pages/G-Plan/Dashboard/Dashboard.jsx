import React from "react";
// import { useEffect, useState} from "react"; // A de-commenter aussi
import "./Dashboard.css";
import GanttChart from "./Gantt-chart/gantt";
import Alerts from "./Alert/Alert";
import { BsCheckCircle, BsSend } from "react-icons/bs";
import { FaUserCog } from "react-icons/fa"; 
import { GrLineChart } from "react-icons/gr"; 

const statsData = [
  {
    id: 1,
    title: "Travaux ce mois",
    value: 124,
    change: "+4.2%",
    type: "positive",
    icon: <FaUserCog />,
  },
  {
    id: 2,
    title: "Conflits non traités",
    value: 8,
    badge: "ATTENTION",
    type: "danger",
    icon: <GrLineChart />,
  },
  {
    id: 3,
    title: "Plannings transmis",
    value: 45,
    badge: "ÉTABLE",
    type: "neutral",
    icon: <BsSend />,
  },
  {
    id: 4,
    title: "Plannings clôturés",
    value: 92,
    change: "+12%",
    type: "positive",
    icon: <BsCheckCircle />,
  },
];


export default function StatsCards() {

 // Code pour connecter au backend qu'il faudra de-commenter
    // const [statsData, setStatsData] = useState([]);
    
    // useEffect(() => {
    //   fetch("/api/dashboard/stats")
    //     .then(res => res.json())
    //     .then(data => setStatsData(data));
    // }, []);


  return (
    <div className="Home"> 
      <div className="stats-container">
        {statsData.map((item) => (
          <div className="card" key={item.id}>
            
            <div className="card-top">
              <div className="icon-box">{item.icon}</div>

              {item.change && (
                <span className="change positive">{item.change}</span>
              )}

              {item.badge && (
                <span className={`badge ${item.type}`}>
                  {item.badge}
                </span>
              )}
            </div>

            <div className="card-body">
              <p className="label">{item.title}</p>
              <h2 className={`value ${item.type === "danger" ? "danger" : ""}`}>
                {item.value}
              </h2>
            </div>

          </div>
        ))}
      </div>

      <div className="App">
        {/* <h1>My Project Timeline</h1> */}
        <GanttChart  />
      </div>

      <div>
          <Alerts />
      </div>

    </div>
  );
}