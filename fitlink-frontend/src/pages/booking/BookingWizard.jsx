// src/pages/booking/BookingWizard.jsx
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useBooking } from "@/contexts/BookingContext";
import { getPTDetailPublic } from "@/services/ptProfileService";
import { getPackagesByPTPublic } from "@/services/packageService";
import Stepper from "./Stepper";
import Step1SelectPackage from "./Step1SelectPackage";
import Step2Location from "./Step2Location";
import Step3Schedule from "./Step3Schedule";
import Step4StartDate from "./Step4StartDate";
import Step5Preview from "./Step5Preview";
import { useAuth } from "@/contexts/AuthProvider";
import { booking } from "@/services/bookingService";
import { toast } from "react-toastify";

const STEPS = ["Chọn gói", "Địa điểm dạy", "Lịch cố định", "Ngày bắt đầu", "Preview & Xác nhận"];

export default function BookingWizard() {
  const { id: ptId } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const { set, state } = useBooking();
  const { user } = useAuth();

  const packageId = sp.get("packageId");
  const [pt, setPt] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(packageId ? 1 : 0);

  const handleCheckout = async () => {
    try {
      await booking({
        student: user._id,
        pt: state?.ptId,
        package: state?.packageId,
        mode: state?.mode,
        pattern: state?.pattern,
        slot: state?.slot,
        startDate: state?.startDate,
        totalSessions: state?.package?.totalSessions || 9,
        sessionDurationMin: state?.package?.sessionDurationMin || 60,
        clientAddress: state?.clientAddress || null,
        ptGymAddress: state?.ptGymAddress || null,
        otherGymAddress: state?.otherGymAddress || null,
        travelPolicy: state?.travelPolicy,
        travelDistanceKm: state?.distanceKm,
        travelFee: state?.travelFee,
        inRange: state?.inRange,
        packageSnapshot: state?.packageSnapshot,
        pricing: { base: state?.packageSnapshot?.price, travel: null },
        amount: null,
        currency: "VND",
        status: "PENDING_PAYMENT",
      });
      toast.success("Đặt lịch thành công!");
    } catch {
      toast.error("Đặt lịch thất bại. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    (async () => {
      const [ptRes, pkRes] = await Promise.all([
        getPTDetailPublic(ptId),
        getPackagesByPTPublic(ptId),
      ]);

      const ptData = ptRes?.data?.data || ptRes?.data;
      const list = pkRes?.data?.data || pkRes?.data || [];

      setPt(ptData);
      setPackages(list);

      set({
        ptId,
        packageId: packageId || null,
        travelPolicy: {
          freeRadiusKm: 6,
          maxTravelKm: 10,
          feePerKm: 10000,
        },
      });

      setLoading(false);
    })();
  }, [ptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        Đang tải…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Đặt lịch PT</h1>
            <p className="text-sm text-neutral-400">
              Hoàn tất 5 bước đơn giản để bắt đầu tập luyện.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-300 hover:bg-red-600 hover:text-white transition"
          >
            ← Quay lại
          </button>
        </header>

        {/* Stepper */}
        <Stepper steps={STEPS} current={step} />

        {/* Main card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 backdrop-blur-md p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-black/20">
          {step === 0 && <Step1SelectPackage packages={packages} onNext={() => setStep(1)} />}
          {step === 1 && <Step2Location student={user} pt={pt} onBack={() => setStep(0)} onNext={() => setStep(2)} />}
          {step === 2 && <Step3Schedule pt={pt} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
          {step === 3 && <Step4StartDate onBack={() => setStep(2)} onNext={() => setStep(4)} />}
          {step === 4 && (
            <Step5Preview
              student={user}
              onBack={() => setStep(3)}
              onConfirm={handleCheckout}
            />
          )}
        </div>

      </div>
    </div>
  );
}
