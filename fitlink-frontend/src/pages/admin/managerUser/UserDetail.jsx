import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "@/api/axiosClient";
import SidebarAdmin from "@/components/SidebarAdmin";

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/admin/users`);
      const found = res.data.find((u) => u._id === id);
      setUser(found || null);
    } catch (err) {
      setUser(null);
    }
    setLoading(false);
  };

  const handleBlockToggle = async () => {
    if (!user) return;
    setBlockLoading(true);
    try {
      await axios.patch(`/admin/users/${user._id}/${user.isActive ? "block" : "unlock"}`);
      fetchUser();
    } catch (err) {
      alert("Lỗi cập nhật trạng thái người dùng");
    }
    setBlockLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  if (loading)
    return (
      <div className="flex min-h-screen bg-[#121212] text-gray-200">
        <SidebarAdmin />
        <div className="flex-1 flex items-center justify-center text-orange-400">
          Đang tải...
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="flex min-h-screen bg-[#121212] text-gray-200">
        <SidebarAdmin />
        <div className="flex-1 flex items-center justify-center text-red-500">
          Không tìm thấy người dùng
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#121212] text-gray-200">
      <SidebarAdmin />
      <main className="flex-1 p-8 flex flex-col items-center">
        <div className="w-full max-w-3xl bg-[#1e1e1e] rounded-xl shadow-lg p-8 border border-gray-800">
          <button
            className="mb-4 text-orange-400 hover:underline flex items-center gap-1"
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </button>

          <h2 className="text-3xl font-bold mb-6 text-center text-orange-500">
            Chi tiết người dùng
          </h2>

          <div className="flex flex-col items-center mb-8">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-28 h-28 rounded-full object-cover mb-3 border-2 border-orange-500"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center mb-3 text-4xl">
                👤
              </div>
            )}
            <div className="text-xl font-semibold">{user.name}</div>
            <div className="text-gray-400">{user.phone}</div>
            <div className="text-gray-400">{user.email}</div>
          </div>

          <div className="space-y-2 mb-6">
            <div><b>Họ tên:</b> {user.name}</div>
            <div><b>SĐT:</b> {user.phone}</div>
            <div><b>Email:</b> {user.email}</div>
            <div><b>Giới tính:</b> {user.gender}</div>
            <div><b>Địa chỉ:</b> {user.address || "-"}</div>
            <div>
              <b>Trạng thái:</b>{" "}
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  user.isActive
                    ? "bg-green-900/40 text-green-400"
                    : "bg-red-900/40 text-red-400"
                }`}
              >
                {user.isActive ? "Đang hoạt động" : "Đã bị khóa"}
              </span>
            </div>
            <div>
              <b>Xác thực:</b>{" "}
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  user.verified
                    ? "bg-green-900/40 text-green-400"
                    : "bg-red-900/40 text-red-400"
                }`}
              >
                {user.verified ? "Đã xác thực" : "Chưa xác thực"}
              </span>
            </div>
            <div><b>Quyền:</b> {user.role}</div>
            <div><b>Ngày tạo:</b> {formatDate(user.createdAt)}</div>
            <div><b>Ngày cập nhật:</b> {formatDate(user.updatedAt)}</div>
          </div>

          {user.role !== "admin" && (
            <button
              className={`w-full py-2 rounded text-white font-semibold transition ${
                user.isActive
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-orange-600 hover:bg-orange-500"
              }`}
              onClick={handleBlockToggle}
              disabled={blockLoading}
            >
              {blockLoading
                ? "Đang xử lý..."
                : user.isActive
                ? "Block tài khoản"
                : "Mở khóa tài khoản"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDetail;
