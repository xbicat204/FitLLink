// s@/components/PackageDetailModal.jsx

import React from 'react';

const formatVND = (amount) => {
    if (typeof amount !== 'number') return '0 VND';
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// CSS Styles (Đảm bảo các styles này được định nghĩa đầy đủ)
const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', maxWidth: '550px', width: '90%', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', position: 'relative' },
    checkoutButton: { backgroundColor: '#ff6600', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', fontSize: '1.1rem', cursor: 'pointer', width: '100%', fontWeight: 'bold', marginBottom: '10px', boxShadow: '0 4px 6px rgba(255, 102, 0, 0.3)' },
    closeButton: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#555' },
    price: { fontSize: '1.1rem', color: '#ff6600', fontWeight: 'bold' },
    detailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }
};

const PackageDetailModal = ({ isOpen, onClose, packageData, onProceedToPayment }) => {
    if (!isOpen || !packageData) return null;

    // DEBUG: Kiểm tra xem Modal có được render không
    console.log(`[PackageDetailModal] Rendering package: ${packageData.name || 'Unknown'}`);

    const { 
        _id, 
        name, 
        description, 
        price, 
        totalSessions, 
        durationDays, 
        pt, 
        tags 
    } = packageData;

    const durationText = durationDays > 30 
        ? `${Math.round(durationDays / 30)} tháng (${durationDays} ngày)` 
        : `${durationDays} ngày`;
    
    // Style cho nút đóng modal
    const closeButtonStyle = {
        ...styles.closeButton, 
        position: 'absolute', 
        top: '10px', 
        right: '15px'
    };

    return (
        <div className="modal-overlay" style={styles.overlay}>
            <div className="modal-content" style={styles.modal}>
                
                <button 
                    onClick={onClose} 
                    style={closeButtonStyle}
                >
                    &times;
                </button>
                
                <h2 style={{fontSize: '1.8rem', color: '#333', marginBottom: '10px'}}>{name}</h2>
                <p style={{fontSize: '1rem', color: '#777', fontWeight: 'normal', marginBottom: '15px'}}>PT phụ trách: **{pt?.name || 'Đang cập nhật'}**</p>

                <hr style={{border: '0', borderTop: '1px solid #eee', marginBottom: '20px'}} />

                {/* Grid Chi Tiết */}
                <div style={{...styles.detailsGrid}}>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <strong>Giá:</strong>
                        <span style={styles.price}>{formatVND(price)}</span>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <strong>Tổng số buổi:</strong>
                        <span>{totalSessions} buổi</span>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <strong>Thời hạn sử dụng:</strong>
                        <span>{durationText}</span>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <strong>Phân loại:</strong>
                        <span>{tags?.join(', ') || 'Cá nhân hóa'}</span>
                    </div>
                </div>

                <div style={{marginBottom: '20px'}}>
                    <strong style={{ display: 'block', marginBottom: '5px' }}>Mô tả chi tiết:</strong>
                    <p style={{fontSize: '0.9rem', lineHeight: '1.6', color: '#555', paddingLeft: '10px', borderLeft: '3px solid #f0f0f0'}}>
                        {description || "Gói tập cá nhân hóa 1 kèm 1, phù hợp cho người mới bắt đầu."}
                    </p>
                </div>

                {/* Khu vực Thanh toán */}
                <div style={{textAlign: 'center', paddingTop: '15px', borderTop: '1px solid #eee'}}>
                    <button 
                        // Gọi hàm initiatePayment và truyền toàn bộ dữ liệu gói (đã được Modal nhận)
                        onClick={() => onProceedToPayment(packageData)} 
                        style={styles.checkoutButton}
                        disabled={price === 0} 
                    >
                        Thanh toán {formatVND(price)}
                    </button>
                    <button onClick={onClose} style={{background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.9rem'}}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PackageDetailModal;