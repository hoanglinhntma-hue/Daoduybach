/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  List, 
  Calculator, 
  Info, 
  Palette, 
  Layers, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  Split, 
  Maximize, 
  Minimize,
  Grid,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  Plus,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { MathFormula } from './components/MathFormula.tsx';
import { BBT } from './components/BBT.tsx';
import { SocraticTutor } from './components/SocraticTutor.tsx';
import { MathStory } from './components/MathStory.tsx';
import { AnalysisResults } from './components/AnalysisResults.tsx';
import { GraphCanvas } from './components/GraphCanvas.tsx';
import { KnowledgeCheck } from './components/KnowledgeCheck.tsx';
import { solveQuadratic, formatNum, getFunctionValue } from './utils/math-utils.ts';
import { FONT_FAMILY, DEFAULT_BLUE, COLORS, THEME_PRESETS, functionOptions } from './constants.ts';

const CoefficientInput: React.FC<{ 
  label: string; 
  value: number; 
  onChange: (val: number) => void; 
  step?: number;
}> = ({ 
  label, 
  value, 
  onChange, 
  step = 1 
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    const currentNum = parseFloat(inputValue);
    if (currentNum !== value && inputValue !== '-' && inputValue !== '.' && inputValue !== '') {
      setInputValue(value.toString());
    }
  }, [value]);

  const handleInputChange = (val: string) => {
    // Allow empty string, single minus, or single dot for starting typing
    setInputValue(val);
    
    if (val === '' || val === '-' || val === '.') return;
    
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const adjustValue = (delta: number) => {
    const newValue = Math.round((value + delta) * 10) / 10;
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="font-bold text-zinc-400 text-[10px] uppercase">{label}</span>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => adjustValue(-step)}
          className="p-1 px-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-600 transition-colors active:scale-90"
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleInputChange(e.target.value)}
          className="flex-1 min-w-0 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-center"
        />
        <button 
          onClick={() => adjustValue(step)}
          className="p-1 px-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-600 transition-colors active:scale-90"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [funcType, setFuncType] = useState('rational21');
  const [coeffs, setCoeffs] = useState({ a: 1, b: 1, c: 4, d: 1, e: 1 });
  const [analysis, setAnalysis] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [viewConfig, setViewConfig] = useState({ 
    grid: true, 
    asymptotes: true, 
    extrema: true, 
    intersections: true, 
    projections: true 
  });
  const [config, setConfig] = useState({ 
    fontSize: 16, 
    strokeWidth: 2, 
    graphColor: DEFAULT_BLUE, 
    zoom: 1.0, 
    bbtLineWidth: 2,
    theme: THEME_PRESETS[0]
  });
  const [isGraphFullscreen, setIsGraphFullscreen] = useState(false);
  const [intersection, setIntersection] = useState({ 
    active: false, 
    type: 'horizontal',
    m: 0,
    a: 1,
    b: 0 
  });
  const [showHelp, setShowHelp] = useState(false);
  const [showResultsPanel, setShowResultsPanel] = useState(true);
  const [activeTab, setActiveTab] = useState<'input' | 'analysis' | 'graph' | 'tutor' | 'story'>('input');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    try {
      analyzeFunction();
      setErrorMsg('');
    } catch (err) {
      console.error(err);
      setErrorMsg('Có lỗi khi tính toán.');
    }
  }, [coeffs, funcType]);

  const analyzeFunction = () => {
    const { a, b, c, d, e } = coeffs;
    let result: any = { 
        type: funcType, 
        coeffs: coeffs, 
        roots: [], 
        extrema: [], 
        asymptotes: [], 
        valid: true, 
        specialPoints: [], 
        intersections: [], 
        poles: [] 
    };

    const addIntersection = (val: number, axis: string) => {
      if (!isFinite(val)) return;
      result.intersections.push({ val, axis });
    };

    const addPoint = (x: number, y: number, label: string, type: string) => {
      if (!isFinite(x) || !isFinite(y)) return;
      result.specialPoints.push({ x, y, label, type });
    };

    if (funcType === 'cubic') {
      if (Math.abs(a) < 1e-9) { result.valid = false; result.msg = "a ≠ 0"; }
      else {
        const derivRoots = solveQuadratic(3 * a, 2 * b, c);
        result.roots = derivRoots;
        result.extrema = derivRoots.map((x, idx) => {
          const y = a * x ** 3 + b * x ** 2 + c * x + d;
          let label = "";
          if (derivRoots.length === 2) label = a > 0 ? (idx === 0 ? "CĐ" : "CT") : (idx === 0 ? "CT" : "CĐ");
          addPoint(x, y, label, "extrema");
          return { x, y, label };
        });
        
        // Điểm uốn / Tâm đối xứng cho hàm bậc 3
        const xInf = -b / (3 * a);
        const yInf = a * xInf ** 3 + b * xInf ** 2 + c * xInf + d;
        result.inflectionPoint = { x: xInf, y: yInf };
        addPoint(xInf, yInf, "I", "center");

        result.mainSign = a > 0 ? 1 : -1;
        addIntersection(d, 'y');
      }
    } else if (funcType === 'rational11') {
      if (Math.abs(c) < 1e-9) { result.valid = false; }
      else {
        const p = -d / c;
        result.poles = [p];
        result.asymptotes.push({ type: 'vertical', val: p });
        result.asymptotes.push({ type: 'horizontal', val: a / c });
        result.yPrimeNum = a * d - b * c;
        result.mainSign = result.yPrimeNum > 0 ? 1 : -1;
        const center = { x: p, y: a / c };
        result.symmetryCenter = center;
        addPoint(center.x, center.y, "I", "center");
        if (p !== 0) addIntersection(b / d, 'y');
        if (Math.abs(a) > 1e-9) addIntersection(-b / a, 'x');
      }
    } else if (funcType === 'rational21') {
      if (Math.abs(d) < 1e-9) { result.valid = false; }
      else {
        const p = -e / d;
        result.poles = [p];
        result.asymptotes.push({ type: 'vertical', val: p });
        const m = a / d;
        const k = (b * d - a * e) / (d * d);
        result.asymptotes.push({ type: 'slant', m, k });
        const numA = a * d, numB = 2 * a * e, numC = b * e - c * d;
        const dr = solveQuadratic(numA, numB, numC).filter(x => Math.abs(x - p) > 1e-5);
        result.roots = dr;
        result.extrema = dr.map(x => {
          const y = (a * x * x + b * x + c) / (d * x + e);
          addPoint(x, y, "", "extrema");
          return { x, y, label: "" };
        });
        result.mainSign = (a / d) > 0 ? 1 : -1;
        
        const centerX = p;
        const centerY = m * p + k;
        result.symmetryCenter = { x: centerX, y: centerY };
        addPoint(centerX, centerY, "I", "center");
        
        if (Math.abs(e) > 1e-9) addIntersection(c / e, 'y');
      }
    } else if (funcType === 'exponential') {
        result.mainSign = (b * Math.log(a)) > 0 ? 1 : -1;
        // Exponential y = a^(bx+c) + d
        // Root: a^(bx+c) = -d => bx+c = log_a(-d)
        if (d !== 0 && (-d > 0)) {
            const xRoot = (Math.log(-d) / Math.log(a) - c) / b;
            result.roots = [xRoot];
        }
    } else if (funcType === 'logarithmic') {
        const p = -c / b;
        result.poles = [p];
        result.asymptotes.push({ type: 'vertical', val: p });
        // Root: log_a(bx+c) + d = 0 => bx+c = a^-d => x = (a^-d - c) / b
        const xRoot = (Math.pow(a, -d) - c) / b;
        result.roots = [xRoot];
        result.mainSign = (b / Math.log(a)) > 0 ? 1 : -1;
    } else {
        result.mainSign = a > 0 ? 1 : -1;
    }
    setAnalysis(result);
  };

  const toggleLayer = (layer: keyof typeof viewConfig) => {
    setViewConfig(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const SidebarItem = ({ children, title, icon: Icon, className = "", isActive = false }: { children: React.ReactNode, title: string, icon: any, className?: string, isActive?: boolean }) => (
    <div className={`
      p-6 rounded-[2rem] shadow-sm border transition-all duration-300 h-full flex flex-col
      ${isActive ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-white border-zinc-200 hover:shadow-md'}
      ${className}
    `}>
      <label className={`
        block text-sm font-bold mb-4 uppercase tracking-widest flex items-center
        ${isActive ? 'text-indigo-600' : 'text-zinc-400'}
      `}>
        <Icon className="w-4 h-4 mr-2" /> {title}
      </label>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 overflow-x-hidden font-sans" style={{ fontFamily: FONT_FAMILY }}>
      {/* Header */}
      <header className="bg-zinc-50 p-6 md:p-8 flex items-center justify-between z-30 max-w-[1400px] w-full mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-800">NTMA <span className="text-indigo-600">Socrates</span></h1>
          <p className="text-sm text-zinc-500">Hệ thống khảo sát hàm số thông minh</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex px-4 py-2 bg-white border border-zinc-200 rounded-full text-xs font-semibold shadow-sm items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Trạng thái: Sẵn sàng
          </div>
          <button onClick={() => setShowHelp(true)} className="p-2 bg-white border border-zinc-200 rounded-full shadow-sm hover:bg-zinc-50 transition-colors"><HelpCircle className="w-5 h-5 text-zinc-600"/></button>
        </div>
      </header>

      {/* Main Layout - Bento Grid */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-8 mb-20 md:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:h-[calc(100vh-200px)]">
          {/* Controls - Left Bento Column */}
          <div className={`
            ${activeTab === 'input' ? 'flex' : 'hidden md:flex'} 
            md:col-span-4 lg:col-span-3 flex-col gap-5 overflow-y-auto pr-1
          `}>
            <SidebarItem title="1. Loại hàm số" icon={List} className="min-h-[250px]">
              <div className="grid grid-cols-1 gap-1 h-36 overflow-y-auto pr-1 custom-scrollbar">
                {functionOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setFuncType(opt.id)}
                    className={`px-4 py-2 rounded-xl text-left text-xs font-bold transition-all ${
                      funcType === opt.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </SidebarItem>

            <SidebarItem title="2. Hệ số & Công thức" icon={Calculator}>
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex justify-center mb-6">
                <MathFormula type={funcType} {...coeffs} fontSize={14} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(coeffs).map((key) => {
                  if (key === 'd' && !['cubic', 'rational11', 'rational21', 'trig', 'trig_cos', 'trig_tan', 'trig_cot', 'logarithmic', 'exponential'].includes(funcType)) return null;
                  if (key === 'e' && funcType !== 'rational21') return null;
                  
                  let label = key.toUpperCase();
                  if (funcType === 'exponential' || funcType === 'logarithmic') {
                    if (key === 'a') label = 'Cơ số (a)';
                    if (key === 'b') label = 'Hệ số (b)';
                    if (key === 'c') label = 'Hệ số (c)';
                    if (key === 'd') label = 'Dịch (d)';
                  }

                  return (
                    <CoefficientInput
                      key={key}
                      label={label}
                      value={Number(coeffs[key as keyof typeof coeffs])}
                      step={key === 'a' && (funcType === 'exponential' || funcType === 'logarithmic') ? 0.1 : 1}
                      onChange={(val) => setCoeffs({ ...coeffs, [key]: val })}
                    />
                  );
                })}
              </div>
            </SidebarItem>

            <SidebarItem title="3. Giao diện Đồ thị" icon={Palette}>
              <div className="flex flex-wrap gap-2 mb-6">
                {THEME_PRESETS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setConfig(prev => ({ ...prev, theme: t }))}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                      config.theme?.id === t.id ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Màu đồ thị</span>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.theme?.graphColor }} />
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {COLORS.map(c => (
                      <button 
                        key={c.hex} 
                        onClick={() => setConfig(prev => ({ ...prev, theme: { ...prev.theme, graphColor: c.hex } }))}
                        className={`w-full aspect-square rounded-lg border-2 transition-transform hover:scale-110 ${config.theme?.graphColor === c.hex ? 'border-zinc-900 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nền</span>
                      <input 
                        type="color" 
                        value={config.theme?.bgColor} 
                        onChange={e => setConfig(prev => ({ ...prev, theme: { ...prev.theme, bgColor: e.target.value } }))}
                        className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Trục</span>
                      <input 
                        type="color" 
                        value={config.theme?.axisColor} 
                        onChange={e => setConfig(prev => ({ ...prev, theme: { ...prev.theme, axisColor: e.target.value } }))}
                        className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Lưới</span>
                      <input 
                        type="color" 
                        value={config.theme?.gridColor} 
                        onChange={e => setConfig(prev => ({ ...prev, theme: { ...prev.theme, gridColor: e.target.value } }))}
                        className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Chữ</span>
                      <input 
                        type="color" 
                        value={config.theme?.textColor} 
                        onChange={e => setConfig(prev => ({ ...prev, theme: { ...prev.theme, textColor: e.target.value } }))}
                        className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                   </div>
                </div>
              </div>
            </SidebarItem>

            <SidebarItem title="4. Tương giao" icon={Split} isActive={intersection.active}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-zinc-500">Tương giao đồ thị</span>
                <button 
                  onClick={() => setIntersection(p => ({...p, active: !p.active}))}
                  className={`w-10 h-5 rounded-full relative transition-colors ${intersection.active ? 'bg-indigo-600' : 'bg-zinc-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${intersection.active ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>
              {intersection.active ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex bg-zinc-100 p-1 rounded-xl">
                    <button onClick={() => setIntersection(p => ({...p, type: 'horizontal'}))} className={`flex-1 text-[10px] py-1.5 rounded-lg font-bold transition-all ${intersection.type === 'horizontal' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500'}`}>y = m</button>
                    <button onClick={() => setIntersection(p => ({...p, type: 'linear'}))} className={`flex-1 text-[10px] py-1.5 rounded-lg font-bold transition-all ${intersection.type === 'linear' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500'}`}>y = ax+b</button>
                    <button onClick={() => setIntersection(p => ({...p, type: 'tangent'}))} className={`flex-1 text-[10px] py-1.5 rounded-lg font-bold transition-all ${intersection.type === 'tangent' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500'}`}>Tiếp tuyến</button>
                  </div>
                  {intersection.type === 'horizontal' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tham số m:</span>
                        <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{intersection.m}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setIntersection(p => ({...p, m: Math.round((p.m - 0.1) * 10) / 10}))}
                          className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-600 transition-all active:scale-90"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input 
                          type="range" 
                          min="-10" 
                          max="10" 
                          step="0.1" 
                          value={intersection.m} 
                          onChange={(e) => setIntersection(p => ({...p, m: parseFloat(e.target.value)}))} 
                          className="flex-1 accent-indigo-600 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer" 
                        />
                        <button 
                          onClick={() => setIntersection(p => ({...p, m: Math.round((p.m + 0.1) * 10) / 10}))}
                          className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-600 transition-all active:scale-90"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : intersection.type === 'tangent' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tiếp điểm x₀:</span>
                        <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{intersection.m}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setIntersection(p => ({...p, m: Math.round((p.m - 0.1) * 10) / 10}))}
                          className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-600 transition-all active:scale-90"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input 
                          type="range" 
                          min="-5" 
                          max="5" 
                          step="0.1" 
                          value={intersection.m} 
                          onChange={(e) => setIntersection(p => ({...p, m: parseFloat(e.target.value)}))} 
                          className="flex-1 accent-indigo-600 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer" 
                        />
                        <button 
                          onClick={() => setIntersection(p => ({...p, m: Math.round((p.m + 0.1) * 10) / 10}))}
                          className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-600 transition-all active:scale-90"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-400 italic">Di chuyển x₀ để xem tiếp tuyến tại các điểm khác nhau</p>
                    </div>
                  ) : (
                      <div className="grid grid-cols-2 gap-2">
                          <CoefficientInput label="Hệ số a" value={Number(intersection.a)} onChange={val => setIntersection(p => ({...p, a: val}))} />
                          <CoefficientInput label="Hệ số b" value={Number(intersection.b)} onChange={val => setIntersection(p => ({...p, b: val}))} />
                      </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">Bật để khám phá tương giao & tiếp tuyến</p>
              )}
            </SidebarItem>
          </div>

          {/* Main Visuals - Right Bento Grid */}
          <div className={`
            md:col-span-8 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5
            ${activeTab !== 'input' ? 'flex flex-col h-full' : 'hidden md:grid'}
          `}>
            {/* Graph Panel - Most dominant block */}
            <div className={`
              md:col-span-2 lg:col-span-3 row-span-2 bg-white rounded-[2.5rem] shadow-sm border border-zinc-200 overflow-hidden flex flex-col relative
              ${isGraphFullscreen ? '!fixed inset-0 z-[100] rounded-none border-0' : ''}
              ${activeTab === 'graph' ? 'flex' : 'hidden md:flex'}
            `}>
              <div className="p-8 flex items-center justify-between border-b border-zinc-100">
                <h2 className="text-lg font-bold tracking-tight">Đồ thị hàm số</h2>
                <div className="flex gap-2">
                    <button onClick={() => setIsGraphFullscreen(!isGraphFullscreen)} className="p-2 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors">
                        {isGraphFullscreen ? <Minimize className="w-5 h-5 text-zinc-600"/> : <Maximize className="w-5 h-5 text-zinc-600"/>}
                    </button>
                </div>
              </div>
              <div className="flex-1 flex flex-col min-h-[400px] p-6 lg:p-8">
                <div className="flex-1 bg-zinc-50 border border-zinc-100 rounded-[2rem] overflow-hidden flex items-center justify-center relative">
                   <GraphCanvas 
                      onCanvasReady={(c) => canvasRef.current = c}
                      funcType={funcType} 
                      coeffs={coeffs} 
                      analysis={analysis} 
                      config={config} 
                      viewConfig={viewConfig} 
                      intersection={intersection} 
                      isFullscreen={isGraphFullscreen} 
                  />
                </div>
                {!isGraphFullscreen && (
                  <div className="pt-6 flex flex-wrap gap-2">
                      <button onClick={() => toggleLayer('grid')} className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all border ${viewConfig.grid ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-500 border-zinc-200'}`}>LƯỚI</button>
                      <button onClick={() => toggleLayer('asymptotes')} className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all border ${viewConfig.asymptotes ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-500 border-zinc-200'}`}>TIỆM CẬN</button>
                      <button onClick={() => toggleLayer('extrema')} className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all border ${viewConfig.extrema ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-500 border-zinc-200'}`}>CỰC TRỊ</button>
                      <button onClick={() => toggleLayer('intersections')} className={`px-4 py-2 rounded-full text-[10px] font-bold transition-all border ${viewConfig.intersections ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-500 border-zinc-200'}`}>GIAO ĐIỂM</button>
                  </div>
                )}
              </div>
            </div>

            {/* AI Tutor Card */}
            <div className={`
              md:col-span-1 lg:col-span-1 row-span-2 
              ${activeTab === 'tutor' ? 'flex flex-1' : 'hidden md:flex'}
            `}>
              <div className="w-full bg-zinc-900 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/10 overflow-hidden border border-white/5">
                <SocraticTutor analysis={analysis} funcType={funcType} coeffs={coeffs} onToggleResults={() => setShowAnalysis(!showAnalysis)} />
              </div>
            </div>

            {/* Math Story Card - New block in the grid */}
            <div className={`
              md:col-span-1 lg:col-span-1 
              ${activeTab === 'story' ? 'flex flex-1' : 'hidden md:flex'}
            `}>
              <MathStory funcType={funcType} />
            </div>

            {/* Analysis & BBT Panel */}
            <AnimatePresence>
                {showResultsPanel && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`
                      lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-zinc-200 overflow-hidden flex flex-col
                      ${activeTab === 'analysis' ? 'flex' : 'hidden lg:flex'}
                    `}
                >
                    <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-900 text-white">
                        <h3 className="font-bold tracking-tight">Cơ sở toán học & Lời giải chi tiết</h3>
                        <div className="flex gap-2">
                           <button onClick={() => setShowAnalysis(!showAnalysis)} className="text-zinc-400 hover:text-white transition-colors">
                              {showAnalysis ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                           </button>
                        </div>
                    </div>
                    <div className="p-8 flex-1 overflow-y-auto">
                        {showAnalysis ? (
                            <div className="space-y-12">
                                <section>
                                  <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-600"></div> Bảng xét dấu đạo hàm
                                  </div>
                                  <div className="bg-white p-2 overflow-x-auto">
                                    <BBT analysis={analysis} funcType={funcType} coeffs={coeffs} config={config} />
                                  </div>
                                </section>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                  <section className="space-y-4">
                                     <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                       <div className="w-2 h-2 rounded-full bg-indigo-600"></div> Khảo sát biến thiên
                                     </div>
                                     <div className="p-2"><AnalysisResults analysis={analysis} funcType={funcType} coeffs={coeffs} /></div>
                                  </section>

                                  <section className="space-y-6">
                                     <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                       <div className="w-2 h-2 rounded-full bg-indigo-600"></div> Bảng giá trị tọa độ
                                     </div>
                                     <div className="bg-zinc-50 rounded-3xl border border-zinc-100 overflow-hidden">
                                        <table className="w-full text-xs text-center border-collapse">
                                            <thead>
                                              <tr className="bg-zinc-100/50 border-b border-zinc-200">
                                                <th className="py-3 border-r border-zinc-200 font-black italic text-zinc-400">x</th>
                                                {[-2, -1, 0, 1, 2].map(x => (
                                                  <th key={x} className="py-3 border-r border-zinc-200">{x}</th>
                                                ))}
                                              </tr>
                                            </thead>
                                            <tbody>
                                              <tr>
                                                <td className="py-3 border-r border-zinc-200 font-black italic text-zinc-400">y</td>
                                                {[-2, -1, 0, 1, 2].map(x => {
                                                  const yVal = getFunctionValue(x, funcType, coeffs);
                                                  return (
                                                    <td key={x} className="py-3 border-r border-zinc-200 font-bold text-indigo-600">
                                                      {isFinite(yVal) ? formatNum(yVal) : '||'}
                                                    </td>
                                                  );
                                                })}
                                              </tr>
                                            </tbody>
                                        </table>
                                     </div>
                                     <p className="text-[10px] text-zinc-400 italic bg-blue-50 p-3 rounded-xl border border-blue-100">
                                       * Mẹo : Hãy chọn các điểm đặc biệt để xác định đồ thị chính xác nhất.
                                     </p>
                                  </section>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-6 p-10 text-center">
                              <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center shadow-inner">
                                <EyeOff className="w-10 h-10 opacity-30" />
                              </div>
                              <div>
                                <h4 className="font-bold text-zinc-800 mb-2 italic uppercase tracking-widest text-xs">Thử thách tư duy</h4>
                                <p className="text-xs leading-relaxed max-w-xs mx-auto text-zinc-500">Học sinh nên tự lập bảng xét dấu trước khi xem đáp án chi tiết từ Socrates.</p>
                              </div>
                              <button onClick={() => setShowAnalysis(true)} className="px-8 py-3 bg-zinc-900 text-white rounded-full font-bold text-[10px] tracking-widest shadow-xl hover:bg-indigo-600 transition-all uppercase">Mở lời giải</button>
                            </div>
                        )}
                    </div>
                </motion.div>
                )}
            </AnimatePresence>

            {/* Knowledge Check Card */}
            <div className={`
              lg:col-span-1 
              ${activeTab === 'analysis' ? 'flex' : 'hidden lg:flex'}
            `}>
              <KnowledgeCheck funcType={funcType} coeffs={coeffs} analysis={analysis} />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-zinc-900 border border-white/10 h-18 rounded-3xl flex items-center justify-around z-40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-4">
        <button onClick={() => setActiveTab('input')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'input' ? 'text-white scale-110' : 'text-zinc-500'}`}><Settings className="w-5 h-5"/><span className="text-[8px] font-black uppercase tracking-widest">Cài đặt</span></button>
        <button onClick={() => setActiveTab('graph')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'graph' ? 'text-white scale-110' : 'text-zinc-500'}`}><Palette className="w-5 h-5"/><span className="text-[8px] font-black uppercase tracking-widest">Đồ thị</span></button>
        <button onClick={() => setActiveTab('tutor')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'tutor' ? 'text-indigo-400 scale-125' : 'text-zinc-500'}`}><CheckCircle2 className="w-6 h-6"/><span className="text-[8px] font-black uppercase tracking-widest">Socrates</span></button>
        <button onClick={() => setActiveTab('story')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'story' ? 'text-emerald-400 scale-125' : 'text-zinc-500'}`}><BookOpen className="w-6 h-6"/><span className="text-[8px] font-black uppercase tracking-widest">Câu chuyện</span></button>
        <button onClick={() => setActiveTab('analysis')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'analysis' ? 'text-white scale-110' : 'text-zinc-500'}`}><Info className="w-5 h-5"/><span className="text-[8px] font-black uppercase tracking-widest">Lời giải</span></button>
      </nav>

      <AnimatePresence>
        {showHelp && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
                >
                    <div className="bg-blue-900 p-6 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2"><HelpCircle className="text-amber-400" /><h3 className="font-bold text-xl">Hướng dẫn sử dụng</h3></div>
                        <button onClick={() => setShowHelp(false)} className="hover:rotate-90 transition-transform"><XCircle /></button>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-100 text-blue-600 font-black rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">1</div>
                            <div><p className="font-bold text-gray-800">Chọn Hàm & Nhập số</p><p className="text-sm text-gray-500">Khu vực bên trái cho phép bạn chọn loại hàm và thay đổi hệ số.</p></div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-orange-100 text-orange-600 font-black rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">2</div>
                            <div><p className="font-bold text-gray-800">Trợ giảng Socrates</p><p className="text-sm text-gray-500">Bạn có thể học bài cùng Socrates thông qua các câu hỏi gợi mở.</p></div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-green-100 text-green-600 font-black rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">3</div>
                            <div><p className="font-bold text-gray-800">Tương giao</p><p className="text-sm text-gray-500">Kéo thanh trượt m để xem sự thay đổi số giao điểm giữa đồ thị và đường thẳng.</p></div>
                        </div>
                        <button onClick={() => setShowHelp(false)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all">Bắt đầu ngay</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorMsg && (
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 p-4 rounded-xl shadow-lg flex items-center gap-3 z-50 text-red-800 font-bold"
            >
                <AlertTriangle /> {errorMsg}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
