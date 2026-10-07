// components/PaymentButton.js (FINAL FIXED cho Giao dịch Nội bộ)

import React, { useState } from 'react';
import { initiatePayment } from '@/services/transactionService'; 
import { useNavigate } from 'react-router-dom'; 

function PaymentButton({ studentId, ptId, packageId, amount }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); 

    const handlePayment = async () => {
        setIsLoading(true);
        setError(null);

        const transactionData = {
            studentId,
            ptId,
            packageId,
            amount,
            isPaid: true 
        };

        try {
            const result = await initiatePayment(transactionData);
            
            const { status, transactionId } = result;

            console.log(`✅ Giao dịch ID: ${transactionId} đã hoàn tất nội bộ. Trạng thái: ${status}`);
            
            // Chuyển hướng nội bộ đến trang kết quả
            navigate(`/success?orderCode=${transactionId}&status=${status}`);

        } catch (err) {
            setError(err.message || "Lỗi không xác định khi tạo gói tập."); 
            console.error('🔴 Lỗi xử lý giao dịch nội bộ:', err);
            setIsLoading(false); 
        } 
    };

    return (
        <div>
            {error && <div style={{ color: 'red' }}>Lỗi: {error}</div>}
            
            <button 
                onClick={handlePayment} 
                disabled={isLoading}
                style={{ padding: '10px 20px', fontSize: '16px' }}
            >
                {isLoading ? 'Đang tạo gói tập...' : `Tạo & Kích hoạt gói ${amount.toLocaleString('vi-VN')} VNĐ`}
            </button>
        </div>
    );
}

export default PaymentButton;