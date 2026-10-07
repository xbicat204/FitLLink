// s@/components/home/ProgramSection.jsx
import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { Link } from "react-router-dom";
import { PackageTags } from "@/domain/enum";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.45 },
  }),
};

export default function ProgramSection() {
  const programs = [
    {
      name: "Fat Loss Reset",
      img: "/images/pro_service_1.png",
      desc: "Tập trung giảm mỡ, nâng cao thể lực và kỷ luật tập luyện trong 6-8 tuần.",
      goal: PackageTags.WEIGHT_LOSS,
    },
    {
      name: "Lean Muscle Build",
      img: "/images/pro_service_2.png",
      desc: "Tăng sức mạnh, cải thiện kỹ thuật và tăng khối cơ theo lịch tập bền vững.",
      goal: PackageTags.MUSCLE_GAIN,
    },
    {
      name: "Flexible Lifestyle Coaching",
      img: "/images/pro_service_3.png",
      desc: "Phù hợp người bận rộn cần lịch tập mềm dẻo, theo dõi qua app và chat với PT.",
      goal: PackageTags.GENERAL_HEALTH,
    },
  ];

  return (
    <SectionWrapper className="bg-slate-950 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">
              Programs
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
              Chương trình được gợi ý theo kết quả bạn muốn thấy trên cơ thể.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-300 md:text-base">
            Mỗi lộ trình là một cách ghép mục tiêu, lịch sống và cách PT đồng hành.
            Bạn có thể bắt đầu từ cơ bản, sau đó nâng cấp thành gói chuyên sâu hơn.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {programs.map((p, i) => (
            <motion.div
              key={p.name}
              custom={i}
              variants={cardVariants}
              className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-sm transition hover:shadow-2xl"
              whileHover={{ y: -6 }}
            >
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={p.img}
                  alt={p.name}
                  className="h-full w-full object-cover transform group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>

              <div className="absolute inset-0 flex items-end">
                <div className="p-6">
                  <p className="mb-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200">
                    Featured Track
                  </p>
                  <h3 className="text-2xl font-semibold text-white">
                    {p.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/75">
                    {p.desc}
                  </p>
                  <Link
                    to={`/list-pt?goal=${encodeURIComponent(p.goal)}`}
                    className="mt-4 inline-flex rounded-full border border-white/25 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white hover:text-slate-900"
                  >
                    Tìm PT phù hợp
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
