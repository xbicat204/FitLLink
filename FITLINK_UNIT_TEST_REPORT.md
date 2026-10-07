# Báo cáo Unit Test tối thiểu — FitLink

## 1. Phạm vi

FitLink backend dùng Node.js, Express và MongoDB. Bộ test dùng Jest kiểm tra ba nhóm logic trong source:

- **Authentication:** access token, refresh token và reset token.
- **Booking/Schedule:** giá booking, phí di chuyển và ngày tập theo pattern.
- **Payment:** chia khoản thanh toán thành phí nền tảng và thu nhập PT.

Các test không gọi HTTP API, MongoDB hoặc PayOS thật.

## 2. Jest

Repo backend chưa cấu hình test framework ban đầu. Jest được thêm cùng `babel-jest` để hỗ trợ cú pháp `import/export` trong source.

- `describe()` nhóm test theo chức năng.
- `test()` mô tả một tình huống.
- `expect()` xác nhận kết quả.

Ví dụ từ `tests/unit/payment.test.js`:

```js
expect(calculatePaymentSplit(1_250_000)).toEqual({
  platformFee: 250_000,
  ptEarning: 1_000_000
})
```

## 3. Test cases

### Authentication — `src/utils/genarateTokens.js`

- Access token: claim đúng và hết hạn sau 1 ngày.
- Refresh token: claim đúng và hết hạn sau 7 ngày.
- Reset token: 64 ký tự hex, hết hạn sau 5 phút.

Đây là test helper token, không phải kiểm thử toàn bộ API đăng nhập/đăng ký hay Google OAuth.

### Booking/Schedule

- `calcBookingPricing`: 8 km, miễn phí 2 km, phí 50.000đ/km → phí đi lại 300.000đ; tổng sau thuế và giảm giá là 1.250.000đ.
- Tập tại gym PT: không tính phí di chuyển.
- `generateDatesByPatternFromDate`: pattern Thứ Ba/Thứ Năm từ 01/01/2026 tạo ngày 01/01, 06/01, 08/01 theo thứ tự.
- Pattern `[4, 4]` không sinh buổi trùng.

Test lịch ban đầu phát hiện bug: hàm cũ có thể trả ngày sai thứ tự và bỏ sót buổi. Hàm được sửa để duyệt lần lượt theo ngày.

### Payment — `src/utils/paymentUtils.js`

`calculatePaymentSplit` được gọi trong checkout sau khi PayOS xác nhận trạng thái `PAID`.

- Amount 1.250.000đ, phí 20% → platform 250.000đ, PT 1.000.000đ.
- Amount 101đ, phí 15% → phí làm tròn xuống 15đ, PT nhận 86đ.

## 4. Cấu trúc file tối thiểu

```text
fitlink-backend/
├── src/
│   └── utils/paymentUtils.js
├── tests/
│   ├── unit/
│   │   ├── auth.test.js
│   │   ├── booking.test.js
│   │   └── payment.test.js
│   └── README.md
├── coverage/                       # Jest tự sinh, không commit
│   └── lcov-report/index.html
├── .github/workflows/test.yml
├── jest.config.cjs
└── package.json
```

`tests/mocks/` được bỏ qua vì các test này chỉ gọi helper thuần, không cần mock database hoặc payment gateway. README trong `tests/` ghi lệnh chạy và vị trí coverage.

## 5. Chạy test và coverage

```bash
npm test -- --runInBand
npm test -- --runInBand --coverage
```

Jest tạo báo cáo HTML tại `coverage/lcov-report/index.html`. Thư mục coverage được Git ignore để tránh commit artifact được sinh tự động.

## 6. CI

`.github/workflows/test.yml` chạy khi có `push` hoặc `pull_request`:

1. Checkout repository.
2. Cài Node.js 20.
3. Chạy `npm ci`.
4. Chạy Jest với coverage.

Workflow đã cấu hình nhưng cần push lên GitHub để xem kết quả runner trong tab **Actions**.

## 7. Kết quả local

```text
Test Suites: 3 passed, 3 total
Tests:       9 passed, 9 total
All files:   100% lines
```

Coverage chỉ áp dụng cho các helper được chọn; không đại diện coverage toàn backend. Các phần chưa được kiểm tra gồm API end-to-end, MongoDB thật, Google OAuth và PayOS.
