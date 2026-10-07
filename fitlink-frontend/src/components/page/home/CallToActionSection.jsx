// s@/components/home/CallToActionSection.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function CallToActionSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-400 to-red-500 text-white text-center rounded-t-3xl mt-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Sẵn sàng thay đổi vóc dáng của bạn?
        </h2>
        <p className="text-base md:text-lg opacity-90 mb-10 max-w-xl mx-auto">
          Đặt lịch với huấn luyện viên chỉ trong 1 phút – không ràng buộc, không
          phí ẩn.
        </p>

        <motion.div
          whileHover={{ scale: 1.08, boxShadow: "0 18px 40px rgba(0,0,0,0.25)" }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex"
        >
          <Link
            to="/programs"
            className="rounded-xl bg-white px-10 py-4 text-lg font-semibold text-orange-600 shadow-md"
          >
            Khám phá chương trình
          </Link>
        </motion.div>

        <motion.p
          className="mt-4 text-xs md:text-sm text-white/80"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.2 }}
        >
          Miễn phí tư vấn buổi đầu & đánh giá chỉ số cơ thể.
        </motion.p>
      </motion.div>
    </section>
  );
}
