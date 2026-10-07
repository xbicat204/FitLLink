// s@/components/home/TestimonialSection.jsx
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";

const reviewVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.45 },
  }),
};

export default function TestimonialSection() {
  const reviews = [
    {
      name: "Lan Anh",
      content:
        "Chỉ sau 8 tuần, mình giảm 6kg & siết body rõ rệt. PT theo rất sát!",
    },
    {
      name: "Văn Nam",
      content: "Lần đầu tập online nhưng hiệu quả bất ngờ. Lịch linh hoạt.",
    },
    {
      name: "Minh Tuấn",
      content:
        "PT nhiệt tình, giải đáp nhanh. Lộ trình phù hợp dân văn phòng.",
    },
  ];

  return (
    <SectionWrapper className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
        >
          Học viên nói gì về FitLink?
        </motion.h2>
        <motion.p
          className="text-center text-gray-600 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Được hàng trăm học viên tin tưởng & sử dụng hằng ngày.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={reviewVariants}
              whileHover={{ scale: 1.03, y: -4 }}
              className="p-6 rounded-2xl bg-orange-50/40 backdrop-blur shadow-sm hover:shadow-xl transition border border-orange-100/80"
            >
              <p className="text-gray-700 italic mb-4 text-sm md:text-base">
                “{r.content}”
              </p>
              <h3 className="font-bold text-sm md:text-base">{r.name}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
