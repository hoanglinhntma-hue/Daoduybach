import React from 'react';
import { BookOpen, Globe, Lightbulb, Star, Quote } from 'lucide-react';
import { motion } from 'motion/react';
import { MATH_FONT_FAMILY } from '../constants';

interface MathStoryProps {
  funcType: string;
}

export const MathStory: React.FC<MathStoryProps> = ({ funcType }) => {
  const getStory = () => {
    switch (funcType) {
      case 'cubic':
        return {
          title: "Đường cong của sự sống",
          context: "Hàm số bậc ba và sự biến đổi",
          story: "Trong thiên nhiên, đường cong bậc ba (Cubic) xuất hiện khi chúng ta quan sát sự uốn lượn của những con sông hay sự thay đổi của áp suất. Nó không đơn điệu như đường thẳng, nó có 'điểm uốn' - khoảnh khắc mà sự thay đổi bắt đầu đi theo một hướng mới, giống như những bước ngoặt trong cuộc đời mỗi con người.",
          scenario: "Hãy tưởng tượng bạn đang thiết kế một con đường chạy qua đồi núi. Để xe cộ không bị xóc nảy khi chuyển hướng, các kỹ sư dùng hàm bậc ba để tạo ra độ dốc mượt mà nhất tại các điểm nối.",
          fact: "Các kỹ sư sử dụng đường cong bậc ba để thiết kế các đoạn nối trên đường ray tàu hỏa, đảm bảo hành khách không cảm nhận được lực quán tính quá đột ngột khi tàu vào cua."
        };
      case 'quartic':
        return {
          title: "Vẻ đẹp của sự đối xứng trùng phương",
          context: "Hàm bậc bốn và sự ổn định",
          story: "Hàm trùng phương mang hình dáng của một chiếc nôi hoặc chữ W đầy nghệ thuật. Nó mô tả những hệ thống có nhiều trạng thái cân bằng. Trong kiến trúc, những mái vòm uốn lượn theo dáng dấp của hàm bậc bốn không chỉ đẹp mà còn giúp phân tán lực một cách thông minh.",
          scenario: "Khi bạn đeo một cặp kính cận, bề mặt thấu kính thường được tính toán theo các hàm đa thức bậc cao như bậc 4 để triệt tiêu hiện tượng quang sai, giúp hình ảnh qua kính rõ nét đến tận rìa.",
          fact: "Hàm bậc bốn được dùng để mô tả sự tán xạ ánh sáng trong quang học và cấu trúc của các hạt nano, nơi mà sự đối xứng quyết định nên tính chất của vật chất."
        };
      case 'rational11':
      case 'rational21':
        return {
          title: "Ranh giới của sự vô hạn",
          context: "Hàm phân thức và sự tiệm cận",
          story: "Những đường tiệm cận là biểu tượng của sự kiên trì: chúng tiến lại gần nhau mãi mãi nhưng không bao giờ chạm vào nhau. Trong kinh tế, đây là quy luật của 'hiệu suất giảm dần' - nhắc nhở chúng ta về sự tồn tại của những giới hạn cần được tôn trọng.",
          scenario: "Khi bạn bật một chiếc máy lọc không khí, tốc độ làm sạch sẽ nhanh lúc đầu nhưng chậm dần khi không khí đã gần sạch. Nồng độ bụi sẽ tiến về mức 0 (tiệm cận) nhưng khó lòng đạt mức 0 tuyệt đối.",
          fact: "Các bác sĩ sử dụng hàm phân thức để tính toán nồng độ thuốc trong máu. Khi thời gian trôi qua, nồng độ thuốc sẽ tiệm cận về 0, giúp xác định thời điểm chính xác cho liều dùng tiếp theo."
        };
      case 'exponential':
        return {
          title: "Sức mạnh của sự bùng nổ",
          context: "Hàm số mũ và sự tăng trưởng",
          story: "Hàm số mũ bắt đầu một cách lặng lẽ, nhưng sau đó bùng nổ với một tốc độ kinh ngạc. Đó là câu chuyện về lãi suất kép hay là sự lan tỏa của một ý tưởng tốt. Nó dạy ta rằng những hành động nhỏ bé nhưng kiên trì sẽ tạo nên kết quả khổng lồ.",
          scenario: "Một bài đăng trên mạng xã hội có thể 'viral' theo hàm số mũ. Nếu mỗi người xem chia sẻ cho 2 người khác, chỉ sau 20 bước, bạn đã tiếp cận được hơn 1 triệu người!",
          fact: "Từ sự phân rã phóng xạ của các nguyên tử đến sự tăng trưởng nhanh chóng của các vi sinh vật, hàm số mũ là ngôn ngữ của sự sinh sôi và chuyển hóa năng lượng."
        };
      case 'logarithmic':
        return {
          title: "Ngôn ngữ của các giác quan",
          context: "Hàm logarit và sự cảm thụ",
          story: "Tại sao chúng ta cảm thấy tiếng sét lớn gấp nhiều lần tiếng thì thầm, dù năng lượng thực tế lớn hơn hàng triệu lần? Đó là vì các giác quan của con người hoạt động theo thang Logarit để bảo vệ chúng ta khỏi bị quá tải.",
          scenario: "Trong âm nhạc, các phím đàn piano được sắp xếp theo logarit để tai người nghe thấy các quãng tám cách đều nhau, dù tần số âm thanh thực tế tăng gấp đôi sau mỗi quãng.",
          fact: "Thang đo độ Richter cho động đất và thang Decibel cho âm thanh đều là hàm logarit. Mỗi đơn vị tăng thêm thực tế tương ứng với một sự thay đổi khổng lồ về năng lượng."
        };
      case 'trig':
      case 'trig_cos':
        return {
          title: "Giai điệu của vũ trụ",
          context: "Hàm lượng giác và chu kỳ",
          story: "Mọi thứ xung quanh ta đều rung động: từ nhịp đập trái tim đến ánh sáng từ các vì sao. Hàm số Sin và Cosin là những nốt nhạc toán học mô tả sự tuần hoàn này, nhắc nhở ta rằng sau mỗi cơn sóng dữ, mặt biển sẽ lại bình yên.",
          scenario: "Khi bạn sử dụng điện thoại di động, giọng nói của bạn được mã hóa thành các sóng điện từ có dạng hình sin để truyền đi qua không gian và tái tạo lại chính xác ở đầu bên kia.",
          fact: "Toàn bộ kỷ nguyên số hóa hiện nay đều dựa trên việc phân tích tín hiệu thành các hàm lượng giác đơn giản thông qua phép biến đổi Fourier."
        };
      default:
        return {
          title: "Toán học - Bản hòa ca của vũ trụ",
          context: "Sự liên kết vô hình",
          story: "Mỗi phương trình bạn giải hôm nay là một phần của bản đồ dẫn đường cho các vệ tinh, là công trình sư cho những tòa nhà chọc trời. Toán học là ngôn ngữ chung duy nhất của nhân loại và cả vũ trụ.",
          scenario: "Trong cuộc sống hàng ngày, từ cách GPS tìm đường đến cách dự báo thời tiết cho ngày mai, tất cả đều là sự vận hành âm thầm của các hàm số toán học.",
          fact: "Mọi hiện tượng xung quanh chúng ta, từ hình dáng bông tuyết đến quỹ đạo hành tinh, đều có thể được mô tả qua vẻ đẹp của bản hòa ca toán học."
        };
    }
  };

  const story = getStory();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col bg-white border border-zinc-200 rounded-[2.5rem] p-6 md:p-8 shadow-xl overflow-hidden relative group"
    >
      {/* Background decoration - lighter and cleaner */}
      <div className="absolute -top-20 -right-20 bg-indigo-50 w-64 h-64 rounded-full blur-3xl opacity-60" />
      <div className="absolute -bottom-20 -left-20 bg-emerald-50 w-64 h-64 rounded-full blur-3xl opacity-60" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Góc văn hóa</h4>
              <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight">{story.title}</h3>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
          <div className="relative mb-8 pt-4">
            <Quote className="absolute top-0 -left-2 w-10 h-10 text-indigo-500/10" />
            <p className="text-zinc-700 leading-relaxed font-serif italic text-lg relative z-10 pl-6 border-l-4 border-indigo-500/20">
              {story.story}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-2">
                 <Lightbulb className="w-4 h-4 text-emerald-600" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Tình huống thực tế</span>
              </div>
              <p className="text-sm text-emerald-900/80 leading-relaxed font-medium">
                {story.scenario}
              </p>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-2">
                 <Globe className="w-4 h-4 text-amber-600" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Kiến thức bổ sung</span>
              </div>
              <p className="text-xs text-amber-900/70 leading-relaxed">
                {story.fact}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Toán học là thi ca của tư duy</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
            </div>
        </div>
      </div>
    </motion.div>
  );
};
