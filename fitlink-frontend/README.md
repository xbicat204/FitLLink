# FitLink Frontend

Frontend cho nền tảng FitLink, xây bằng React + Vite. Ứng dụng phục vụ 3 vai trò chính:

- `student`: tìm PT, đặt lịch, thanh toán, xem gói học, chat, feedback
- `pt`: quản lý hồ sơ, học viên, gói tập, lịch, ví, tài liệu
- `admin`: quản lý user, duyệt PT, giao dịch và payout

## Tech Stack

- React 19
- Vite 6
- React Router 7
- Tailwind CSS
- Axios
- Socket.IO client
- FullCalendar

## Cấu trúc chính

```text
src/
  api/          wrapper axios/socket mức thấp
  components/   UI tái sử dụng
  contexts/     auth, booking, notification, socket
  layouts/      layout cho student/admin/pt
  pages/        màn hình theo vai trò
  routes/       định nghĩa route + bảo vệ route
  services/     service gọi API theo nghiệp vụ
  utils/        helper và formatters
```

## Yêu cầu môi trường

- Node.js `20.x`
- Backend FitLink chạy sẵn và cho phép CORS/cookie

Biến môi trường frontend đang được dùng trong code:

- `VITE_API_BASE_URL`: URL API có hậu tố `/api`
  - Ví dụ: `http://localhost:3000/api`
- `VITE_API_URL`: URL backend gốc, dùng ở một số service upload/material
  - Ví dụ: `http://localhost:3000`
- `VITE_SOCKET_URL`: URL socket server
  - Ví dụ: `http://localhost:3000`
- `VITE_GG_CLIENT_ID`
- `VITE_GEOAPIFY_KEY`
- `VITE_MAPTILER_KEY`

## Chạy local

1. Cài dependency:

```bash
npm install
```

2. Tạo file `.env` trong thư mục `fitlink-frontend`.

3. Thêm cấu hình tối thiểu:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_GG_CLIENT_ID=your_google_client_id
VITE_GEOAPIFY_KEY=your_geoapify_key
VITE_MAPTILER_KEY=your_maptiler_key
```

4. Chạy dev server:

```bash
npm run dev
```

5. Build production:

```bash
npm run build
```

## Các module đáng chú ý

- `chat`: dùng Socket.IO với room id dạng `userId-peerId` đã sort
- `feedback`: học viên gửi feedback theo `studentPackage`, PT xem danh sách feedback của mình
- `booking`: flow nhiều bước từ chọn gói đến checkout
- `notifications`: kết hợp REST + realtime

## Lưu ý hiện tại

- Dự án đang tồn tại cả `src/api/*` và `src/services/*`. Khi thêm logic nghiệp vụ mới, ưu tiên tập trung vào `services` để tránh trùng contract.
- Một số service cũ vẫn còn dùng `VITE_API_URL`, trong khi phần lớn API app dùng `VITE_API_BASE_URL`.
- Socket chat hiện dùng các event chuẩn: `registerUser`, `joinRoom`, `leaveRoom`, `sendMessage`, `receiveMessage`.
