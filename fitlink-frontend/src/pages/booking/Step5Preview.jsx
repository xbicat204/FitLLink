// src/pages/booking/Step5Preview.jsx
import { useMemo, useState } from "react";
import axios from "@/api/axiosClient";
import { useBooking } from "@/contexts/BookingContext";
import { initStudentPackageCheckout, payTransaction } from "@/services/paymentService";

const slotLabel = (s) => (s ? `${s.start}–${s.end}` : "—");
const fmtVND = (n) => (typeof n === "number" ? n.toLocaleString("vi-VN") : "0");

export default function Step5Preview({ pt, student, onBack }) {
  const { state } = useBooking();
  const [showPreview, setShowPreview] = useState(false);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ===== Derive display fields =====
  const ptName = pt?.user?.name || pt?.name || state?.ptName || state?.ptId || "—";
  const studentName = student?.name || state?.studentName || "Bạn";

  const pkgName =
    state.package?.name || state.packageSnapshot?.name || state.packageId || "—";
  const totalSessions =
    state.package?.totalSessions || state.packageSnapshot?.totalSessions || 9;
  const sessionDurationMin =
    state.package?.sessionDurationMin || state.packageSnapshot?.sessionDurationMin || 60;
  const currency = state.packageSnapshot?.currency || state.currency || "VND";

  const addressFromState = (addr) =>
    addr?.address ||
    (addr?.location
      ? `[${addr.location?.lat ?? addr.location?.coordinates?.[1]}, ${
          addr.location?.lng ?? addr.location?.coordinates?.[0]
        }]`
      : null);

  const clientAddressText = addressFromState(state.clientAddress) || "—";
  const ptGymAddressText = addressFromState(state.ptGymAddress) || "—";
  const otherGymAddressText = addressFromState(state.otherGymAddress) || "—";

  // ===== Price estimate (FE-side) =====
  const basePrice = state.packageSnapshot?.price ?? state.package?.price ?? 0;
  const travelFee = state.travelFee ?? 0;
  const discount = 0;
  const tax = 0;
  const subtotal = basePrice + travelFee - discount;
  const total = subtotal + tax;

  // ===== Build preview schedule =====
  const preview = useMemo(() => {
    if (!state.pattern?.length || !state.slot || !state.startDate) return [];
    const arr = [];
    const total = totalSessions;
    let d = new Date(state.startDate + "T00:00:00");
    while (arr.length < total) {
      if (state.pattern.includes(d.getDay())) {
        const start = new Date(d);
        const [h1, m1] = state.slot.start.split(":").map(Number);
        start.setHours(h1, m1, 0, 0);
        const end = new Date(d);
        const [h2, m2] = state.slot.end.split(":").map(Number);
        end.setHours(h2, m2, 0, 0);
        arr.push({
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          label: slotLabel(state.slot),
        });
      }
      d.setDate(d.getDate() + 1);
    }
    return arr;
  }, [state.pattern, state.slot, state.startDate, totalSessions]);

  const patternText = (state.pattern || []).join(", ");
  const startDateText = state.startDate || "—";
  const distanceKmText =
    state.distanceKm != null ? `${state.distanceKm.toFixed(2)} km` : "—";
  const durationMinText =
    state.durationMin != null ? `${Math.round(state.durationMin)} phút` : "—";
  const modeText =
    state.mode === "atPtGym"
      ? "Tại gym PT"
      : state.mode === "atClient"
      ? "Tại nhà"
      : state.mode === "atOtherGym"
      ? "Tại gym khác"
      : "—";

  // ===== Validate + payload builder =====
  const canSubmit = !!(
    state?.ptId &&
    (state?.packageId || state?.package?._id) &&
    Array.isArray(state?.pattern) &&
    state.pattern.length &&
    state?.slot?.start &&
    state?.slot?.end &&
    state?.startDate &&
    state?.mode
  );

  const buildPayload = () => {
    const packageId = state.packageId || state?.package?._id;
    return {
      pt: state.ptId,
      package: packageId,
      pattern: state.pattern,
      slot: state.slot,
      startDate: state.startDate,
      mode: state.mode,
      clientAddress: state.clientAddress,
      otherGymAddress: state.otherGymAddress,
      ptGymAddress: state.ptGymAddress,
      travelPolicy: state.travelPolicy,
      travelDistanceKm: state.distanceKm,
      travelFee: state.travelFee,
      inRange: state.inRange,
      exceededByKm: state.exceededByKm,
      packageSnapshot: state.packageSnapshot,
      pricing: state.pricing || {
        base: basePrice,
        travel: travelFee,
        discount,
        tax,
        subtotal,
        total,
      },
      amount: total,
      currency: "VND",
      notes: state?.notes,
    };
  };

  const handlePay = async () => {
    setErr("");
    if (!canSubmit) {
      setErr("Thiếu thông tin bắt buộc. Vui lòng kiểm tra lại.");
      return;
    }
    setSubmitting(true);
    try {
      const initRes = await initStudentPackageCheckout(buildPayload());
      const { transactionId } = initRes?.data || {};
      if (!transactionId) throw new Error("Không tạo được giao dịch.");
      const payRes = await payTransaction(transactionId);
      const checkoutUrl = payRes?.data?.checkoutUrl;
      if (!checkoutUrl) throw new Error("Không lấy được link thanh toán.");
      window.location.href = checkoutUrl;
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e.message || "Có lỗi khi tạo thanh toán.");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-400 text-sm">Xác nhận thông tin đặt lịch</p>
          <h2 className="text-xl font-semibold text-white mt-1">{pkgName}</h2>
        </div>
        <div className="text-right text-sm text-neutral-300">
          <div>
            <span className="text-neutral-400">PT:&nbsp;</span>
            <b>{ptName}</b>
          </div>
          <div>
            <span className="text-neutral-400">Học viên:&nbsp;</span>
            <b>{studentName}</b>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm p-5 shadow-[0_8px_28px_rgba(0,0,0,0.45)]">
        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <div className="text-neutral-400 text-sm mb-1">Lịch học</div>
            <ul className="text-neutral-100 text-sm space-y-1">
              <li>Địa điểm: <b>{modeText}</b></li>
              <li>Pattern: <b>{patternText}</b></li>
              <li>Khung giờ: <b>{slotLabel(state.slot)}</b></li>
              <li>Ngày bắt đầu: <b>{startDateText}</b></li>
              <li>Số buổi: <b>{totalSessions}</b> • {sessionDurationMin}'/buổi</li>
            </ul>
          </div>

          <div>
            <div className="text-neutral-400 text-sm mb-1">Địa chỉ</div>
            <ul className="text-neutral-100 text-sm space-y-1">
              <li>Nhà học viên: <b>{clientAddressText}</b></li>
              <li>Gym PT: <b>{ptGymAddressText}</b></li>
              <li>Gym khác: <b>{otherGymAddressText}</b></li>
            </ul>
          </div>

          <div>
            <div className="text-neutral-400 text-sm mb-1">Di chuyển</div>
            <ul className="text-neutral-100 text-sm space-y-1">
              <li>Quãng đường: <b>{distanceKmText}</b></li>
              <li>Thời gian dự kiến: <b>{durationMinText}</b></li>
              {state.inRange === false && (
                <li className="text-amber-400">⚠ Ngoài phạm vi phục vụ</li>
              )}
            </ul>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-6 border-t border-neutral-800 pt-4">
          <div className="text-neutral-400 text-sm mb-2">Chi phí dự kiến</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="rounded-xl bg-neutral-800/60 p-3">
              <div className="text-neutral-400">Giá gói</div>
              <div className="text-white font-semibold">{fmtVND(basePrice)} {currency}</div>
            </div>
            <div className="rounded-xl bg-neutral-800/60 p-3">
              <div className="text-neutral-400">Phí di chuyển</div>
              <div className="text-white font-semibold">{fmtVND(travelFee)} {currency}</div>
            </div>
            <div className="rounded-xl bg-neutral-800/60 p-3">
              <div className="text-neutral-400">Giảm giá</div>
              <div className="text-white font-semibold">{fmtVND(discount)} {currency}</div>
            </div>
            <div className="rounded-xl bg-neutral-800/60 p-3">
              <div className="text-neutral-400">Tổng tạm tính</div>
              <div className="text-red-400 font-semibold">{fmtVND(total)} {currency}</div>
            </div>
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            * Đây là ước tính phía client. Tổng tiền sẽ được xác nhận ở bước thanh toán.
          </p>
        </div>
      </div>

      {/* Error */}
      {err && <div className="text-red-400 text-sm">{err}</div>}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition"
        >
          {showPreview
            ? "Ẩn lịch dự kiến"
            : `Xem lịch dự kiến (${preview.length || totalSessions} buổi)`}
        </button>

        <div className="flex gap-2">
          <button
            onClick={onBack}
            disabled={submitting}
            className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition"
          >
            Quay lại
          </button>
          <button
            onClick={handlePay}
            disabled={!canSubmit || submitting}
            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition shadow-[0_6px_18px_rgba(220,38,38,0.3)]"
          >
            {submitting ? "Đang chuyển đến cổng thanh toán..." : "Tiếp tục thanh toán"}
          </button>
        </div>
      </div>

      {/* Preview grid */}
      {showPreview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {preview.map((it, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
            >
              <div className="text-neutral-400 text-sm">
                #{idx + 1} •{" "}
                {new Date(it.startTime).toLocaleDateString("vi-VN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </div>
              <div className="text-lg font-semibold text-white mt-1">
                {it.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
