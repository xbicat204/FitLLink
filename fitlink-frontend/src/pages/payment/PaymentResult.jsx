import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import { confirmPayment } from '@/services/paymentService'

export default function PaymentResult() {
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('checking')
  const orderCode = sp.get('orderCode')
  const payment = sp.get('payment')

  useEffect(() => {
    (async () => {
      if (!orderCode) { setStatus('invalid'); return }
      if (payment === 'success') {
        try {
          const res = await confirmPayment(orderCode)
          const s = res?.data?.status
          if (s === 'paid') setStatus('paid')
          else if (s === 'cancelled') setStatus('cancelled')
          else setStatus('pending')
        } catch {
          setStatus('error')
        }
      } else if (payment === 'cancelled') {
        setStatus('cancelled')
      } else {
        setStatus('invalid')
      }
    })()
  }, [orderCode, payment])

  return (
    <MainLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6">
        {status === 'checking' && <p>Đang xác nhận thanh toán…</p>}
        {status === 'paid' && (
          <>
            <h1 className="text-2xl font-bold text-green-600">Thanh toán thành công!</h1>
            <button
              onClick={() => navigate('/my-packages')}
              className="px-4 py-2 bg-orange-500 text-white rounded"
            >
              Xem gói của tôi
            </button>
          </>
        )}
        {status === 'pending' && <p>Thanh toán đang xử lý, vui lòng đợi…</p>}
        {status === 'cancelled' && <p className="text-red-600">Bạn đã hủy thanh toán.</p>}
        {status === 'invalid' && <p>Liên kết không hợp lệ.</p>}
        {status === 'error' && <p className="text-red-600">Có lỗi khi xác nhận thanh toán.</p>}
      </div>
    </MainLayout>
  )
}
