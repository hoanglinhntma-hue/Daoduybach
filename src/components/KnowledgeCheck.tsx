import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ChevronRight, RefreshCw, GraduationCap, Trophy, Target, Sparkles } from 'lucide-react';
import { formatNum, getFunctionValue } from '../utils/math-utils';
import { MATH_FONT_FAMILY } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

import { MathFormula } from './MathFormula.tsx';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface KnowledgeCheckProps {
  funcType: string;
  coeffs: any;
  analysis: any;
}

const MathText: React.FC<{ text: string }> = ({ text }) => {
  // Simple parser for common math notations in this app
  // Italicizes single letters x, y, a, b, c, d, e, k, u, v
  // Handles ^ for superscript and _ for subscript
  
  const tokens = text.split(/(\^\{[^{}]+\}|\^.|_\{[^{}]+\}|_.)/g);
  
  return (
    <span style={{ fontFamily: MATH_FONT_FAMILY }}>
      {tokens.map((token, i) => {
        if (!token) return null;
        
        if (token.startsWith('^')) {
          const content = token.startsWith('^{') ? token.slice(2, -1) : token.slice(1);
          return <sup key={i} className="text-[0.75em]"><MathText text={content} /></sup>;
        }
        
        if (token.startsWith('_')) {
          const content = token.startsWith('_{') ? token.slice(2, -1) : token.slice(1);
          return <sub key={i} className="text-[0.75em]"><MathText text={content} /></sub>;
        }
        
        // Split further to handle variables and operators
        const chars = token.split(/([xyabcdekuv]'+|[xyabcdekuv]|[\+\−\=\∞])/g);
        return chars.map((char, j) => {
          if (!char) return null;
          if (/^[xyabcdekuv]'+$/.test(char) || /^[xyabcdekuv]$/.test(char)) {
            // Only italicize if it's likely a variable (not inside a word)
            const prev = j > 0 ? chars[j-1].slice(-1) : '';
            const next = j < chars.length - 1 ? chars[j+1][0] : '';
            const isBoundary = !/[a-zA-Zà-ỹÀ-Ỹ]/.test(prev) && !/[a-zA-Zà-ỹÀ-Ỹ]/.test(next);
            
            if (isBoundary) {
                return <i key={`${i}-${j}`} className="opacity-95">{char}</i>;
            }
          }
          if (char === '=') return <span key={`${i}-${j}`} className="mx-1.5 opacity-60">=</span>;
          if (char === '+') return <span key={`${i}-${j}`} className="mx-1 opacity-60">+</span>;
          if (char === '−') return <span key={`${i}-${j}`} className="mx-1 opacity-60">−</span>;
          return char;
        });
      })}
    </span>
  );
};

export const KnowledgeCheck: React.FC<KnowledgeCheckProps> = ({ funcType, coeffs, analysis }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, [funcType, coeffs, analysis]);

  const generateQuestions = () => {
    if (!analysis || !analysis.valid) return;

    const newQuestions: Question[] = [];
    const { a, b, c, d, e } = coeffs;

    // --- Question: Domain (Advanced) ---
    if (funcType === 'rational11' || funcType === 'rational21') {
        const pole = funcType === 'rational11' ? -coeffs.d / coeffs.c : -coeffs.e / coeffs.d;
        newQuestions.push({
            id: 1,
            text: `Tiệm cận đứng của đồ thị hàm số là đường thẳng:`,
            options: [
                `x = ${formatNum(pole)}`,
                `x = ${formatNum(-pole)}`,
                `y = ${formatNum(pole)}`,
                `x = 0`
            ],
            correctIndex: 0,
            explanation: `Tiệm cận đứng là nghiệm của mẫu số: ${funcType === 'rational11' ? `${formatNum(coeffs.c)}x + ${formatNum(coeffs.d)} = 0` : `${formatNum(coeffs.d)}x + ${formatNum(coeffs.e)} = 0`}.`
        });
    }

    // --- Question: Intercepts ---
    const yIntercept = getFunctionValue(0, funcType, coeffs);
    if (isFinite(yIntercept)) {
        newQuestions.push({
            id: 10,
            text: "Giao điểm của đồ thị với trục tung (Oy) có tọa độ là:",
            options: [
                `(0; ${formatNum(yIntercept)})`,
                `(${formatNum(yIntercept)}; 0)`,
                `(0; 0)`,
                `Không cắt trục tung`
            ],
            correctIndex: 0,
            explanation: `Giao điểm với trục tung Oy là điểm có hoành độ x = 0. Thay x = 0 vào hàm số ta được y = ${formatNum(yIntercept)}.`
        });
    }

    // --- Question: Symmetry (Cubic/Rational) ---
    if (funcType === 'cubic') {
        const xInf = -b / (3 * a);
        const yInf = a * xInf ** 3 + b * xInf ** 2 + c * xInf + d;
        newQuestions.push({
            id: 20,
            text: "Tâm đối xứng (điểm uốn) của đồ thị hàm số bậc 3 này là:",
            options: [
                `I(${formatNum(xInf)}; ${formatNum(yInf)})`,
                `I(${formatNum(-xInf)}; ${formatNum(yInf)})`,
                `O(0; 0)`,
                `Hàm số không có tâm đối xứng`
            ],
            correctIndex: 0,
            explanation: `Đối với hàm bậc 3, tâm đối xứng chính là điểm uốn, có hoành độ là nghiệm của đạo hàm cấp hai y'' = 0 (x = -b/3a).`
        });
    }

    // --- Question: Limits at Infinity ---
    if (funcType === 'cubic' || funcType === 'quartic') {
        const isPosInf = a > 0;
        newQuestions.push({
            id: 30,
            text: "Giới hạn của hàm số khi x tiến tới dương vô cùng (+∞) là:",
            options: [
                "+∞",
                "−∞",
                "0",
                formatNum(a)
            ],
            correctIndex: isPosInf ? 0 : 1,
            explanation: `Giới hạn tại vô cực của hàm đa thức phụ thuộc vào dấu của hệ số bậc cao nhất. Ở đây a = ${formatNum(a)} ${isPosInf ? '> 0' : '< 0'}.`
        });
    }

    // --- Question: Monotonicity (Exponential/Log) ---
    if (funcType === 'exponential' || funcType === 'logarithmic') {
        const base = a;
        const isInc = base > 1;
        const label = funcType === 'exponential' ? 'mũ' : 'logarit';
        newQuestions.push({
            id: 40,
            text: `Với cơ số a = ${formatNum(base)}, hàm số ${label} này:`,
            options: [
                "Luôn đồng biến (nếu b > 0)",
                "Luôn nghịch biến (nếu b > 0)",
                "Đồng biến khi x < 0",
                "Có một cực trị"
            ],
            correctIndex: isInc ? 0 : 1,
            explanation: `Hàm số ${label} cơ bản đồng biến khi cơ số a > 1 và nghịch biến khi 0 < a < 1. Ở đây a = ${formatNum(base)}.`
        });
    }

    // --- Question: Number of Extrema (Quartic) ---
    if (funcType === 'quartic') {
        const has3 = (a * b < 0);
        newQuestions.push({
          id: 50,
          text: "Số lượng điểm cực trị của hàm số trùng phương này là:",
          options: ["1 điểm cực trị", "2 điểm cực trị", "3 điểm cực trị", "Không có cực trị"],
          correctIndex: has3 ? 2 : 0,
          explanation: `Hàm trùng phương ax⁴ + bx² + c có 3 cực trị khi ab < 0 và có 1 cực trị khi ab ≥ 0.`
        });
    }

    // --- Question: Concavity/Inflection (Cubic) ---
    if (funcType === 'cubic') {
        newQuestions.push({
            id: 25,
            text: `Tại điểm uốn I(${formatNum(-b/(3*a))}; ...), đồ thị hàm số sẽ:`,
            options: [
                "Đổi chiều lồi/lõm",
                "Đạt cực đại",
                "Đạt cực tiểu",
                "Cắt trục hoành"
            ],
            correctIndex: 0,
            explanation: `Điểm uốn là điểm mà tại đó đồ thị hàm số bậc 3 thay đổi hướng lồi hoặc lõm.`
        });
    }

    // --- Question: Limits at Infinity (More specific) ---
    if (funcType === 'cubic' || funcType === 'quartic') {
        const result = (funcType === 'cubic') ? (a > 0 ? '−∞' : '+∞') : (a > 0 ? '+∞' : '−∞');
        
        newQuestions.push({
            id: 31,
            text: "Giới hạn của hàm số khi x tiến tới âm vô cùng (−∞) là:",
            options: ["+∞", "−∞", "0", formatNum(a)],
            correctIndex: result === '+∞' ? 0 : 1,
            explanation: `Khi x tiến tới âm vô cùng, hàm bậc ${funcType === 'cubic' ? 'lẻ' : 'chẵn'} có kết quả phụ thuộc vào dấu của x và hệ số bậc cao nhất.`
        });
    }

    // --- Question: Behavioral property ---
    if (funcType === 'rational11') {
        const ad_bc = a * d - b * c;
        const isInc = ad_bc > 0;
        newQuestions.push({
            id: 60,
            text: `Với tích chéo ad - bc = ${formatNum(ad_bc)}, đồ thị hàm số này:`,
            options: [
                isInc ? "Đi lên từ trái sang phải" : "Đi xuống từ trái sang phải",
                isInc ? "Đi xuống từ trái sang phải" : "Đi lên từ trái sang phải",
                "Có một điểm cực trị",
                "Cắt tiệm cận ngang"
            ],
            correctIndex: 0,
            explanation: `Dấu của đạo hàm hàm bậc 1/1 phụ thuộc vào biểu thức ad - bc. Nếu dương thì hàm đồng biến (đồ thị đi lên).`
        });
    }

    // --- Question: Quartic Shape ---
    if (funcType === 'quartic') {
        const isW = a > 0;
        newQuestions.push({
            id: 65,
            text: `Với hệ số a = ${formatNum(a)}, đồ thị hàm trùng phương có bề lõm hướng về:`,
            options: [
                isW ? "Phía trên" : "Phía dưới",
                isW ? "Phía dưới" : "Phía trên",
                "Trục tung",
                "Trục hoành"
            ],
            correctIndex: 0,
            explanation: `Đối với hàm bậc 4, nếu a > 0 thì hai nhánh cuối cùng hướng lên trên (+∞), nếu a < 0 thì hướng xuống dưới (−∞).`
        });
    }

    // --- Question: Fixed point (Log/Exp) ---
    if (funcType === 'exponential') {
        const xFix = -c / b;
        const yFix = 1 + d;
        newQuestions.push({
            id: 70,
            text: `Đồ thị hàm số mũ luôn đi qua điểm cố định nào sau đây?`,
            options: [
                `(${formatNum(xFix)}; ${formatNum(yFix)})`,
                `(0; 1)`,
                `(1; 0)`,
                `(${formatNum(xFix)}; 0)`
            ],
            correctIndex: 0,
            explanation: `Khi số mũ bằng 0 (bx+c=0), ta có a⁰ = 1. Do đó y = 1 + d.`
        });
    }

    // --- Question: Tangent slope at x=0 ---
    let derivativeAtZero: number | null = null;
    if (funcType === 'cubic') derivativeAtZero = c;
    if (funcType === 'quartic') derivativeAtZero = 0; 
    if (funcType === 'rational11') derivativeAtZero = (a*d - b*c) / (d*d);

    if (derivativeAtZero !== null && isFinite(derivativeAtZero)) {
        newQuestions.push({
            id: 45,
            text: `Hệ số góc của tiếp tuyến của đồ thị tại điểm x = 0 là:`,
            options: [
                `${formatNum(derivativeAtZero)}`,
                `${formatNum(-derivativeAtZero)}`,
                "1",
                "0"
            ],
            correctIndex: 0,
            explanation: `Hệ số góc k của tiếp tuyến tại điểm có hoành độ x₀ chính là giá trị đạo hàm y'(x₀). Ở đây y'(0) = ${formatNum(derivativeAtZero)}.`
        });
    }

    // Always ensure we have exactly 5 questions by adding general math or calculus questions if needed
    if (newQuestions.length < 5) {
        const fallbacks = [
            {
                id: 101,
                text: "Quy tắc đạo hàm của tích (uv)' là:",
                options: ["u'v + uv'", "u'v − uv'", "u'v'", "u' + v'"],
                correctIndex: 0,
                explanation: "Đây là quy tắc đạo hàm cơ bản của một tích hai hàm số."
            },
            {
                id: 102,
                text: "Hàm số y = x^k (k là số nguyên dương) có đạo hàm là:",
                options: ["k·x^{k-1}", "x^{k-1}", "k·x^k", "1/k · x^{k+1}"],
                correctIndex: 0,
                explanation: "Công thức đạo hàm lũy thừa cơ bản."
            },
            {
                id: 103,
                text: "Nếu y' > 0 với mọi x thuộc khoảng K thì hàm số:",
                options: ["Đồng biến trên K", "Nghịch biến trên K", "Không đổi trên K", "Có cực đại trên K"],
                correctIndex: 0,
                explanation: "Đây là định lý cơ bản về mối liên hệ giữa dấu của đạo hàm và sự biến thiên."
            },
            {
                id: 104,
                text: "Đồ thị hàm số bậc 1/1 có bao nhiêu đường tiệm cận?",
                options: ["2", "1", "0", "Vô số"],
                correctIndex: 0,
                explanation: "Hàm bậc 1/1 luôn có 1 tiệm cận đứng và 1 tiệm cận ngang."
            },
            {
                id: 105,
                text: "Số giao điểm của đồ thị hàm số và trục hoành là số nghiệm của:",
                options: ["Phương trình y = 0", "Phương trình x = 0", "Đạo hàm y' = 0", "Đạo hàm y'' = 0"],
                correctIndex: 0,
                explanation: "Giao điểm với trục hoành là các điểm có tung độ y = 0."
            }
        ];
        
        for (const f of fallbacks) {
            if (newQuestions.length < 5) newQuestions.push(f);
        }
    }

    setQuestions(newQuestions.sort(() => Math.random() - 0.5).slice(0, 5));
    resetStates();
  };

  const resetStates = () => {
    setCurrentIdx(0);
    setSelectedIdx(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
  };

  const handleCheck = () => {
    if (selectedIdx === null) return;
    setIsAnswered(true);
    if (selectedIdx === questions[currentIdx].correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  if (!analysis || !analysis.valid || questions.length === 0) {
      return null;
  }

  const currentQ = questions[currentIdx];

  if (showResult) {
    const isPassing = score >= questions.length / 2;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col h-full bg-emerald-100/50 backdrop-blur-3xl rounded-[2.5rem] p-8 text-zinc-900 border border-emerald-200/50 shadow-xl"
      >
        <div className="flex-1 flex flex-col items-center justify-center text-center">
            <motion.div 
               initial={{ rotate: -15, scale: 0 }}
               animate={{ rotate: 0, scale: 1 }}
               className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-2xl ${isPassing ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-orange-500 shadow-orange-500/20'}`}
            >
                {isPassing ? <Trophy className="w-12 h-12 text-white" /> : <Target className="w-12 h-12 text-white" />}
            </motion.div>
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight text-emerald-900">KẾT QUẢ CỦA BẠN</h3>
            <p className="text-emerald-700/70 text-sm mb-10 px-4 font-medium">Bạn đã hoàn thành bài trắc nghiệm nhanh về khảo sát hàm số</p>
            
            <div className="relative mb-12">
               <div className="text-8xl font-black text-emerald-600 tracking-tighter tabular-nums drop-shadow-sm">
                   {score}<span className="text-4xl text-emerald-300">/{questions.length}</span>
               </div>
            </div>

            <button 
                onClick={resetStates}
                className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
            >
                <RefreshCw className="w-5 h-5" /> THỬ LẠI LẦN NỮA
            </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-emerald-50/90 backdrop-blur-3xl rounded-[2.5rem] p-6 lg:p-8 text-zinc-900 border border-white shadow-2xl overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/30 blur-[100px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-200/30 blur-[100px] -z-10 rounded-full" />

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/20">
                <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800/60">Kiểm tra kiến thức</h3>
              <div className="flex gap-1.5 mt-1.5">
                 {questions.map((_, i) => (
                   <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < currentIdx ? 'bg-emerald-600 w-4' : i === currentIdx ? 'bg-emerald-400 w-8 shadow-sm shadow-emerald-400/50' : 'bg-emerald-100 w-2'}`} />
                 ))}
              </div>
            </div>
        </div>
        <div className="flex items-center text-[10px] font-black text-emerald-700 bg-emerald-100/80 px-4 py-2 rounded-2xl border border-emerald-200/50">
            {currentIdx + 1} / {questions.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-6">
                <h4 className="text-xl md:text-2xl font-extrabold leading-tight text-emerald-950 mb-4" style={{ fontFamily: MATH_FONT_FAMILY }}>
                  {currentQ.text}
                </h4>
                
                {/* Reference formula area */}
                <div className="inline-flex items-center px-6 py-3 bg-white/50 backdrop-blur-sm border border-emerald-100 rounded-2xl shadow-sm">
                   <div className="flex flex-col items-start">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-700/50 mb-1">Hàm số đang xét:</span>
                      <MathFormula type={funcType} {...coeffs} fontSize={18} />
                   </div>
                </div>
            </div>

            <div className="space-y-3.5 mb-10">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionClick(i)}
                  className={`
                    group w-full text-left p-5 rounded-3xl border-2 transition-all duration-300 text-sm md:text-base font-bold flex items-center justify-between
                    ${selectedIdx === i 
                      ? (isAnswered 
                          ? (i === currentQ.correctIndex ? 'bg-emerald-100 border-emerald-500 text-emerald-700 shadow-md' : 'bg-orange-50 border-orange-400 text-orange-700')
                          : 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-600/30 -translate-y-1')
                      : (isAnswered && i === currentQ.correctIndex 
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                          : 'bg-white border-zinc-100 text-emerald-900/60 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm')
                    }
                  `}
                  disabled={isAnswered}
                >
                  <MathText text={opt} />
                  <div className="flex items-center ml-4 shrink-0">
                    {isAnswered && i === currentQ.correctIndex && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    {isAnswered && selectedIdx === i && i !== currentQ.correctIndex && <XCircle className="w-5 h-5 text-orange-500" />}
                    {!isAnswered && selectedIdx === i && <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />}
                  </div>
                </button>
              ))}
            </div>

            <AnimatePresence>
                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-10 p-5 bg-white/60 border border-emerald-100 rounded-[2rem] shadow-sm overflow-hidden"
                  >
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-emerald-100 rounded-2xl">
                           <HelpCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-800 mb-1">Giải thích</h5>
                            <p className="text-sm text-emerald-900/70 leading-relaxed italic font-medium">
                                {currentQ.explanation}
                            </p>
                        </div>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto pt-4 border-t border-emerald-100/50">
          <AnimatePresence mode="wait">
            {!isAnswered ? (
              <motion.button
                key="check"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCheck}
                disabled={selectedIdx === null}
                className={`
                  w-full py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] transition-all
                  ${selectedIdx === null ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200/50' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 active:scale-95'}
                `}
              >
                Xác nhận đáp án
              </motion.button>
            ) : (
              <motion.button
                key="next"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleNext}
                className="w-full py-5 bg-teal-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-teal-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-teal-600/20 active:scale-95"
              >
                {currentIdx === questions.length - 1 ? 'Xem kết quả' : 'Câu hỏi tiếp theo'} <ChevronRight className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
