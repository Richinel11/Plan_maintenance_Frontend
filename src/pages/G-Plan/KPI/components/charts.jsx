import React, { useEffect, useRef } from "react";
import { COLORS } from "../components/kpi";

export function DonutChart({ pct, color, label }) {
  const r = 50, cx = 60, cy = 60, stroke = 12;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8eaed" strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`} />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={18} fontWeight={700} fill={color}>{pct}%</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={9} fill={COLORS.textMuted}>{label}</text>
      </svg>
    </div>
  );
}

export function MiniBar({ value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, background: "#e8eaed", borderRadius: 3, height: 6 }}>
        <div style={{ width: `${pct}%`, background: color || COLORS.blue, borderRadius: 3, height: 6 }} />
      </div>
      <span style={{ fontSize: 10, color: COLORS.textMuted, minWidth: 24 }}>{value}%</span>
    </div>
  );
}

export function BarChart({ data, height = 160 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const pad = { top: 16, right: 16, bottom: 40, left: 36 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    ctx.clearRect(0, 0, W, H);
    const groups = data.labels.length;
    const series = data.datasets.length;
    const allVals = data.datasets.flatMap(d => d.data);
    const maxVal = Math.max(...allVals) * 1.15;
    const gw = chartW / groups;
    const bw = (gw * 0.7) / series;
    ctx.fillStyle = "#f0f2f5";
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + chartH - (i / 4) * chartH;
      ctx.fillRect(pad.left, y, chartW, 0.5);
      ctx.fillStyle = COLORS.textMuted;
      ctx.font = "9px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(Math.round((i / 4) * maxVal), pad.left - 4, y + 3);
      ctx.fillStyle = "#f0f2f5";
    }
    data.datasets.forEach((ds, si) => {
      ds.data.forEach((val, gi) => {
        const x = pad.left + gi * gw + (gw * 0.15) + si * bw;
        const h = (val / maxVal) * chartH;
        const y = pad.top + chartH - h;
        ctx.fillStyle = ds.color;
        ctx.fillRect(x, y, bw - 2, h);
      });
    });
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = "9px system-ui";
    ctx.textAlign = "center";
    data.labels.forEach((lbl, gi) => {
      const x = pad.left + gi * gw + gw / 2;
      ctx.fillText(lbl, x, H - 8);
    });
  }, [data]);
  return <canvas ref={canvasRef} width={500} height={height} style={{ width: "100%", height: height }} />;
}

export function LineBarChart({ data, height = 220 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext("2d");
    
    // Définition des dimensions réelles basées sur la densité d'affichage
    const W = canvas.width;
    const H = canvas.height;
    const pad = { top: 20, right: 40, bottom: 40, left: 40 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    const itemsCount = data.labels.length;
    if (itemsCount === 0) return;

    // Calcul des échelles max pour l'axe Y gauche (Budget/Actual) et Y droit (Ligne %)
    const maxBarVal = Math.max(...data.bars.budget, ...data.bars.actual, 1) * 1.15;
    const maxLineVal = 100 * 1.1; // Pourcentage max fixé à 110% pour laisser de l'espace

    const gw = chartW / itemsCount; // largeur d'un groupe
    const bw = (gw * 0.6) / 2;      // largeur d'une barre individuelle

    // 1. Dessin de la grille horizontale d'arrière-plan
    ctx.fillStyle = "#f0f2f5";
    for (let i = 0; i <= 4; i++) {
      const ratio = i / 4;
      const y = pad.top + chartH - ratio * chartH;
      
      // Ligne de repère
      ctx.fillRect(pad.left, y, chartW, 0.5);

      // Label Axe Gauche (Nombre d'activités)
      ctx.fillStyle = COLORS.textMuted || "#718096";
      ctx.font = "9px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(Math.round(ratio * maxBarVal), pad.left - 6, y + 3);

      // Label Axe Droit (Taux de complétion %)
      ctx.textAlign = "left";
      ctx.fillText(Math.round(ratio * maxLineVal) + "%", pad.left + chartW + 6, y + 3);
      ctx.fillStyle = "#f0f2f5";
    }

    // 2. Dessin des barres (Budget vs Actual)
    data.labels.forEach((lbl, i) => {
      const groupX = pad.left + i * gw;

      // Barre 1 : Budget
      const valBudget = data.bars.budget[i] || 0;
      const hBudget = (valBudget / maxBarVal) * chartH;
      const yBudget = pad.top + chartH - hBudget;
      ctx.fillStyle = COLORS.barBlue || "#1B75BB";
      ctx.fillRect(groupX + (gw * 0.2), yBudget, bw - 2, hBudget);

      // Barre 2 : Actual
      const valActual = data.bars.actual[i] || 0;
      const hActual = (valActual / maxBarVal) * chartH;
      const yActual = pad.top + chartH - hActual;
      ctx.fillStyle = COLORS.barGreen || "#2E7D32";
      ctx.fillRect(groupX + (gw * 0.2) + bw, yActual, bw - 2, hActual);
    });

    // 3. Dessin de la ligne de tendance (Compl. Rate %)
    ctx.strokeStyle = "#D32F2F"; // Couleur rouge d'accentuation pour la ligne
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.labels.forEach((lbl, i) => {
      const groupX = pad.left + i * gw;
      const centerX = groupX + gw / 2; // Point ancré au centre du groupe
      
      const valLine = data.line[i] || 0;
      const yLine = pad.top + chartH - (valLine / maxLineVal) * chartH;

      if (i === 0) ctx.moveTo(centerX, yLine);
      else ctx.lineTo(centerX, yLine);
    });
    ctx.stroke();

    // Ajouter des ronds sur les points clés de la ligne
    data.labels.forEach((lbl, i) => {
      const groupX = pad.left + i * gw;
      const centerX = groupX + gw / 2;
      const valLine = data.line[i] || 0;
      const yLine = pad.top + chartH - (valLine / maxLineVal) * chartH;

      ctx.fillStyle = "#D32F2F";
      ctx.beginPath();
      ctx.arc(centerX, yLine, 3.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(centerX, yLine, 1.5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // 4. Inscription des étiquettes textuelles au bas du graphique
    ctx.fillStyle = COLORS.textMuted || "#718096";
    ctx.font = "9px system-ui";
    ctx.textAlign = "center";
    data.labels.forEach((lbl, i) => {
      const x = pad.left + i * gw + gw / 2;
      ctx.fillText(lbl, x, H - 12);
    });

  }, [data]);

  return (
    <canvas 
      ref={canvasRef} 
      width={500} 
      height={height} 
      style={{ width: "100%", height: height, display: "block" }} 
    />
  );
}