// ExportPlanningButton.jsx
import React from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

const ExportPlanningButton = ({ excelData, fileName = "planning" }) => {
  const handleExport = () => {
    if (!excelData || excelData.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    try {
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Planning");

      const exportFileName = `${fileName
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase()}_${new Date().toISOString().slice(0, 10)}.xlsx`;

      XLSX.writeFile(wb, exportFileName);
      toast.success("✅ Planning exporté avec succès !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'exportation du fichier");
    }
  };

  return (
    <button
      type="button"
      className="btn-export"
      onClick={handleExport}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 18px",
        background: "linear-gradient(135deg, #10b981, #059669)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(16, 185, 129, 0.4)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
      }}
    >
      <svg
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Exporter Excel
    </button>
  );
};

export default ExportPlanningButton;