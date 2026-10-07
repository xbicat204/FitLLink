import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import MainLayout from "@/layouts/MainLayout";

const channels = [
  {
    title: "Hotline tư vấn nhanh",
    value: "1900 888 999",
    note: "Phản hồi trong giờ hành chính, ưu tiên đặt lịch và hỗ trợ booking.",
  },
  {
    title: "Email cho đội ngũ FitLink",
    value: "support@fitlink.vn",
    note: "Phù hợp khi bạn cần gửi mô tả chi tiết, file đính kèm, hoặc cần đội ngũ gọi lại.",
  },
  {
    title: "Kênh dành cho PT hợp tác",
    value: "partners@fitlink.vn",
    note: "Dành cho HLV cá nhân, gym studio, và đối tác muốn đưa gói tập lên FitLink.",
  },
];

const operations = [
  { label: "Hỗ trợ booking", time: "08:00 - 21:00" },
  { label: "Review hồ sơ PT mới", time: "Mon - Sat" },
  { label: "Phản hồi email", time: "< 24 giờ" },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    goal: "",
    message: "",
  });

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.error("Vui lòng nhập tên, số điện thoại và nội dung liên hệ.");
      return;
    }

    const subject = encodeURIComponent(`FitLink Contact | ${form.name}`);
    const body = encodeURIComponent(
      [
        `Họ tên: ${form.name}`,
        `Số điện thoại: ${form.phone}`,
        `Mục tiêu: ${form.goal || "Chưa ghi"}`,
        "",
        form.message,
      ].join("\n")
    );

    window.location.href = `mailto:support@fitlink.vn?subject=${subject}&body=${body}`;
    toast.success("Đã mở email để bạn gửi yêu cầu cho FitLink.");
  };

  return (
    <MainLayout>
      <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.28),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.22),_transparent_24%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#1f2937_100%)] px-6 py-20 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-300">
              Contact FitLink
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
              Liên hệ theo cách nhanh nhất để bắt đầu lộ trình tập luyện của bạn.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Trang này được thiết kế để giải quyết việc đặt lịch, tư vấn PT, hỗ trợ
              thanh toán, và hợp tác HLV. Không phải một bản sao của home, mà là một
              điểm vào rõ ràng cho những ai muốn hành động ngay.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {operations.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">
                    {item.label}
                  </p>
                  <p className="mt-3 text-2xl font-black text-white">{item.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/8 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="relative overflow-hidden rounded-[28px]">
              <img
                src="/poster2.jpg"
                alt="FitLink support"
                className="h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">
                  Command Desk
                </p>
                <p className="mt-3 max-w-sm text-2xl font-black text-white">
                  Đặt buổi tư vấn, chọn PT, và chốt cách đồng hành phù hợp ngay trong một lần liên hệ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf3] px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            {channels.map((channel) => (
              <article
                key={channel.title}
                className="rounded-[28px] border border-orange-100 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-500">
                  {channel.title}
                </p>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                  {channel.value}
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-600">{channel.note}</p>
              </article>
            ))}
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_90px_rgba(15,23,42,0.1)]">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
                Quick Request
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                Gửi yêu cầu để FitLink gọi lại cho bạn.
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Họ tên
                  </span>
                  <input
                    value={form.name}
                    onChange={(event) => onChange("name", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
                    placeholder="Nguyễn Văn A"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Số điện thoại
                  </span>
                  <input
                    value={form.phone}
                    onChange={(event) => onChange("phone", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
                    placeholder="0912 345 678"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Mục tiêu hiện tại
                </span>
                <input
                  value={form.goal}
                  onChange={(event) => onChange("goal", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
                  placeholder="Giảm mỡ, tăng cơ, cần PT online, cần đặt lịch gấp..."
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Nội dung liên hệ
                </span>
                <textarea
                  value={form.message}
                  onChange={(event) => onChange("message", event.target.value)}
                  rows={6}
                  className="w-full rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 outline-none transition focus:border-orange-400 focus:bg-white"
                  placeholder="Mô tả ngắn gọn vấn đề, mục tiêu hoặc loại PT bạn đang tìm."
                />
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Gửi yêu cầu qua email
                </button>
                <Link
                  to="/list-pt"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-6 py-4 text-sm font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  Xem danh sách PT trước
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
