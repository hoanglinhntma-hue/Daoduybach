/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const FONT_FAMILY = "Inter, system-ui, sans-serif";
export const MATH_FONT_FAMILY = "'Times New Roman', Times, serif";
export const DEFAULT_BLUE = '#4f46e5'; // Indigo 600
export const COLORS = [
  { hex: '#4f46e5', name: 'Indigo' },
  { hex: '#18181b', name: 'Zinc' },
  { hex: '#dc2626', name: 'Red' },
  { hex: '#16a34a', name: 'Green' },
  { hex: '#9333ea', name: 'Purple' },
  { hex: '#2563eb', name: 'Blue' },
  { hex: '#ea580c', name: 'Orange' },
];

export const THEME_PRESETS = [
  {
    id: 'light',
    name: 'Sáng chuẩn',
    bgColor: '#ffffff',
    axisColor: '#4f46e5',
    gridColor: '#f1f5f9',
    graphColor: '#4f46e5',
    textColor: '#1e293b'
  },
  {
    id: 'dark',
    name: 'Tối huyền ảo',
    bgColor: '#09090b',
    axisColor: '#3f3f46',
    gridColor: '#18181b',
    graphColor: '#818cf8',
    textColor: '#a1a1aa'
  },
  {
    id: 'blueprint',
    name: 'Bản vẽ kỹ thuật',
    bgColor: '#1e3a8a',
    axisColor: '#3b82f6',
    gridColor: '#1e40af',
    graphColor: '#ffffff',
    textColor: '#bfdbfe'
  },
  {
    id: 'chalkboard',
    name: 'Bảng xanh',
    bgColor: '#064e3b',
    axisColor: '#059669',
    gridColor: '#065f46',
    graphColor: '#fcd34d',
    textColor: '#ecfdf5'
  }
];

export const functionOptions = [
  { id: 'cubic', label: '1. Hàm bậc ba (Cubic)' },
  { id: 'quartic', label: '2. Hàm trùng phương (Quartic)' },
  { id: 'quadratic', label: '3. Hàm bậc hai (Quadratic)' },
  { id: 'rational11', label: '4. Hàm phân thức 1/1' },
  { id: 'rational21', label: '5. Hàm phân thức 2/1' },
  { id: 'trig', label: '6. Hàm lượng giác (Sin)' },
  { id: 'trig_cos', label: '7. Hàm lượng giác (Cos)' },
  { id: 'trig_tan', label: '8. Hàm lượng giác (Tan)' },
  { id: 'trig_cot', label: '9. Hàm lượng giác (Cot)' },
  { id: 'exponential', label: '10. Hàm số mũ' },
  { id: 'logarithmic', label: '11. Hàm số logarit' },
];
