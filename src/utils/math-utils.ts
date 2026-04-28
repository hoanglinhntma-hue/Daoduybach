/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const formatNum = (n: number | undefined): string => {
  if (n === undefined || !isFinite(n)) return '';
  if (Math.abs(n) < 1e-10) return '0';
  const s = Number.isInteger(n) ? n.toString() : (Math.round(n * 100) / 100).toString();
  return s.replace('-', '−');
};

export const solveQuadratic = (A: number, B: number, C: number): number[] => {
  if (Math.abs(A) < 1e-10) {
    if (Math.abs(B) < 1e-10) return [];
    return [-C / B];
  }
  const d = B * B - 4 * A * C;
  if (d < 0) return [];
  if (Math.abs(d) < 1e-10) return [-B / (2 * A)];
  const s = Math.sqrt(d);
  return [(-B - s) / (2 * A), (-B + s) / (2 * A)].sort((a, b) => a - b);
};

export const getFunctionValue = (x: number, funcType: string, coeffs: any): number => {
  const { a, b, c, d, e } = coeffs;
  switch (funcType) {
    case 'cubic': return a * x ** 3 + b * x ** 2 + c * x + d;
    case 'quadratic': return a * x ** 2 + b * x + c;
    case 'quartic': return a * x ** 4 + b * x ** 2 + c;
    case 'rational11': return (a * x + b) / (c * x + d);
    case 'rational21': return (a * x * x + b * x + c) / (d * x + e);
    case 'trig': return a * Math.sin(b * x + c) + d;
    case 'trig_cos': return a * Math.cos(b * x + c) + d;
    case 'trig_tan': return a * Math.tan(b * x + c) + d;
    case 'trig_cot': return a * (1 / Math.tan(b * x + c)) + d;
    case 'logarithmic': {
      const inner = b * x + c;
      if (inner <= 0 || a <= 0 || a === 1) return NaN;
      return Math.log(inner) / Math.log(a) + d;
    }
    case 'exponential': {
      if (a <= 0) return NaN;
      return Math.pow(a, b * x + c) + d;
    }
    default: return 0;
  }
};

export const findIntersectionRoot = (x1: number, x2: number, funcType: string, coeffs: any, intersection: any): number => {
  const tolerance = 1e-10;
  const maxIterations = 50;

  const f = (x: number) => {
    const funcVal = getFunctionValue(x, funcType, coeffs);
    let lineVal;
    if (intersection.type === 'horizontal') {
      lineVal = parseFloat(intersection.m);
    } else {
      lineVal = intersection.a * x + intersection.b;
    }
    return funcVal - lineVal;
  };

  const f1 = f(x1);
  const f2 = f(x2);

  if (Math.abs(f1) < tolerance) return x1;
  if (Math.abs(f2) < tolerance) return x2;

  let a = x1, b = x2, fa = f1, fb = f2;

  if (fa * fb > 0) return (x1 + x2) / 2; // Should not happen with good search

  for (let i = 0; i < maxIterations; i++) {
    const c = (a + b) / 2;
    const fc = f(c);

    if (Math.abs(fc) < tolerance || (b - a) / 2 < tolerance) {
      return c;
    }

    if (fa * fc < 0) {
      b = c;
      fb = fc;
    } else {
      a = c;
      fa = fc;
    }
  }

  return (a + b) / 2;
};
