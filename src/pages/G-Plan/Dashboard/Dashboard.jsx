import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import GanttChart from "./Gantt-chart/gantt";
import Alerts from "./Alert/Alert";
import { BsCheckCircle, BsSend } from "react-icons/bs";
import { FaUserCog } from "react-icons/fa";
import { GrLineChart } from "react-icons/gr";

// Mock data for now
const mockedStatsData = [
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

  const [statsData, setStatsData] = useState(mockedStatsData);

  useEffect(() => {

    // Replace this later with the real backend URL
    fetch("http://localhost:5000/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
   // J'attend le id , le titre et la valeurs 
        // Add icons manually because backend won't send React icons
        const updatedData = data.map((item) => {
          switch (item.id) {
            case 1:
              return { ...item, icon: <FaUserCog /> };

            case 2:
              return { ...item, icon: <GrLineChart /> };

            case 3:
              return { ...item, icon: <BsSend /> };

            case 4:
              return { ...item, icon: <BsCheckCircle /> };

            default:
              return item;
          }
        });

        setStatsData(updatedData);
      })
      .catch((error) => {
        console.log("Backend not connected yet:", error);

        // keep mocked data if backend fails
        setStatsData(mockedStatsData);
      });

  }, []);

  return (
    <div className="Home">
      <div className="stats-container">

        {statsData.map((item) => (
          <div className="card" key={item.id}>

            <div className="card-top">

              <div className="icon-box">
                {item.icon}
              </div>

              {item.change && (
                <span className="change positive">
                  {item.change}
                </span>
              )}

              {item.badge && (
                <span className={`badge ${item.type}`}>
                  {item.badge}
                </span>
              )}

            </div>

            <div className="card-body">

              <p className="label">
                {item.title}
              </p>

              <h2 className={`value ${item.type === "danger" ? "danger" : ""}`}>
                {item.value}
              </h2>

            </div>

          </div>
        ))}

      </div>

      <div className="App">
        <GanttChart />
      </div>

      <div>
        <Alerts />
      </div>

    </div>
  );
}