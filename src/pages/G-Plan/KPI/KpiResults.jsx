import React, { useState, useRef } from 'react';
import { COLORS, styles } from "./components/kpi";
import { DonutChart, MiniBar, BarChart } from "./components/charts";

import Page1 from './KPI1/kpi1';
import Page2 from './KPI2/KPI2';
import Page3 from './KPI3/kpi3';
import Page4 from './KPI4/kpi4';
import Page5 from './KPI5/kpi5';
import Page6 from './KPI6/kpi6';
import Page7 from './KPI7/kpi7';
import Page8 from './KPI8/kpi8';

const PAGES = [
  { id: 1, label: "1. Plannings secteur", component: Page1 },
  { id: 2, label: "2. Maintenance DCP", component: Page2 },
  { id: 3, label: "3. Disponibilité IPPs", component: Page3 },
  { id: 4, label: "4. Maintenance TRANSPORT", component: Page4 },
  { id: 5, label: "5. Distribution POSTE", component: Page5 },
  { id: 6, label: "6. Distribution RÉSEAU", component: Page6 },
  { id: 7, label: "7. Impact KPI (SAIDI-SAIFI)", component: Page7 },
  { id: 8, label: "8. ENDs épargnées", component: Page8 },
];

export default function KPI({ selectedMonth: propMonth }) {
  const [active, setActive] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(propMonth || "Avril 2026");
  const printRef = useRef(null);

  const PageComponent = PAGES.find(p => p.id === active)?.component || Page1;

  const handlePrint = () => {
    document.body.classList.add('print-mode');
    setTimeout(() => {
      window.print();
      setTimeout(() => document.body.classList.remove('print-mode'), 2000);
    }, 600);
  };

  return (
    <div style={styles.app}>
      {/* Non-printable UI */}
      <div className="no-print">
        {/* Top Header */}
        <div style={{ background: "#1a3a5c", color: "#fff", padding: "10px 16px", fontSize: 13, fontWeight: 600, display: "flex", justifyContent: "space-between" }}>
          <span>📊 Rapport de Performance — Réseau Électrique</span>
          <span>{selectedMonth}</span>
        </div>

        {/* Toolbar */}
        <div style={{ padding: "12px 16px", background: "#f8f9fa", borderBottom: "1px solid #eee" }}>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", marginRight: "12px" }}
          >
            {["Janvier","Février","Mars","Avril","Mai","Juin"].map(m => (
              <option key={m} value={`${m} 2026`}>{m} 2026</option>
            ))}
          </select>

          <button onClick={handlePrint} style={{ padding: "8px 16px" }}>
            🖨️ Télécharger PDF
          </button>
        </div>

        {/* Tabs */}
        <nav style={styles.nav}>
          {PAGES.map(p => (
            <button
              key={p.id}
              style={styles.navTab(active === p.id)}
              onClick={() => setActive(p.id)}
            >
              {p.label}
            </button>
          ))}
        </nav>
      </div>

      {/* === PRINTABLE CONTENT === */}
      <div ref={printRef} className="print-area">
        <PageComponent 
          selectedMonth={selectedMonth}
          styles={styles}
          COLORS={COLORS}
          BarChart={BarChart}
          DonutChart={DonutChart}
        />
      </div>

      {/* === STRONG PRINT STYLES === */}
      <style>{`
        @media print {
          .no-print { 
            display: none !important; 
          }

          .print-area, .print-area * {
            visibility: visible !important;
            display: block !important;
          }

          body, html, .print-area {
            background: white !important;
            margin: 0 !important;
            padding: 20px !important;
            width: 100% !important;
          }

          /* Charts */
          canvas, svg, img {
            display: block !important;
            max-width: 100% !important;
            height: auto !important;
            page-break-inside: avoid !important;
          }

          /* Cards & Tables */
          div[style*="card"], .card, [class*="card"] {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 20px !important;
            border: 1px solid #ddd !important;
            box-shadow: none !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          th, td {
            border: 1px solid #ccc !important;
            padding: 8px !important;
          }

          * { box-sizing: border-box !important; }
        }
      `}</style>
    </div>
  );
}