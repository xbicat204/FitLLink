import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaFilePdf, FaVideo, FaImage, FaFileAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import PTMainLayout from "@/layouts/pt/PTMainLayout";
import {
  getPackageById,
  updatePackage,
  softDeletePackage,
  hardDeletePackage,
} from "@/services/packageService";
import { PackageTagLabels } from "@/domain/enum";

// ===== UI helpers =====
function Badge({ tone = "neutral", children, className = "" }) {
  const map = {
    success: "bg-green-500/15 text-green-300 ring-1 ring-green-400/20",
    warning: "bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-400/20",
    info: "bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20",
    neutral: "bg-white/5 text-gray-300 ring-1 ring-white/10",
    danger: "bg-red-500/15 text-red-300 ring-1 ring-red-400/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${map[tone]} ${className}`}>
      {children}
    </span>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-300 ring-1 ring-white/10">
      {children}
    </span>
  );
}

function Section({ title, right, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-white/10 ${className}`} />;
}

// helper format weekday 0..6 -> Sun..Sat
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function formatRecurrenceHuman(rec) {
  const arr = rec?.daysOfWeek;
  if (!Array.isArray(arr) || arr.length === 0) return "—";
  return arr
    .map((group) => (Array.isArray(group) ? group.map((d) => WD[d] ?? d).join(",") : ""))
    .filter(Boolean)
    .join(" • ");
}

export default function PTPackageDetail() {
  const params = useParams();
  const idParam = params.id || params.packageId;
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await getPackageById(idParam);
        if (!mounted) return;
        setPkg(res?.data || null);
      } catch (e) {
        if (!mounted) return;
        const msg = e?.message?.includes("403")
          ? "Bạn không có quyền xem gói này."
          : "Không tải được dữ liệu gói.";
        // setErrorMsg(msg);
        toast.error(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [idParam]);

  // Confirm helper (dark theme-friendly)
  const fireConfirm = (opts) =>
    Swal.fire({
      background: "#0b0f17",
      color: "#e5e7eb",
      showCancelButton: true,
      reverseButtons: true,
      focusCancel: true,
      confirmButtonColor: "#f97316", // orange
      cancelButtonColor: "#4b5563",
      ...opts,
    });

  async function onToggleActive() {
    if (!pkg || saving) return;

    // If currently Active -> confirm before hiding (soft delete)
    if (pkg.isActive) {
      const res = await fireConfirm({
        title: "Set Hidden?",
        text: "Học viên sẽ không thể mua gói này nữa.",
        icon: "question",
        confirmButtonText: "Set Hidden",
        cancelButtonText: "Cancel",
      });
      if (!res.isConfirmed) return;
    }

    setSaving(true);
    const prev = pkg.isActive;
    setPkg((cur) => ({ ...cur, isActive: !prev })); // Optimistic

    try {
      if (prev) {
        await softDeletePackage(pkg._id); // Active -> Hidden
        toast.success("Gói đã được ẩn thành công.");
      } else {
        await updatePackage(pkg._id, { isActive: true }); // Hidden -> Active
        toast.success("Gói đã được mở thành công.");
      }
    } catch (err) {
      setPkg((cur) => ({ ...cur, isActive: prev })); // rollback
      const msg = err?.message || "Đổi trạng thái thất bại.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function onHardDelete() {
    if (!pkg || saving) return;

    const res = await fireConfirm({
      title: "Delete permanently?",
      text: "Hành động này không thể hoàn tác.",
      icon: "warning",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444", // red
    });
    if (!res.isConfirmed) return;

    setSaving(true);
    try {
      await hardDeletePackage(pkg._id);
      toast.success("Đã xóa gói vĩnh viễn.");
      navigate("/pt/packages");
    } catch (err) {
      //   toast.error(err?.message || "Xóa gói thất bại.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PTMainLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-56" />
          <Skeleton className="h-44" />
        </div>
      </PTMainLayout>
    );
  }

  if (errorMsg || !pkg) {
    return (
      <PTMainLayout>
        <Section title="Package">
          <div className="mb-4 text-sm text-red-300">{errorMsg || "Không tìm thấy gói."}</div>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs text-gray-300 hover:bg-white/10"
          >
            Quay lại
          </button>
        </Section>
      </PTMainLayout>
    );
  }

  // ===== Derived display =====
  const pricePerSession = (pkg.price || 0).toLocaleString() + "₫ / session";
  const sessionsInfo = `${pkg.totalSessions} × ${pkg.sessionDurationMin}’`;
  const durationInfo = `${pkg.durationDays} days`;
  const humanRecurrence = formatRecurrenceHuman(pkg.recurrence);

  const visibilityTone = pkg.visibility === "public" ? "info" : "neutral";
  const activeTone = pkg.isActive ? "success" : "neutral";

  const tags = Array.isArray(pkg.tags) ? pkg.tags : [];
  const tagItems = tags.map((k) => PackageTagLabels[k] || k);

  return (
    <PTMainLayout>
      {/* Header */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 text-xs text-gray-400">
            <Link to="/pt/packages" className="hover:underline">
              Packages
            </Link>
            <span className="mx-2 opacity-60">/</span>
            <span className="text-gray-300">Detail</span>
          </div>
          <h1 className="truncate text-2xl font-semibold text-white">{pkg.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={activeTone}>{pkg.isActive ? "Active" : "Hidden"}</Badge>
            <Badge tone={visibilityTone}>{pkg.visibility}</Badge>
            {tagItems.length > 0 && (
              <div className="ml-1 hidden gap-1 sm:flex">
                {tagItems.slice(0, 3).map((label, i) => (
                  <Chip key={`${label}-${i}`}>{label}</Chip>
                ))}
                {tagItems.length > 3 && <Chip>+{tagItems.length - 3}</Chip>}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/pt/packages/${pkg._id}/edit`}
            className="rounded-xl border border-white/10 bg-yellow-500/20 px-3 py-2 text-xs text-gray-300 hover:bg-yellow-100/25"
          >
            Edit
          </Link>

          <button
            onClick={onToggleActive}
            disabled={saving}
            className={`rounded-xl px-3 py-2 text-xs font-medium transition ${pkg.isActive
                ? "bg-green-500/20 text-green-200 hover:bg-green-500/25"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
              } border border-white/10`}
            title={pkg.isActive ? "Ẩn gói" : "Kích hoạt gói"}
          >
            {saving ? "Saving…" : pkg.isActive ? "Set Hidden" : "Set Active"}
          </button>

          {/* Hard delete with SweetAlert2 confirm */}
          <button
            onClick={onHardDelete}
            disabled={saving}
            className="rounded-xl border border-red-500/40 bg-red-500/20 px-3 py-2 text-xs text-red-300 hover:bg-red-500/25"
            title="Xóa vĩnh viễn gói (không thể hoàn tác)"
          >
            {saving ? "Deleting…" : "Delete permanently"}
          </button>

          <Link
            to="/pt/packages"
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/10"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-4">
          <div className="text-xs text-gray-400">Price</div>
          <div className="mt-1 text-lg font-semibold text-white">{pricePerSession}</div>
          <div className="mt-1 text-xs text-gray-500">Price per session</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-4">
          <div className="text-xs text-gray-400">Sessions</div>
          <div className="mt-1 text-lg font-semibold text-white">{sessionsInfo}</div>
          <div className="mt-1 text-xs text-gray-500">Total sessions × duration</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-4">
          <div className="text-xs text-gray-400">Duration</div>
          <div className="mt-1 text-lg font-semibold text-white">{durationInfo}</div>
          <div className="mt-1 text-xs text-gray-500">Package validity</div>
        </div>
      </div>

      {/* Description */}
      <Section title="Description">
        <div className="whitespace-pre-wrap text-sm text-gray-300">
          {pkg.description?.trim() ? pkg.description : "—"}
        </div>
      </Section>

      {/* Details */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Section
          title="Details"
          right={
            tagItems.length > 0 ? (
              <div className="hidden gap-1 sm:flex">
                {tagItems.map((label, i) => (
                  <Chip key={`${label}-${i}`}>{label}</Chip>
                ))}
              </div>
            ) : null
          }
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div className="text-sm">
              <div className="text-gray-400">Visibility</div>
              <div className="mt-1">
                <Badge tone={visibilityTone}>{pkg.visibility}</Badge>
              </div>
            </div>
            <div className="text-sm">
              <div className="text-gray-400">Status</div>
              <div className="mt-1">
                <Badge tone={activeTone}>{pkg.isActive ? "Active" : "Hidden"}</Badge>
              </div>
            </div>

            <div className="text-sm sm:col-span-2">
              <div className="text-gray-400">Recurrence</div>
              {Array.isArray(pkg.recurrence?.daysOfWeek) && pkg.recurrence.daysOfWeek.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {pkg.recurrence.daysOfWeek.map((group, gi) => (
                    <div key={gi} className="flex items-center gap-1">
                      {group.map((d) => (
                        <Chip key={`${gi}-${d}`}>{WD[d] ?? d}</Chip>
                      ))}
                      {gi < pkg.recurrence.daysOfWeek.length - 1 && (
                        <span className="px-1 text-xs text-gray-500">•</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-1 text-gray-300">—</div>
              )}
              <div className="mt-2 text-xs text-gray-500">{humanRecurrence}</div>
            </div>

            {pkg.supports ? (
              <div className="text-sm sm:col-span-2">
                <div className="text-gray-400">Supports</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {["atPtGym", "atClient", "atOtherGym"].map(
                    (k) =>
                      pkg.supports?.[k] && (
                        <Chip key={k}>
                          {k === "atPtGym" ? "@PT Gym" : k === "atClient" ? "@Client" : "@Other Gym"}
                        </Chip>
                      )
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </Section>

        <Section title="Materials">
          {Array.isArray(pkg.materials) && pkg.materials.length > 0 ? (
            <div className="divide-y divide-white/5">
              {pkg.materials.map((m, i) => (
                <div
                  key={m._id || i}
                  className="flex items-center justify-between py-3 text-sm text-gray-200"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      {m.type === "pdf" ? (
                        <FaFilePdf className="text-red-400" />
                      ) : m.type === "video" ? (
                        <FaVideo className="text-blue-400" />
                      ) : m.type === "image" ? (
                        <FaImage className="text-emerald-400" />
                      ) : (
                        <FaFileAlt className="text-gray-400" />
                      )}
                      <span className="font-medium text-white">
                        {m.title || m.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {m.type || "Document"} • Cập nhật:{" "}
                      {new Date(m.updatedAt || m.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  {m.url ? (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300 hover:bg-white/10"
                    >
                      Xem tài liệu
                    </a>
                  ) : (
                    <span className="text-xs text-gray-500 italic">
                      Không có link
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">No materials shared yet.</div>
          )}
        </Section>


      </div>

      {/* Meta */}
      <div className="mt-6 text-right text-xs text-gray-500">
        Created: {new Date(pkg.createdAt).toLocaleString()} • Updated:{" "}
        {new Date(pkg.updatedAt).toLocaleString()}
      </div>
    </PTMainLayout>
  );
}
