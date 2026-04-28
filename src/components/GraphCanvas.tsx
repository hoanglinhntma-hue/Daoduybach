/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { getFunctionValue, formatNum, findIntersectionRoot } from '../utils/math-utils.ts';
import { DEFAULT_BLUE, MATH_FONT_FAMILY } from '../constants.ts';

interface GraphCanvasProps {
  funcType: string;
  coeffs: any;
  analysis: any;
  config: any;
  viewConfig: any;
  intersection: any;
  isFullscreen: boolean;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  funcType,
  coeffs,
  analysis,
  config,
  viewConfig,
  intersection,
  isFullscreen,
  onCanvasReady
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const theme = config.theme || {
    bgColor: 'white',
    axisColor: '#4f46e5',
    gridColor: '#e5e7eb',
    graphColor: config.graphColor || '#4f46e5',
    textColor: '#1e293b'
  };

  useEffect(() => {
    if (analysis && analysis.valid) {
      draw();
      if (canvasRef.current && onCanvasReady) {
        onCanvasReady(canvasRef.current);
      }
    }
  }, [analysis, config, viewConfig, intersection, isFullscreen]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    const w = isFullscreen ? window.innerWidth : (container?.clientWidth || 650);
    const h = isFullscreen ? window.innerHeight : (container?.clientHeight || 500);

    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = theme.bgColor;
    ctx.fillRect(0, 0, w, h);

    let xMin = -6, xMax = 6, yMin = -6, yMax = 6;
    if (analysis && analysis.valid) {
      const importantX = [0];
      const importantY = [0];
      if (analysis.roots) analysis.roots.forEach((r: number) => importantX.push(r));
      if (analysis.extrema)
        analysis.extrema.forEach((p: any) => {
          importantX.push(p.x);
          importantY.push(p.y);
        });
      if (analysis.intersections)
        analysis.intersections.forEach((p: any) => {
          if (p.axis === 'x') importantX.push(p.val);
          else importantY.push(p.val);
        });
      if (funcType === 'logarithmic') {
        importantX.push(analysis.domainMin);
        importantX.push(analysis.domainMin + 5);
      }
      if (funcType === 'exponential') {
        importantY.push(coeffs.d);
        importantY.push(coeffs.d + (coeffs.a > 0 ? 2 : -2));
      }

      if (intersection.active) {
        if (intersection.type === 'horizontal') {
          importantY.push(parseFloat(intersection.m));
        } else {
          const y1 = intersection.a * xMin + intersection.b;
          const y2 = intersection.a * xMax + intersection.b;
          importantY.push(y1);
          importantY.push(y2);
        }
      }

      let minX = Math.min(...importantX), maxX = Math.max(...importantX);
      let minY = Math.min(...importantY), maxY = Math.max(...importantY);
      let rX = maxX - minX, rY = maxY - minY;
      xMin = minX - Math.max(2, rX * 0.2);
      xMax = maxX + Math.max(2, rX * 0.2);
      yMin = minY - Math.max(2, rY * 0.2);
      yMax = maxY + Math.max(2, rY * 0.2);
    }

    const aspect = w / h;
    const currentW = xMax - xMin;
    const currentH = yMax - yMin;
    if (aspect > currentW / currentH) {
      const newW = currentH * aspect;
      const delta = (newW - currentW) / 2;
      xMin -= delta;
      xMax += delta;
    } else {
      const newH = currentW / aspect;
      const delta = (newH - currentH) / 2;
      yMin -= delta;
      yMax += delta;
    }

    const scaleX = w / (xMax - xMin);
    const scaleY = h / (yMax - yMin);
    const toSX = (x: number) => (x - xMin) * scaleX;
    const toSY = (y: number) => h - (y - yMin) * scaleY;
    const yOrigin = toSY(0);
    const xOrigin = toSX(0);

    const drawGridAndAxes = () => {
      if (!viewConfig.grid) return;
      let gridStep = 1;
      if (xMax - xMin > 20) gridStep = 2;
      if (xMax - xMin > 50) gridStep = 5;
      ctx.strokeStyle = theme.gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = Math.ceil(xMin / gridStep) * gridStep; x <= xMax; x += gridStep) {
        ctx.moveTo(toSX(x), 0);
        ctx.lineTo(toSX(x), h);
      }
      for (let y = Math.ceil(yMin / gridStep) * gridStep; y <= yMax; y += gridStep) {
        ctx.moveTo(0, toSY(y));
        ctx.lineTo(w, toSY(y));
      }
      ctx.stroke();

      ctx.strokeStyle = theme.axisColor;
      ctx.fillStyle = theme.axisColor;
      ctx.lineWidth = config.strokeWidth;
      const arrowSize = 6;
      if (yOrigin >= -20 && yOrigin <= h + 20) {
        ctx.beginPath();
        ctx.moveTo(0, yOrigin);
        ctx.lineTo(w - arrowSize, yOrigin);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w, yOrigin);
        ctx.lineTo(w - 12, yOrigin - 4);
        ctx.lineTo(w - 12, yOrigin + 4);
        ctx.closePath();
        ctx.fill();
      }
      if (xOrigin >= -20 && xOrigin <= w + 20) {
        ctx.beginPath();
        ctx.moveTo(xOrigin, h);
        ctx.lineTo(xOrigin, arrowSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xOrigin, 0);
        ctx.lineTo(xOrigin - 4, 12);
        ctx.lineTo(xOrigin + 4, 12);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = theme.textColor;
      ctx.font = `italic bold ${config.fontSize + 4}pt ${MATH_FONT_FAMILY}`;
      if (yOrigin >= -20 && yOrigin <= h + 20) ctx.fillText('x', w - 20, yOrigin - 12);
      if (xOrigin >= -20 && xOrigin <= w + 20) ctx.fillText('y', xOrigin + 12, 25);
      if (xOrigin >= 0 && xOrigin <= w && yOrigin >= 0 && yOrigin <= h) ctx.fillText('O', xOrigin - 25, yOrigin + 25);
    };
    drawGridAndAxes();

    // Vẽ đồ thị
    ctx.strokeStyle = theme.graphColor;
    ctx.lineWidth = config.strokeWidth;
    ctx.beginPath();

    const drawStep = (xMax - xMin) / 1500;
    let prevX = xMin;
    let isDiscontinuous = false;

    for (let x = xMin; x <= xMax; x += drawStep) {
      const y = getFunctionValue(x, funcType, coeffs);
      if (analysis.poles && analysis.poles.length > 0) {
        if (analysis.poles.some((p: number) => prevX < p && x >= p)) isDiscontinuous = true;
      }
      const sy = toSY(y);
      if (!isFinite(y) || sy < -h * 2 || sy > h * 3) isDiscontinuous = true;
      else {
        const sx = toSX(x);
        if (isDiscontinuous) {
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          isDiscontinuous = false;
        } else ctx.lineTo(sx, sy);
      }
      prevX = x;
    }
    ctx.stroke();

    // Tương giao / Tiếp tuyến
    if (intersection.active) {
      ctx.setLineDash([]);
      ctx.lineWidth = 2;

      if (intersection.type === 'horizontal') {
        ctx.strokeStyle = '#d97706';
        const m = parseFloat(intersection.m);
        ctx.beginPath();
        ctx.moveTo(0, toSY(m));
        ctx.lineTo(w, toSY(m));
        ctx.stroke();
        ctx.fillStyle = '#d97706';
        ctx.font = `bold ${config.fontSize}pt ${MATH_FONT_FAMILY}`;
        ctx.fillText(`y = ${m}`, 10, toSY(m) - 5);
      } else if (intersection.type === 'tangent') {
          const x0 = parseFloat(intersection.m);
          const y0 = getFunctionValue(x0, funcType, coeffs);
          
          // Tính đạo hàm tại x0 bằng cách tính xấp xỉ hoặc theo công thức nếu có
          const h_diff = 1e-7;
          const yPlus = getFunctionValue(x0 + h_diff, funcType, coeffs);
          const f_prime = (yPlus - y0) / h_diff;

          if (isFinite(f_prime)) {
            const a_tan = f_prime;
            const b_tan = y0 - f_prime * x0;

            ctx.strokeStyle = '#059669'; // Emerald 600
            const sy1 = toSY(a_tan * xMin + b_tan);
            const sy2 = toSY(a_tan * xMax + b_tan);
            ctx.beginPath();
            ctx.moveTo(toSX(xMin), sy1);
            ctx.lineTo(toSX(xMax), sy2);
            ctx.stroke();

            // Vẽ tiếp điểm
            ctx.fillStyle = '#059669';
            ctx.beginPath();
            ctx.arc(toSX(x0), toSY(y0), 6, 0, 2 * Math.PI);
            ctx.fill();

            ctx.font = `bold ${config.fontSize}pt ${MATH_FONT_FAMILY}`;
            ctx.fillText(`M(${formatNum(x0)}; ${formatNum(y0)})`, toSX(x0) + 10, toSY(y0) - 10);
            ctx.fillText(`y = ${formatNum(a_tan)}x ${b_tan >= 0 ? '+' : '−'} ${formatNum(Math.abs(b_tan))}`, 20, h - 30);
          }
      } else {
        ctx.strokeStyle = '#d97706';
        const a = parseFloat(intersection.a);
        const b = parseFloat(intersection.b);
        const sy1 = toSY(a * xMin + b);
        const sy2 = toSY(a * xMax + b);
        ctx.beginPath();
        ctx.moveTo(toSX(xMin), sy1);
        ctx.lineTo(toSX(xMax), sy2);
        ctx.stroke();
        ctx.fillStyle = '#d97706';
        ctx.font = `bold ${config.fontSize}pt ${MATH_FONT_FAMILY}`;
        ctx.fillText(`y = ${formatNum(a)}x ${b >= 0 ? '+' : '−'} ${formatNum(Math.abs(b))}`, 10, 30);
      }

      // Find points (only for non-tangent intersections for simplicity)
      if (intersection.type !== 'tangent') {
          const searchStep = (xMax - xMin) / 1000;
          let points: { x: number; y: number }[] = [];
          let prevVal = getFunctionValue(xMin, funcType, coeffs);

          for (let x = xMin + searchStep; x <= xMax; x += searchStep) {
            const val = getFunctionValue(x, funcType, coeffs);
            if (Math.abs(val - prevVal) > 10) {
              prevVal = val;
              continue;
            }
            let lineVal1, lineVal2;
            if (intersection.type === 'horizontal') {
              lineVal1 = lineVal2 = parseFloat(intersection.m);
            } else {
              lineVal1 = intersection.a * (x - searchStep) + intersection.b;
              lineVal2 = intersection.a * x + intersection.b;
            }

            if ((prevVal - lineVal1) * (val - lineVal2) <= 0) {
              const xRoot = findIntersectionRoot(x - searchStep, x, funcType, coeffs, intersection);
              // @ts-ignore
              const yRoot = intersection.type === 'horizontal' ? parseFloat(intersection.m) : intersection.a * xRoot + intersection.b;
              if (!points.some((p) => Math.abs(p.x - xRoot) < 1e-4)) {
                points.push({ x: xRoot, y: yRoot });
              }
            }
            prevVal = val;
          }

          points.forEach((p) => {
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(toSX(p.x), toSY(p.y), 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.font = `${config.fontSize - 2}pt ${MATH_FONT_FAMILY}`;
            ctx.fillText(`(${formatNum(p.x)}; ${formatNum(p.y)})`, toSX(p.x) + 8, toSY(p.y) - 8);
          });
      }
    }

    // Tiệm cận, cực trị...
    if (viewConfig.asymptotes && analysis.asymptotes) {
      ctx.setLineDash([6, 4]); // Nét đứt rõ ràng hơn
      analysis.asymptotes.forEach((asym: any) => {
        let label = '';
        ctx.lineWidth = 2;
        
        if (asym.type === 'vertical') {
          ctx.strokeStyle = '#ef4444'; // Red for Vertical
          ctx.beginPath();
          ctx.moveTo(toSX(asym.val), 0);
          ctx.lineTo(toSX(asym.val), h);
          ctx.stroke();
          label = `TCĐ: x = ${formatNum(asym.val)}`;
          
          ctx.fillStyle = '#ef4444';
          ctx.font = `bold ${config.fontSize - 2}pt ${MATH_FONT_FAMILY}`;
          const labelX = toSX(asym.val) + 5;
          const labelY = 20;
          // Vẽ nền cho nhãn cho dễ đọc
          const metrics = ctx.measureText(label);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(labelX - 2, labelY - 14, metrics.width + 4, 18);
          ctx.fillStyle = '#ef4444';
          ctx.fillText(label, labelX, labelY);

        } else if (asym.type === 'horizontal') {
          ctx.strokeStyle = '#2563eb'; // Blue for Horizontal
          ctx.beginPath();
          ctx.moveTo(0, toSY(asym.val));
          ctx.lineTo(w, toSY(asym.val));
          ctx.stroke();
          label = `TCN: y = ${formatNum(asym.val)}`;

          ctx.fillStyle = '#2563eb';
          ctx.font = `bold ${config.fontSize - 2}pt ${MATH_FONT_FAMILY}`;
          const labelX = w - ctx.measureText(label).width - 10;
          const labelY = toSY(asym.val) - 5;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(labelX - 2, labelY - 14, ctx.measureText(label).width + 4, 18);
          ctx.fillStyle = '#2563eb';
          ctx.fillText(label, labelX, labelY);

        } else if (asym.type === 'slant') {
          ctx.strokeStyle = '#7c3aed'; // Violet for Slant
          ctx.beginPath();
          ctx.moveTo(toSX(xMin), toSY(asym.m * xMin + asym.k));
          ctx.lineTo(toSX(xMax), toSY(asym.m * xMax + asym.k));
          ctx.stroke();
          label = `TCX: y = ${formatNum(asym.m)}x ${asym.k >= 0 ? '+' : '−'} ${formatNum(Math.abs(asym.k))}`;

          ctx.fillStyle = '#7c3aed';
          ctx.font = `bold ${config.fontSize - 3}pt ${MATH_FONT_FAMILY}`;
          const labelX = w * 0.7;
          const labelY = toSY(asym.m * (xMin + (xMax - xMin) * 0.7) + asym.k) - 10;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(labelX - 2, labelY - 14, ctx.measureText(label).width + 4, 18);
          ctx.fillStyle = '#7c3aed';
          ctx.fillText(label, labelX, labelY);
        }
      });
      ctx.setLineDash([]);
    }

    if (viewConfig.extrema && analysis.specialPoints) {
      analysis.specialPoints.forEach((p: any) => {
        const sx = toSX(p.x), sy = toSY(p.y);
        if (sx < 0 || sx > w || sy < 0 || sy > h) return;
        
        // Marker style based on type
        if (p.type === 'extrema') {
          // Glow effect for extrema
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(220, 38, 38, 0.5)';
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(sx, sy, 5, 0, 2 * Math.PI);
          ctx.fill();
          
          // White ring
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          // Label with background
          const labelText = `(${formatNum(p.x)}; ${formatNum(p.y)})`;
          ctx.font = `bold ${config.fontSize - 2}pt ${MATH_FONT_FAMILY}`;
          const metrics = ctx.measureText(labelText);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(sx + 8, sy - 22, metrics.width + 6, 18);
          ctx.fillStyle = '#1e293b';
          ctx.fillText(labelText, sx + 11, sy - 8);

          if (p.label) {
            ctx.fillStyle = '#dc2626';
            ctx.font = `black ${config.fontSize - 1}pt ${MATH_FONT_FAMILY}`;
            ctx.fillText(p.label, sx - 10, sy - 25);
          }
        } else if (p.type === 'center') {
          // Center of symmetry / Inflection point
          ctx.fillStyle = '#f59e0b'; // Amber 500
          ctx.beginPath();
          ctx.arc(sx, sy, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          const labelText = `I(${formatNum(p.x)}; ${formatNum(p.y)})`;
          ctx.font = `bold ${config.fontSize - 2}pt ${MATH_FONT_FAMILY}`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(sx + 8, sy + 4, ctx.measureText(labelText).width + 6, 18);
          ctx.fillStyle = '#b45309';
          ctx.fillText(labelText, sx + 11, sy + 18);
        }
      });
    }
  };

  return <canvas ref={canvasRef} className="border border-slate-100 shadow-sm rounded bg-white max-w-full h-auto cursor-crosshair" />;
};
