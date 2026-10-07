// s@/components/student/PackageDetailModal.jsx
import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

const formatVND = (n) =>
  typeof n === "number"
    ? n.toLocaleString("vi-VN")
    : typeof n === "string" && !Number.isNaN(Number(n))
    ? Number(n).toLocaleString("vi-VN")
    : "-";

export default function PackageDetailModal({ pkg, onClose }) {
  const [agree, setAgree] = useState(true);
  const navigate = useNavigate();
  const { id: ptIdFromRoute } = useParams(); // /pt/:id

  // PT id có thể nằm trong route hoặc trong pkg.pt
  const ptId = pkg?.pt?._id || pkg?.ptId || pkg?.pt || ptIdFromRoute;

  const pricePerSession = useMemo(() => {
    if (!pkg?.price || !pkg?.totalSessions) return null;
    const raw = Number(pkg.price) / Number(pkg.totalSessions);
    if (!Number.isFinite(raw)) return null;
    return Math.round(raw); // làm tròn cho gọn
  }, [pkg?.price, pkg?.totalSessions]);

  const handleGoBooking = () => {
    if (!ptId) {
      console.error("Missing PT id for booking");
      return;
    }
    const search = new URLSearchParams();
    if (pkg?._id) search.set("packageId", pkg._id);

    navigate(`/booking/${ptId}?${search.toString()}`);
  };

  if (!pkg) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 px-6 pt-5 pb-4 border-b">
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-[0.12em] text-orange-500 uppercase">
              Training package
            </p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">
              {pkg.name}
            </h3>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-xs font-semibold tracking-[0.18em] text-gray-400 uppercase">
                Giá gói
              </div>
              <div className="text-2xl font-extrabold text-orange-500">
                {formatVND(pkg.price)}{" "}
                <span className="text-sm font-semibold text-orange-500 ml-1">
                  VND
                </span>
              </div>
              {pricePerSession && (
                <div className="mt-1 text-xs text-gray-500">
                  ~ {formatVND(pricePerSession)} VND / buổi
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body: 2 cột */}
        <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1.2fr] gap-5 px-6 py-5 max-h-[70vh] overflow-y-auto">
          {/* LEFT – mô tả */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900">
              Mô tả gói tập
            </h4>
            <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
              {pkg.description ? (
                <p className="whitespace-pre-line">{pkg.description}</p>
              ) : (
                <p className="text-gray-400">Chưa có mô tả chi tiết.</p>
              )}
            </div>

            {Array.isArray(pkg.tags) && pkg.tags.length > 0 && (
              <div>
                <div className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {pkg.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT – info + điều khoản */}
          <div className="space-y-4">
            {/* Thông tin chính */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500">Thời hạn</div>
                  <div className="mt-1 font-semibold text-gray-900">
                    {pkg.durationDays || pkg.duration || "-"} ngày
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Số buổi</div>
                  <div className="mt-1 font-semibold text-gray-900">
                    {pkg.totalSessions || "-"} buổi
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Hiển thị</div>
                  <div className="mt-1 font-semibold text-gray-900 capitalize">
                    {pkg.visibility || "public"}
                  </div>
                </div>
                {pkg.sessionDurationMin && (
                  <div>
                    <div className="text-xs text-gray-500">
                      Thời lượng mỗi buổi
                    </div>
                    <div className="mt-1 font-semibold text-gray-900">
                      {pkg.sessionDurationMin} phút
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                Tài liệu tập luyện, giáo án chi tiết chỉ được mở khóa sau khi
                bạn <span className="font-semibold">mua gói</span> và gói được
                kích hoạt thành công.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm">
              <div className="font-semibold text-gray-900 mb-1">
                 Hỗ Trợ
              </div>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">      
                <li>
                  Gói sẽ hỗ trợ tiền vào cửa nếu chọn mua gói tại phòng tập
                </li>              
              </ul>
            </div>

            {/* Điều khoản */}
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm">
              <div className="font-semibold text-gray-900 mb-1">
                Điều khoản thanh toán
              </div>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Thanh toán qua PayOS an toàn, bảo mật.</li>
                <li>
                  Không hoàn tiền sau khi kích hoạt gói, trừ trường hợp đặc
                  biệt theo chính sách.
                </li>
                <li>
                  Gói sẽ kích hoạt khi thanh toán thành công và có hiệu lực
                  trong {pkg.durationDays || pkg.duration || "-"} ngày.
                </li>
              </ul>
              <label className="mt-3 inline-flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span className="text-sm">
                  Tôi đã đọc và đồng ý với điều khoản trên.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
          >
            Đóng
          </button>
          <button
            onClick={handleGoBooking}
            disabled={!agree || !ptId}
            className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Mua gói ngay
          </button>
        </div>
      </div>
    </div>
  );
}
