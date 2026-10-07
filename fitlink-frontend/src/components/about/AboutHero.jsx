// s@/components/about/AboutHero.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const slides = [
  {
    title: "Built by coaches,\nfor everyday people.",
    desc:
      "FitLink kết nối bạn với đội ngũ huấn luyện viên được chứng nhận, kết hợp kiến thức khoa học và kinh nghiệm thực tế để giúp bạn duy trì thói quen tập luyện lâu dài.",
    primaryCta: "Our story",
    secondaryCta: "Meet the team",
    primaryTargetId: "our-story",
    secondaryTargetId: "our-team",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1400&auto=format&fit=crop",
    badge: "Since 2025 • FitLink Coach",
    tag: "Helping busy people stay consistent",
  },
  {
    title: "Human coaching,\nscience-backed training.",
    desc:
      "Chúng tôi kết hợp dữ liệu từ buổi tập, lịch sử sức khỏe và feedback của bạn để PT có thể điều chỉnh chương trình mỗi tuần – không phải chỉ là một file giáo án cố định.",
    primaryCta: "How FitLink works",
    secondaryCta: "Our values",
    primaryTargetId: "how-it-works",
    secondaryTargetId: "our-values",
    image:
      "https://images.unsplash.com/photo-1571907480495-3b4bff7b5b4a?q=80&w=1400&auto=format&fit=crop",
    badge: "Data-driven • Coach-guided",
    tag: "Blending technology & personal care",
  },
];

export default function AboutHero() {
  const scrollToSection = (id) => {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Swiper
      autoplay={{ delay: 7000, disableOnInteraction: false }}
      loop
      effect="fade"
      pagination={{ clickable: true }}
      modules={[Autoplay, Pagination, EffectFade]}
      className="w-full h-[520px] md:h-[580px]"
    >
      {slides.map((s, i) => (
        <SwiperSlide key={i}>
          <section className="relative h-[520px] md:h-[580px] overflow-hidden">
            {/* background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-white to-amber-50" />
            {/* soft shapes */}
            <div className="pointer-events-none absolute -right-24 -top-24 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-orange-200/60 to-amber-100 blur-2xl" />
            <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[58%] h-[120%] bg-gradient-to-l from-orange-100 via-orange-50 to-transparent rounded-l-[48px]" />

            {/* main content */}
            <div className="relative z-10 mx-auto h-full max-w-[1200px] px-6 md:px-10 lg:px-14 flex flex-col md:flex-row items-center gap-10 md:gap-8">
              {/* left text */}
              <div className="flex-1 max-w-2xl pt-6 md:pt-0">
                {/* top tag */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-semibold">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500" />
                    {s.badge}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-gray-500">
                    {s.tag}
                  </span>
                </div>

                <h1 className="whitespace-pre-line text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-gray-900 leading-[1.15]">
                  {s.title}
                </h1>

                <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-xl">
                  {s.desc}
                </p>

                {/* CTA buttons */}
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => scrollToSection(s.primaryTargetId)}
                    className="px-7 py-3 rounded-full text-sm sm:text-base text-white font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md transition"
                  >
                    {s.primaryCta}
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection(s.secondaryTargetId)}
                    className="px-7 py-3 rounded-full text-sm sm:text-base font-semibold text-gray-800 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition"
                  >
                    {s.secondaryCta}
                  </button>
                </div>

                {/* stats row – giữ để About có số liệu */}
                <div className="mt-6 grid grid-cols-3 max-w-xs text-xs sm:text-sm text-gray-600">
                  <div>
                    <div className="font-semibold text-gray-900 text-base sm:text-lg">
                      50+
                    </div>
                    <div>Certified PTs</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-base sm:text-lg">
                      1.2k
                    </div>
                    <div>Active members</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-base sm:text-lg">
                      92%
                    </div>
                    <div>See progress in 8 weeks</div>
                  </div>
                </div>
              </div>

              {/* right image / card */}
              <div className="flex-1 flex justify-center md:justify-end w-full">
                <div className="relative w-full max-w-[420px]">
                  <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-3xl bg-gradient-to-br from-orange-200 to-amber-100" />
                  <img
                    src={s.image}
                    alt="FitLink coaching team"
                    className="relative z-10 h-[280px] sm:h-[360px] lg:h-[420px] w-full object-cover rounded-3xl shadow-[0_30px_80px_rgba(15,23,42,0.45)]"
                  />

                  {/* small glass card */}
                  <div className="absolute left-4 bottom-4 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-lg font-bold">
                      PT
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Behind FitLink</p>
                      <p className="text-sm font-semibold text-gray-900">
                        Real coaches, real stories
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
