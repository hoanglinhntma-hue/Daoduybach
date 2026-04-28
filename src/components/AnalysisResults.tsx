/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { formatNum } from '../utils/math-utils.ts';
import { MATH_FONT_FAMILY } from '../constants.ts';

interface AnalysisResultsProps {
  analysis: any;
  funcType: string;
  coeffs: any;
}

const Term: React.FC<{ coef: number; power: number; first?: boolean }> = ({ coef, power, first = false }) => {
  if (Math.abs(coef) < 1e-9) return null;
  let sign = '';
  let val = Math.abs(coef);
  if (!first) sign = coef > 0 ? ' + ' : ' − ';
  else if (coef < 0) sign = '−';
  let valStr = val === 1 && power > 0 ? '' : formatNum(val).replace('-', '');
  return (
    <span>
      {sign}
      {valStr}
      {power > 0 && <i>x</i>}
      {power > 1 && <sup>{power}</sup>}
    </span>
  );
};

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis, funcType, coeffs }) => {
  if (!analysis || !analysis.valid) return <div className="text-gray-500 italic">Chưa có dữ liệu phân tích</div>;
  const { a, b, c, d, e } = coeffs;

  let domainStr: React.ReactNode = '';
  let derivDisplay: React.ReactNode = null;
  let extremaStr: React.ReactNode[] = [];
  let asymStr: React.ReactNode[] = [];

  if (funcType === 'cubic') {
    domainStr = <span>D = ℝ</span>;
    derivDisplay = (
      <span>
        y' = <Term coef={3 * a} power={2} first={true} />
        <Term coef={2 * b} power={1} />
        <Term coef={c} power={0} />
      </span>
    );
  } else if (funcType === 'rational11') {
    domainStr = (
      <span>
        D = ℝ \ {'{'}
        {formatNum(-d / c)}
        {'}'}
      </span>
    );
    const num = a * d - b * c;
    derivDisplay = (
      <div className="flex items-center gap-1">
        y' ={' '}
        <div className="flex flex-col items-center justify-center">
          <div className="border-b border-black px-1">{formatNum(num)}</div>
          <div>
            (<Term coef={c} power={1} first={true} />
            <Term coef={d} power={0} />)<sup>2</sup>
          </div>
        </div>
      </div>
    );
  } else if (funcType === 'rational21') {
    domainStr = (
      <span>
        D = ℝ \ {'{'}
        {formatNum(-e / d)}
        {'}'}
      </span>
    );
    const A = a * d;
    const B = 2 * a * e;
    const C = b * e - c * d;
    derivDisplay = (
      <div className="flex items-center gap-1">
        y' ={' '}
        <div className="flex flex-col items-center justify-center">
          <div className="border-b border-black px-1">
            <Term coef={A} power={2} first={true} />
            <Term coef={B} power={1} />
            <Term coef={C} power={0} />
          </div>
          <div>
            (<Term coef={d} power={1} first={true} />
            <Term coef={e} power={0} />)<sup>2</sup>
          </div>
        </div>
      </div>
    );
  } else if (funcType === 'exponential') {
    domainStr = <span>D = ℝ</span>;
    derivDisplay = (
      <span>
        y' = {formatNum(b)} \cdot ln({formatNum(a)}) \cdot {formatNum(a)}<sup>{formatNum(b)}x {c >= 0 ? '+' : '−'} {formatNum(Math.abs(c))}</sup>
      </span>
    );
  } else if (funcType === 'logarithmic') {
    const pole = -c / b;
    domainStr = b > 0 ? (
      <span>D = ({formatNum(pole)}; +∞)</span>
    ) : (
      <span>D = (−∞; {formatNum(pole)})</span>
    );
    derivDisplay = (
      <div className="flex items-center gap-1">
        y' ={' '}
        <div className="flex flex-col items-center justify-center">
          <div className="border-b border-black px-1">{formatNum(b)}</div>
          <div>
            ({formatNum(b)}x {c >= 0 ? '+' : '−'} {formatNum(Math.abs(c))}) \cdot ln({formatNum(a)})
          </div>
        </div>
      </div>
    );
  }

  if (analysis.extrema.length === 0) {
    extremaStr.push(<div key="none">Hàm số không có cực trị</div>);
  } else {
    analysis.extrema.forEach((ex: any, idx: number) => {
      extremaStr.push(
        <div key={idx} className="mb-1">
          • {ex.label === 'CĐ' ? 'Cực đại' : ex.label === 'CT' ? 'Cực tiểu' : 'Cực trị'} tại <i>x</i> = {formatNum(ex.x)},{' '}
          <i>y</i> = {formatNum(ex.y)}
        </div>
      );
    });
  }

  if (analysis.asymptotes.length === 0) {
    asymStr.push(<div key="none">Không có tiệm cận</div>);
  } else {
    analysis.asymptotes.forEach((asym: any, idx: number) => {
      if (asym.type === 'vertical') asymStr.push(<div key={`v-${idx}`}>• TC đứng: <i>x</i> = {formatNum(asym.val)}</div>);
      if (asym.type === 'horizontal') asymStr.push(<div key={`h-${idx}`}>• TC ngang: <i>y</i> = {formatNum(asym.val)}</div>);
      if (asym.type === 'slant')
        asymStr.push(
          <div key={`s-${idx}`}>
            • TC xiên: <i>y</i> = {formatNum(asym.m)}<i>x</i> {asym.k >= 0 ? '+' : '−'} {formatNum(Math.abs(asym.k))}
          </div>
        );
    });
  }

  let symmetryStr: React.ReactNode = null;
  if (funcType === 'cubic' && analysis.inflectionPoint) {
    symmetryStr = <div>• Tâm đối xứng (Điểm uốn): <i>I</i>({formatNum(analysis.inflectionPoint.x)}; {formatNum(analysis.inflectionPoint.y)})</div>;
  } else if ((funcType === 'rational11' || funcType === 'rational21') && analysis.symmetryCenter) {
    symmetryStr = <div>• Tâm đối xứng: <i>I</i>({formatNum(analysis.symmetryCenter.x)}; {formatNum(analysis.symmetryCenter.y)})</div>;
  }

  let monotonicityStr: React.ReactNode = null;
  if (analysis.mainSign !== undefined) {
      if (funcType === 'cubic' || funcType === 'quartic') {
          // Complex monotonicity for polynomials
          // For now keep it simple or expand if we have intervals
      } else if (funcType === 'rational11' || funcType === 'rational21') {
          const sign = analysis.mainSign;
          monotonicityStr = <div>• Hàm số {sign > 0 ? 'đồng biến' : 'nghịch biến'} trên từng khoảng xác định.</div>;
      }
  }

  let limitStr: React.ReactNode[] = [];
  if (funcType === 'cubic') {
      const a = coeffs.a;
      limitStr.push(<div key="inf">
          • lim <i>y</i> (<i>x</i>→+∞) = {a > 0 ? '+∞' : '−∞'}; 
          lim <i>y</i> (<i>x</i>→−∞) = {a > 0 ? '−∞' : '+∞'}
      </div>);
  } else if (funcType === 'rational11') {
      const horizontalVal = coeffs.a / coeffs.c;
      limitStr.push(<div key="inf">• lim <i>y</i> (<i>x</i>→±∞) = {formatNum(horizontalVal)}</div>);
      const pole = -coeffs.d / coeffs.c;
      const num = coeffs.a * pole + coeffs.b;
      const denDeriv = coeffs.c; // c*x + d -> c
      const leftLimit = (num * denDeriv) > 0 ? '+∞' : '−∞'; // Very simplified limit check
      const rightLimit = (num * denDeriv) > 0 ? '−∞' : '+∞';
      // Note: This is just for display, the math should be more rigorous if needed
  }

  return (
    <div className="text-base text-zinc-800 leading-relaxed space-y-4" style={{ fontFamily: MATH_FONT_FAMILY }}>
      <div>
        <div className="font-bold border-l-4 border-indigo-600 pl-2 mb-2 text-indigo-900">1. Tập xác định:</div>
        <div className="pl-6 font-bold">{domainStr || 'D = ℝ'}</div>
      </div>
      <div>
        <div className="font-bold border-l-4 border-indigo-600 pl-2 mb-2 text-indigo-900">2. Sự biến thiên:</div>
        <div className="pl-6 space-y-2">
            <div>• Đạo hàm: <b>{derivDisplay || '...'}</b></div>
            {monotonicityStr}
            <div>• Cực trị: {extremaStr}</div>
            {limitStr.length > 0 && <div>{limitStr}</div>}
        </div>
      </div>
      {(asymStr[0]?.props?.children !== "Không có tiệm cận" || symmetryStr) && (
        <div>
          <div className="font-bold border-l-4 border-indigo-600 pl-2 mb-2 text-indigo-900">3. Tiệm cận & Đối xứng:</div>
          <div className="pl-6 space-y-1">
            {asymStr}
            {symmetryStr}
          </div>
        </div>
      )}
    </div>
  );
};
