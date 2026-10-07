import React, { useEffect, useState, useMemo } from "react";
import axios from "@/api/axiosClient";
import { studentService } from "@/services/studentService";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();

      // 🔥 Auto-sort: Active trước, Banned sau
      const sorted = (data || []).sort((a, b) => {
        return Number(b.isActive) - Number(a.isActive);
      });

      setStudents(sorted);
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setShowModal(false);
  };

  const handleBanToggle = async () => {
    if (!selectedStudent) return;

    const isActive = selectedStudent.isActive;
    const action = isActive ? "block" : "unlock";

    if (
      !window.confirm(
        isActive
          ? "Are you sure you want to lock this student account?"
          : "Are you sure you want to unlock this student account?"
      )
    )
      return;

    try {
      await axios.patch(`/admin/users/${selectedStudent._id}/${action}`);

      await fetchStudents();

      alert(
        isActive
          ? "Student account has been locked."
          : "Student account has been unlocked."
      );

      closeModal();
    } catch (err) {
      alert("Operation failed.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(students.length / pageSize));
  const pageRows = useMemo(
    () => students.slice((page - 1) * pageSize, page * pageSize),
    [students, page]
  );

  return (
    <div className="bg-[#0f172a] text-white min-h-screen p-6 -mt-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Student List</h1>
        <p className="text-gray-400">{students.length} results</p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          <p>No students found.</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg overflow-hidden shadow-md">
          <table className="w-full text-sm text-gray-300">
            <thead className="bg-slate-700 text-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Gender</th>
                <th className="px-6 py-3 text-left">Goals</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((s, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-700 hover:bg-slate-700/40"
                >
                  <td className="px-6 py-3 flex items-center space-x-3">
                    <img
                      src={s.avatar || "/default-avatar.png"}
                      alt={s.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-medium">{s.name || "—"}</span>
                  </td>
                  <td className="px-6 py-3">{s.email || "—"}</td>
                  <td className="px-6 py-3 capitalize">{s.gender || "—"}</td>
                  <td className="px-6 py-3">
                    {s.goals?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {s.goals.map((g, i) => (
                          <span
                            key={i}
                            className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`${
                        s.isActive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {s.isActive ? "Active" : "Banned"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => openModal(s)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2 p-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border border-slate-600 bg-slate-700 text-gray-100 hover:bg-slate-600 disabled:opacity-50 rounded-md px-3 py-1"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400">
              Page {page}/{totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="border border-slate-600 bg-slate-700 text-gray-100 hover:bg-slate-600 disabled:opacity-50 rounded-md px-3 py-1"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 w-[750px] rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-600 p-5">
              <h2 className="text-xl font-semibold text-white">
                Student Details
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 text-gray-200 space-y-5">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={selectedStudent.avatar || "/default-avatar.png"}
                  alt={selectedStudent.name}
                  className="w-20 h-20 rounded-full border border-gray-500 object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedStudent.name || "—"}
                  </h3>
                  <p>ID: {selectedStudent._id}</p>
                  <p>Email: {selectedStudent.email || "—"}</p>
                  <p>Phone: {selectedStudent.phone || "—"}</p>
                  <p>Gender: {selectedStudent.gender || "—"}</p>
                  {selectedStudent.dob && (
                    <p>
                      DOB:{" "}
                      {new Date(selectedStudent.dob).toLocaleDateString("en-GB")}
                    </p>
                  )}
                  <p>
                    Status:{" "}
                    <span
                      className={
                        selectedStudent.isActive
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {selectedStudent.isActive ? "Active" : "Locked"}
                    </span>
                  </p>
                  <p>Role: {selectedStudent.role}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p>
                  <strong>Height:</strong> {selectedStudent.heightCm || "—"} cm
                </p>
                <p>
                  <strong>Weight:</strong> {selectedStudent.weightKg || "—"} kg
                </p>
                <p>
                  <strong>BMI:</strong>{" "}
                  {selectedStudent.bmi?.toFixed(1) || "—"}
                </p>
              </div>

              <div>
                <p className="font-semibold mt-3">🎯 Training Goals:</p>
                {selectedStudent.goals?.length ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedStudent.goals.map((g, i) => (
                      <span
                        key={i}
                        className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-sm"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>Not set.</p>
                )}
              </div>

              {selectedStudent.home && (
                <div>
                  <p className="font-semibold mt-3">🏠 Home:</p>
                  {selectedStudent.home.address ? (
                    <p>Address: {selectedStudent.home.address}</p>
                  ) : (
                    <p>Address not updated.</p>
                  )}
                  {selectedStudent.home.location?.coordinates?.length ? (
                    <p>
                      Coordinates:{" "}
                      {selectedStudent.home.location.coordinates.join(", ")}
                    </p>
                  ) : null}
                </div>
              )}

              <div>
                <p className="font-semibold mt-3">📍 Default Location:</p>
                {selectedStudent.defaultLocation ? (
                  <div>
                    <p>
                      Coordinates:{" "}
                      {selectedStudent.defaultLocation.coordinates.join(", ")}
                    </p>
                    {selectedStudent.defaultLocation.address && (
                      <p>Address: {selectedStudent.defaultLocation.address}</p>
                    )}
                  </div>
                ) : (
                  <p>Not set.</p>
                )}
              </div>

              <div>
                <p className="font-semibold mt-3">🕒 System Info:</p>
                <p>
                  Created:{" "}
                  {new Date(selectedStudent.createdAt).toLocaleString("en-GB")}
                </p>
                <p>
                  Updated:{" "}
                  {new Date(selectedStudent.updatedAt).toLocaleString("en-GB")}
                </p>
              </div>
            </div>

            {/* Footer + Ban / Unban */}
            <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={handleBanToggle}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  selectedStudent.isActive
                    ? "bg-red-600 hover:bg-red-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                {selectedStudent.isActive ? "Ban (Lock)" : "Unban (Unlock)"}
              </button>

              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
