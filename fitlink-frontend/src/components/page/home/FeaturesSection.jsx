// s@/components/home/FeaturesSection.jsx
export default function FeaturesSection() {
  const features = [
    {
      title: "PT đã được kiểm duyệt",
      desc: "Hồ sơ, phong cách dạy và mức độ uy tín được kiểm tra trước khi hiển thị.",
      stat: "50+",
    },
    {
      title: "Lộ trình theo đúng mục tiêu",
      desc: "Tăng cơ, giảm mỡ, body recomposition hoặc tập để duy trì sức khỏe.",
      stat: "1:1",
    },
    {
      title: "Theo dõi tiến độ rõ ràng",
      desc: "Buổi tập, lịch học, BMI và ghi chú được lưu xuyên suốt trong app.",
      stat: "24/7",
    },
    {
      title: "Tập linh hoạt online hoặc offline",
      desc: "Bạn có thể học tại gym PT, tại nhà hoặc chọn buổi coaching online.",
      stat: "3 modes",
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-500">
              Why FitLink
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
              Nền tảng kết nối mục tiêu tập luyện với PT phù hợp hơn.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600 md:text-base">
            Thay vì tự tìm và tự đoán, FitLink giúp bạn bắt đầu bằng một hệ thống rõ
            ràng: tìm PT, chọn gói, đặt lịch, chat và theo dõi tiến độ trong cùng một app.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-[28px] border border-orange-100 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_65%)] p-7 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
            >
              <div className="text-4xl font-black text-orange-500">{f.stat}</div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
