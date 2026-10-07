// components/StudentPackageDetail.jsx (FINAL FIXED)

import React, { useState, useEffect } from 'react';
import { getPackageDetails } from '@/services/studentPackageService'; 

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });
};

function StudentPackageDetail({ studentPackageId }) {
    const [pkgDetail, setPkgDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchDetails() {
            try {
                const data = await getPackageDetails(studentPackageId);
                setPkgDetail(data);
            } catch (err) {
                setError("Lỗi: Không thể tải chi tiết gói tập."); 
            } finally {
                setLoading(false);
            }
        }
        
        if (studentPackageId) {
            fetchDetails();
        }
    }, [studentPackageId]);

    if (loading) return <div>Đang tải thông tin gói tập...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>; 
    if (!pkgDetail) return <div>Không tìm thấy dữ liệu gói tập.</div>;

    const { 
        pt, package: pkg, startDate, endDate, 
        remainingSessions, status, baselineMetric, baselineMetricAt 
    } = pkgDetail;
    
    const isMetricSet = baselineMetric && baselineMetric.heightCm !== undefined;

    return (
        <div style={{ padding: '20px', border: '1px solid #4CAF50', borderRadius: '8px', backgroundColor: '#f9fff9' }}>
            <h2 style={{ color: '#4CAF50' }}>Chi tiết Gói Tập ({pkg.name})</h2>
            
            <p><strong>Trạng thái:</strong> <span style={{ color: status === 'active' ? 'blue' : 'gray' }}>{status.toUpperCase()}</span></p>

            <hr />

            <h3>Thông tin Buổi Tập</h3>
            <p><strong>Tổng số buổi:</strong> {pkg.totalSessions}</p>
            <p><strong>Số buổi còn lại:</strong> <strong>{remainingSessions}</strong></p>
            <p><strong>Thời hạn:</strong> {pkg.durationDays} ngày</p>

            <hr />

            <h3>Thời gian Áp Dụng & PT</h3>
            <p><strong>Ngày Bắt Đầu:</strong> {formatDate(startDate)}</p>
            <p><strong>Ngày Kết Thúc:</strong> {formatDate(endDate)}</p>
            <p><strong>PT Phụ Trách:</strong> {pt.username} ({pt.email})</p>

            <hr />

            <h3>Chỉ số Baseline (Đầu vào)</h3>
            {isMetricSet ? (
                <>
                    <p><strong>Ngày thiết lập:</strong> {formatDate(baselineMetricAt)}</p>
                    <p><strong>Chiều cao:</strong> {baselineMetric.heightCm} cm | <strong>Cân nặng:</strong> {baselineMetric.weightKg} kg</p>
                    <p><strong>BMI:</strong> {baselineMetric.bmi.toFixed(2)} | <strong>BMR:</strong> {baselineMetric.bmr.toFixed(0)} kcal</p>
                    <p><strong>Mục tiêu:</strong> {baselineMetric.goal.toUpperCase()} | <strong>Hoạt động:</strong> {baselineMetric.activity}</p>
                </>
            ) : (
                <p>Chưa có chỉ số cơ bản (baseline metric) được thiết lập cho gói tập này. (PT cần cập nhật)</p>
            )}

        </div>
    );
}

export default StudentPackageDetail;