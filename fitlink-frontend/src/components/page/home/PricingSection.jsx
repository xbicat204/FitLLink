import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PackageTags } from "@/domain/enum";

const plans = [
  {
    name: "Starter",
    price: "499K",
    note: "/thang",
    accent: "from-orange-500 to-amber-500",
    goal: PackageTags.GENERAL_HEALTH,
    features: [
      "1 buổi đánh giá thể trạng",
      "Chat với PT trong app",
      "Lịch tập cá nhân hóa cơ bản",
    ],
  },
  {
    name: "Transformation",
    price: "1.290K",
    note: "/goi 8 buoi",
    accent: "from-slate-900 to-slate-700",
    featured: true,
    goal: PackageTags.WEIGHT_LOSS,
    features: [
      "Theo dõi tiến độ hàng tuần",
      "PT đồng hành online/offline",
      "Điều chỉnh lịch tập linh hoạt",
    ],
  },
  {
    name: "Elite",
    price: "2.490K",
    note: "/goi 16 buoi",
    accent: "from-emerald-500 to-teal-500",
    goal: PackageTags.MUSCLE_GAIN,
    features: [
      "Ưu tiên đặt lịch với PT top rated",
      "Báo cáo body metrics định kỳ",
      "Tư vấn dinh dưỡng nâng cao",
    ],
  },
];

export default function PricingSection() {
  return (
    <section className="relative overflow-hidden bg-[#fff9f2] py-24">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-orange-100/60 to-transparent" />
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-500">
              Pricing
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
              Bảng giá rõ ràng, không phí ẩn, để bắt đầu ngay.
            </h2>
          </div>
          <Link
            to="/pricing"
            className="inline-flex items-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
          >
            Xem bảng giá chi tiết
          </Link>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className={`rounded-[28px] border p-7 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ${
                plan.featured
                  ? "border-slate-900 bg-white"
                  : "border-white/60 bg-white/80 backdrop-blur"
              }`}
            >
              <div
                className={`inline-flex rounded-full bg-gradient-to-r px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white ${plan.accent}`}
              >
                {plan.name}
              </div>

              <div className="mt-6">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-slate-900">
                    {plan.price}
                  </span>
                  <span className="pb-1 text-sm text-slate-500">{plan.note}</span>
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={`/list-pt?goal=${encodeURIComponent(plan.goal)}`}
                className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  plan.featured
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                Chọn PT cho {plan.name}
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
