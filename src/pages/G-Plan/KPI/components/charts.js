import React, { useEffect, useRef } from "react";
import { COLORS } from "../constants/colors";

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