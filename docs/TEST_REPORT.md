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

## Bổ sung luồng ảnh (Kilo, 21/10/2026 13:17 UTC)

- Môi trường lượt này: Windows, Java **17.0.17** theo log Spring Boot; do đó không áp dụng giới hạn chưa chạy runtime Java17 của lượt Java27 ở trên.
- `rtk mvn test -q`: 124 tests đạt, 0 failure/error; 1 PostgreSQL test skipped local. Trong đó 42 image integration + 56 image validation, 6 text AI, 4 API, 10 learning flow, 4 HTTP thật, 2 SM-2.
- Test ảnh tạo JPEG/PNG thật bằng ImageIO, HTTP provider fixture bắt payload thực; xác nhận model vision, các image_url/order/pixels, max output/JSON, usage/costs, 6 task, không lưu ảnh/base64 vào DB/export, privacy, replay/concurrent duplicate/conflict, auth/CSRF/ownership, multipart metadata và hạn mức trước gọi provider.
- Test âm: MIME giả/SVG/hỏng/ảnh trống/vượt byte-count-pixel/config; output thiếu usage/sai schema/answer mâu thuẫn/trailing tokens/truncated output/lộ đáp án HINT/thiếu cảnh báo khi ảnh không rõ. Phát hiện từ test đã được sửa runtime, các regression đạt. Bộ lọc tường minh HINT không chứng minh không thể có mọi dạng ám chỉ đáp án trong ngôn ngữ tự nhiên.
- `rtk npm test`: **60/60 đạt**, 6 files, gồm 22 test upload/ảnh/kết quả. `rtk npm run build`: đạt.
- E2E cũ `rtk proxy npx playwright test --config verification.playwright.config.js`: 1/1 đạt trên Edge/backend thật, provider chưa cấu hình, database RAM riêng.
- E2E ảnh: đặt `VERIFY_IMAGE_FLOW=true`, chạy cùng config trên JAR mới; 1/1 đạt, lần cuối 22.3s. Kiểm tra upload PNG thật từ canvas, zoom/Escape, multipart ảnh-only qua Vite/backend tới HTTP vision fixture, ABCD, reload lịch sử, lưu kiến thức, HINT không có đáp án/option, export không có data:image, không tràn ngang 360/1440px, không pageerror. Hai service backend/frontend và fixture tự dừng sau test. Không chạm dữ liệu dev.
- `rtk mvn package -DskipTests -q` tạo JAR; đây là đóng gói sau test, không tính skipTests là một lượt kiểm thử. `rtk git diff --check` đạt ở lượt tích hợp.
- Chưa nghiệm thu: provider vision thật và chất lượng đọc/chọn đáp án trên ảnh thực của người dùng; cần `AI_VISION_ENABLED`, `AI_VISION_MODEL`, base/key và bảng giá/allowance phù hợp. HTTP fixture chỉ kiểm chứng luồng và giao thức, không phải bằng chứng AI nhận dạng đúng. Không push/deploy trong lượt ảnh.

### Kết quả sau review ảnh (13:25 UTC)

- Review độc lập tìm 4 lỗi, đã sửa và thêm regression: chiều xoay/lật JPEG EXIF, pixel-identical fingerprint khác palette/RGB, private transient result bị history ghi đè, retry request FAILED không có cách gửi mới khi giữ nguyên ảnh.
- Backend `rtk mvn test -q`: **136 tests pass**, 1 PostgreSQL skipped local. Thêm 12 `ImageOrientationTest` kiểm tra 8 transform, 2 endian TIFF/EXIF thật qua ImageTutor, palette/RGB cùng digest và EXIF hỏng.
- Frontend `rtk npm test`: **64/64 pass**, `rtk npm run build` pass. Thêm 4 regression cho text/image retry/newUUID và merge retained/nonretained history.
- E2E image (JAR cuối): **1/1 pass, 23.2s**. Thêm tắt history trong hội thoại có sẵn, nhận kết quả riêng tư vẫn hiện sau refetch trong khi DB không có thêm message; provider 503 dẫn API502 rồi click chủ động tạo request mới giữ ảnh/nội dung thành công. Không tự tạo UUID mới khi chưa rõ kết quả mạng.
- E2E không provider luồng cũ: **1/1 pass, 27.2s**. `rtk git diff --check` pass.
- Tổng số test là case count (bao gồm parameterized), không phải % line/branch coverage hay chỉ số chính xác AI. Giới hạn provider thật ở trên giữ nguyên; checklist IMG08 chưa tick.
