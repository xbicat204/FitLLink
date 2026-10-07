// s@/components/PackageViewer.jsx

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axiosClient from '@/api/axiosClient'; // Dùng đường dẫn phù hợp với cấu trúc của bạn
import PackageDetailModal from './PackageDetailModal'; // Import Modal

// Component mô phỏng thẻ gói tập trên màn hình (Giống hình ảnh bạn cung cấp)
const PackageCard = ({ packageInfo, onDetailsClick, isLoading }) => {
    const formatVND = (amount) => {
        if (typeof amount !== 'number') return '0 VND';
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '20px', maxWidth: '300px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#6a1b9a', marginBottom: '5px' }}>{packageInfo.name}</h3>
            <p style={{ margin: '0 0 15px 0' }}>{packageInfo.subtitle || 'PT kèm 1-1 cho người mới bắt đầu'}</p>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ff6600' }}>
                    💰 {formatVND(packageInfo.price)}
                </span>
            </div>
            <p style={{ margin: '0 0 15px 0' }}>
                ⏰ Thời lượng: {packageInfo.durationDays || '?'} ngày
            </p>
            
            <button 
                onClick={() => onDetailsClick(packageInfo._id)}
                style={{ 
                    backgroundColor: isLoading ? '#ccc' : '#ff6600', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    width: '100%',
                    transition: 'background-color 0.2s'
                }}
                disabled={isLoading}
            >
                {isLoading ? 'Đang tải...' : 'Xem chi tiết'}
            </button>
        </div>
    );
};

// Dữ liệu giả định cho danh sách gói tập
const dummyPackages = [
    { _id: '60c72b1f9b3e1c001f8f8f8f', name: 'Gói 8 buổi / 1 tháng', price: 1200000, durationDays: 30 },
    // Thêm các gói khác nếu cần
];


const PackageViewer = () => {
    // Trạng thái quản lý Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [packageDetails, setPackageDetails] = useState(null); 
    const [isLoading, setIsLoading] = useState(false);

    // 1. Hàm gọi API và hiển thị Modal
    const fetchAndShowDetails = async (packageId) => {
        if (!packageId) return;

        setIsLoading(true);
        setPackageDetails(null); 
        
        try {
            // Gọi API GE@/api/packages/:id
            const response = await axiosClient.get(`/packages/${packageId}`); 
            
            setPackageDetails(response.data.data); 
            setIsModalOpen(true); 

        } catch (error) {
            // Lỗi đã được xử lý bằng toast.error trong interceptor
            console.error('Lỗi khi tải chi tiết gói:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => setIsModalOpen(false);

    // 2. Hàm Placeholder cho nút Thanh toán (Không xử lý logic)
    const handleProceedToPayment = (packageId) => {
        console.log(`[PAYMENT TRIGGERED] Chuẩn bị chuyển sang bước thanh toán cho Gói ID: ${packageId}`);
        toast.info("Chức năng Thanh toán (Logic của người khác) được gọi thành công.");
        // closeModal(); // Có thể đóng modal sau khi trigger thanh toán
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Danh sách Gói Tập PT</h1>
            
            <div style={{ display: 'flex', gap: '20px' }}>
                {dummyPackages.map(pkg => (
                    // Chỉ truyền trạng thái loading chung nếu cần, hoặc quản lý loading riêng
                    <PackageCard 
                        key={pkg._id} 
                        packageInfo={pkg} 
                        onDetailsClick={fetchAndShowDetails} 
                        isLoading={isLoading} 
                    />
                ))}
            </div>

            {/* Modal Chi Tiết */}
            <PackageDetailModal
                isOpen={isModalOpen}
                onClose={closeModal}
                packageData={packageDetails}
                onProceedToPayment={handleProceedToPayment} 
            />
        </div>
    );
};

export default PackageViewer;