import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllPTProfilesPublic } from '@/services/ptProfileService'
import { getPackagesByPTPublic } from '@/services/packageService'
import MainLayout from '@/layouts/MainLayout'
import { FaSearch } from 'react-icons/fa'

const PTList = () => {
  const [ptList, setPtList] = useState([])
  const [packagesByPT, setPackagesByPT] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // 🔹 Lấy danh sách PT
  const fetchAllPTs = async () => {
    try {
      const res = await getAllPTProfilesPublic()
      if (res && res.success && Array.isArray(res.data)) {
        setPtList(res.data)
      } else {
        setError('Không thể tải danh sách huấn luyện viên.')
      }
    } catch (err) {
      console.error('❌ Lỗi khi gọi API:', err)
      setError('Lỗi khi tải danh sách PT.')
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Lấy gói tập của từng PT
  const fetchPackagesForAllPTs = async (ptProfiles) => {
    const packageMap = {}
    await Promise.all(
      ptProfiles.map(async (pt) => {
        try {
          const res = await getPackagesByPTPublic(pt.user?._id)
          packageMap[pt.user._id] =
            res?.success && Array.isArray(res.data) ? res.data : []
        } catch {
          packageMap[pt.user._id] = []
        }
      })
    )
    setPackagesByPT(packageMap)
  }

  useEffect(() => {
    const init = async () => await fetchAllPTs()
    init()
  }, [])

  useEffect(() => {
    if (ptList.length > 0) fetchPackagesForAllPTs(ptList)
  }, [ptList])

  if (loading)
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </MainLayout>
    )

  if (error)
    return (
      <MainLayout>
        <p className="text-center text-red-500 font-medium mt-10">{error}</p>
      </MainLayout>
    )

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-12 pt-[80px]">
        {/* 🔹 Thanh tìm kiếm bên trái + Tiêu đề giữa */}
        <div className="relative flex items-center justify-center mb-10">
          {/* Ô tìm kiếm (có icon bên trong) */}
          <div className="absolute left-0 flex items-center">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Tìm kiếm huấn luyện viên..."
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-full text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 w-48 sm:w-56 transition"
              />
            </div>
          </div>

          {/* Tiêu đề ở giữa */}
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Danh sách Huấn luyện viên cá nhân
          </h1>
        </div>

        {/* 🔹 Danh sách PT */}
        {ptList.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            Chưa có huấn luyện viên nào.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {ptList.map((pt) => {
              const allowedTypes = [
                'Rehab',
                'Fat loss',
                'Posture correction',
                'Mobility'
              ]
              const types =
                pt.specialties?.filter((s) => allowedTypes.includes(s)) || []
              const ptPackages = packagesByPT[pt.user?._id] || []

              return (
                <div
                  key={pt._id}
                  className="cursor-pointer bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transform transition duration-300"
                  onClick={() => navigate(`/trainer/${pt.user?._id}`)}
                >
                  {/* Ảnh đại diện */}
                  <div className="relative w-full h-56">
                    <img
                      src={pt.user?.avatar || '/default-avatar.png'}
                      alt={pt.user?.name}
                      className="w-full h-full object-cover"
                    />
                    {pt.verified && (
                      <span className="absolute top-3 right-3 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Nội dung */}
                  <div className="p-5 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {pt.user?.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">
                      Kinh nghiệm: {pt.yearsExperience || 0} năm
                    </p>
                    <p className="text-orange-600 text-sm font-medium mb-3">
                      {types.length
                        ? types.join(', ')
                        : 'Chưa cập nhật loại PT'}
                    </p>

                    {/* Gói tập nổi bật */}
                    {ptPackages.length > 0 ? (
                      <div className="bg-gray-50 rounded-lg p-3 text-left border border-gray-100">
                        <p className="text-gray-700 text-sm font-semibold mb-2">
                          🔹 Gói tập nổi bật:
                        </p>
                        {ptPackages.slice(0, 2).map((pkg) => (
                          <div
                            key={pkg._id}
                            className="bg-white rounded-md shadow-sm border border-gray-200 px-3 py-2 mb-2 hover:shadow-md transition"
                          >
                            <p className="font-semibold text-gray-800 text-sm">
                              {pkg.name}
                            </p>
                            <p className="text-gray-600 text-xs line-clamp-1">
                              {pkg.description}
                            </p>
                            <div className="flex justify-between mt-1 text-xs text-gray-500">
                              <span>💰 {pkg.price?.toLocaleString()} VND</span>
                              <span>⏱ {pkg.duration} ngày</span>
                            </div>
                          </div>
                        ))}
                        {ptPackages.length > 2 && (
                          <p className="text-xs text-gray-500 italic">
                            + {ptPackages.length - 2} gói khác...
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm italic mb-3">
                        Chưa có gói tập
                      </p>
                    )}

                    {/* Nút hành động */}
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/trainer/${pt.user?._id}`)
                        }}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-2 rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-amber-700 transition"
                      >
                        Xem chi tiết
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/chat/${pt.user?._id}`)
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold transition"
                      >
                        💬 Nhắn tin
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default PTList
