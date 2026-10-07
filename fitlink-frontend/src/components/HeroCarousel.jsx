import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BMIWidget from "./student/BMIWidget";

const slides = [
  {
    title: "Shape Your Body,\nShape Your Destiny.",
    desc:
      "Transform your health and fitness with expert coaching, structured programs, and a schedule that fits your life.",
    primaryCta: "Explore Our Programs",
    secondaryCta: "View Pricing",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1400&auto=format&fit=crop",
    badge: "4.8★ Rated Coaches",
    tag: "Trusted by 500+ members",
  },
  {
    title: "Train Smarter,\nNot Just Harder.",
    desc:
      "Personalized plans, weekly schedules, and nutrition notes for consistent progress—built together with your PT.",
    primaryCta: "Find Your Coach",
    secondaryCta: "Talk to a PT",
    image:
      "/poster2.jpg",
    badge: "Nutrition + Workout",
    tag: "Science-based coaching",
  },
];

export default function HeroCarousel() {
  const [showBMI, setShowBMI] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Swiper
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        loop
        effect="fade"
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination, EffectFade]}
        className="w-full h-[620px] md:h-[680px]"
      >
        {slides.map((s, i) => (
          <SwiperSlide key={i}>
            <section className="relative h-[620px] overflow-hidden md:h-[680px]">
              {/* background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#fbf6ef] via-[#fffdf9] to-[#f6e8d5]" />
              {/* soft shapes */}
              <div className="pointer-events-none absolute -right-24 -top-24 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-orange-200/60 to-amber-100 blur-2xl" />
              <div className="pointer-events-none absolute right-0 top-1/2 h-[120%] w-[58%] -translate-y-1/2 rounded-l-[48px] bg-gradient-to-l from-orange-100/90 via-orange-50/60 to-transparent" />

              {/* main content */}
              <div className="relative z-10 mx-auto flex h-full max-w-[1240px] flex-col items-center gap-10 px-6 md:flex-row md:gap-8 md:px-10 lg:px-14">
                {/* left text */}
                <div className="flex-1 max-w-2xl pt-10 md:pt-0">
                  {/* top tag */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-white/70 px-3 py-1 text-xs font-semibold text-orange-700 shadow-sm backdrop-blur-sm">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
                      {s.badge}
                    </div>
                    <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-slate-500 sm:inline">
                      {s.tag}
                    </span>
                  </div>

                  <h1 className="font-display whitespace-pre-line text-4xl font-bold leading-[0.98] text-slate-900 sm:text-5xl lg:text-[5rem]">
                    {s.title}
                  </h1>

                  <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                    {s.desc}
                  </p>

                  {/* CTA buttons */}
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(i === 0 ? "/programs" : "/list-pt")
                      }
                      className="rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(245,158,11,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_46px_rgba(245,158,11,0.34)] sm:text-base"
                    >
                      {s.primaryCta}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(i === 0 ? "/pricing" : "/chat-ai")
                      }
                      className="rounded-full border border-slate-300/90 bg-white/70 px-7 py-3 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white sm:text-base"
                    >
                      {s.secondaryCta}
                    </button>

                    {/* nhỏ nhưng nổi để mở BMI */}
                    <button
                      type="button"
                      onClick={() => setShowBMI(true)}
                      className="text-sm font-medium text-orange-700 underline decoration-orange-300 underline-offset-4 hover:text-orange-800"
                    >
                      Quick BMI check
                    </button>
                  </div>

                  {/* quick tips bar */}
                  <div className="mt-8 hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
                    {[
                      "Get Adequate Sleep",
                      "Include Rest Days",
                      "Focus on Form",
                      "Stay Consistent",
                    ].map((tip) => (
                      <div key={tip} className="flex items-center gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
                        {tip}
                      </div>
                    ))}
                  </div>

                  {/* stats row */}
                  <div className="soft-panel mt-7 grid max-w-md grid-cols-3 rounded-[28px] px-5 py-4 text-xs text-slate-600 sm:text-sm">
                    <div>
                      <div className="font-display text-base font-bold text-slate-900 sm:text-lg">
                        50+
                      </div>
                      <div>Certified PTs</div>
                    </div>
                    <div>
                      <div className="font-display text-base font-bold text-slate-900 sm:text-lg">
                        1.2k
                      </div>
                      <div>Active members</div>
                    </div>
                    <div>
                      <div className="font-display text-base font-bold text-slate-900 sm:text-lg">
                        92%
                      </div>
                      <div>See progress in 8 weeks</div>
                    </div>
                  </div>
                </div>

                {/* right image / card */}
                <div className="flex-1 flex justify-center md:justify-end w-full">
                  <div className="relative w-full max-w-[480px]">
                    <div className="absolute -right-6 -bottom-6 h-40 w-40 rounded-[32px] bg-gradient-to-br from-orange-200 to-amber-100" />
                    <img
                      src={s.image}
                      alt="Personal Trainer"
                      className="relative z-10 h-[320px] w-full rounded-[32px] border border-white/50 object-cover shadow-[0_34px_80px_rgba(15,23,42,0.26)] sm:h-[420px] lg:h-[480px]"
                    />

                    {/* small glass card */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl border border-white/60 bg-[rgba(255,252,248,0.9)] px-4 py-3 shadow-lg backdrop-blur-md">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
                        PT
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Today&apos;s focus</p>
                        <p className="text-sm font-semibold text-slate-900">
                          Strength & form
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

      {/* BMI Popup (nhỏ gọn, không full màn) */}
      {showBMI && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40">
          <div className="w-full overflow-hidden rounded-t-3xl bg-[rgba(255,251,245,0.96)] shadow-2xl sm:w-[420px] sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Quick BMI Check
              </h3>
              <button
                onClick={() => setShowBMI(false)}
                className="px-2 text-lg text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>
            <div className="p-4 max-h-[420px] overflow-y-auto">
              <BMIWidget />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
