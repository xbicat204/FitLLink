// pages/SuccessPage.jsx (FIXED)

import React, { useState, useEffect } from 'react';
import axiosClient from "@/api/axiosClient"; // Sử dụng axiosClient cho truy vấn giao dịch
import { useLocation, Link, useNavigate } from 'react-router-dom'; 

function SuccessPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    
    // Lấy orderCode (Transaction ID) và status từ PaymentButton.js
    const orderCode = queryParams.get('orderCode'); 
    const initialStatus = queryParams.get('status'); // Lấy trạng thái ban đầu

    const [finalStatusText, setFinalStatusText] = useState('Đang kiểm tra trạng thái giao dịch...');
    const [isPaid, setIsPaid] = useState(false);
    
    useEffect(() => {
        if (!orderCode) {
            setFinalStatusText('Lỗi: Không tìm thấy mã đơn hàng. Giao dịch không xác định.');
            return;
        }

        async function verifyTransaction() {
            try {
                // Gọi GE@/api/transactions/:id để xác nhận trạng thái cuối cùng từ Backend
                // Dù là giao dịch nội bộ, việc kiểm tra lại là cần thiết.
                const response = await axiosClient.get(`/transactions/${orderCode}`);
                const transaction = response.data;

                if (transaction.status === 'paid') {
                    setFinalStatusText('Thanh toán thành công! Gói tập đã được kích hoạt.');
                    setIsPaid(true);
                } else {
                    // Đối với giao dịch nội bộ, nếu không phải 'paid' thì coi như thất bại/lỗi
                    setFinalStatusText(`Giao dịch thất bại. Trạng thái: ${transaction.status}`);
                    setIsPaid(false);
                }

            } catch (error) {
                setFinalStatusText('Lỗi truy vấn trạng thái giao dịch. Vui lòng kiểm tra lịch sử mua hàng.');
            }
        }

        verifyTransaction();
    }, [orderCode]);

    const statusStyle = isPaid ? { color: 'green' } : { color: 'red' };

    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '50px auto', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
            <h1>KẾT QUẢ GIAO DỊCH</h1>
            
            <p style={{ fontSize: '1.4em', fontWeight: 'bold', ...statusStyle }}>{finalStatusText}</p>
            
            <p>Mã Giao Dịch: <strong>{orderCode}</strong></p>
            <p>Trạng thái khởi tạo: <em>{initialStatus}</em></p>

            {isPaid && (
                <div style={{ marginTop: '30px' }}>
                    {/* <Link to="/" }> */}
                        <button onClick={()=> navigate('/training-calendar')} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', textDecoration: 'none' }}>
                            Back Home
                        </button>
                    {/* </Link> */}
                </div>
            )}
             {!isPaid && (
                 <div style={{ marginTop: '30px' }}>
                     <p>Nếu bạn tin rằng đây là lỗi, vui lòng liên hệ hỗ trợ.</p>
                     <Link to="/pricing">
                        <button>Quay lại trang mua gói</button>
                     </Link>
                 </div>
            )}
        </div>
    );
}

export default SuccessPage;