
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MainLayout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[26rem] h-[360px] bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)]" />

      {/* Header cố định */}
      <header className="fixed top-0 left-0 z-50 w-full px-4 py-4 md:px-6">
        <Navbar />
      </header>

      {/* 👇 Đẩy nội dung xuống để tránh bị che */}
      <main className="relative z-10 flex-1 bg-transparent pt-24 md:pt-28">
        {children}
      </main>

      {/* Footer luôn ở dưới cùng */}
      <Footer />
    </div>
  );
}

