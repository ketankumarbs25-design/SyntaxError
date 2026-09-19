/**
 * FLOWSHIELD — HeatmapCanvas
 *
 * DPI-aware, high-performance HTML5 Canvas renderer for the 2D flood simulation lattice.
 * Renders:
 * - Topographic elevation relief shading
 * - Dynamic water depth gradient (cyan / deep blue)
 * - Risk classification boundaries (Safe: Emerald, Warning: Amber, Critical: Red glow)
 * - Dynamic flow vectors / gradient arrows along hydraulic head slopes
 * - Blocked channel hazard overlays
 * - Interactive hover inspector and coordinate labels (A1..H8)
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { CellState } from '../../sim/types';

interface HeatmapCanvasProps {
  cells: CellState[];
  rows: number;
  cols: number;
  blockedCells?: Set<string>;
  selectedCellId?: string | null;
  emergencyMode?: boolean;
  onCellClick?: (cell: CellState) => void;
}

export const HeatmapCanvas: React.FC<HeatmapCanvasProps> = ({
  cells,
  rows,
  cols,
  blockedCells = new Set(),
  selectedCellId = null,
  emergencyMode = false,
  onCellClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<CellState | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Map of cells by row and col for fast O(1) lookup
  const cellMap = useRef<Map<string, CellState>>(new Map());
  useEffect(() => {
    const map = new Map<string, CellState>();
    cells.forEach((c) => {
      map.set(`r${c.row}c${c.col}`, c);
    });
    cellMap.current = map;
  }, [cells]);

  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const padding = 28; // Space for A-H and 1-8 labels
    const gridW = width - padding * 2;
    const gridH = height - padding * 2;
    const cellW = gridW / cols;
    const cellH = gridH / rows;

    // 1. Draw coordinate axis labels
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#64748b'; // slate-500

    // Column numbers (1..cols)
    for (let c = 0; c < cols; c++) {
      const cx = padding + c * cellW + cellW / 2;
      ctx.fillText(`${c + 1}`, cx, padding / 2);
      ctx.fillText(`${c + 1}`, cx, height - padding / 2);
    }

    // Row letters (A..rows)
    for (let r = 0; r < rows; r++) {
      const cy = padding + r * cellH + cellH / 2;
      const letter = String.fromCharCode(65 + r);
      ctx.fillText(letter, padding / 2, cy);
      ctx.fillText(letter, width - padding / 2, cy);
    }

    // 2. Render each cell in grid
    cells.forEach((cell) => {
      const x = padding + cell.col * cellW;
      const y = padding + cell.row * cellH;
      const gap = 2; // subtle cell separation
      const innerX = x + gap;
      const innerY = y + gap;
      const innerW = cellW - gap * 2;
      const innerH = cellH - gap * 2;

      const isBlocked = blockedCells.has(cell.id);
      const isSelected = selectedCellId === cell.id;
      const isCritical = cell.risk === 'CRITICAL';
      const isWarning = cell.risk === 'WARNING';

      // Base terrain elevation color (dark topographic contour palette)
      const elevNorm = Math.min(1, Math.max(0, cell.elevation / 1.5));
      const baseR = Math.round(10 + elevNorm * 18);
      const baseG = Math.round(16 + elevNorm * 24);
      const baseB = Math.round(28 + elevNorm * 38);

      // Water depth color blend (cyan/blue gradient)
      const waterDepth = cell.water;
      const hasWater = waterDepth > 0.001;
      const waterNorm = Math.min(1.0, waterDepth / 0.8);

      // Create cell fill
      ctx.save();
      ctx.beginPath();
      // Round rect
      const radius = 6;
      ctx.roundRect(innerX, innerY, innerW, innerH, radius);

      if (isCritical) {
        // Critical inundation: intense crimson with alpha based on severity
        const critAlpha = Math.min(0.9, 0.45 + (waterDepth / 0.6) * 0.4);
        ctx.fillStyle = `rgba(239, 68, 68, ${critAlpha})`;
      } else if (isWarning) {
        // Warning: amber/orange glow
        const warnAlpha = Math.min(0.8, 0.35 + (waterDepth / 0.3) * 0.35);
        ctx.fillStyle = `rgba(245, 158, 11, ${warnAlpha})`;
      } else if (hasWater) {
        // Safe standing water: clean cyan-blue gradient
        const blueAlpha = Math.min(0.75, 0.2 + waterNorm * 0.55);
        ctx.fillStyle = `rgba(6, 182, 212, ${blueAlpha})`;
      } else {
        // Dry terrain
        ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
      }
      ctx.fill();

      // Border outline
      if (isSelected) {
        ctx.strokeStyle = '#00e5ff'; // Cyan selection ring
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 10;
        ctx.stroke();
      } else if (isCritical) {
        ctx.strokeStyle = '#f87171'; // Red outline
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
        ctx.shadowBlur = 8;
        ctx.stroke();
      } else if (isWarning) {
        ctx.strokeStyle = '#fbbf24'; // Amber outline
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(23, 36, 59, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // Cell Inner Water Ripple / Topo Contours
      if (hasWater) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(innerX + innerW * 0.7, innerY + innerH * 0.3, innerW * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fill();
        ctx.restore();
      }

      // Blocked Channel Hazard Indicator (Hazard cross)
      if (isBlocked) {
        ctx.save();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(innerX + 6, innerY + 6);
        ctx.lineTo(innerX + innerW - 6, innerY + innerH - 6);
        ctx.moveTo(innerX + innerW - 6, innerY + 6);
        ctx.lineTo(innerX + 6, innerY + innerH - 6);
        ctx.stroke();
        ctx.restore();
      }

      // Small readout inside cell: Zone name (top left) & Depth (bottom right)
      ctx.save();
      const zoneName = `${String.fromCharCode(65 + cell.row)}${cell.col + 1}`;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isCritical ? '#fee2e2' : isWarning ? '#fef3c7' : '#94a3b8';
      ctx.fillText(zoneName, innerX + 4, innerY + 4);

      if (hasWater) {
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = isCritical ? '#ffffff' : '#e0f2fe';
        ctx.fillText(`${waterDepth.toFixed(2)}m`, innerX + innerW - 4, innerY + innerH - 4);
      }
      ctx.restore();
    });

    // 3. Render Inter-Cell Flow Gradient Arrows (Jacobi flow vectors)
    cells.forEach((cell) => {
      if (cell.water < 0.01) return;
      const head_i = cell.elevation + cell.water;
      const x_i = padding + cell.col * cellW + cellW / 2;
      const y_i = padding + cell.row * cellH + cellH / 2;

      const neighbours = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
      ];

      neighbours.forEach(({ dr, dc }) => {
        const nr = cell.row + dr;
        const nc = cell.col + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return;

        const neighbor = cellMap.current.get(`r${nr}c${nc}`);
        if (!neighbor) return;

        const head_j = neighbor.elevation + neighbor.water;
        const drop = head_i - head_j;
        if (drop > 0.04) {
          // Flow moving towards neighbor
          const x_j = padding + nc * cellW + cellW / 2;
          const y_j = padding + nr * cellH + cellH / 2;

          const startX = x_i + dr * 8;
          const startY = y_i + dc * 8;
          const endX = x_i + (x_j - x_i) * 0.42;
          const endY = y_i + (y_j - y_i) * 0.42;

          ctx.save();
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
          ctx.fillStyle = 'rgba(0, 229, 255, 0.65)';
          ctx.lineWidth = 1.5;

          // Arrow line
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Arrowhead
          const angle = Math.atan2(endY - startY, endX - startX);
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - 5 * Math.cos(angle - Math.PI / 6),
            endY - 5 * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            endX - 5 * Math.cos(angle + Math.PI / 6),
            endY - 5 * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });
    });

    ctx.restore();
  }, [cells, rows, cols, blockedCells, selectedCellId]);

  useEffect(() => {
    drawHeatmap();
  }, [drawHeatmap]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => drawHeatmap();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawHeatmap]);

  // Mouse Move for Hover & Tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = 28;
    const gridW = rect.width - padding * 2;
    const gridH = rect.height - padding * 2;
    const cellW = gridW / cols;
    const cellH = gridH / rows;

    const colIndex = Math.floor((x - padding) / cellW);
    const rowIndex = Math.floor((y - padding) / cellH);

    if (colIndex >= 0 && colIndex < cols && rowIndex >= 0 && rowIndex < rows) {
      const cell = cellMap.current.get(`r${rowIndex}c${colIndex}`);
      if (cell) {
        setHoveredCell(cell);
        setTooltipPos({ x: e.clientX, y: e.clientY });
        return;
      }
    }

    setHoveredCell(null);
    setTooltipPos(null);
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
    setTooltipPos(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = 28;
    const gridW = rect.width - padding * 2;
    const gridH = rect.height - padding * 2;
    const cellW = gridW / cols;
    const cellH = gridH / rows;

    const colIndex = Math.floor((x - padding) / cellW);
    const rowIndex = Math.floor((y - padding) / cellH);

    if (colIndex >= 0 && colIndex < cols && rowIndex >= 0 && rowIndex < rows) {
      const cell = cellMap.current.get(`r${rowIndex}c${colIndex}`);
      if (cell) {
        onCellClick?.(cell);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-square max-w-[620px] mx-auto rounded-2xl bg-[#0a101f]/80 border border-[#17243b] p-2 shadow-2xl backdrop-blur-md overflow-hidden ${
        emergencyMode ? 'ring-2 ring-red-500/50 shadow-red-500/20' : ''
      }`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer block"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {/* Floating Hover Tooltip */}
      {hoveredCell && tooltipPos && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-2 rounded-xl bg-slate-950/95 border border-cyan-500/30 text-xs shadow-2xl backdrop-blur-lg -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y - 12}px` }}
        >
          <div className="flex items-center justify-between gap-3 pb-1 border-b border-slate-800">
            <span className="font-bold text-white font-mono flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  hoveredCell.risk === 'CRITICAL'
                    ? 'bg-red-500 shadow-sm shadow-red-500'
                    : hoveredCell.risk === 'WARNING'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
              Sector {String.fromCharCode(65 + hoveredCell.row)}{hoveredCell.col + 1}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                hoveredCell.risk === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : hoveredCell.risk === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {hoveredCell.risk}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1.5 text-[11px] font-mono">
            <div className="text-slate-400">Water Depth:</div>
            <div className="text-right text-cyan-300 font-bold">{hoveredCell.water.toFixed(3)} m</div>
            <div className="text-slate-400">Elevation:</div>
            <div className="text-right text-slate-200">{hoveredCell.elevation.toFixed(2)} m</div>
            <div className="text-slate-400">Critical At:</div>
            <div className="text-right text-slate-300">{hoveredCell.criticalDepth.toFixed(2)} m</div>
            <div className="text-slate-400">Est. Pop:</div>
            <div className="text-right text-slate-300">{hoveredCell.population.toLocaleString()}</div>
            {hoveredCell.eta !== null && hoveredCell.eta > 0 && (
              <>
                <div className="text-amber-400">Time to Crit:</div>
                <div className="text-right text-amber-300 font-bold">~{hoveredCell.eta.toFixed(0)} min</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
