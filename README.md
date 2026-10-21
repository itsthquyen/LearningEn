# LearningEN

Ứng dụng tự học tiếng Anh cá nhân: Spring Boot + React JS, tham khảo cách tách backend/frontend và luồng API của HR-V5. Số liệu học, sổ tay, lịch ôn và nội dung bài học được lấy từ database. AI gọi qua backend bằng cấu hình riêng, không có câu trả lời giả trong ứng dụng.

Theo dõi công việc và nhật ký tại [kế hoạch](KE_HOACH_APP_TU_HOC_TIENG_ANH.md#19-checklist-triển-khai-thực-tế-21102026); hợp đồng API tại [docs/API.md](docs/API.md).

## Chạy phát triển trên Windows

Cần JDK 17+, Maven 3.9+, Node.js 22+. Nếu máy dùng RTK, giữ prefix trong các lệnh dưới đây.

Mở PowerShell tại thư mục gốc, cấu hình **email và mật khẩu riêng** (12–72 ký tự), sau đó chạy backend:

```powershell
$env:BOOTSTRAP_EMAIL = "email-cua-ban@example.com"
$env:BOOTSTRAP_PASSWORD = Read-Host "Mat khau tai khoan ca nhan"
Set-Location backend
rtk proxy mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Profile `dev` dùng H2 lưu bền trong `backend/data/learningen`. Không có tài khoản/mật khẩu mặc định. Biến bootstrap chỉ tạo tài khoản lần đầu khi database còn trống, không thay mật khẩu tài khoản đã tồn tại.

Mở PowerShell khác:

```powershell
Set-Location frontend
rtk proxy npm ci
rtk proxy npm run dev
```

Mở [http://localhost:5173](http://localhost:5173). Vite proxy `/api` tới backend. Có thể đổi `BACKEND_PORT`, `FRONTEND_PORT`, `BACKEND_URL`; giữ frontend và API cùng origin qua proxy để cookie/CSRF hoạt động. `.env` gốc dành cho Docker Compose; Maven không tự đọc file đó, hãy đặt biến môi trường trước khi chạy.

## AI thật

Đặt biến môi trường trên **backend** trước khi khởi động:

```powershell
$env:AI_BASE_URL = "https://provider.example/v1"
$env:AI_API_KEY = Read-Host "API key"
$env:AI_MODEL = "model-cua-provider"
```

Endpoint provider cần tương thích `POST /chat/completions`, trả `choices[0].message.content` và `usage.prompt_tokens/completion_tokens`. Không cấu hình sẽ trả 503 rõ ràng; sổ tay, ôn tập và bài học vẫn dùng được. Khóa không được đưa vào React, Git hay bản xuất JSON.

Hạn mức qua `AI_DAILY_REQUESTS`, `AI_DAILY_TOKENS`, `AI_GLOBAL_DAILY_TOKENS`; token đầu vào/đầu ra được đặt trước khi gọi để tránh đồng thời vượt trần. Giới hạn theo ngày UTC trên backend; báo cáo học theo múi giờ profile. Yêu cầu lỗi/không rõ kết quả giữ phần ngân sách đã đặt để tránh retry tốn tiền không kiểm soát. Request ID chống gọi AI trùng.

Theo dõi tiền mặc định tắt vì chưa có đơn giá đã chọn. Khi có đơn giá thực, đặt `AI_COST_TRACKING_ENABLED=true`, `AI_INPUT_COST_PER_MILLION`, `AI_OUTPUT_COST_PER_MILLION` và trần `AI_DAILY_COST_LIMIT`/`AI_GLOBAL_DAILY_COST_LIMIT` cùng đơn vị tiền. Các số là ước lượng theo usage provider; không phải hóa đơn. Trần ngày không thay trần hóa đơn tại provider. Xóa dữ liệu không xóa các bộ đếm hạn mức.

## PostgreSQL và Docker Compose

Ứng dụng mặc định dùng PostgreSQL. Đặt `DATABASE_URL` dạng JDBC, `DATABASE_USER`, `DATABASE_PASSWORD`; không dùng profile dev. Flyway tự chạy migration.

Nếu có Docker Desktop:

```powershell
Copy-Item .env.example .env
# Điền POSTGRES_PASSWORD, BOOTSTRAP_EMAIL, BOOTSTRAP_PASSWORD và cấu hình AI nếu dùng.
rtk proxy docker compose up --build -d
```

Compose chỉ publish frontend ở `127.0.0.1:5173`, lưu PostgreSQL trong volume; backend/database ở mạng nội bộ. Đây là cấu hình chạy local, chưa triển khai public. Khi triển khai HTTPS, đặt `COOKIE_SECURE=true`, cấu hình proxy và CORS phù hợp. Không xóa volume database nếu chưa sao lưu.

## Kiểm thử

```powershell
Set-Location backend
rtk proxy mvn verify
Set-Location ../frontend
rtk proxy npm test
rtk proxy npm run build
rtk proxy npm audit
```

Backend có unit/integration cho lịch ôn, sở hữu dữ liệu hai tài khoản, CSRF thật, idempotency, lỗi/hạn mức AI, học bài, phiên học, múi giờ và khôi phục. Các bài kiểm thử AI dùng HTTP provider giả lập chỉ trong test, không xác nhận chất lượng dịch thật.

E2E dùng backend database **in-memory riêng**, tài khoản ngẫu nhiên, Vite trên cổng trống và provider giả lập riêng; không dùng hay xóa dữ liệu dev của bạn:

```powershell
# Tại thư mục frontend, cài Chromium dùng cho test một lần:
rtk proxy npx playwright install chromium
Set-Location ..
# backend JAR phải đã được mvn verify/package tạo ở bước trên.
rtk proxy node scripts/e2e.mjs
```

Có thể dùng Chromium đã cài bằng `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Kết quả, log và ảnh chụp được lưu trong `work/e2e/` (không commit). Bộ E2E chạy luồng học đầy đủ và kiểm tra màn 360px/desktop.

## Dữ liệu và nội dung

- Xuất JSON trong Cài đặt trước khi dùng làm sổ tay chính. Để thử khôi phục, xuất → xóa dữ liệu học tập → chọn file JSON → khôi phục. Restore chỉ nhận workspace trống, kiểm tra liên kết thuộc tài khoản và chạy trong transaction; không nhập mật khẩu, khóa hoặc bộ đếm hạn mức từ file.
- Nội dung tự biên soạn nằm ở `backend/src/main/resources/content/a1-foundations.json`, có phiên bản và nạp vào database lúc khởi động. Nguồn biên soạn: `scripts/write-course.mjs`. Tăng `version` khi sửa nội dung muốn cập nhật database.
- 12 bài ngắn + 3 kiểm tra mốc + 1 vận dụng đều ghi **DRAFT/chưa duyệt**. Không quảng cáo là giáo trình được chứng nhận. Trắc nghiệm chấm ở server; bài có hỗ trợ không được tính đạt độc lập; bài viết chỉ ghi thực hành, chưa tự chấm năng lực.
- Lịch ôn hiện dùng baseline **SM-2**, chưa tích hợp FSRS. Không cộng tiến độ chỉ vì mở trang/xem đáp án. Phiên học chỉ ghi thời gian khi tab hiển thị và người dùng tương tác gần đây; lưu mỗi 15 giây, nên đóng tab đột ngột có thể mất tối đa phần chưa gửi.
- MVP hiện là online. PWA/offline, nhắc học, thanh toán, chứng chỉ và giáo trình A2–C2 chưa triển khai. Cần cấu hình provider thật, duyệt nội dung, chạy bộ chất lượng AI và dùng thử trước phát hành.

## Cấu trúc

`backend/`: controller nhận DTO/validation/owner, service xử lý nghiệp vụ, repository truy vấn giáo trình; Spring Security session + CSRF; JDBC và Flyway. `frontend/`: app/router, pages, features (notebook/study), components, hooks và service API dùng chung. Không đưa nghiệp vụ chấm điểm hay nội dung giáo trình vào React.
