// pages/VerifyEmail.jsx
import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "@/api/axiosClient";

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [state, setState] = useState('loading') // 'loading' | 'ok' | 'error'
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const calledRef = useRef(false) // chặn StrictMode gọi 2 lần

  useEffect(() => {
    if (!token || calledRef.current) return
    calledRef.current = true

    ;(async () => {
      try {
        const res = await axios.get(`/auth/register/confirm?token=${encodeURIComponent(token)}`)
        setState('ok')
        setMessage(res?.data?.message || 'Tạo tài khoản thành công!')
        setTimeout(() => navigate('/login'), 2000)
      } catch (e) {
        const msg = e?.response?.data?.message || 'Xác nhận thất bại'
        // Nếu backend trả "đã được tạo trước đó", vẫn coi là thành công
        if (/được tạo trước đó/i.test(msg) || /already/i.test(msg)) {
          setState('ok')
          setMessage('Tài khoản đã được xác nhận trước đó. Bạn có thể đăng nhập.')
          setTimeout(() => navigate('/login'), 2000)
          return
        }
        setState('error')
        setMessage(msg)
      }
    })()
  }, [token, navigate])

  if (!token) return <div className="p-6">Thiếu token</div>

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow p-6 max-w-md w-full text-center">
        {state === 'loading' && <p className="text-gray-700">Đang xác nhận...</p>}
        {state === 'ok' && <>
          <h1 className="text-2xl font-bold text-green-700 mb-2">Thành công</h1>
          <p className="text-gray-700 mb-4">{message}</p>
          <Link to="/login" className="text-[#0e2e2a] font-medium hover:underline">Đăng nhập</Link>
        </>}
        {state === 'error' && <>
          <h1 className="text-2xl font-bold text-red-700 mb-2">Thất bại</h1>
          <p className="text-gray-700 mb-4">{message}</p>
          <Link to="/register" className="text-[#0e2e2a] font-medium hover:underline">Thử lại đăng ký</Link>
        </>}
      </div>
    </div>
  )
}
