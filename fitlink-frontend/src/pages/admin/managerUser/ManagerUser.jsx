import { useEffect, useState } from "react";
import axios from "@/api/axiosClient";
import SidebarAdmin from "@/components/SidebarAdmin";
import { useNavigate } from "react-router-dom";

const ManagerUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      alert("Lỗi tải danh sách người dùng");
    }
    setLoading(false);
  };

  const handleBlockToggle = async (userId, isActive) => {
    try {
      await axios.patch(`/admin/users/${userId}/${isActive ? "block" : "unlock"}`);
      fetchUsers();
    } catch (err) {
      alert("Lỗi cập nhật trạng thái người dùng");
    }
  };

  const handleDetail = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  return (
    <div className="flex min-h-screen bg-[#121212] text-gray-100">
      <SidebarAdmin />
      <main className="flex-1 p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <h2 className="text-3xl font-bold mb-8 text-center text-orange-500">
            Quản lý người dùng
          </h2>
          <div className="bg-[#1e1e1e] rounded-xl shadow-lg p-6 overflow-x-auto border border-gray-800">
            <h3 className="text-lg font-semibold mb-6 text-orange-400 text-center">
              Danh sách người dùng
            </h3>

            {loading ? (
              <div className="text-center text-gray-400">Đang tải...</div>
            ) : (
              <table className="min-w-full text-sm text-left border border-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-[#2b2b2b] text-orange-400">
                  <tr>
                    {["STT", "Tên", "SĐT", "Email", "Trạng thái", "Hành động"].map(
                      (h) => (
                        <th key={h} className="px-4 py-3 border border-gray-700 text-center">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr
                      key={user._id}
                      className="hover:bg-[#2c2c2c] transition-colors border-b border-gray-800"
                    >
                      <td className="px-3 py-2 text-center">{idx + 1}</td>
                      <td className="px-3 py-2">{user.name}</td>
                      <td className="px-3 py-2">{user.phone}</td>
                      <td className="px-3 py-2">{user.email}</td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.isActive
                              ? "bg-green-900/40 text-green-400"
                              : "bg-red-900/40 text-red-400"
                          }`}
                        >
                          {user.isActive ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="px-3 py-2 flex gap-2 justify-center">
                        <button
                          className="px-3 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium"
                          onClick={() => handleDetail(user._id)}
                        >
                          Chi tiết
                        </button>
                        <button
                          className={`px-3 py-1 rounded text-white text-xs font-medium ${
                            user.isActive
                              ? "bg-red-600 hover:bg-red-500"
                              : "bg-green-600 hover:bg-green-500"
                          }`}
                          onClick={() => handleBlockToggle(user._id, user.isActive)}
                        >
                          {user.isActive ? "Block" : "Unblock"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManagerUser;
