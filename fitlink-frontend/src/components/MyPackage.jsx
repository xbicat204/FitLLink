import React, { useEffect, useState } from "react";
import myPackagesService from "@/services/myPackagesService";
import materialService from "@/services/materialService"; // ⭐ NEW
import Navbar from "@/components/Navbar";

export default function MyPackage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState(null);

  // ⭐ NEW — state cho tài liệu
  const [materials, setMaterials] = useState([]);
  const [showMaterials, setShowMaterials] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const pkgRes = await myPackagesService.getMyPackages();
        setPackages(pkgRes.data);
      } catch (err) {
        console.error("Lỗi lấy gói tập:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openDetail = (pkg) => setSelectedPkg(pkg);
  const closeDetail = () => setSelectedPkg(null);

  // ⭐ NEW — load tài liệu theo packageId
  async function loadMaterials() {
    try {
      const mats = await materialService.getMaterialsByPackage(
        selectedPkg.package?._id
      );
      setMaterials(mats);
      setShowMaterials(true);
    } catch (err) {
      console.error("Lỗi load tài liệu:", err);
    }
  }

  if (loading)
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* HEADER */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">My Packages</h1>

        <div className="rounded-xl border border-gray-200 shadow-lg bg-white overflow-hidden">
          {/* HEADER ROW */}
          <div className="grid grid-cols-6 font-semibold text-gray-700 bg-gray-50 py-3 px-6 border-b">
            <div>Name</div>
            <div className="text-center">Sessions</div>
            <div className="text-center">Duration</div>
            <div className="text-center">Expired</div>
            <div className="text-center">Status</div>
            <div className="text-right">Action</div>
          </div>

          {packages.map((pkg) => {
            const duration =
              pkg.startDate && pkg.endDate
                ? Math.ceil(
                    (new Date(pkg.endDate) - new Date(pkg.startDate)) /
                      (1000 * 60 * 60 * 24)
                  )
                : null;

            return (
              <div
                key={pkg._id}
                className="grid grid-cols-6 items-center py-4 px-6 border-b hover:bg-gray-50 transition"
              >
                <div className="text-gray-900">
                  {pkg.package?.name || "Unknown package"}
                </div>

                <div className="text-center text-gray-700">
                  {pkg.totalSessions} buổi
                </div>

                <div className="text-center text-gray-700">
                  {duration ? `${duration} ngày` : "-"}
                </div>

                <div className="text-center text-gray-700">
                  {pkg.endDate
                    ? new Date(pkg.endDate).toLocaleDateString()
                    : "-"}
                </div>

                <div className="text-center">
                  <span className="px-4 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full shadow-sm">
                    active
                  </span>
                </div>

                <div className="text-right flex gap-2 justify-end">
                  <button
                    onClick={() => openDetail(pkg)}
                    className="px-4 py-1 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    View
                  </button>

                  <button
                    onClick={() =>
                      (window.location.href = `/training-calendar`)
                    }
                    className="px-4 py-1 text-sm font-medium bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                  >
                    Lịch tập
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DETAILS */}
      {selectedPkg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-2xl animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Package Details
            </h2>

            <Detail label="Tên gói" value={selectedPkg.package?.name} />
            <Detail
              label="Số buổi"
              value={`${selectedPkg.totalSessions} buổi`}
            />
            <Detail
              label="Thời hạn"
              value={`${Math.ceil(
                (new Date(selectedPkg.endDate) -
                  new Date(selectedPkg.startDate)) /
                  (1000 * 60 * 60 * 24)
              )} ngày`}
            />
            <Detail
              label="Ngày hết hạn"
              value={new Date(selectedPkg.endDate).toLocaleDateString()}
            />
            <Detail label="PT" value={selectedPkg.pt?.name} />

            <div className="text-right mt-6 flex justify-end gap-3">
              {/* ⭐ NEW — nút xem tài liệu */}
              <button
                onClick={loadMaterials}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
              >
                Xem tài liệu
              </button>

              <button
                onClick={() => (window.location.href = "/training-calendar")}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold"
              >
                Xem lịch tập
              </button>

              <button
                onClick={closeDetail}
                className="px-5 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ NEW — MATERIAL MODAL */}
      {showMaterials && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-2xl animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4">Tài liệu đã chia sẻ</h2>

            {materials.length === 0 ? (
              <p className="text-gray-500">
                PT chưa chia sẻ tài liệu cho gói này.
              </p>
            ) : (
              <div className="space-y-3">
                {materials.map((mat) => (
                  <div key={mat._id} className="border p-3 rounded-lg">
                    <p className="font-semibold text-gray-800">{mat.title}</p>

                    {mat.url && (
                      <a
                        href={mat.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        Xem file
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="text-right mt-5">
              <button
                onClick={() => setShowMaterials(false)}
                className="px-5 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="mb-3">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}
