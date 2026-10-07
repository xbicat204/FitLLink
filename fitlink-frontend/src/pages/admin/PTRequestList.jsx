// import React, { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { getAllPTRequests } from "@/services/adminPTRequestService'
// import { Loader2, ArrowLeft } from 'lucide-react'
// import SidebarAdmin from "@/components/SidebarAdmin'

// const StatusTag = ({ status }) => {
//   const color =
//     status === 'approved'
//       ? 'bg-green-600/30 border-green-500 text-green-400'
//       : status === 'rejected'
//       ? 'bg-red-600/30 border-red-500 text-red-400'
//       : 'bg-yellow-600/30 border-yellow-500 text-yellow-400'
//   return (
//     <span className={`px-2 py-1 border rounded text-xs font-semibold ${color}`}>
//       {status}
//     </span>
//   )
// }

// const PTRequestList = () => {
//   const [requests, setRequests] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const navigate = useNavigate()

//   useEffect(() => {
//     const fetchRequests = async () => {
//       try {
//         const res = await getAllPTRequests()
//         setRequests(res.data || [])
//       } catch (err) {
//         console.error(err)
//         setError('Không thể tải danh sách yêu cầu PT')
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchRequests()
//   }, [])

//   if (loading)
//     return (
//       <div className="flex min-h-screen bg-slate-900 text-white justify-center items-center">
//         <Loader2 className="animate-spin mr-2" /> Đang tải danh sách yêu cầu...
//       </div>
//     )

//   if (error)
//     return (
//       <div className="flex min-h-screen bg-slate-900 text-red-400 justify-center items-center">
//         {error}
//       </div>
//     )

//   return (
//     <div className="flex min-h-screen bg-slate-900 text-white">
//       <SidebarAdmin />

//       <div className="flex-1 p-8 space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => navigate('/admin')}
//               className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-300 px-3 py-2 rounded-md text-sm transition"
//             >
//               <ArrowLeft size={16} /> Quay lại
//             </button>
//             <h1 className="text-2xl font-bold text-orange-400">
//               PT Verification Requests
//             </h1>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-slate-800 border border-slate-700 rounded-xl shadow">
//           <div className="p-4 border-b border-slate-700 flex justify-between items-center">
//             <h2 className="text-lg font-semibold text-orange-400">
//               Danh sách yêu cầu duyệt hồ sơ PT
//             </h2>
//             <span className="text-sm text-gray-400">
//               {requests.length} results
//             </span>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm text-gray-200">
//               <thead className="bg-slate-700 text-gray-100">
//                 <tr>
//                   <th className="p-3 text-left">PT Name</th>
//                   <th className="p-3 text-left">Email</th>
//                   <th className="p-3 text-center">Trạng thái</th>
//                   <th className="p-3 text-center">Ngày gửi</th>
//                   <th className="p-3 text-center">Thao tác</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {requests.length > 0 ? (
//                   requests.map((req) => (
//                     <tr
//                       key={req._id}
//                       className="border-t border-slate-700 hover:bg-slate-700/60 transition"
//                     >
//                       <td className="p-3 font-medium text-gray-100">
//                         {req.user?.name || '—'}
//                       </td>
//                       <td className="p-3 text-gray-400">
//                         {req.user?.email || '—'}
//                       </td>
//                       <td className="p-3 text-center">
//                         <StatusTag status={req.status} />
//                       </td>
//                       <td className="p-3 text-center text-gray-400">
//                         {new Date(req.createdAt).toLocaleString('vi-VN')}
//                       </td>
//                       <td className="p-3 text-center">
//                         <button
//                           onClick={() =>
//                             navigate(`/admin/pt-requests/${req._id}`)
//                           }
//                           className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm transition"
//                         >
//                           Xem chi tiết
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="5" className="text-center py-6 text-gray-400">
//                       Không có yêu cầu nào.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default PTRequestList

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllPTRequests } from '@/services/adminPTRequestService'
import { Loader2 } from 'lucide-react'
import SidebarAdmin from '@/components/SidebarAdmin'

const StatusTag = ({ status }) => {
  const color =
    status === 'approved'
      ? 'bg-green-600/30 border-green-500 text-green-400'
      : status === 'rejected'
      ? 'bg-red-600/30 border-red-500 text-red-400'
      : 'bg-yellow-600/30 border-yellow-500 text-yellow-400'
  return (
    <span className={`px-2 py-1 border rounded text-xs font-semibold ${color}`}>
      {status}
    </span>
  )
}

const PTRequestList = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await getAllPTRequests()
        setRequests(res.data || [])
      } catch (err) {
        console.error(err)
        setError('Không thể tải danh sách yêu cầu PT')
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [])

  if (loading)
    return (
      <div className="flex min-h-screen bg-slate-900 text-white justify-center items-center">
        <Loader2 className="animate-spin mr-2" /> Đang tải danh sách yêu cầu...
      </div>
    )

  if (error)
    return (
      <div className="flex min-h-screen bg-slate-900 text-red-400 justify-center items-center">
        {error}
      </div>
    )

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <SidebarAdmin />

      <div className="flex-1 p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-orange-400">
            PT Verification Requests
          </h1>
          <span className="text-sm text-gray-400">
            {requests.length} results
          </span>
        </div>

        {/* Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-orange-400">
              Danh sách yêu cầu duyệt hồ sơ PT
            </h2>
            <span className="text-sm text-gray-400">
              {requests.length} kết quả
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-200">
              <thead className="bg-slate-700 text-gray-100">
                <tr>
                  <th className="p-3 text-left">PT Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-center">Trạng thái</th>
                  <th className="p-3 text-center">Ngày gửi</th>
                  <th className="p-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr
                      key={req._id}
                      className="border-t border-slate-700 hover:bg-slate-700/60 transition"
                    >
                      <td className="p-3 font-medium text-gray-100">
                        {req.user?.name || '—'}
                      </td>
                      <td className="p-3 text-gray-400">
                        {req.user?.email || '—'}
                      </td>
                      <td className="p-3 text-center">
                        <StatusTag status={req.status} />
                      </td>
                      <td className="p-3 text-center text-gray-400">
                        {new Date(req.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() =>
                            navigate(`/admin/pt-requests/${req._id}`)
                          }
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-md text-sm transition"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-400">
                      Không có yêu cầu nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PTRequestList
