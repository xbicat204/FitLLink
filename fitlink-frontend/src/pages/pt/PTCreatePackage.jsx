// src/pages/pt/PTCreatePackage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PTMainLayout from "@/layouts/pt/PTMainLayout";
import { createPackage } from "@/services/packageService";
import { previewScheduleDraft } from "@/services/scheduleService";
import PackageSchedulePreview from "@/components/pt/PackageSchedulePreview";

// 👇 NEW: import enum (điều chỉnh path theo project của bạn)
import { PackageTags, PackageTagLabels } from "@/domain/enum";

// Quy ước 0..6: 0=CN, 1=T2 … 6=T7
const DOW0 = { 1: "T2", 2: "T3", 3: "T4", 4: "T5", 5: "T6", 6: "T7", 0: "CN" };
// Thứ tự hiển thị nút: Thứ 2 → CN (Mon-first)
const UI_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

// 👇 NEW: helper cho tags
const TAG_VALUES = Object.values(PackageTags);
const TAG_ITEMS = TAG_VALUES.map((v) => ({
  value: v,
  label: PackageTagLabels?.[v] || v,
}));

function PatternEditor({ value, onChange, index, onRemove }) {
  const toggleDay = (day) => {
    const set = new Set(value);
    if (set.has(day)) set.delete(day);
    else set.add(day);
    // sort theo Mon-first để UI ổn định (chỉ ảnh hưởng hiển thị)
    const orderIdx = (d) => UI_DAY_ORDER.indexOf(d);
    const next = Array.from(set).sort((a, b) => orderIdx(a) - orderIdx(b));
    onChange(next);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-white">Pattern #{index + 1}</div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md border border-red-400/30 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
        >
          Remove
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {UI_DAY_ORDER.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => toggleDay(d)}
            className={`rounded-full px-3 py-1 text-xs ${
              value.includes(d)
                ? "bg-orange-500 text-white"
                : "border border-white/10 text-gray-300 hover:bg-white/10"
            }`}
            title={`dayOfWeek=${d}`}
          >
            {DOW0[d]}
          </button>
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-400">
        Selected:{" "}
        <span className="text-gray-200">
          {value.length ? `${value.join(", ")} (${value.map((d) => DOW0[d]).join(", ")})` : "—"}
        </span>{" "}
        <span className="text-gray-500">(0=CN, 1=T2 … 6=T7)</span>
      </div>
    </div>
  );
}

export default function PTCreatePackage() {
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    totalSessions: 9,
    sessionDurationMin: 60,
    durationDays: 30,
    isActive: true,
    visibility: "private", // 'private' | 'public'
    supports: {
      atPtGym: true,
      atClient: false,
      atOtherGym: false,
    },
    travelPricing: {
      enabled: false,
      freeRadiusKm: 6,
      maxTravelKm: 20,
      feePerKm: 10000,
    },
    // Mỗi pattern là mảng số 0..6 (0=CN, 1=T2 … 6=T7)
    recurrence: {
      // ví dụ mặc định: T2-4-6 và T3-5-7
      daysOfWeek: [
        [1, 3, 5],
        [2, 4, 6],
      ],
    },
    // 👇 NEW: dùng enum, mảng rỗng ban đầu
    tags: [],
  });

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const isFormValid =
    form.name.trim().length >= 3 &&
    form.totalSessions > 0 &&
    form.sessionDurationMin > 0 &&
    (form.recurrence?.daysOfWeek?.length || 0) > 0;

  // Clean patterns 0..6
  const cleanedPatterns = (form.recurrence?.daysOfWeek || [])
    .map((p) =>
      Array.from(
        new Set(
          (p || [])
            .map(Number)
            .filter((d) => d >= 0 && d <= 6)
        )
      ).sort((a, b) => a - b)
    )
    .filter((p) => p.length > 0);

  const handlePreview = async () => {
    setLoadingPreview(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);

      const res = await previewScheduleDraft({
        startDate,
        draft: {
          totalSessions: Number(form.totalSessions),
          sessionDurationMin: Number(form.sessionDurationMin),
          supports: form.supports,
          recurrence: { daysOfWeek: cleanedPatterns }, // 0..6
        },
        carryForward: true, // bật (default đã là true)
        spreadWeekly: false, // hoặc true nếu muốn rải đều nhiều tuần
      });

      setPreviewData(res?.slots || []);
      setShowPreview(true);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Preview failed");
    } finally {
      setLoadingPreview(false);
    }
  };

  const addPattern = () => {
    setForm((prev) => ({
      ...prev,
      recurrence: {
        // thêm mặc định T2-4-6 theo chuẩn 0..6
        daysOfWeek: [...(prev.recurrence?.daysOfWeek || []), [1, 3, 5]],
      },
    }));
  };

  const updatePattern = (idx, arr) => {
    setForm((prev) => {
      const next = [...(prev.recurrence?.daysOfWeek || [])];
      next[idx] = arr;
      return { ...prev, recurrence: { daysOfWeek: next } };
    });
  };

  const removePattern = (idx) => {
    setForm((prev) => {
      const next = [...(prev.recurrence?.daysOfWeek || [])];
      next.splice(idx, 1);
      return { ...prev, recurrence: { daysOfWeek: next } };
    });
  };

  // 👇 NEW: toggle cho checkbox tags
  const toggleTag = (value) => {
    setForm((s) => {
      const set = new Set(s.tags || []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      // đảm bảo chỉ giữ giá trị hợp lệ theo enum
      const cleaned = Array.from(set).filter((v) => TAG_VALUES.includes(v));
      return { ...s, tags: cleaned };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setApiError("");

    // Lọc & sort pattern trước khi gửi (chuẩn 0..6, sort tăng dần để khớp BE)
    const cleanedPatterns = (form.recurrence?.daysOfWeek || [])
      .map((pat) =>
        Array.from(
          new Set((pat || []).map(Number).filter((d) => d >= 0 && d <= 6))
        ).sort((a, b) => a - b)
      )
      .filter((pat) => pat.length > 0);

    // 👇 NEW: lọc tag theo enum trước khi gửi
    const cleanedTags = (form.tags || []).filter((v) => TAG_VALUES.includes(v));

    const payload = {
      name: form.name?.trim(),
      description: form.description?.trim(),
      price: Number(form.price) || 0,
      totalSessions: Number(form.totalSessions) || 1,
      sessionDurationMin: Number(form.sessionDurationMin) || 15,
      durationDays: Number(form.durationDays) || 1,
      isActive: !!form.isActive,
      visibility: form.visibility,
      supports: form.supports,
      travelPricing: form.travelPricing,
      recurrence: {
        daysOfWeek: cleanedPatterns.length ? cleanedPatterns : [[1, 3, 5]],
      },
      tags: cleanedTags, // 👈 enum values
    };

    try {
      await createPackage(payload);
      navigate("/pt/packages");
    } catch (err) {
      console.error(err);
      setApiError(err?.response?.data?.message || "Create package failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PTMainLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Create Package</h1>
        <div className="flex items-center gap-2">
          <Link
            to="/pt/packages"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10"
          >
            Back
          </Link>
        </div>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-4">
        {/* top info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Name</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
              minLength={3}
              maxLength={80}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-400">Price (VND)</label>
            <input
              type="number"
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
              value={form.price}
              onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) }))}
              min={0}
              step={1000}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-400">Total sessions</label>
            <input
              type="number"
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
              value={form.totalSessions}
              onChange={(e) => setForm((s) => ({ ...s, totalSessions: Number(e.target.value) }))}
              min={1}
              max={500}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-400">Session duration (min)</label>
            <input
              type="number"
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
              value={form.sessionDurationMin}
              onChange={(e) =>
                setForm((s) => ({ ...s, sessionDurationMin: Number(e.target.value) }))
              }
              min={15}
              max={300}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-400">Package duration (days)</label>
            <input
              type="number"
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
              value={form.durationDays}
              onChange={(e) => setForm((s) => ({ ...s, durationDays: Number(e.target.value) }))}
              min={1}
              max={3650}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-400">Visibility</label>
            <select
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
              value={form.visibility}
              onChange={(e) => setForm((s) => ({ ...s, visibility: e.target.value }))}
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>

        {/* supports */}
        <div className="mt-4">
          <div className="mb-2 text-sm font-medium text-white">Supports</div>
          <div className="flex flex-wrap gap-3">
            {[
              ["atPtGym", "At PT Gym"],
              ["atClient", "At Client"],
              ["atOtherGym", "At Other Gym"],
            ].map(([k, label]) => (
              <label key={k} className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-orange-500"
                  checked={!!form.supports[k]}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, supports: { ...s.supports, [k]: e.target.checked } }))
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* recurrence patterns */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-white">Recurrence patterns</div>
            <button
              type="button"
              onClick={addPattern}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10"
            >
              + Add pattern
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(form.recurrence?.daysOfWeek || []).map((pat, idx) => (
              <PatternEditor
                key={idx}
                index={idx}
                value={pat}
                onChange={(arr) => updatePattern(idx, arr)}
                onRemove={() => removePattern(idx)}
              />
            ))}
          </div>

          <div className="mt-2 text-xs text-gray-400">
            * Mỗi pattern là một combo (ví dụ <b>[1,3,5]</b> hoặc <b>[2,4,6]</b>). Tất cả pattern dùng
            chung <b>totalSessions</b> của package. (Quy ước: <b>0=CN, 1=T2 … 6=T7</b>)
          </div>
        </div>

        {/* isActive + tags (enum) */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              className="h-4 w-4 accent-orange-500"
              checked={!!form.isActive}
              onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
            />
            Active
          </label>

          {/* 👇 NEW: Tags enum (checkbox group) */}
          <div>
            <div className="mb-1 block text-xs text-gray-400">Tags</div>
            <div className="flex flex-wrap gap-2">
              {TAG_ITEMS.map((t) => {
                const checked = (form.tags || []).includes(t.value);
                return (
                  <label
                    key={t.value}
                    className={`cursor-pointer rounded-full px-3 py-1 text-xs border ${
                      checked
                        ? "bg-orange-500 text-white border-orange-500"
                        : "border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleTag(t.value)}
                    />
                    {t.label}
                  </label>
                );
              })}
            </div>

            {/* tiện ích nhỏ */}
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setForm((s) => ({ ...s, tags: TAG_VALUES.slice(0, 3) }))} // ví dụ chọn nhanh 3 tag đầu
                className="rounded-md border border-white/10 px-2 py-1 text-xs text-gray-300 hover:bg-white/10"
              >
                Quick pick
              </button>
              <button
                type="button"
                onClick={() => setForm((s) => ({ ...s, tags: [] }))}
                className="rounded-md border border-white/10 px-2 py-1 text-xs text-gray-300 hover:bg-white/10"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs text-gray-400">Description</label>
          <textarea
            className="min-h-[90px] w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            maxLength={1000}
          />
        </div>

        {apiError && (
          <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {apiError}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          {isFormValid && (
            <button
              type="button"
              onClick={handlePreview}
              disabled={loadingPreview}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/10 disabled:opacity-60"
            >
              {loadingPreview ? "Loading…" : "Review"}
            </button>
          )}

          <Link
            to="/pt/packages"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>

      {showPreview && (
        <PackageSchedulePreview
          open={showPreview}
          onClose={() => setShowPreview(false)}
          slots={previewData}
          startDate={new Date().toISOString().slice(0, 10)}
        />
      )}
    </PTMainLayout>
  );
}
