# FitLink

FitLink là nền tảng kết nối học viên với huấn luyện viên cá nhân (PT). Học viên có thể tìm PT, chọn gói tập, đặt lịch và thanh toán. PT quản lý hồ sơ, gói tập, lịch và học viên; admin quản lý người dùng, duyệt PT và giao dịch.

## Thành phần

| Thư mục | Công nghệ | Vai trò |
|---|---|---|
| `fitlink-frontend/` | React 19, Vite 6, React Router, Tailwind CSS | Giao diện cho học viên, PT và admin |
| `fitlink-backend/` | Node.js, Express, MongoDB/Mongoose | API, xác thực, booking, lịch tập, thanh toán, chat và thông báo |

Backend cũng sử dụng Socket.IO cho chức năng realtime, PayOS cho thanh toán và Cloudinary cho media. Các tích hợp ngoài cần được cấu hình bằng biến môi trường.

## Yêu cầu

- Node.js 20.19 trở lên được khuyến nghị.
- MongoDB local hoặc MongoDB Atlas.
- npm.
- Tài khoản/khóa API cho những chức năng cần Google OAuth, bản đồ, email, Cloudinary hoặc PayOS.

## Cài đặt và chạy Backend

Mở terminal thứ nhất:

```bash
cd fitlink-backend
npm ci
cp .env.example .env
```

Điền thông tin cần thiết vào `fitlink-backend/.env`, tối thiểu gồm MongoDB, host/port, URL frontend và secret ký token. Không commit file `.env` hoặc khóa API.

```env
APP_HOST=127.0.0.1
APP_PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/fitlink
DATABASE_NAME=fitlink
CLIENT_URL=http://localhost:5173
ACCESS_TOKEN_SECRET=replace_with_a_random_secret
REFRESH_TOKEN_SECRET=replace_with_another_random_secret
```

Khởi động API:

```bash
npm run dev
```

## Cài đặt và chạy Frontend

Mở terminal thứ hai:

```bash
cd fitlink-frontend
npm ci
```

Tạo `fitlink-frontend/.env` với cấu hình phù hợp. Các biến dưới đây được frontend tham chiếu trong source:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_GG_CLIENT_ID=
VITE_GEOAPIFY_KEY=
VITE_MAPTILER_KEY=
```

Chạy ứng dụng web:

```bash
npm run dev
```

Vite thường mở frontend tại `http://localhost:5173`. Đảm bảo backend cho phép origin này qua CORS.

## Unit test và coverage

Unit test Jest nằm trong `fitlink-backend/tests/unit/` và kiểm tra các helper authentication, booking/schedule và payment. Các test hiện tại không kết nối MongoDB hoặc PayOS thật.

```bash
cd fitlink-backend
npm test -- --runInBand
npm test -- --runInBand --coverage
```

Báo cáo HTML được tạo tại `fitlink-backend/coverage/lcov-report/index.html`.

## CI

Workflow backend nằm tại `fitlink-backend/.github/workflows/test.yml`. Workflow cài Node.js 20, cài dependency bằng `npm ci`, rồi chạy Jest với coverage khi có push hoặc pull request trong repository backend.

Nếu đưa frontend và backend vào một repository gộp, GitHub Actions chỉ tự nhận workflow trong `.github/workflows/` ở root repository; khi đó cần đặt/cấu hình workflow ở root.

## Tài liệu

- Tổng quan kiến trúc và nghiệp vụ: [`FITLINK_DOC.md`](FITLINK_DOC.md)
- Báo cáo Unit Test: [`fitlink-backend/FITLINK_UNIT_TEST_REPORT.md`](fitlink-backend/FITLINK_UNIT_TEST_REPORT.md)
- Hướng dẫn test backend: [`fitlink-backend/tests/README.md`](fitlink-backend/tests/README.md)

