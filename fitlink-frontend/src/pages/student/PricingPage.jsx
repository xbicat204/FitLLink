import { Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import PricingSection from "@/components/page/home/PricingSection";

const comparisons = [
  ["Đánh giá thể trạng", "1 lần", "2 lần", "4 lần"],
  ["Chat với PT", "Có", "Có", "Ưu tiên cao"],
  ["Số buổi tập", "Theo lịch riêng", "8 buổi", "16 buổi"],
  ["Báo cáo tiến độ", "Cơ bản", "Hàng tuần", "Chuyên sâu"],
];

export default function PricingPage() {
  return (
    <MainLayout>
      <section className="bg-slate-950 px-6 py-24 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">
            Pricing
          </p>
          <div className="mt-4 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                Bảng giá được thiết kế để bạn có thể bắt đầu nhanh và nâng cấp dần.
              </h1>
              <p className="mt-5 max-w-2xl text-base text-slate-300 md:text-lg">
                Không hợp đồng mơ hồ, không phí ẩn. Bạn trả cho mục tiêu, mức độ đồng
                hành và tần suất tập luyện thực tế.
              </p>
            </div>
            <Link
              to="/list-pt"
              className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Tìm PT phù hợp
            </Link>
          </div>
        </div>
      </section>

      <PricingSection />

      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
              Compare
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-5xl">
              So sánh nhanh các mức gói.
            </h2>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div className="grid grid-cols-4 bg-slate-900 px-6 py-4 text-sm font-semibold text-white">
              <div>Hạng mục</div>
              <div>Starter</div>
              <div>Transformation</div>
              <div>Elite</div>
            </div>
            {comparisons.map((row, index) => (
              <div
                key={row[0]}
                className={`grid grid-cols-4 px-6 py-4 text-sm ${
                  index % 2 === 0 ? "bg-white" : "bg-orange-50/40"
                }`}
              >
                {row.map((cell) => (
                  <div key={cell} className="pr-4 text-slate-700">
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
