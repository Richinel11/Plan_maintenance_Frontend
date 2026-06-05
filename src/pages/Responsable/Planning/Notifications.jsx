import React from "react";
import "./Notifications.css";
import { FiBell } from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";
import Liste from '../components/liste/liste';

const notifications = [
  {
    id: 1,
    title: "New Planning: REF 2024-001",
    subtitle: "Transmitted by Administrator",
    time: "Just now",
  },
  {
    id: 2,
    title: "New Planning: REF 2024-001",
    subtitle: "Transmitted by Administrator",
    time: "Just now",
  },
];

export default function Notifications() {
  return (
    <div className="notifications-wrapper">
      <div className="notifications-card">
        <div className="notifications-header">
          <div className="header-left">
            <span className="bell-icon"><FiBell /></span>
            <h3>Recent Notifications</h3>
          </div>

          <button className="mark-read-btn">
            Mark all as read
          </button>
        </div>

        <div className="notifications-list">
          {notifications.map((item) => (
            <div className="notification-item" key={item.id}>
              <div className="notification-left">
                <div className="notification-icon">
                  <HiOutlineDocumentText />
                </div>

                <div className="notification-content">
                  <h4>{item.title}</h4>
                  <p>{item.subtitle}</p>
                </div>
              </div>

              <div className="notification-right">
                <span className="time">{item.time}</span>

                <div className="actions">
                  <button className="review-btn">
                    Review
                  </button>

                  <button className="dismiss-btn">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Liste />
    </div>
  );
}