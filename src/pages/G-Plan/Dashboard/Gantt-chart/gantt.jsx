import React, { useEffect, useState } from 'react';
import "./gantt.css";
import mockData from "../data/ganttData"; 
import { GrFormPrevious, GrFormNext } from "react-icons/gr"; 

const days = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

export default function GanttChart() {
  const [allData, setAllData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(42);

  useEffect(() => {
    setAllData(mockData);
  }, []);

  // my connection to the db

  useEffect(() => {
  fetch("http://localhost:8000/tasks")
    .then(res => res.json())
    .then(data => {
      setAllData(data);
    })
    .catch(err => console.error(err));
}, []);

  const goToPreviousWeek = () => setCurrentWeek(w => w - 1);
  const goToNextWeek = () => setCurrentWeek(w => w + 1);

  const getWeekHeader = (week) => {
    const baseDate = new Date(2024, 9, 16); // Semaine 42 = 16 Oct
    const startDate = new Date(baseDate);
    startDate.setDate(startDate.getDate() + (week - 42) * 7);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    return `Semaine ${week} (${startDate.toLocaleDateString('fr-FR', {day:'numeric', month:'short'})} - ${endDate.toLocaleDateString('fr-FR', {day:'numeric', month:'short'})})`;
  };


      function assignTaskLanes(tasks) {
      const lanes = [];

      return tasks.map(task => {
        let assignedLane = 0;

        // Find first available lane
        while (true) {
          const lane = lanes[assignedLane];

          if (!lane) {
            lanes[assignedLane] = [task];
            break;
          }

          // Check overlap
          const overlaps = lane.some(existingTask => {
            return (
              task.start < existingTask.end &&
              task.end > existingTask.start
            );
          });

          if (!overlaps) {
            lane.push(task);
            break;
          }

          assignedLane++;
        }

        return {
          ...task,
          lane: assignedLane
        };
      });
    }


  // ==================== FILTERING LOGIC ====================
  const filteredData = allData.map(resource => {
    const filteredTasks = resource.tasks.filter(task => {
      // Case 1: Task uses numbers (your current mockData)
      if (typeof task.start === 'number' && typeof task.end === 'number') {
        return true; // show all for now with mock data
      }

      // Case 2: Task uses real dates (when backend is connected)
      if (task.startDate && task.endDate) {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.endDate);
        const weekStart = new Date(2024, 9, 16);
        weekStart.setDate(weekStart.getDate() + (currentWeek - 42) * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        return taskEnd >= weekStart && taskStart <= weekEnd;
      }
      return false;
    });

    return { ...resource, tasks: filteredTasks };
  }).filter(resource => resource.tasks.length > 0);

  // ==================== RENDER ====================
  return (
    <div className="gantt-container">
      <div className="gantt-header">
        <h3>Aperçu Gantt Hebdomadaire</h3>
        <div className="week">
          <GrFormPrevious onClick={goToPreviousWeek} style={{ cursor: 'pointer' }} />
          <span>{getWeekHeader(currentWeek)}</span>
          <GrFormNext onClick={goToNextWeek} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      <div className="gantt-days">
        <div className="resource-label">RESSOURCE</div>
        {days.map((day) => <div key={day}>{day}</div>)}
      </div>

      {filteredData.map((row, i) => (
        <div className="gantt-row" key={i}>
          <div className="resource">{row.name}</div>

            <div
              className="timeline"
              style={{
                height: `${
                  (Math.max(...assignTaskLanes(row.tasks).map(t => t.lane)) + 1) * 40
                }px`
              }}
            >
            {assignTaskLanes(row.tasks).map((task, j) => {
              // Position logic for number-based tasks (mock)
              if (typeof task.start === 'number') {
                return (
                  <div
                    key={j}
                    className={`task ${task.color}`}
                    style={{
                      left: `${(task.start / 7) * 100}%`,
                      width: `${((task.end - task.start) / 7) * 100}%`,
                      top: `${task.lane * 35}px`,
                    }}
                  />
                );
              }

              // Position logic for real dates (backend)
              const weekStart = new Date(2024, 9, 16);
              weekStart.setDate(weekStart.getDate() + (currentWeek - 42) * 7);
              
              const taskStart = new Date(task.startDate);
              const daysOffset = Math.max(0, Math.floor((taskStart - weekStart) / (86400000)));
              const duration = Math.ceil((new Date(task.endDate) - taskStart) / 86400000);

              return (
                <div
                  key={j}
                  className={`task ${task.color}`}
                  style={{
                    left: `${(daysOffset / 7) * 100}%`,
                    width: `${(Math.min(duration, 7) / 7) * 100}%`,
                    top: `${task.lane * 35}px`,
                  }}
                  title={task.name}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}