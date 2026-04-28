/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { formatNum } from '../utils/math-utils.ts';
import { MATH_FONT_FAMILY, DEFAULT_BLUE } from '../constants.ts';

interface BBTProps {
  analysis: any;
  funcType: string;
  coeffs: any;
  config: any;
}

export const BBT: React.FC<BBTProps> = ({ analysis, funcType, coeffs, config }) => {
  if (!analysis || !analysis.valid) return <div className="p-5 text-zinc-400 font-medium italic text-sm text-center">Đang tính toán dữ liệu...</div>;
  if (['trig', 'trig_cos', 'trig_tan', 'trig_cot'].includes(funcType))
    return <div className="p-5 text-center text-zinc-400 italic text-sm">Hàm tuần hoàn - Xem chi tiết trên đồ thị</div>;

  const bbtFontSize = config.fontSize - 4;
  const bbtStyle = { fontFamily: MATH_FONT_FAMILY, fontSize: `${bbtFontSize}pt`, color: '#18181b' };

  const { roots = [], poles = [], mainSign } = analysis;
  const keyPoints = [...roots, ...poles].sort((a, b) => a - b);
  
  let signs: number[] = [];
  let currentSign = mainSign;
  signs[keyPoints.length] = currentSign;
  for (let i = keyPoints.length - 1; i >= 0; i--) {
    const p = keyPoints[i];
    if (roots.some((r: number) => Math.abs(r - p) < 1e-5)) currentSign = -currentSign;
    signs[i] = currentSign;
  }

  const DoubleBar = () => (
    <div className="h-full w-full flex justify-center items-center gap-[2px]">
      <div className="h-full w-[1.5px] bg-zinc-400"></div>
      <div className="h-full w-[1.5px] bg-zinc-400"></div>
    </div>
  );

  const renderSign = (s: number) => (
    <div className={`font-black text-xl ${s > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
      {s > 0 ? '+' : '−'}
    </div>
  );

  // Define column widths for grid
  const sideHeaderWidth = "w-12";
  const pointColWidth = "w-16";
  
  return (
    <div className="w-full bg-white rounded-2xl border border-zinc-200 overflow-x-auto min-w-fit" style={bbtStyle}>
      <div className="flex flex-col">
        {/* Row X */}
        <div className="flex border-b border-zinc-100 bg-zinc-50/50">
          <div className={`${sideHeaderWidth} flex items-center justify-center border-r border-zinc-200 font-black text-[9px] text-zinc-400 italic`}>x</div>
          <div className="flex items-center">
            <div className="w-12 flex justify-center font-bold text-zinc-400">−∞</div>
            {keyPoints.map((p, i) => (
              <React.Fragment key={i}>
                <div className="flex-1 min-w-[60px]"></div>
                <div className={`${pointColWidth} flex justify-center font-black text-indigo-600`}>{formatNum(p)}</div>
              </React.Fragment>
            ))}
            <div className="flex-1 min-w-[60px]"></div>
            <div className="w-12 flex justify-center font-bold text-zinc-400">+∞</div>
          </div>
        </div>

        {/* Row Y' */}
        <div className="flex">
          <div className={`${sideHeaderWidth} flex items-center justify-center border-r border-zinc-200 font-black text-[9px] text-zinc-400 italic`}>y'</div>
          <div className="flex items-center h-12">
            <div className="w-12"></div>
            {signs.map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex-1 min-w-[60px] flex justify-center items-center">{renderSign(s)}</div>
                {i < keyPoints.length && (
                  <div className={`${pointColWidth} h-full flex justify-center items-center`}>
                    {roots.some((r: number) => Math.abs(r - keyPoints[i]) < 1e-5) ? (
                      <span className="font-bold text-zinc-400">0</span>
                    ) : (
                      <DoubleBar />
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
            <div className="w-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
