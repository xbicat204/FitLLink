// s@/components/home/TrainerSection.jsx
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";

const trainerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.45 },
  }),
};

export default function TrainerSection() {
  const trainers = [
    {
      name: "PT Hoàng Minh",
      img: "/poster.jpg",
      exp: "5 năm kinh nghiệm",
      tag: "Strength & Hypertrophy",
    },
    {
      name: "PT Thu Uyên",
      img: "/poster2.jpg",
      exp: "Chuyên gia giảm mỡ - diet plan",
      tag: "Fat Loss & Conditioning",
    },
    {
      name: "PT Quốc Khánh",
      img: "/dog.png",
      exp: "Chuyên sức mạnh - tăng cơ",
      tag: "Power & Performance",
    },
  ];

  return (
    <SectionWrapper className="bg-orange-50/40 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.h2
          className="mb-3 text-center text-3xl font-black tracking-tight md:text-5xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
        >
          Huấn luyện viên tiêu biểu
        </motion.h2>
        <motion.p
          className="mb-10 text-center text-gray-600"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Được kiểm duyệt bởi FitLink, chấm điểm bởi học viên thực tế.
        </motion.p>

        <div className="grid gap-8 md:grid-cols-3">
          {trainers.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              variants={trainerVariants}
              className="rounded-[28px] border border-orange-100/70 bg-white p-4 shadow-sm transition hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative">
                <motion.img
                  src={t.img}
                  alt={t.name}
                  className="h-64 w-full rounded-[22px] object-cover"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs text-white shadow">
                  Top Rated
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-bold">{t.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{t.exp}</p>
                <p className="mt-2 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700">
                  {t.tag}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
