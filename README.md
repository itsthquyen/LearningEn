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

## Học từ ảnh đề bài

Trong **Hỏi & Dịch**, tải/kéo thả/dán JPEG hoặc PNG, xem trước và phóng to để kiểm tra ảnh trước khi gửi. Có thể chỉ gửi ảnh hoặc thêm câu hỏi, số câu cần giải và đáp án đã chọn. Nhiều ảnh gửi theo thứ tự hiển thị; nên chụp đủ đề, lựa chọn và đoạn đọc, cắt bỏ thông tin riêng tư. Mặc định tối đa 3 ảnh, 5 MiB/ảnh, 12 MiB tổng và 16 triệu pixel/ảnh; giới hạn do backend trả về, không phải fixture UI.

Các chế độ: **Chỉ đáp án**, **Giải chi tiết ABCD**, **Gợi ý** không hiện đáp án, **Dịch đề**, **Chép nội dung**, **Luyện thêm** với đáp án bài luyện ẩn. Phân tích chi tiết hiển thị từng câu, đáp án AI đề xuất, lý do từng lựa chọn đúng/sai, bản dịch, kiến thức và mẹo; lưu câu/kiến thức vào sổ tay để chỉnh lại và ôn. Ảnh mờ, thiếu gạch chân/đoạn đọc/audio phải được báo rõ; AI không bảo đảm đúng tuyệt đối.

Backend cần cấu hình cùng `AI_BASE_URL`/`AI_API_KEY` ở trên, thêm `AI_VISION_ENABLED=true` và `AI_VISION_MODEL` là **model thực hỗ trợ image_url và JSON output** của provider. Không tự dùng model chỉ nhận chữ, không có đáp án mẫu khi provider hỏng. Model vision có thể khác `AI_MODEL`. Không cấu hình thì UI vẫn cho hỏi chữ, upload ảnh bị khóa và API ảnh trả 503. Kết quả provider sai cấu trúc/cắt ngang bị từ chối 502 thay vì hiển thị lời giải dở dang.

`AI_VISION_MAX_OUTPUT_TOKENS` mặc định 6000 để giải chi tiết; nhiều câu nên chia lô hoặc chỉ định số câu. `AI_VISION_TOKENS_PER_IMAGE` mặc định 4096 là khoản dự trù token ảnh, không phải tokenizer/hóa đơn chính xác của mọi model; đặt theo provider thực tế. Hạn mức ngày chung bao gồm chữ và ảnh. Khi bật theo dõi tiền, đặt riêng `AI_VISION_INPUT_COST_PER_MILLION` và `AI_VISION_OUTPUT_COST_PER_MILLION` theo giá vision; phải dùng cùng đơn vị tiền với giới hạn ngày. Một yêu cầu 3 ảnh có thể dự trù hơn 30k token, cần điều chỉnh trần theo nhu cầu và khả năng chi trả.

Ảnh được kiểm tra signature/decoder/kích thước, áp dụng chiều xoay/lật EXIF của ảnh điện thoại rồi mã hóa lại để bỏ EXIF/location; chỉ xử lý RAM, không lưu ảnh/base64 vào DB, file upload công khai hay backup. Provider vẫn nhận ảnh nên cần xem chính sách riêng tư của provider. Nếu bật lịch sử, nội dung đọc từ ảnh và lời giải được lưu, không phải ảnh gốc. Hỏi tiếp dùng nội dung đã đọc; muốn phân tích lại chi tiết thị giác cần gắn ảnh lại. Tắt lịch sử thì không lưu nội dung/kết quả vào DB.

Lỗi mạng chưa rõ kết quả nên thử lại cùng request ID để tránh gọi trùng. Nếu backend báo yêu cầu đã thất bại/đã xử lý, có thể chọn **Gửi thành yêu cầu mới** mà không cần gắn ảnh lại; thao tác này có thể gọi AI và tính thêm hạn mức, không được tự động thực hiện khi retry.

Test ảnh độc lập: sau `rtk mvn test` và `rtk mvn package -DskipTests`, chạy từ `frontend/`: `$env:VERIFY_IMAGE_FLOW='true'`, rồi `rtk proxy npx playwright test --config verification.playwright.config.js`. Bộ này dùng ảnh PNG sinh tại test, backend thật và HTTP vision fixture riêng (không kiểm chứng khả năng đọc/giải của provider thật); Edge phải được cài, hoặc cấu hình `VERIFY_BROWSER_CHANNEL` phù hợp. Xóa biến `VERIFY_IMAGE_FLOW` để chạy E2E cũ không provider. Không có credential thật hoặc model vision đã chọn thì chưa nghiệm thu độ chính xác OCR/ABCD.

## Bộ đề B1

Sau khi đăng nhập, chọn **Bộ đề B1** trên thanh điều hướng; trên màn hình nhỏ có thể vuốt thanh điều hướng ngang để thấy mục này. Đề chia thành đọc, viết, nghe, bài luyện và nói; không tính giờ hay tự nộp. Phần nghe cần audio bên ngoài và chỉ cho chọn câu trả lời, không cung cấp đáp án nghe. Lựa chọn và bài viết được tự lưu theo tài khoản, có thể tiếp tục sau khi tải lại hoặc đăng nhập lại; đợi thông báo “Đã lưu bài làm” trước khi rời trang. Nếu mất mạng hoặc cùng sửa trên hai thiết bị, hãy xử lý thông báo lỗi trước khi rời trang. Khi trang đề đang hiển thị, trình duyệt định kỳ duy trì phiên đăng nhập; hãy đăng xuất khi dùng thiết bị chung.

Nội dung và ảnh được trích từ PDF scan do người dùng cung cấp. Các câu bị thiếu/che được đánh dấu; một số đề gốc có lỗi hoặc nhiều cách hiểu. Lời giải và bản dịch đã biên soạn, đối chiếu một phần nhưng chưa phải đáp án chính thức được giáo viên thẩm định; bài viết và nói là mẫu tham khảo.

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
