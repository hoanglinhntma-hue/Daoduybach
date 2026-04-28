/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { formatNum } from '../utils/math-utils.ts';
import { MATH_FONT_FAMILY, DEFAULT_BLUE } from '../constants.ts';

interface MathFormulaProps {
  type: string;
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  fontSize: number;
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
      {power > 1 && <sup style={{ fontSize: '0.7em' }}>{power}</sup>}
    </span>
  );
};

export const MathFormula: React.FC<MathFormulaProps> = ({ type, a, b, c, d, e, fontSize }) => {
  const style = { fontFamily: MATH_FONT_FAMILY, fontSize: `${fontSize}pt`, color: DEFAULT_BLUE };

  if (type === 'cubic')
    return (
      <div style={style} className="font-bold">
        <i>y</i> = <Term coef={a} power={3} first={true} />
        <Term coef={b} power={2} />
        <Term coef={c} power={1} />
        <Term coef={d} power={0} />
      </div>
    );
  if (type === 'quadratic')
    return (
      <div style={style} className="font-bold">
        <i>y</i> = <Term coef={a} power={2} first={true} />
        <Term coef={b} power={1} />
        <Term coef={c} power={0} />
      </div>
    );
  if (type === 'quartic')
    return (
      <div style={style} className="font-bold">
        <i>y</i> = <Term coef={a} power={4} first={true} />
        <Term coef={b} power={2} />
        <Term coef={c} power={0} />
      </div>
    );
  if (type === 'rational11')
    return (
      <div style={style} className="font-bold flex items-center justify-center gap-1">
        <i>y</i> ={' '}
        <div className="flex flex-col items-center justify-center mx-1">
          <div className="border-b-2 border-blue-900 px-1 pb-[1px] mb-[1px]">
            <Term coef={a} power={1} first={true} />
            <Term coef={b} power={0} />
          </div>
          <div className="px-1">
            <Term coef={c} power={1} first={true} />
            <Term coef={d} power={0} />
          </div>
        </div>
      </div>
    );
  if (type === 'rational21')
    return (
      <div style={style} className="font-bold flex items-center justify-center gap-1">
        <i>y</i> ={' '}
        <div className="flex flex-col items-center justify-center mx-1">
          <div className="border-b-2 border-blue-900 px-1 pb-[1px] mb-[1px]">
            <Term coef={a} power={2} first={true} />
            <Term coef={b} power={1} />
            <Term coef={c} power={0} />
          </div>
          <div className="px-1">
            <Term coef={d} power={1} first={true} />
            <Term coef={e} power={0} />
          </div>
        </div>
      </div>
    );
  if (type === 'trig')
    return (
      <div style={style} className="font-bold">
        <i>y</i> = {formatNum(a) === '1' ? '' : formatNum(a) === '-1' ? '−' : formatNum(a)}sin({formatNum(b)}<i>x</i>{' '}
        {c >= 0 ? '+' : '−'} {formatNum(Math.abs(c))}) {d !== 0 ? (d > 0 ? '+ ' + formatNum(d) : '− ' + formatNum(Math.abs(d))) : ''}
      </div>
    );
  if (type === 'trig_cos')
    return (
      <div style={style} className="font-bold">
        <i>y</i> = {formatNum(a) === '1' ? '' : formatNum(a) === '-1' ? '−' : formatNum(a)}cos({formatNum(b)}<i>x</i>{' '}
        {c >= 0 ? '+' : '−'} {formatNum(Math.abs(c))}) {d !== 0 ? (d > 0 ? '+ ' + formatNum(d) : '− ' + formatNum(Math.abs(d))) : ''}
      </div>
    );
  if (type === 'trig_tan')
    return (
      <div style={style} className="font-bold">
        <i>y</i> = {formatNum(a) === '1' ? '' : formatNum(a) === '-1' ? '−' : formatNum(a)}tan({formatNum(b)}<i>x</i>{' '}
        {c >= 0 ? '+' : '−'} {formatNum(Math.abs(c))}) {d !== 0 ? (d > 0 ? '+ ' + formatNum(d) : '− ' + formatNum(Math.abs(d))) : ''}
      </div>
    );
  if (type === 'trig_cot')
    return (
      <div style={style} className="font-bold">
        <i>y</i> = {formatNum(a) === '1' ? '' : formatNum(a) === '-1' ? '−' : formatNum(a)}cot({formatNum(b)}<i>x</i>{' '}
        {c >= 0 ? '+' : '−'} {formatNum(Math.abs(c))}) {d !== 0 ? (d > 0 ? '+ ' + formatNum(d) : '− ' + formatNum(Math.abs(d))) : ''}
      </div>
    );
  if (type === 'logarithmic')
    return (
      <div style={style} className="font-bold">
        <i>y</i> = log<sub>{formatNum(a)}</sub>({formatNum(b)}<i>x</i>{' '}
        {c >= 0 ? '+' : '−'} {formatNum(Math.abs(c))}) {d !== 0 ? (d > 0 ? '+ ' + formatNum(d) : '− ' + formatNum(Math.abs(d))) : ''}
      </div>
    );
  if (type === 'exponential')
    return (
      <div style={style} className="font-bold">
        <i>y</i> = {formatNum(a)}
        <sup>
          {formatNum(b)}<i>x</i> {c >= 0 ? '+' : '−'} {formatNum(Math.abs(c))}
        </sup>{' '}
        {d !== 0 ? (d > 0 ? '+ ' + formatNum(d) : '− ' + formatNum(Math.abs(d))) : ''}
      </div>
    );
  return null;
};
