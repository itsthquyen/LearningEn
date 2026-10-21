# Kết quả kiểm tra — 21/10/2026

Các lệnh được chạy trên Windows, Node 24.11.1, Java 27 (biên dịch target Java 17). Không suy diễn đã chạy Java 17 runtime hoặc PostgreSQL khi chưa chạy.

- Backend: 25 tests pass. 6 AI HTTP provider giả lập; 4 auth/CRUD/owner; 10 học bài, nháp, phiên học, múi giờ, backup và mã HTTP 405/415/404; 3 HTTP thật với cookie/CSRF và hai tài khoản; 2 unit SM-2. `mvn package` đã chạy bộ 24 tests trước khi bổ sung kiểm tra mã HTTP, sau đó `mvn test -Dtest=LearningFlowIntegrationTest` chạy 10/10. Một test PostgreSQL riêng được skip local khi chưa có TEST_POSTGRES_URL; GitHub Actions cấu hình PostgreSQL 17 để chạy test này thật.
- `rtk proxy mvn package -q`: pass, tạo executable JAR.
- `rtk proxy npm test`: 38 tests pass (13 tests của phần triển khai + 25 tests verification độc lập trong workspace chung): che đáp án trước tự đánh giá, retry không đổi requestId/rating, giữ form khi lỗi, PUT đúng định danh, nháp bài học, assisted flag, không cấp kết quả khi chỉ mở bài, AI thiếu cấu hình, CSRF/session/network/204/abort và auth/route.
- `rtk proxy npm run build`: pass, bundle React production.
- `rtk proxy npm audit`: 0 vulnerabilities sau khi cập nhật Vitest.
- `rtk proxy node scripts/e2e.mjs` với Chromium có sẵn qua `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`: 2 scenarios pass. Chuỗi đăng nhập → AI test provider → lưu sổ tay → reload → ôn → nháp bài → reload → nộp → tiến bộ → phiên học → xuất → xóa → khôi phục → kiểm tra dữ liệu → đăng xuất. Kiểm tra viewport 360px cho 6 trang và desktop 1440px, focus/Escape của modal, không có pageerror.
- E2E dùng database H2 in-memory và credential ngẫu nhiên riêng. Không dùng/xóa dữ liệu dev. Đã sửa cấu hình CORS cho cổng động của runner sau lần chạy đầu bị từ chối origin.

Artifacts E2E: `work/e2e/results.json`, `work/e2e/desktop-dashboard.png`, `work/e2e/mobile-*.png`, log và trace khi lỗi; bị gitignore vì chứa dữ liệu phiên test. Không commit credential/provider secret.

Chưa xác nhận: PostgreSQL/Docker runtime (máy hiện không có lệnh Docker/PostgreSQL), Java 17 runtime, chất lượng/độ trễ/chi phí nhà cung cấp AI thật, 60 ca chấm nội dung, kiểm duyệt giáo trình, beta và thử dùng liên tục 2–4 tuần. Các việc này giữ chưa tick trong kế hoạch. E2E provider giả lập xác nhận luồng kỹ thuật, không xác nhận AI dịch đúng.
