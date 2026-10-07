import MainLayout from "@/layouts/MainLayout";
import ProgramSection from "@/components/page/home/ProgramSection";
import TrainerSection from "@/components/page/home/TrainerSection";
import PricingSection from "@/components/page/home/PricingSection";

export default function ProgramsPage() {
  return (
    <MainLayout>
      <section className="bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_34%),linear-gradient(180deg,#fff7ed_0%,#ffffff_55%)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-500">
            Programs
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
            Chọn đúng lộ trình theo mục tiêu, lịch sống và ngân sách của bạn.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-600 md:text-lg">
            FitLink không chỉ bán gói tập. Chúng tôi ghép mục tiêu của bạn với PT phù
            hợp, tần suất hợp lý và hình thức tập linh hoạt.
          </p>
        </div>
      </section>
      <ProgramSection />
      <TrainerSection />
      <PricingSection />
    </MainLayout>
  );
}
