import React, { useState, useEffect, useRef } from 'react';
import { Bot, ChevronRight, RotateCcw, HelpCircle, CheckCircle2, Sparkles, AlertCircle, Lightbulb, Info, Calculator } from 'lucide-react';
import { formatNum } from '../utils/math-utils.ts';
import { MATH_FONT_FAMILY } from '../constants.ts';
import { motion, AnimatePresence } from 'motion/react';
import { MathFormula } from './MathFormula.tsx';

interface SocraticTutorProps {
  funcType: string;
  coeffs: any;
  analysis: any;
  onToggleResults: () => void;
}

export const SocraticTutor: React.FC<SocraticTutorProps> = ({ funcType, coeffs, analysis, onToggleResults }) => {
  const [step, setStep] = useState(0);
  const [subStep, setSubStep] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: string; msg: string } | null>(null);
  const [showWhy, setShowWhy] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStep(0);
    setSubStep(0);
    setHintLevel(0);
    setUserAnswer('');
    setFeedback(null);
    setIsCorrect(false);
    setShowWhy(false);
  }, [funcType]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [feedback, hintLevel, step]);

  if (!analysis || !analysis.valid) return null;

  const getStepContent = () => {
    let q = '', h1 = '', h2 = '', h3 = '', why = '';
    if (step === 0) {
      if (['rational11', 'rational21'].includes(funcType)) {
        const val = funcType === 'rational11' ? -coeffs.d / coeffs.c : -coeffs.e / coeffs.d;
        q = 'Bước 1: Tập xác định. Em hãy tìm giá trị x mà hàm số KHÔNG xác định.';
        h1 = 'Hàm phân thức xác định khi mẫu số khác 0.';
        h2 = `Hãy giải phương trình mẫu số = 0 để tìm nghiệm.`;
        h3 = `Mẫu số bằng 0 khi x = ${formatNum(val)}.`;
        why = 'Vì phép chia cho 0 không xác định trong tập số thực, nên ta phải loại bỏ giá trị làm mẫu bằng 0.';
      } else if (
        ['cubic', 'quartic', 'quadratic', 'exponential', 'trig', 'trig_cos', 'trig_tan', 'trig_cot'].includes(funcType)
      ) {
        q = 'Bước 1: Tập xác định của hàm số này là gì?';
        h1 = 'Có điều kiện gì cho x không? (Căn thức, mẫu số...)';
        h2 = 'Hàm đa thức xác định với mọi giá trị x.';
        h3 = 'Tập xác định là R (toàn bộ trục số).';
        why = 'Các phép toán cộng, trừ, nhân, lũy thừa luôn thực hiện được với mọi số thực.';
      } else if (funcType === 'logarithmic') {
        const val = -coeffs.c;
        q = 'Bước 1: Điều kiện xác định của hàm logarit này là gì?';
        h1 = 'Biểu thức bên trong logarit phải luôn dương.';
        h2 = `Giải bất phương trình: x ${coeffs.c >= 0 ? '+' : '−'} ${formatNum(Math.abs(coeffs.c))} > 0.`;
        h3 = `x phải lớn hơn ${formatNum(val)}.`;
        why = 'Hàm logarit log_b(u) chỉ có nghĩa khi u > 0.';
      }
    } else if (step === 1) {
      q = "Bước 2: Xét sự biến thiên. Đạo hàm y' có các nghiệm nào? (Liệt kê đủ)";
      if (['rational11'].includes(funcType)) {
        q = "Bước 2: Xét dấu y'. Hàm số này Đồng biến hay Nghịch biến?";
        h1 = "Tính y' và xem dấu của tử số.";
        h2 = `Tử số của y' là (ad - bc).`;
        h3 = analysis.yPrimeNum > 0 ? 'Tử số dương -> Đồng biến.' : 'Tử số âm -> Nghịch biến.';
        why = 'Nếu y\' > 0 trên miền K thì hàm đồng biến trên K. Ngược lại y\' < 0 thì nghịch biến.';
      } else {
        h1 = "Tính y' theo công thức đạo hàm cơ bản, sau đó giải y' = 0.";
        h2 = "Nghiệm của y' là các điểm cực trị tiềm năng.";
        const roots = analysis.roots || [];
        h3 = roots.length > 0 ? `y' = 0 tại x ∈ {${roots.map((r: number) => formatNum(r)).join(', ')}}` : "y' = 0 vô nghiệm.";
        why = "Đạo hàm y' cho biết tốc độ thay đổi tức thời. Tại các điểm y' = 0, đồ thị có tiếp tuyến nằm ngang (thường là cực trị).";
      }
    } else if (step === 2) {
      const numExtrema = analysis.extrema.length;
      q = `Bước 3: Hàm số có bao nhiêu điểm cực trị?`;
      h1 = "Dựa vào số nghiệm đơn của phương trình y' = 0.";
      h2 = "Nếu y' đổi dấu qua nghiệm thì đó là cực trị.";
      h3 = `Hàm số này có ${numExtrema} cực trị.`;
      why = 'Cực trị là các điểm \'đỉnh núi\' (cực đại) hoặc \'đáy thung lũng\' (cực tiểu) của đồ thị.';
    } else if (step === 3) {
      if (funcType === 'rational11') {
        if (subStep === 0) {
          q = 'Bước 4a: Tìm Tiệm cận đứng. Đường thẳng x = ?';
          h1 = 'Tiệm cận đứng là nghiệm của mẫu số.';
          h2 = `Giải phương trình mẫu số ${formatNum(coeffs.c)}x + ${formatNum(coeffs.d)} = 0.`;
          h3 = `x = ${formatNum(-coeffs.d / coeffs.c)}.`;
          why = 'Khi x tiến dần tới nghiệm của mẫu, giá trị hàm số tiến ra vô cực.';
        } else {
          q = 'Bước 4b: Tìm Tiệm cận ngang. Đường thẳng y = ?';
          h1 = 'Tiệm cận ngang là giới hạn của hàm số khi x -> vô cùng.';
          h2 = 'Với hàm bậc 1/1, TCN là tỉ số hai hệ số của x trên tử và mẫu (a/c).';
          h3 = `y = a/c = ${formatNum(coeffs.a / coeffs.c)}.`;
          why = 'Khi x rất lớn, các hằng số không đáng kể, y xấp xỉ ax/cx = a/c.';
        }
      } else if (funcType === 'rational21') {
        if (subStep === 0) {
          q = 'Bước 4a: Tìm Tiệm cận đứng. Đường thẳng x = ?';
          h1 = 'Tiệm cận đứng là nghiệm của mẫu số.';
          h2 = `Giải phương trình mẫu số ${formatNum(coeffs.d)}x + ${formatNum(coeffs.e)} = 0.`;
          h3 = `x = ${formatNum(-coeffs.e / coeffs.d)}.`;
          why = 'Khi x tiến dần tới nghiệm của mẫu, giá trị hàm số tiến ra vô cực.';
        } else {
          q = 'Bước 4b: Tìm Tiệm cận xiên. Đường thẳng y = ax + b. Nhập phương trình hoặc các hệ số.';
          h1 = 'Thực hiện phép chia đa thức tử cho mẫu.';
          h2 = 'Thương số của phép chia chính là phương trình tiệm cận xiên.';
          const m = coeffs.a / coeffs.d;
          const k = (coeffs.b * coeffs.d - coeffs.a * coeffs.e) / (coeffs.d * coeffs.d);
          h3 = `y = ${formatNum(m)}x ${k >= 0 ? '+' : ''} ${formatNum(k)}.`;
          why = 'Khi x -> vô cùng, phần dư của phép chia tiến về 0, đồ thị tiệm cận đường thẳng thương.';
        }
      } else if (funcType === 'logarithmic') {
        q = 'Bước 4: Hàm Logarit có tiệm cận đứng x = ?';
        h1 = 'Xét tại biên của tập xác định.';
        h2 = 'Biểu thức trong logarit bằng 0 tại đâu?';
        h3 = `x = ${formatNum(-coeffs.c)}.`;
        why = 'Logarit tiến tới vô cực khi biểu thức bên trong tiến về 0.';
      } else if (funcType === 'exponential') {
        q = 'Bước 4: Hàm Mũ có tiệm cận ngang y = ?';
        h1 = 'Xét giới hạn khi x -> âm vô cùng (nếu cơ số > 1) hoặc dương vô cùng.';
        h2 = 'Phần mũ tiến về 0, hàm số còn lại hằng số nào?';
        h3 = `y = ${formatNum(coeffs.d)}.`;
        why = 'Hàm mũ b^x luôn dương và tiến về 0 ở một đầu vô cực, nên đồ thị tiệm cận đường nằm ngang.';
      } else {
        q = 'Bước 4: Hàm số này có đường tiệm cận nào không?';
        h1 = 'Hàm đa thức bậc cao có tiệm cận không?';
        h2 = 'Khi x -> vô cùng, y cũng -> vô cùng.';
        h3 = 'Không có tiệm cận.';
        why = 'Hàm đa thức liên tục trên R và nhánh vô hạn, không bị chặn bởi đường thẳng nào.';
      }
    } else {
      q = 'Chúc mừng! Em đã hoàn thành việc khảo sát.';
    }
    return { q, h1, h2, h3, why };
  };

  const content = getStepContent();

  const handleCheckAnswer = () => {
    const extractNums = (str: string) => {
      const matches = str.match(/-?\d+(\.\d+)?(\/\d+)?/g);
      if (!matches) return [];
      return matches.map((s) => {
        if (s.includes('/')) {
          const [n, d] = s.split('/');
          return parseFloat(n) / parseFloat(d);
        }
        return parseFloat(s);
      });
    };
    const input = userAnswer.toLowerCase().trim();
    const userNums = extractNums(input);
    let correct = false;
    let feedbackType = 'error';
    let errorMsg = 'Câu trả lời chưa chính xác. Thử lại nhé!';

    if (step === 0) {
      if (['rational11', 'rational21'].includes(funcType)) {
        const val = funcType === 'rational11' ? -coeffs.d / coeffs.c : -coeffs.e / coeffs.d;
        if (userNums.some((n) => Math.abs(n - val) < 0.01)) correct = true;
        else errorMsg = 'Em hãy kiểm tra lại nghiệm của mẫu số.';
      } else if (funcType === 'logarithmic') {
        const val = -coeffs.c;
        if (userNums.some((n) => Math.abs(n - val) < 0.01)) correct = true;
        else errorMsg = 'Em hãy kiểm tra lại điều kiện biểu thức trong logarit > 0.';
      } else {
        if (input.includes('r') || input.includes('thực') || input.includes('mọi')) correct = true;
        else errorMsg = 'Hàm đa thức/lượng giác/mũ thường xác định trên đâu?';
      }
    } else if (step === 1) {
      if (funcType === 'rational11') {
        const isInc = analysis.yPrimeNum > 0;
        if (
          (isInc && (input.includes('đồng') || input.includes('tăng') || input.includes('>'))) ||
          (!isInc && (input.includes('nghịch') || input.includes('giảm') || input.includes('<')))
        ) {
          correct = true;
        } else {
          errorMsg = "Hãy tính kỹ dấu của tử số (ad - bc).";
        }
      } else {
        const roots = analysis.roots || [];
        if (roots.length === 0) {
          if (input.includes('vô') || input.includes('không')) correct = true;
          else errorMsg = "Phương trình y' = 0 có nghiệm không? Hãy kiểm tra lại.";
        } else {
          const foundCount = roots.filter((r: number) => userNums.some((u) => Math.abs(u - r) < 0.1)).length;
          if (foundCount === roots.length) {
            correct = true;
          } else if (foundCount > 0) {
            feedbackType = 'warning';
            errorMsg = `Em đã tìm đúng ${foundCount} nghiệm, nhưng vẫn còn thiếu (tổng ${roots.length} nghiệm).`;
          } else {
            errorMsg = "Chưa thấy nghiệm đúng nào của y'.";
          }
        }
      }
    } else if (step === 2) {
      const num = analysis.extrema.length;
      if (input.includes(num.toString())) correct = true;
      else errorMsg = 'Số lượng điểm cực trị chưa đúng.';
    } else if (step === 3) {
      if (funcType === 'rational11') {
        if (subStep === 0) {
          const val = -coeffs.d / coeffs.c;
          if (userNums.some((n) => Math.abs(n - val) < 0.01)) correct = true;
          else errorMsg = 'Giá trị x chưa đúng. Kiểm tra nghiệm mẫu số.';
        } else {
          const val = coeffs.a / coeffs.c;
          if (userNums.some((n) => Math.abs(n - val) < 0.01)) correct = true;
          else errorMsg = 'Giá trị y chưa đúng. Kiểm tra tỉ số hệ số bậc cao nhất.';
        }
      } else if (funcType === 'rational21') {
        if (subStep === 0) {
          const val = -coeffs.e / coeffs.d;
          if (userNums.some((n) => Math.abs(n - val) < 0.01)) correct = true;
          else errorMsg = 'Giá trị x chưa đúng. Kiểm tra nghiệm mẫu số.';
        } else {
          const m = coeffs.a / coeffs.d;
          const k = (coeffs.b * coeffs.d - coeffs.a * coeffs.e) / (coeffs.d * coeffs.d);
          const hasM = userNums.some((n) => Math.abs(n - m) < 0.01);
          const hasK = userNums.some((n) => Math.abs(n - k) < 0.01);
          if (hasM && (hasK || Math.abs(k) < 0.01)) correct = true;
          else if (hasM) {
            feedbackType = 'warning';
            errorMsg = 'Hệ số góc a đúng, nhưng hệ số tự do b chưa đúng.';
          } else if (hasK) {
            feedbackType = 'warning';
            errorMsg = 'Hệ số tự do b đúng, nhưng hệ số góc a chưa đúng.';
          } else errorMsg = 'Phương trình tiệm cận xiên chưa chính xác.';
        }
      } else if (['logarithmic', 'exponential'].includes(funcType)) {
        const asymVals = analysis.asymptotes.map((a: any) => a.val);
        if (asymVals.some((val: number) => userNums.some((u) => Math.abs(u - val) < 0.1))) correct = true;
        else errorMsg = 'Giá trị tiệm cận chưa chính xác.';
      } else {
        if (input.includes('không') || input.includes('0')) correct = true;
        else errorMsg = 'Hàm đa thức này không có tiệm cận.';
      }
    }
    if (correct) {
      setFeedback({ type: 'success', msg: 'Chính xác! Em làm tốt lắm.' });
      setIsCorrect(true);
    } else {
      setFeedback({ type: feedbackType, msg: errorMsg });
      setIsCorrect(false);
    }
  };

  const handleNext = () => {
    let nextStep = step;
    let nextSubStep = subStep;
    if (step === 3 && ['rational11', 'rational21'].includes(funcType) && subStep === 0) {
      nextSubStep = 1;
    } else {
      nextStep = step + 1;
      nextSubStep = 0;
    }
    setStep(nextStep);
    setSubStep(nextSubStep);
    setHintLevel(0);
    setUserAnswer('');
    setFeedback(null);
    setIsCorrect(false);
    setShowWhy(false);
  };

  if (step > 3)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-indigo-600/10 backdrop-blur-md rounded-3xl p-8 text-center min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-indigo-400/30"
      >
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Hoàn thành xuất sắc!</h3>
        <p className="text-indigo-200 mb-8 max-w-xs">Em đã nắm vững các bước khảo sát hàm số này. Hãy thử các bài toán khác nhé!</p>
        <button
          onClick={() => {
            setStep(0);
            setSubStep(0);
          }}
          className="group flex items-center px-8 py-3 bg-white text-indigo-600 rounded-2xl font-black shadow-xl hover:bg-indigo-50 transition-all hover:scale-105"
        >
          <RotateCcw className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-500" /> 
          THỬ LẠI
        </button>
      </motion.div>
    );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with fancy indicator */}
      <div className="px-4 py-3 md:px-6 md:py-4 flex flex-col gap-3 md:gap-4 border-b border-white/5 bg-white/5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-sm md:text-lg leading-none uppercase tracking-tighter">Socrates AI</h3>
              <span className="text-[8px] md:text-[10px] text-indigo-300 font-bold tracking-widest flex items-center mt-1 uppercase">
                 Trợ lý học thuật số
              </span>
            </div>
          </div>
          
          <div className="flex gap-1 md:gap-1.5">
             {[0, 1, 2, 3].map((s) => (
               <div 
                 key={s} 
                 className={`h-1 md:h-1.5 w-4 md:w-6 rounded-full transition-all duration-500 ${
                   s < step ? 'bg-emerald-400' : s === step ? 'bg-white w-6 md:w-10 shadow-lg shadow-white/20' : 'bg-white/10'
                 }`} 
               />
             ))}
          </div>
        </div>

        {/* Function Display for easy reference */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4">
           <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
              <Calculator className="w-3 h-3 md:w-4 md:h-4 text-indigo-300" />
           </div>
           <div className="flex-1 text-center overflow-x-auto py-1 scrollbar-hide">
              <MathFormula type={funcType} {...coeffs} fontSize={16} />
           </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 md:px-6 space-y-5 md:space-y-6"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${step}-${subStep}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500/50 flex items-center justify-center shrink-0 border border-white/10">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="space-y-4 max-w-[85%]">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl rounded-tl-none text-white shadow-xl">
                 <p className="text-base font-medium leading-relaxed" style={{ fontFamily: MATH_FONT_FAMILY }}>
                   {content.q}
                 </p>
              </div>

              {/* Hints list (shown sequentially as "AI thoughts") */}
              {hintLevel > 0 && (
                <div className="space-y-2">
                  {[...Array(hintLevel)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 5 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2"
                    >
                       <div className="w-5 h-5 rounded-full bg-indigo-400/20 flex items-center justify-center shrink-0">
                         <Lightbulb className="w-3 h-3 text-indigo-300" />
                       </div>
                       <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-xs text-indigo-100 italic">
                         {i === 0 ? content.h1 : i === 1 ? content.h2 : content.h3}
                       </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Feedback Message (as a separate message bubble) */}
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-end"
          >
            <div className={`max-w-[80%] p-4 rounded-2xl rounded-tr-none border shadow-lg ${
              feedback.type === 'success' 
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100' 
              : feedback.type === 'warning'
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-100'
              : 'bg-rose-500/20 border-rose-500/50 text-rose-100'
            }`}>
               <div className="flex items-center gap-2 mb-1">
                 {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                 <span className="text-[10px] font-black uppercase tracking-widest">
                   {feedback.type === 'success' ? 'Hệ thống' : 'Gợi ý thêm'}
                 </span>
               </div>
               <p className="text-sm font-medium">{feedback.msg}</p>
            </div>
          </motion.div>
        )}

        {/* Why Explanation */}
        <AnimatePresence>
          {showWhy && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex gap-2 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-400/20"
            >
               <Info className="w-5 h-5 text-indigo-400 shrink-0" />
               <p className="text-xs text-indigo-200 italic leading-relaxed">{content.why}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div className="p-4 md:p-6 pt-2 md:pt-4 bg-indigo-950/40 backdrop-blur-3xl border-t border-white/5 shrink-0">
        <div className="relative group">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Gõ câu trả lời..."
            className="w-full bg-white/5 border-2 border-white/10 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 pr-24 md:pr-32 text-white placeholder:text-indigo-400/50 focus:outline-none focus:border-indigo-500/50 transition-all font-medium backdrop-blur-md text-sm md:text-base"
            onKeyDown={(e) => e.key === 'Enter' && !isCorrect && userAnswer && handleCheckAnswer()}
            disabled={isCorrect}
          />
          <div className="absolute right-1.5 top-1.5 bottom-1.5 flex gap-1">
            {!isCorrect ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!userAnswer}
                className={`flex items-center px-4 md:px-6 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] transition-all uppercase tracking-widest ${
                  !userAnswer ? 'text-white/20 bg-white/5' : 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-400'
                }`}
              >
                Gửi
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center px-4 md:px-6 bg-emerald-500 text-white rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] transition-all uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 animate-pulse"
              >
                Tiếp <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!isCorrect && (
          <div className="flex gap-4 md:gap-6 mt-3 md:mt-4 px-1">
             <button
               onClick={() => setHintLevel(prev => (prev >= 3 ? 1 : prev + 1))}
               className="flex items-center gap-1.5 md:gap-2 text-indigo-300 hover:text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors"
             >
               <Lightbulb className="w-3 h-3 md:w-3.5 md:h-3.5" />
               Gợi ý ({hintLevel}/3)
             </button>
             <button
               onClick={() => setShowWhy(!showWhy)}
               className={`flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors ${showWhy ? 'text-white' : 'text-indigo-300 hover:text-white'}`}
             >
               <HelpCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
               Kiến thức
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
