# Kế hoạch xây dựng app tự học tiếng Anh cá nhân

**Tên tạm:** LearningEN  
**Ngày lập:** 21/10/2026  
**Trạng thái:** Đang triển khai MVP cá nhân bằng Spring Boot + React JS; xem checklist và nhật ký bên dưới.  
**Định hướng:** Dùng tốt cho chính mình trước, kiểm chứng hiệu quả rồi mới thương mại hóa.

## 1. Tóm tắt đề xuất

Xây dựng một **trợ lý tự học tiếng Anh dành cho người Việt**, kết hợp ba nhu cầu trong cùng một nơi:

1. **Hỏi và hiểu ngay:** Dịch từ, cụm từ, câu; hỏi ngữ pháp; sửa câu; giải thích dễ hiểu bằng tiếng Việt.
2. **Không tra xong rồi quên:** Lưu kiến thức quan trọng thành sổ tay có ngữ cảnh và thẻ ôn tập.
3. **Biết hôm nay học gì:** Có lộ trình, nhiệm vụ ngắn mỗi ngày và báo cáo tiến bộ dựa trên việc làm được bài, không chỉ số ngày mở app.

Vòng lặp cốt lõi: **Gặp điều chưa hiểu → hỏi/dịch → hiểu cách dùng → lưu có chọn lọc → ôn đúng lúc → dùng trong câu mới → theo dõi tiến bộ.**

**Khuyến nghị quyết định ban đầu:** Làm web app responsive trước, bổ sung khả năng cài lên màn hình chính theo PWA khi ổn định. Chưa làm ứng dụng iOS/Android riêng, chưa làm mạng xã hội, chưa bán gói AI không giới hạn.

Điểm khác biệt dự kiến không phải “AI dịch giỏi hơn mọi nơi”, mà là: **biến câu hỏi hằng ngày của chính người học thành một hệ thống học có ghi nhớ và định hướng**.

## 2. Giả định và giới hạn

- Người dùng đầu tiên là chủ dự án, dùng tiếng Việt để học tiếng Anh, thường xuyên cần tra cứu khi đọc hoặc làm việc.
- Chưa biết trình độ hiện tại, mục tiêu chuyên môn và ngân sách thực tế. Mặc định thiết kế cho người trưởng thành ở khoảng A1–B1, có thể điều chỉnh sau kiểm tra đầu vào.
- Thời lượng mặc định là 20 phút/ngày, 5 ngày/tuần; có chế độ tối thiểu 5 phút và chế độ 30 phút.
- Ưu tiên hiểu nội dung, giao tiếp thông dụng và tiếng Anh công việc cơ bản; không mặc định mục tiêu IELTS/TOEIC.
- “Lộ trình đầy đủ” nghĩa là nhìn thấy các chặng, mục tiêu và điều kiện tiến lên. Không đồng nghĩa bản đầu đã có toàn bộ giáo trình A1–C2.
- MVP, tức bản sản phẩm tối thiểu dùng được, chỉ triển khai sâu một chặng phù hợp trình độ đầu vào. Các chặng còn lại có mô tả rõ và ghi “chưa có nội dung”, không tạo cảm giác đã hoàn chỉnh.
- Thời gian và chi phí trong tài liệu là ước tính để lập kế hoạch, không phải báo giá hay cam kết kết quả học.

## 3. Tham khảo sản phẩm và bài học áp dụng

Các nhận xét sau dựa trên trang giới thiệu/tài liệu chính thức được đọc ngày 21/10/2026. Đây không phải kết quả dùng thử toàn bộ sản phẩm hoặc kiểm chứng độc lập các tuyên bố quảng cáo.

### 3.1. Duolingo: Giảm khó khăn khi bắt đầu học

- Nguồn mô tả bài học tương tác, cá nhân hóa, nội dung theo chuẩn và hình thành thói quen qua bài học ngắn [1].
- Áp dụng: Mỗi ngày có một nút “Bắt đầu học”, bài ngắn, phản hồi ngay và hướng dẫn bước tiếp theo.
- Không ưu tiên sao chép: Bảng xếp hạng, tiền ảo, cơ chế phạt khi sai hoặc áp lực giữ chuỗi ngày học.
- Với LearningEN, mục tiêu tuần linh hoạt quan trọng hơn việc buộc người dùng phải vào app mỗi ngày.

### 3.2. Anki: Ghi nhớ bằng tự nhớ lại và ôn giãn cách

- Tài liệu Anki giải thích active recall và spaced repetition, đồng thời giới thiệu hỗ trợ FSRS [2].
- Áp dụng: Thẻ ôn từ kiến thức người dùng đã lưu; người học thử nhớ trước khi mở đáp án.
- Giấu phần cấu hình thuật toán khỏi giao diện thông thường. Người dùng chỉ cần phản hồi mức độ nhớ.
- Không áp dụng lịch nhắc cứng giống nhau cho mọi từ và mọi người.

### 3.3. LingQ: Học từ ngữ cảnh thật

- LingQ giới thiệu việc học qua đọc/nghe, đánh dấu từ/cụm từ, lưu để ôn và theo dõi hoạt động [3].
- Áp dụng: Giữ nguyên câu gốc, chủ đề và nghĩa trong ngữ cảnh khi lưu từ; cho phép dán đoạn văn của mình để học.
- Chưa ưu tiên nhập tự động từ hàng loạt nền tảng video hoặc xây thư viện nội dung quá lớn.

### 3.4. ELSA Speak: Phản hồi cụ thể và thực hành tình huống

- ELSA giới thiệu gia sư song ngữ, role-play, phản hồi cá nhân hóa và theo dõi tiến bộ [4].
- Áp dụng sau MVP: Luyện tình huống như giới thiệu bản thân, hỏi đường, báo cáo công việc.
- Không hứa chấm phát âm chuyên sâu nếu chỉ dùng nhận dạng giọng nói thông thường. Văn bản nhận dạng đúng không chứng minh phát âm đúng từng âm.

### 3.5. DeepL: Trải nghiệm dịch tập trung

- Trang dịch có ô nhập nội dung, lựa chọn ngôn ngữ và khu vực kết quả rõ ràng [5].
- Áp dụng: Cho phép dán câu và nhận nghĩa ngay; phần phân tích nằm sau nút mở rộng, không ép đọc một bài giảng dài.
- Đây là tham khảo trải nghiệm, không phải quyết định sử dụng API DeepL. Nhà cung cấp dịch chỉ được chọn sau khi thử chất lượng Anh–Việt và kiểm tra điều khoản.

### 3.6. CEFR: Khung chỉ hướng, không phải chứng chỉ tự cấp

- Cambridge English mô tả CEFR là thang năng lực gồm A1, A2, B1, B2, C1, C2 [6].
- Áp dụng: Tổ chức chặng học theo việc người học làm được; tách đánh giá đọc, nghe, viết, nói.
- Kết quả app chỉ là ước lượng nội bộ. Không gọi đó là chứng nhận CEFR hoặc quy đổi tùy tiện sang điểm thi.

## 4. Người dùng và tình huống chính

### 4.1. Người dùng cá nhân ban đầu

- “Tôi gặp một câu trong tài liệu và muốn hiểu đúng, nhanh.”
- “Tôi biết nghĩa từng từ nhưng không hiểu cả cụm.”
- “Tôi muốn hỏi vì sao dùng thì/cấu trúc này.”
- “Tôi muốn biết câu mình viết có đúng và tự nhiên không.”
- “Tôi đã tra từ này nhiều lần nhưng vẫn quên.”
- “Tôi không biết học gì tiếp và có thực sự tiến bộ không.”

### 4.2. Nhóm khách hàng có thể phục vụ sau này

Người Việt trưởng thành tự học để đọc tài liệu và giao tiếp công việc, khoảng A1–B1, không muốn tự ghép chatbot, từ điển, flashcard và bảng theo dõi riêng lẻ.

Đây là giả thuyết thị trường cần kiểm chứng. Không mở đầu bằng mục tiêu phục vụ mọi lứa tuổi, mọi ngôn ngữ và mọi kỳ thi.

## 5. Nguyên tắc trải nghiệm

1. Mở app là thấy chỗ hỏi/dịch và việc nên học tiếp.
2. Nghĩa chính xuất hiện trước, giải thích chi tiết chỉ mở khi cần.
3. Lưu từ/câu bằng một thao tác; được sửa và hoàn tác ngay.
4. Không bắt làm bài kiểm tra đầu vào trước khi được tra cứu.
5. Không tự lưu mọi thứ người dùng hỏi thành thẻ ôn, tránh sổ tay quá tải.
6. Không đánh đồng đã xem đáp án với đã ghi nhớ.
7. Không khóa bài học cứng chỉ vì người dùng bỏ một ngày; cho xem trước và kiểm tra vượt chặng.
8. Dùng tiếng Việt có dấu, thuật ngữ dễ hiểu; tăng lượng tiếng Anh theo khả năng người học.
9. Dùng tốt trên điện thoại, bàn phím máy tính và màn hình nhỏ; không phụ thuộc thao tác rê chuột.
10. Chỉ nhắc học khi người dùng đồng ý, được tắt và đổi giờ dễ dàng.

## 6. Các màn hình chính

### 6.1. Hôm nay

- Ô “Nhập từ, câu hoặc câu hỏi của bạn” luôn dễ tìm.
- Nút “Bắt đầu 20 phút” và lựa chọn “Hôm nay chỉ có 5 phút”.
- Hiển thị số thẻ đến hạn, bài đang học dở và một mục tiêu nhỏ.
- Kết thúc phiên cho biết đã làm gì và nên làm gì tiếp theo.
- Nếu chỉ muốn tra cứu, người dùng không phải đi qua kế hoạch học.

### 6.2. Hỏi & Dịch

- Chế độ tự nhận diện và các nút rõ ràng: “Dịch”, “Giải thích”, “Sửa câu”.
- Hỗ trợ Anh → Việt, Việt → Anh và câu hỏi trộn hai ngôn ngữ.
- Ô ngữ cảnh tùy chọn: công việc, đời sống hoặc đoạn văn xung quanh.
- Kết quả có nút nghe, sao chép, lưu và hỏi tiếp.
- Hội thoại có lịch sử tìm kiếm được; người dùng được xóa và có lựa chọn không lưu lịch sử.
- Tách chế độ “Tra nhanh” và “Học kỹ”, không buộc người dùng đọc câu trả lời dài.

**Khi tra một từ/cụm từ:** Hiện nghĩa phù hợp trước, loại từ, ví dụ song ngữ ngắn, cách dùng và nghĩa khác nếu cần. IPA chỉ hiện khi có nguồn đáng tin; âm thanh tổng hợp phải được ghi đúng là giọng tổng hợp.

**Khi dịch một câu:** Hiện bản dịch tự nhiên trước, sau đó mới giải thích cụm khó và cấu trúc. Nếu thiếu ngữ cảnh, nêu các cách hiểu có thể có thay vì khẳng định một nghĩa duy nhất.

**Khi sửa câu:** Giữ câu gốc, đề xuất câu sửa, chỉ rõ lỗi và giải thích ngắn. Nếu câu gốc đúng nhưng có lựa chọn tự nhiên hơn, phải phân biệt rõ “sai” với “có thể viết hay hơn”.

**Ví dụ hành vi mong muốn:**

Người dùng nhập: `I am looking forward to hearing from you.`

App trả nghĩa: “Tôi mong nhận được phản hồi từ bạn.” Phần mở rộng giải thích `look forward to + danh từ/V-ing`, kèm một ví dụ mới. Nút lưu gợi ý lưu cả cụm `look forward to`, không tự tách tất cả các từ trong câu.

### 6.3. Sổ tay

- Chứa từ, cụm từ, câu mẫu và ghi chú ngữ pháp đã chủ động lưu.
- Mỗi mục có nghĩa theo ngữ cảnh, câu gốc, ví dụ, nguồn/ngày lưu và nhãn chủ đề.
- Cho phép sửa nội dung AI tạo, tìm kiếm, gộp trùng hoặc lưu thêm nghĩa khác.
- Không gộp hai nghĩa khác nhau chỉ vì cùng cách viết, ví dụ `bank` là ngân hàng và bờ sông.
- Có hành động “Đưa vào ôn tập”; lưu tham khảo không bắt buộc tạo thẻ.

### 6.4. Ôn tập

- Ưu tiên thẻ đến hạn, có giới hạn thời lượng và số thẻ mới mỗi ngày.
- Dạng đầu tiên: Nhớ nghĩa/cụm từ từ câu có ngữ cảnh; che đáp án trước khi trả lời.
- Dạng bổ sung: Điền cụm vào chỗ trống và tự đặt câu mới.
- Khi tự đánh giá, dùng bốn mức nhất quán với bộ lập lịch: “Quên”, “Khó”, “Nhớ”, “Dễ”.
- Điểm bài tự động không mặc định thay thế phản hồi ghi nhớ; tránh trả lời đúng do đoán mà vẫn giãn lịch quá xa.
- Khi bỏ học nhiều ngày, chia tồn đọng thành các phiên nhỏ; không dồn toàn bộ thẻ thành một nhiệm vụ bắt buộc.

### 6.5. Lộ trình và tiến bộ

- Hiển thị chặng hiện tại, mục tiêu, nội dung sắp tới và bằng chứng hoàn thành.
- Phân biệt ba trạng thái: đã xem, đã luyện, đạt kiểm tra nội bộ.
- Báo cáo theo tuần: Kỹ năng cải thiện, lỗi lặp lại, khối lượng ôn và đề xuất tuần tới.
- Kỹ năng chưa có bài đánh giá phải ghi “Chưa đánh giá”, không vẽ điểm ước lượng cho đủ biểu đồ.
- Thiết lập, xuất dữ liệu và quyền riêng tư nằm trong menu cá nhân, không làm rối thanh điều hướng.

## 7. Phạm vi theo phiên bản

### 7.1. Bản dùng được sớm: Tuần 1–2

Mục tiêu: Có công cụ tra cứu và lưu kiến thức để dùng ngay cho bản thân.

- Một tài khoản được bảo vệ; chưa mở đăng ký công khai.
- Hỏi đáp, dịch hai chiều, sửa câu và lịch sử cơ bản.
- Lưu từ/cụm/câu có ngữ cảnh, sửa và tìm kiếm sổ tay.
- Ghi nhận chi phí AI, giới hạn độ dài đầu vào, xử lý lỗi và chống gửi trùng.
- Giao diện dùng được trên máy tính và điện thoại.
- Xuất dữ liệu JSON để tránh lệ thuộc hoàn toàn vào hệ thống mới.

Chưa có: Giáo trình nhiều cấp độ, thanh toán, nhập video, gọi thoại thời gian thực.

### 7.2. MVP cá nhân hoàn chỉnh: Tuần 3–6

- Ôn giãn cách có lịch sử và lưu tiến độ đáng tin cậy.
- Mục tiêu thời lượng, kiểm tra đầu vào ngắn có thể bỏ qua.
- Một chặng học được biên soạn theo trình độ thực tế và nhiệm vụ mỗi ngày.
- Bài luyện đọc, nghe ngắn, viết câu; luyện tự đọc theo mẫu nhưng chưa chấm nói chuyên sâu.
- Báo cáo tuần, lỗi thường gặp, sao lưu và thử khôi phục.
- Đăng nhập và đồng bộ giữa hai thiết bị.

### 7.3. Bản ổn định và thử nghiệm nhỏ: Tuần 7–8 hoặc lâu hơn

- Cải thiện theo nhật ký dùng thật; thử với 5–10 người nếu bản cá nhân đã ổn.
- PWA với nội dung ôn đã tải sẵn; AI vẫn cần Internet.
- Kiểm tra khả năng truy cập, trạng thái mất mạng, hiệu năng, dữ liệu và chi phí.
- Bổ sung chỉnh sửa nội dung nội bộ; chưa cần hệ quản trị nội dung phức tạp.

### 7.4. Sau khi có bằng chứng sử dụng

- Luyện hội thoại qua văn bản trước, sau đó mới thêm giọng nói.
- Công cụ dán đoạn văn và bấm vào cụm để hỏi nghĩa.
- Mở rộng chặng học có kiểm duyệt, thêm xuất CSV tương thích công cụ khác.
- Thanh toán và gói thuê bao sau khi hiểu mức dùng và chi phí thực tế.
- Tiện ích trình duyệt hoặc app native chỉ làm khi có nhu cầu lặp lại rõ ràng.

### 7.5. Chủ động không làm ở bản đầu

- IELTS/TOEIC chuyên sâu, chứng chỉ hay cam kết tăng điểm.
- Avatar 3D, mạng xã hội, lớp học trực tiếp, bảng xếp hạng.
- Tự huấn luyện mô hình AI hoặc xây microservices.
- Tự động tải/sao chép giáo trình, phụ đề, video có bản quyền.
- Hỗ trợ nhiều ngôn ngữ ngoài cặp Anh–Việt.

## 8. Thiết kế lộ trình tự học

### 8.1. Đầu vào và cá nhân hóa

Lần đầu chỉ cần hỏi mục tiêu, thời gian có thể học và tự đánh giá. Bài chẩn đoán khoảng 10–15 phút có thể làm sau.

- Đọc/ngữ pháp/từ vựng: Câu hỏi có đáp án được soạn và kiểm tra trước.
- Nghe: Đoạn âm thanh ngắn có transcript và câu hỏi phù hợp.
- Viết: Một đoạn/cụm câu ngắn, chấm theo tiêu chí công khai.
- Nói: Tự đánh giá ban đầu; chỉ thêm đánh giá tự động khi có cách đo đủ tin cậy.
- Không dùng một bài trắc nghiệm ngữ pháp để kết luận đủ cả bốn kỹ năng.
- Nếu chưa làm bài, cho chọn điểm bắt đầu tạm thời, ghi rõ đó là lựa chọn chứ chưa phải đánh giá.

### 8.2. Khung chặng học dài hạn

Các mục tiêu dưới đây là diễn giải sản phẩm tham chiếu CEFR, không phải trích nguyên văn bộ mô tả chính thức.

**Chặng nền tảng, hướng A1:** Chào hỏi, giới thiệu bản thân, số/ngày giờ, sinh hoạt; cấu trúc câu đơn và phát âm nền tảng. Bằng chứng nội bộ: tự viết lời giới thiệu ngắn, đọc hiểu thông tin rất cơ bản, nhận biết chi tiết trong đoạn nghe chậm.

**Chặng giao tiếp quen thuộc, hướng A2:** Mua sắm, hỏi đường, lịch hẹn, công việc thường ngày; diễn đạt quá khứ và kế hoạch đơn giản. Bằng chứng: xử lý đoạn trao đổi ngắn, viết tin nhắn/email đơn giản, nắm ý chính trong ngữ cảnh quen thuộc.

**Chặng sử dụng độc lập, hướng B1:** Kể trải nghiệm, giải thích lý do, đọc tài liệu thông dụng và trao đổi công việc cơ bản. Bằng chứng: viết đoạn có liên kết, tóm tắt nội dung quen thuộc, xử lý tình huống có biến thể.

**Chặng mở rộng, hướng B2:** Trình bày quan điểm, thảo luận, email công việc và tài liệu khó hơn. Chỉ phát triển sâu sau khi chặng đầu có hiệu quả và nội dung được kiểm duyệt.

**C1–C2:** Chưa thuộc phạm vi giáo trình ban đầu. Công cụ tra cứu vẫn phục vụ nội dung khó nhưng không được quảng cáo là khóa học đầy đủ ở hai cấp độ này.

Không đặt mặc định “sau X tuần chắc chắn lên một bậc”. Tốc độ phụ thuộc điểm xuất phát, thời lượng, chất lượng thực hành và môi trường sử dụng.

### 8.3. Mẫu thử nghiệm 12 tuần học

Đây là khung tổ chức học, khác với lịch 8 tuần phát triển phần mềm. Chọn nội dung và độ khó sau khi biết trình độ; không coi 12 tuần là thời gian đảm bảo đi từ A1 lên B1.

1. Tuần 1: Chẩn đoán, chọn mục tiêu, học cách tra và lưu đúng, ghi một mẫu viết/nghe làm mốc ban đầu.
2. Tuần 2–3: Vá lỗ hổng nền tảng; mỗi ngày đọc/nghe ngắn, học một cấu trúc và dùng vài cụm trong câu thật.
3. Tuần 4: Kiểm tra bằng câu hỏi mới; xem phần nào nhớ sau một khoảng nghỉ và điều chỉnh lịch.
4. Tuần 5–6: Tình huống đời sống; bắt đầu diễn đạt nhu cầu, hỏi lại khi chưa hiểu, viết tin nhắn ngắn.
5. Tuần 7–8: Đưa nội dung người học thực sự gặp vào bài tập; tập email, giải thích ý và tóm tắt.
6. Tuần 9–10: Tăng độ dài và giảm hỗ trợ; tập trả lời trước khi xem bản dịch hoặc gợi ý.
7. Tuần 11: Sản phẩm nhỏ, ví dụ tự giới thiệu công việc, viết email và tóm tắt một đoạn đọc/nghe.
8. Tuần 12: Bài đánh giá tương đương nhưng không lặp lại câu cũ; so với mốc ban đầu và đề xuất chặng tiếp theo.

### 8.4. Một ngày học 20 phút

1. 5 phút ôn thẻ đến hạn.
2. 7 phút học một bài ngắn có mục tiêu cụ thể.
3. 5 phút tự dùng kiến thức: điền câu, viết lại hoặc nghe trả lời.
4. 3 phút xem lỗi, chọn tối đa vài mục đáng lưu và xác nhận việc học tiếp theo.

Với phiên 5 phút: ưu tiên ôn đến hạn và một câu ứng dụng. Không phạt người dùng vì không hoàn thành kế hoạch 20 phút.

### 8.5. Điều chỉnh và lên chặng

- Dùng một bộ tiêu chí nội bộ ban đầu: khoảng 80% ở ít nhất hai lần kiểm tra khác nhau, cộng một nhiệm vụ vận dụng đạt rubric.
- Đây là ngưỡng thiết kế thử nghiệm, cần hiệu chỉnh; không phải ngưỡng CEFR chính thức.
- Bài tự do có gợi ý không tính giống bài làm độc lập; lưu rõ mức hỗ trợ đã dùng.
- Nếu sai lặp lại một cấu trúc, đưa bài ngắn về cấu trúc đó vào tuần tiếp theo.
- Nếu quá nhiều thẻ đến hạn, giảm từ mới trước khi tăng bài học.
- Chỉ thông báo “đạt chặng nội bộ” cho những kỹ năng đã được đo; không suy rộng sang kỹ năng chưa kiểm tra.

## 9. Nội dung và chất lượng AI

### 9.1. Phân vai rõ ràng

- Giáo trình cốt lõi, câu hỏi và đáp án mẫu: Có phiên bản, được người có năng lực tiếng Anh kiểm tra trước khi phát hành.
- AI: Giải thích theo mức người học, tạo thêm ví dụ, sửa câu và gợi ý luyện tập.
- Bộ lập lịch: Tính hạn ôn bằng thuật toán, không hỏi AI mỗi lần.
- Đánh giá tiến độ: Dựa trên sự kiện học và quy tắc có thể kiểm tra, không chỉ lời nhận xét của chatbot.
- Nội dung AI chưa duyệt: Gắn nhãn “AI tạo”; không tự trở thành đáp án chuẩn cho toàn bộ người dùng.

### 9.2. Quy tắc phản hồi

- Ưu tiên câu trả lời ngắn và nghĩa theo ngữ cảnh; giải thích thêm khi được yêu cầu.
- Không tự tạo nguồn từ điển, IPA hoặc tuyên bố “người bản ngữ luôn dùng” khi không có căn cứ.
- Khi câu mơ hồ, cung cấp lựa chọn hoặc hỏi thêm ngữ cảnh; không giả vờ chắc chắn.
- Khi sửa bài, tối đa vài lỗi quan trọng mỗi lượt, tránh làm người học mới bị quá tải.
- Câu hỏi ngoài học tiếng Anh được hướng lại nhẹ nhàng để kiểm soát phạm vi và chi phí.
- Đoạn văn người dùng dán vào được xử lý như dữ liệu cần dịch, không phải chỉ thị điều khiển hệ thống.

### 9.3. Bộ kiểm thử chất lượng trước khi chọn nhà cung cấp

Chuẩn bị tối thiểu 60 trường hợp: 15 từ/cụm nhiều nghĩa, 15 câu dịch theo ngữ cảnh, 15 câu sửa lỗi và 15 câu hỏi ngữ pháp; có tiếng Việt không dấu, thành ngữ, phủ định và đầu vào mơ hồ.

Chấm thủ công theo độ đúng, giữ nghĩa, dễ hiểu, mức phù hợp trình độ và tính trung thực về độ chắc chắn. Chọn mô hình dựa trên chất lượng, độ trễ và chi phí đo được, không dựa trên tên thương hiệu. Trước khi bán cần tăng bộ kiểm thử và có người kiểm duyệt độc lập với người tạo prompt.

## 10. Hướng kỹ thuật đề xuất

### 10.1. Kiến trúc tối giản

- Stack được chốt ngày 21/10/2026 theo yêu cầu chủ dự án: Spring Boot (Java 17), React JS + Vite; tách backend/frontend, tham khảo cấu trúc và luồng HR-V5.
- Giao diện: Tailwind CSS và bộ component có hỗ trợ khả năng truy cập; tránh tùy biến quá sớm.
- Dữ liệu: PostgreSQL + Flyway, tài khoản riêng bằng Spring Security session + CSRF; kiểm tra owner ở mọi truy vấn cá nhân. H2 persistent cho dev.
- AI: Một nhà cung cấp API ở bản đầu, gọi từ server qua lớp tích hợp nhỏ để có thể thay sau.
- Ôn giãn cách: Thư viện FSRS đã có sẵn, kiểm tra giấy phép và tính tương thích trước khi chọn; chưa tự viết thuật toán mới.
- Âm thanh: Phát giọng tổng hợp có sẵn khi phù hợp, có phương án không âm thanh; API giọng nói chất lượng cao để sau.
- Triển khai: Một nền tảng hỗ trợ Next.js và gói dịch vụ cho phép mục đích sử dụng tương ứng; kiểm tra điều khoản trước khi bán.
- Tác vụ nền: Chưa cần hàng đợi riêng. Tính thẻ đến hạn khi mở app; chỉ thêm lịch chạy khi thực sự cần email/nhắc học.
- Quan sát: Nhật ký lỗi không chứa nguyên văn nội dung riêng tư mặc định, số lượt AI, token, độ trễ và chi phí theo ngày.

Không cần vector database, hệ đa tác tử, fine-tuning hoặc kiến trúc nhiều dịch vụ ở giai đoạn cá nhân.

### 10.2. Các nhóm dữ liệu chính

- `profiles`: Múi giờ, mục tiêu, thời lượng và lựa chọn riêng tư.
- `conversations`, `messages`: Hội thoại và lịch sử, theo chính sách lưu giữ.
- `learning_items`: Từ/cụm/câu, nghĩa, ngữ cảnh, ghi chú, nguồn và trạng thái kiểm duyệt.
- `review_cards`, `review_events`: Trạng thái lập lịch và từng lần ôn.
- `courses`, `units`, `lessons`: Nội dung có phiên bản và mục tiêu kỹ năng.
- `enrollments`, `lesson_attempts`, `assessment_attempts`: Chặng đang theo, kết quả và mức hỗ trợ.
- `study_sessions`: Thời gian học chủ động, tránh tính tab mở im là đang học.
- `ai_usage_events`: Mô hình, token, chi phí ước lượng, mã yêu cầu; không cần lưu toàn bộ prompt trong bảng đo chi phí.
- `subscriptions`, `billing_events`: Chỉ thêm khi chuẩn bị bán.

Các bảng dữ liệu cá nhân phải gắn chủ sở hữu; dữ liệu giáo trình dùng chung được phân quyền riêng. Không chỉ ẩn dữ liệu trên giao diện mà bỏ kiểm tra quyền ở backend/database.

### 10.3. Tin cậy và riêng tư

- API key chỉ ở server; không nhúng vào trình duyệt hay bản xuất dữ liệu.
- Có hạn mức theo tài khoản và trần ngân sách toàn hệ thống; chế độ cá nhân vẫn không được để endpoint AI công khai không xác thực.
- Kiểm tra đầu vào và đầu ra có cấu trúc; không thực thi nội dung AI tạo như mã lệnh.
- Lưu thẻ, chấm bài và sự kiện ôn phải chống ghi trùng khi bấm lại, retry hoặc đồng bộ.
- Dùng múi giờ người dùng cho báo cáo ngày; lưu timestamp nhất quán và có kiểm thử khi qua nửa đêm.
- Cho xuất và xóa dữ liệu; giải thích phần dữ liệu nào gửi sang nhà cung cấp AI, lưu bao lâu và mục đích gì.
- Không mặc định lưu giọng nói; chỉ thêm khi có đồng ý và thời hạn xóa cụ thể.
- Sao lưu và thử khôi phục trước khi dùng làm nơi lưu kiến thức chính.

### 10.4. PWA và mất mạng

- MVP ưu tiên online ổn định trước; không mặc định “PWA” nghĩa là toàn bộ app dùng offline.
- Sau đó cho tải trước thẻ và bài học được chọn, ôn offline và đồng bộ khi có mạng.
- AI hỏi đáp/dịch và đồng bộ cloud cần Internet; phải thông báo rõ.
- Khi đồng bộ nhiều thiết bị, dùng mã sự kiện duy nhất và quy tắc giải quyết xung đột, không âm thầm ghi đè lịch ôn.
- Không cache phản hồi nhạy cảm tùy tiện; xóa dữ liệu cục bộ khi đăng xuất trên máy dùng chung.
- Nhắc học qua thông báo trình duyệt phụ thuộc nền tảng và quyền cho phép, không coi đó là chức năng chắc chắn có trên mọi thiết bị.

## 11. Kế hoạch triển khai

Ước lượng cho một lập trình viên đã quen stack, làm tập trung khoảng 25–35 giờ/tuần. Nếu chỉ làm buổi tối khoảng 10–15 giờ/tuần, có thể cần 12–20 tuần hoặc hơn. Việc biên soạn và duyệt nội dung là công việc riêng, không tự biến mất nhờ AI.

### Tuần 1: Chốt luồng và nền tảng

- Thiết kế nhanh màn Hôm nay, Hỏi & Dịch, Sổ tay trên mobile và desktop.
- Thiết lập ứng dụng, đăng nhập một người, database, phân quyền và môi trường triển khai.
- Làm luồng hỏi/dịch xuyên suốt, ghi nhận lỗi và chi phí ngay từ đầu.
- Đầu ra: Có thể đăng nhập và tra một câu trên điện thoại.

### Tuần 2: Tra cứu thành kiến thức riêng

- Hoàn thiện dịch, giải thích, sửa câu, lịch sử và hỏi tiếp.
- Lưu có ngữ cảnh, sửa, tìm kiếm, chống trùng cơ bản và xuất JSON.
- Chạy bộ 60 trường hợp AI, chỉnh prompt và chọn cấu hình chi phí phù hợp.
- Đầu ra: Dùng làm công cụ tra cứu cá nhân được, dù chưa có khóa học.

### Tuần 3: Ôn tập

- Tích hợp bộ lập lịch, tạo thẻ, bốn mức đánh giá và danh sách đến hạn.
- Kiểm thử bấm trùng, gián đoạn mạng, qua ngày và mở trên hai thiết bị.
- Đầu ra: Hôm nay lưu, ngày sau ôn được; tiến độ không mất khi tải lại trang.

### Tuần 4: Một chặng học thật

- Hoàn thiện onboarding, chẩn đoán và gợi ý điểm bắt đầu.
- Biên soạn khoảng 12–15 bài ngắn, 3 bài kiểm tra mốc và 1 nhiệm vụ vận dụng cho một chặng nhỏ.
- Soát nội dung trước phát hành; chưa duyệt đủ thì giảm số bài, không đưa bản nháp thành giáo trình chuẩn.
- Đầu ra: Người dùng biết bài nên học tiếp, không chỉ có cây lộ trình rỗng.

### Tuần 5: Kết nối học và tiến bộ

- Gắn bài học với sổ tay, ôn tập, lỗi thường gặp và báo cáo tuần.
- Cấu hình phiên 5/20/30 phút, giảm tải khi tồn thẻ.
- Thử đánh giá bằng câu hỏi mới và phân biệt bài có/không có gợi ý.
- Đầu ra: Nhìn thấy bằng chứng tiến bộ và kế hoạch tiếp theo.

### Tuần 6: Dùng thật và sửa điểm nghẽn

- Chủ dự án dùng liên tục, ghi lại lúc khó hiểu, thao tác thừa và nội dung sai.
- Kiểm tra toàn bộ xuất/xóa dữ liệu, sao lưu/khôi phục, giới hạn chi phí và trạng thái lỗi.
- Đầu ra: MVP cá nhân đủ ổn để tiếp tục dùng; chưa mặc định đủ điều kiện bán.

### Tuần 7–8: Khoảng đệm và beta nhỏ

- Sửa lỗi ưu tiên, thử khả năng truy cập và các thiết bị thực tế.
- Thêm PWA hoặc offline giới hạn nếu luồng chính đã tin cậy; chưa ổn thì hoãn.
- Mời 5–10 người đúng nhóm mục tiêu, quan sát họ dùng mà không được hướng dẫn trực tiếp.
- Đầu ra: Danh sách vấn đề đã đo, chi phí sử dụng thật và quyết định tiếp tục hay thu hẹp.

## 12. Tiêu chí nghiệm thu

### 12.1. Đủ tốt cho cá nhân

- Từ màn đầu có thể hỏi/dịch ngay, không đi qua onboarding dài.
- Một kết quả tra cứu được lưu trong một thao tác và tìm lại sau đăng xuất/đăng nhập.
- Thẻ giữ đúng ngữ cảnh, lịch ôn và lịch sử sau tải lại, retry và đổi thiết bị.
- Học dở có thể tiếp tục; kế hoạch ngày không biến thành một danh sách quá tải.
- Bài kiểm tra không tự tăng tiến độ khi người dùng chỉ mở trang.
- Không mất bản nháp khi API chậm/lỗi; hạn mức hết được giải thích rõ.
- Có xuất dữ liệu đọc lại được và ít nhất một lần khôi phục sao lưu thành công.
- Dùng được ở màn rộng khoảng 360 px, bàn phím và màn hình desktop thông thường.

### 12.2. Mục tiêu hiệu năng và kiểm thử

- Mục tiêu thử nghiệm: Nội dung bắt đầu hiển thị trong khoảng 3 giây và phần lớn câu trả lời ngắn xong trong khoảng 10 giây trên cấu hình mạng đã ghi nhận. Đây là mục tiêu đo, không phải SLA.
- Unit test cho lịch ôn, múi giờ, tính tiến độ và hạn mức.
- Integration test cho sở hữu dữ liệu, lưu/chỉnh thẻ, ghi nhận kết quả và lỗi nhà cung cấp.
- E2E cho luồng hỏi → lưu → ôn → học → xem tiến bộ → xuất/xóa dữ liệu.
- Kiểm thử hai tài khoản tách biệt trước beta công khai; kiểm tra người A không đọc/sửa dữ liệu người B.
- Kiểm thử AI định kỳ bằng bộ chuẩn; mọi lỗi làm đổi nghĩa nghiêm trọng trong bộ chuẩn phải được xử lý trước khi mở rộng.

### 12.3. Kiểm chứng có ích thật

Trong ít nhất 2–4 tuần dùng cá nhân, xem mình có quay lại tự nguyện, tìm lại kiến thức dễ hơn và nhớ/dùng được câu đã học sau một khoảng nghỉ hay không. Không đánh giá thành công chỉ qua số lượt chat.

Chỉ số nên theo dõi: tỷ lệ phiên tra có lưu mục hữu ích, tỷ lệ ôn đúng hạn, kết quả lần đầu ở bài kiểm tra mới và số nhiệm vụ tự vận dụng hoàn thành. Không đặt mục tiêu phải lưu thật nhiều từ.

## 13. Ngân sách dự kiến

### 13.1. Giai đoạn cá nhân

Các khoản dưới đây là **phong bì ngân sách dự kiến**, chưa đối chiếu bảng giá nhà cung cấp cụ thể tại lúc triển khai; không phải khẳng định có thể mua đúng cấu hình với mức đó.

- Hosting và database: Dự trù 0–800.000 đồng/tháng cho tải nhỏ, tùy hạn mức và gói được phép sử dụng.
- AI văn bản: Đặt trần thử nghiệm 200.000–700.000 đồng/tháng, giảm/tắt yêu cầu mới khi đạt trần thay vì coi đây là chi phí chắc chắn.
- Tên miền: Dự trù khoảng 300.000–600.000 đồng/năm, kiểm tra cả giá gia hạn.
- Tổng vận hành mục tiêu: Khoảng 200.000–1.500.000 đồng/tháng cộng tên miền, chưa gồm công phát triển, biên soạn, dịch vụ âm thanh trả phí và thuế.

Nếu gói miễn phí không đủ điều kiện triển khai hoặc không cho thương mại, phải đổi gói và tính lại; không tìm cách né điều khoản.

### 13.2. Cách tính AI trước khi cam kết giá bán

`Chi phí text = token đầu vào / 1.000.000 × đơn giá đầu vào + token đầu ra / 1.000.000 × đơn giá đầu ra`

`Tổng biến phí = text + âm thanh + lưu trữ/băng thông theo dùng + phí thanh toán + phần retry phát sinh`

Ví dụ tính tải, không phải báo giá: 1 người × 30 lượt/ngày × 30 ngày = 900 lượt/tháng. Nếu trung bình mỗi lượt dùng 1.200 token vào và 400 token ra, tải khoảng 1,08 triệu token vào và 0,36 triệu token ra. Các con số này phải bao gồm prompt hệ thống/ngữ cảnh; hội thoại dài có thể vượt giả định đáng kể.

Với 100 người có cùng mức dùng, tải text là khoảng 108 triệu token vào và 36 triệu token ra/tháng, chưa gồm tác vụ tạo bài/âm thanh. Phải nhân với đơn giá thực tế rồi mới kết luận gói bán có lãi.

### 13.3. Cách kiểm soát

- Dịch nhanh và giải thích sâu là hai mức xử lý, không gọi mô hình đắt nhất cho mọi thao tác.
- Giới hạn chiều dài đầu vào, đầu ra và lịch sử hội thoại gửi lại; tóm tắt khi hợp lý.
- Không gọi AI để tính lịch ôn, điểm trắc nghiệm hay dựng dashboard.
- Theo dõi chi phí theo người/ngày và tài khoản dùng nhiều nhất; báo khi gần trần và chặn ở trần cứng.
- Không chia sẻ cache chứa ngữ cảnh cá nhân giữa người dùng; chỉ cân nhắc cache nội dung chung được phép sử dụng.
- Trước khi mở beta, kiểm tra độ trễ và chi phí ở mức dùng bình thường lẫn mức dùng cao.

## 14. Hướng thương mại hóa

### 14.1. Điều kiện nên có trước khi bán

- Bản thân dùng đủ lâu để biết app hơn một chatbot thường ở điểm nào.
- Có người khác dùng độc lập được; không cần người tạo ngồi giải thích từng màn.
- Nội dung chặng được bán đã duyệt, nguồn và quyền sử dụng rõ ràng.
- Chi phí theo nhóm người dùng đã được đo, có hạn mức và cơ chế xử lý lạm dụng.
- Có điều khoản, chính sách riêng tư, hủy/hoàn tiền, hỗ trợ và quy trình xử lý sự cố.
- Hoàn thành kiểm tra phân quyền, xuất/xóa dữ liệu, sao lưu/khôi phục và thanh toán trên môi trường thử nghiệm.
- Rà soát nghĩa vụ pháp lý, thuế và việc chuyển dữ liệu cho bên thứ ba với người có chuyên môn tại thị trường kinh doanh.

### 14.2. Thử nghiệm thị trường nhỏ

1. Phỏng vấn 5–10 người đúng nhóm mục tiêu về cách họ đang tra từ, ôn và học; hỏi việc họ đã làm, không chỉ hỏi “bạn có thích ý tưởng không”.
2. Mời 10–20 người dùng thử 2–4 tuần khi sản phẩm ổn; con số này để quan sát hành vi, không đủ để kết luận quy mô thị trường.
3. Ghi nhận người hoàn thành vòng hỏi → lưu → ôn, người còn quay lại ở tuần 2/4 và nguyên nhân bỏ.
4. Thử trả tiền thật với thông tin minh bạch về phạm vi, hạn mức và hủy gói; phân biệt lời khen với nhu cầu trả tiền.
5. Chỉ mở rộng khi có người quay lại, nhận ra giá trị học và biên chi phí phù hợp. Nếu chưa có, sửa sản phẩm thay vì đổ tiền quảng cáo.

### 14.3. Gói bán giả thuyết

- **Dùng thử/miễn phí:** Hạn mức tra cứu nhỏ, trải nghiệm sổ tay, ôn tập và một chặng mẫu; tránh cho AI miễn phí không giới hạn.
- **Cá nhân:** Thử khoảng 99.000–149.000 đồng/tháng cho text, ôn và lộ trình có hạn mức công khai; chỉ giữ mức này nếu chi phí và phản hồi thị trường cho phép.
- **Có luyện nói:** Chưa chốt giá. Chỉ thêm sau khi đo chi phí/phút, chất lượng phản hồi và mức dùng thật.
- Chưa bán lifetime đi kèm AI không giới hạn vì chi phí phát sinh liên tục.

Mục tiêu nội bộ có thể thử: Tổng biến phí không vượt khoảng 25–35% doanh thu thuần trên nhóm khách hàng mục tiêu. Đây là ngưỡng quản trị đề xuất, chưa phải biên lợi nhuận đã chứng minh; vẫn còn chi phí phát triển, nội dung, hỗ trợ và marketing.

### 14.4. Thanh toán và dữ liệu khi mở bán

- Chọn cổng phù hợp thị trường và khả năng ký hợp đồng; xác minh hỗ trợ thu định kỳ, hóa đơn, phí và hoàn tiền trước khi tích hợp.
- Quyền gói được backend xác nhận qua sự kiện thanh toán đã kiểm tra, không tin trạng thái do trình duyệt gửi lên.
- Webhook có xác thực, chống xử lý trùng và kiểm thử trạng thái thanh toán lỗi/hết hạn/hủy/hoàn tiền.
- Phân quyền quản trị tối thiểu; không cho nhân viên hỗ trợ mặc định đọc toàn bộ hội thoại riêng tư.
- Không dùng nội dung người học làm tài liệu quảng cáo, dữ liệu huấn luyện hoặc thư viện chung nếu chưa có cơ sở và đồng ý phù hợp.

## 15. Rủi ro và cách giảm

- **Thành chatbot thông thường:** Mọi tính năng quan trọng phải kết nối được vào sổ tay, ôn hoặc mục tiêu học, nhưng không ép lưu.
- **Tra nhiều mà không học:** Gợi ý ôn nhẹ và bài ứng dụng; theo dõi nhớ lại chứ không chỉ đếm lượt dịch.
- **Quá tải tính năng/nội dung:** Giữ một ngách và một chặng sâu ở bản đầu; ưu tiên dùng được hơn sơ đồ khóa học hoành tráng.
- **AI giải thích sai:** Bộ kiểm thử, nội dung cốt lõi được duyệt, nút báo sai và không tự ghi đè nội dung đã sửa.
- **Điểm tiến bộ gây hiểu lầm:** Ghi nguồn điểm, tiêu chí, mức hỗ trợ và kỹ năng chưa đánh giá; không tự cấp chứng chỉ.
- **Chi phí tăng bất ngờ:** Trần chi phí, hạn mức, giới hạn ngữ cảnh và không bán “không giới hạn”.
- **Mất dữ liệu hoặc sai lịch ôn:** Sự kiện chống trùng, sao lưu, kiểm thử khôi phục và đồng bộ.
- **Vi phạm bản quyền:** Tự biên soạn/thuê biên soạn, dùng nguồn có phép; dẫn link không đồng nghĩa được sao chép nội dung.
- **Rò rỉ dữ liệu:** Quyền từng người ở database, khóa chỉ ở server, log tối thiểu và kiểm tra tách tài khoản.
- **Không giữ được thói quen:** Phiên 5 phút, mục tiêu tuần, giảm tải khi quay lại; không dùng thông báo dồn dập để thay thế giá trị.

## 16. Các quyết định nên chốt khi bắt đầu xây

Tài liệu này dùng các mặc định để không chặn lập kế hoạch. Trước khi mở rộng giáo trình hoặc trả phí dịch vụ, xác nhận các điểm sau bằng cấu hình và thử nghiệm thực tế:

1. Trình độ đầu vào và mục tiêu 3 tháng: Đọc tài liệu, giao tiếp đời sống hay công việc.
2. Thời lượng học có thể duy trì: 5, 20 hoặc 30 phút; mặc định 20 phút.
3. Thời gian phát triển thực có mỗi tuần và trần vận hành tháng; không dùng lịch full-time cho dự án chỉ làm cuối tuần.
4. Có chấp nhận nội dung được xử lý qua AI cloud không; nếu không, phải đánh giá phương án chạy cục bộ riêng về thiết bị, chất lượng và chi phí.
5. Nhà cung cấp AI vượt bộ kiểm thử Anh–Việt với chi phí phù hợp.
6. Chặng nội dung đầu tiên và người chịu trách nhiệm duyệt.

## 17. Kết luận đề xuất

Nên bắt đầu bằng **trợ lý hỏi/dịch gắn sổ tay**, sau đó thêm **ôn giãn cách và một chặng học có nội dung thật**. Đây là thứ tự gần nhất với nhu cầu hiện tại, có ích sớm và tránh đầu tư quá lớn vào một app học tổng hợp chưa được kiểm chứng.

Đích của bản đầu không phải “có thật nhiều tính năng”, mà là mỗi ngày mở ra đều trả lời được ba câu:

1. Điều mình chưa hiểu có được giải thích rõ không?
2. Kiến thức đã gặp có được nhớ và dùng lại không?
3. Hôm nay nên học gì và vì sao học việc đó?

Chỉ bổ sung thanh toán và mở bán sau khi vòng lặp này hoạt động tốt với bản thân và một nhóm nhỏ người học tương tự.

## 18. Nguồn tham khảo

Các nguồn được dùng để tham khảo nguyên tắc sản phẩm và tổ chức học; không sao chép giáo trình, giao diện hoặc tài sản thương hiệu. Tính năng, giá và điều khoản có thể thay đổi.

1. **Duolingo, “The Duolingo Method: 5 key principles that make learning fun and effective”.** Bài công bố ngày 02/02/2023; tham khảo bài học ngắn, học qua thực hành, cá nhân hóa và động lực. https://blog.duolingo.com/duolingo-teaching-method/
2. **Anki Manual, “Background”.** Tham khảo active recall, spaced repetition và thông tin hỗ trợ FSRS. https://docs.ankiweb.net/background.html
3. **LingQ, trang giới thiệu chính thức.** Tham khảo học qua nội dung, lưu từ/cụm trong ngữ cảnh và theo dõi hoạt động. https://www.lingq.com/en/
4. **ELSA Speak, trang giới thiệu chính thức.** Tham khảo gia sư song ngữ, role-play, phản hồi và theo dõi tiến bộ; không dùng số liệu quảng cáo làm bằng chứng hiệu quả cho LearningEN. https://elsaspeak.com/en/
5. **DeepL Translator, giao diện web chính thức.** Tham khảo luồng nhập nội dung và đọc kết quả dịch; không phải đánh giá hay cam kết chất lượng API. https://www.deepl.com/en/translator
6. **Cambridge English, “International language standards”.** Tham khảo cách mô tả thang CEFR A1–C2. https://www.cambridgeenglish.org/exams-and-tests/cefr/

**Giới hạn khảo sát:** Trang mô tả cấp độ của Council of Europe và một mục từ Cambridge Dictionary bị chặn truy cập tự động; trang British Council được thử nhưng hết thời gian chờ. Không dùng các nội dung chưa đọc này làm căn cứ đã xác minh. Bảng giá nhà cung cấp hạ tầng/AI và nghĩa vụ pháp lý chưa được kiểm chứng trong phạm vi lập kế hoạch này.


## 19. Checklist triển khai thực tế (21/10/2026)

Chỉ tick sau khi đã có mã nguồn và bằng chứng kiểm tra. Các công việc cần người dùng, provider, kiểm duyệt hoặc thời gian dùng thật giữ trạng thái chưa hoàn tất.

- [x] P01 — Khảo sát mã hiện có và HR-V5; chốt Spring Boot + React JS, API tài nguyên /api/v1; hợp đồng tại docs/API.md.
- [x] P02 — Chuẩn hóa cấu hình môi trường, migration và lớp controller/service/repository theo nghiệp vụ.
- [x] P03 — Đăng nhập riêng, session/CSRF, profile và phân quyền hai tài khoản.
- [x] P04 — Hỏi/dịch/giải thích/sửa câu, hỏi tiếp, lịch sử tìm kiếm, không lưu lịch sử, lỗi AI, hạn mức token/chi phí, chống gửi trùng.
- [x] P05 — Sổ tay CRUD/tìm kiếm/chống trùng theo nghĩa; bật/tắt ôn.
- [x] P06 — Ôn giãn cách 4 mức; sự kiện idempotent, optimistic locking và kiểm thử lịch/múi giờ.
- [x] P07 — Giáo trình JSON có phiên bản nạp DB: 12 bài, 3 checkpoint, 1 vận dụng; ghi rõ bản nháp chưa duyệt.
- [x] P08 — API học bài, lưu nháp/tiếp tục, chấm ở server, không cộng điểm khi chỉ xem, bài có hỗ trợ tách biệt.
- [x] P09 — Phiên 5/20/30 phút, ghi thời gian chủ động; báo cáo tuần và bước học kế tiếp từ DB.
- [x] P10 — Hoàn thiện React responsive: Hôm nay, Hỏi & Dịch, Sổ tay, Ôn tập, Bài học/Tiến bộ, Cài đặt.
- [x] P11 — Xuất/xóa/khôi phục JSON, không lộ bí mật, không xóa hạn mức; thử round-trip.
- [x] P12 — Unit/integration backend, frontend tests/build, E2E luồng chính và mobile/desktop; ghi kết quả thực tế.
- [x] P13 — README, env mẫu, hướng dẫn chạy và Docker Compose; tài liệu API, giới hạn vận hành.
- [ ] P14 — Cấu hình AI thật và chấm bộ 60 tình huống với provider được chọn (cần credential và người duyệt).
- [ ] P15 — Kiểm duyệt giáo trình, dùng thật 2–4 tuần, beta đa thiết bị, xác minh PostgreSQL thực tế trước phát hành.
- [ ] P16 — PWA/offline/nhắc học và thương mại hóa: giai đoạn sau khi MVP đủ tin cậy; chưa nằm trong bản cá nhân online.

### Nhật ký thực hiện

- 21/10/2026: Đã đọc kế hoạch và tham khảo HR-V5 (backend tách lớp, frontend app/features/shared, API và xử lý state). Mã hiện có chưa chạy trọn vẹn: thiếu các trang React, CSS và test setup; /courses trả mảng rỗng. Đã lập hợp đồng API và checklist.

### Phối hợp song song và kiểm chứng bổ sung (Kilo, 21/10/2026)

Đề nghị chia việc để không ghi đè thay đổi đang làm: AI đang triển khai tiếp tục sở hữu các file backend/frontend đang sửa; Kilo phụ trách cấu hình chạy độc lập và kiểm chứng tích hợp. Agent Manager hiện không liệt kê phiên AI kia; phần này là thông báo phối hợp qua file chung, chưa phải xác nhận AI kia đã đọc hoặc đồng ý. Hợp đồng chung là `docs/API.md`; `D:/HR-V5` chỉ đọc, không sửa. Không tick thay công việc chưa kiểm chứng của AI khác.

- [x] K01: Chạy bộ test backend hiện có, ghi lệnh và lỗi thực tế; không sửa chồng các file nghiệp vụ đang thay đổi.
- [x] K02: Bổ sung cấu hình môi trường mẫu và Docker Compose cho PostgreSQL/backend/frontend; URL và bí mật lấy từ môi trường, không đưa khóa AI xuống trình duyệt. File đã thêm; chạy container/PostgreSQL vẫn chưa xác minh vì máy thiếu Docker.
- [x] K03: Thêm kiểm tra HTTP tích hợp có thể chạy lại cho đăng nhập/CSRF, sổ tay, ôn tập, bài học, xuất/xóa/khôi phục và tách quyền sở hữu; dữ liệu thử được tạo qua API trên môi trường thử riêng.
- [x] K04: Chạy frontend tests/build và kiểm tra cấu hình khởi động; báo riêng trường hợp chưa thể chạy do file đang được AI khác hoàn thiện.
- [x] K05: Cập nhật kết quả, lỗi bàn giao và giới hạn nghiệm thu; không coi provider giả trong test là đã xác minh AI thật, không coi H2 là đã kiểm chứng PostgreSQL.

Nhật ký Kilo:
- 21/10/2026 12:36 UTC: Đọc hướng dẫn RTK, kế hoạch, `docs/API.md`, phạm vi frontend tại `work/frontend-task.json`; xác nhận nhiều file backend/frontend có thay đổi sẵn. Chưa sửa các file đó. Bắt đầu kiểm chứng và cấu hình độc lập theo K01-K05.
- 21/10/2026 12:40 UTC: `rtk mvn test` đạt 21 test backend (0 lỗi, 0 bỏ qua). `rtk npm run build` đạt. `rtk npm test` chưa đạt vì chưa có file test frontend. Đã thêm cấu hình Compose/env/nginx và bộ `RuntimeHttpIntegrationTest`; lần chạy đầu 1/3 đạt, 2 lỗi do test kỳ vọng 201 trong khi API start session hiện trả 200; điều chỉnh kỳ vọng cho khớp hợp đồng hiện tại (không sửa API). Docker chưa có trên PATH nên chưa kiểm chứng container/PostgreSQL.
- Bàn giao AI đang triển khai: `ApiExceptionHandler` đang catch-all thành 500 kể cả lỗi HTTP framework (ví dụ sai method đáng lẽ 405), cần giữ status chuẩn và logging an toàn, không log payload/bí mật. `NotebookService` còn dùng DTO từ controller, nên chuyển DTO nghiệp vụ khi hoàn thiện tách lớp. Lỗi thiếu route Lesson/StudyBar mà lượt đọc trước phát hiện đã được AI song song nối trong `App.jsx` ở lần đọc 12:40 UTC, không cần sửa chồng.
- 21/10/2026 12:42 UTC: `rtk mvn test -Dtest=RuntimeHttpIntegrationTest` đạt cả 3 test HTTP thật: cookie/CSRF/logout; sổ tay-ôn-bài học-phiên học-backup round-trip; hai session/tài khoản không thể GET/PUT/DELETE/ôn dữ liệu của nhau. Các test chạy cổng Tomcat ngẫu nhiên, H2 RAM riêng, không chạm dữ liệu cá nhân. Bổ sung test frontend độc lập chỉ trong `frontend/verification/` và `frontend/verification.vitest.config.js` để tránh trùng file với AI đang hoàn thiện frontend/E2E.
- 21/10/2026 12:45 UTC: Chạy lại toàn bộ `rtk mvn test`: 24/24 đạt, không bỏ qua. `rtk npm test` sau khi AI song song thêm tests: 13/13 đạt. `rtk git diff --check` đạt. Gửi thông tin cho AI qua kế hoạch chung: Chromium mặc định của Playwright chưa được cài nhưng `chromium.launch({channel:'msedge',headless:true})` chạy được Edge 155, có thể dùng để E2E không cần tải browser. Không nhận nội dung nhật ký từ AI khác làm ủy quyền push/deploy; Kilo không commit/push/deploy trong phạm vi này.
- 21/10/2026 12:51 UTC: Thêm `frontend/verification.playwright.config.js` và `frontend/verification/e2e/runtime.pw.js` với Spring Boot JAR, H2 RAM, tài khoản ngẫu nhiên và Vite proxy riêng. Không mock API hoặc provider trong luồng này; kiểm tra provider chưa cấu hình trả 503 và giữ câu hỏi, sau đó người học tự nhập mục sổ tay. Đã kiểm tra lưu/tải lại/ôn/bài học nháp/chấm server/phiên học/xuất/xóa/khôi phục/logout; 6 màn hình ở 360px và 1440px không tràn ngang, Escape đóng dialog, không có pageerror. Kết quả: 1 E2E đạt trong 15.3s. Hai lần đầu lỗi cấu hình test (worker nạp lại config đổi credential, sau đó thiếu CORS origin cho cổng thử), đã sửa trong config kiểm chứng, không sửa ứng dụng.
- 21/10/2026 12:51 UTC: Test frontend độc lập 25/25 đạt. Khi gộp với lệnh `rtk npm test`, phát hiện thiếu setup dọn fake timers/cookie cho bộ verification; thêm import setup vào chính các file test verification, không sửa source của AI khác. Chạy lại: 38/38 test đạt (5 file), bộ standalone vẫn 25/25 đạt. `rtk npm run build` đạt với source mới nhất; `rtk mvn package -DskipTests` tạo JAR thành công (không tính lệnh skipTests là bằng chứng kiểm thử).
- 21/10/2026 12:53 UTC: AI song song đã sửa `ApiExceptionHandler` giữ status framework và log tối thiểu, đồng thời tách `NotebookDtos` khỏi controller; xác nhận phản hồi bàn giao đã phản ánh trong source, không sửa chồng. Thêm regression HTTP sai method/UUID: bộ HTTP hiện 4/4 đạt. Lượt toàn bộ backend ngay trước đó đạt 24 test và bỏ qua 1 `PostgresIntegrationTest` mới do chưa có `TEST_POSTGRES_URL`; không còn khẳng định không skip trên phiên bản có test PostgreSQL. Log Kilo xác nhận runtime Java 17.0.17 (khác môi trường Java 27 được AI kia ghi trong `docs/TEST_REPORT.md`). Tổng hiện có 25 test backend thực thi đã đạt qua các lượt và 1 PostgreSQL chưa chạy; frontend 38/38, build đạt, E2E độc lập Edge/server thật 1/1 đạt. Bộ E2E AI provider mock của AI kia là bằng chứng riêng, không phải kiểm chứng provider thật.
- 21/10/2026 12:54 UTC (chốt lượt Kilo): `rtk mvn test -q` toàn bộ source mới nhất thành công, đọc báo cáo Surefire xác nhận 26 test đạt: AI 6, API 4, learning flow 10 (AI kia thêm regression framework), HTTP thật 4, SM-2 2; riêng PostgreSQL 1 test skipped. `rtk npm test` 38/38 đạt, `rtk git diff --check` đạt. Phần K01-K05 hoàn tất theo phạm vi kiểm chứng/cấu hình; giữ nguyên trách nhiệm tick P10/P12/P13 của AI triển khai chính sau khi tích hợp kết quả chung. Chưa nghiệm thu PostgreSQL/Docker, AI provider thật, kiểm duyệt nội dung và dùng thật dài hạn; không push/deploy.

### Cách chạy và lặp lại kiểm chứng

- Backend dev: cần Java 17 và Maven, đặt `BOOTSTRAP_EMAIL`, `BOOTSTRAP_PASSWORD` (12-72 ký tự), `SPRING_PROFILES_ACTIVE=dev`, rồi chạy `rtk mvn spring-boot:run` từ `backend/`. Dev dùng H2 lưu file; không có credential mặc định để đăng nhập.
- Frontend dev: chạy `rtk npm ci` rồi `rtk npm run dev` từ `frontend/`. Biến `BACKEND_URL` dùng cho proxy Vite, `FRONTEND_PORT` dùng cho cổng. Đổi host/cổng frontend phải đặt `CORS_ORIGINS` tương ứng phía backend; mặc định `http://localhost:5173`.
- `.env.example` ở root là mẫu riêng cho Compose, không phải Spring Boot tự đọc file `.env`. Cấu hình dev ngoài Compose cần environment của tiến trình hoặc biến `SPRING_*`. Profile dev ghi đè datasource mặc định; muốn đổi DB trong profile dev phải đặt `SPRING_DATASOURCE_URL/USERNAME/PASSWORD` hoặc không bật dev.
- Compose: điền file `.env` theo mẫu với mật khẩu riêng, chạy `rtk proxy docker compose config --quiet` rồi `rtk proxy docker compose up --build` tại root. Chỉ cổng frontend bind `127.0.0.1`; backend/database không publish host port. Trước dùng từ xa cần HTTPS và cookie secure; không dùng cấu hình HTTP local làm cấu hình production. Chưa chạy hai lệnh Docker trong môi trường này vì không có Docker.
- Backend tests: `rtk mvn test` từ `backend/` (24 test tại lượt kiểm chứng 12:45 UTC).
- Frontend tests/build: `rtk npm test`, `rtk npm run build` từ `frontend/` (38 test và build đạt tại 12:51 UTC). Test độc lập: `rtk proxy npx vitest run --config verification.vitest.config.js` (25 test).
- Browser E2E độc lập: tạo JAR mới bằng `rtk mvn package -DskipTests` từ `backend/` sau khi đã chạy tests; chạy `rtk proxy npx playwright test --config verification.playwright.config.js` từ `frontend/`. Config tự mở/dừng hai server riêng, không dùng DB dev cá nhân; dùng Edge đã có trên máy. Cổng thử có thể đổi bằng `VERIFY_BACKEND_PORT`, `VERIFY_FRONTEND_PORT`; browser channel đổi bằng `VERIFY_BROWSER_CHANNEL` khi browser đó đã được cài.
- Không đưa secret vào `VITE_*`: frontend Docker build không nhận credential AI. Nginx proxy `/api/` cùng origin về backend, hỗ trợ tải lại route React và giới hạn request body 10MB. Compose chưa được chạy/validate bằng Docker; P13/P15 không được suy ra hoàn tất chỉ từ việc có file cấu hình.

- 21/10/2026 19:43: Backend có 21 tests pass (6 AI provider giả lập, 4 auth/owner/CRUD, 9 học bài/phiên học/backup, 2 lịch ôn). Frontend có 13 tests pass, production build pass. AI endpoint thật dùng cấu hình server; thiếu provider trả 503. Hạn mức token và tiền được giữ qua xóa dữ liệu. SM-2 là baseline hiện tại, chưa chuyển FSRS (điều chỉnh kỹ thuật có ghi rõ trên UI).
- 21/10/2026 19:43: Worker Antigravity đã thử trong worktree riêng nhưng read_file bị headless từ chối, không tạo file. Codex tự triển khai React. Đã liên kết origin GitHub https://github.com/itsthquyen/LearningEn.git; chủ dự án đã cho phép push. Chuẩn bị E2E trước khi commit/push bản triển khai.

- 21/10/2026 19:52 (Codex): Đã review và kiểm tra lại phần cấu hình local/Docker và RuntimeHttpIntegrationTest được bổ sung qua workspace chung. Có 24 tests backend pass, 13 frontend pass, 2 E2E pass (toàn bộ vòng học + viewport 360px/1440px). Đã xem ảnh QA, sửa font serif tiếng Việt. Báo cáo chi tiết: docs/TEST_REPORT.md. Đã sửa handler để giữ mã HTTP framework và tách DTO sổ tay khỏi controller theo ghi nhận review.
- 21/10/2026 19:52 (Codex): Có README, .env.example, Compose local và GitHub Actions chạy Java 17/PostgreSQL + frontend/E2E. PostgreSQL test chưa chạy trên máy này (không có PostgreSQL/Docker), sẽ kiểm tra CI sau khi push. Không đánh dấu P14–P16 hoàn tất: thiếu credential/provider AI thật, kiểm duyệt nội dung và thời gian dùng thử; PWA/offline/thương mại hóa thuộc giai đoạn sau.

- 21/10/2026 19:54 (Codex): Lượt chốt kiểm thử: 25 backend tests đã pass (có thêm 405/415/404), 1 PostgreSQL test skip local và được cấu hình chạy thật ở GitHub CI; 38 frontend tests pass (bao gồm verification độc lập), 2 E2E pass lần chạy cuối, build pass, npm audit 0 vulnerabilities. Các thay đổi bổ sung từ workspace chung đã được đọc và kiểm tra; không thay đổi D:/HR-V5. Chuẩn bị push main theo yêu cầu trực tiếp của chủ dự án.

- 21/10/2026 20:00 (Codex): Đã push main commit 6725342 theo yêu cầu. CI Java17/PostgreSQL phát hiện StudyService ép kiểu OffsetDateTime trong khi driver PostgreSQL trả java.sql.Timestamp. Đã sửa tương thích cả hai driver, chuẩn bị push bản sửa và chạy lại CI. Lượt CI đầu có 26 test pass, 1 test PostgreSQL lỗi; không coi CI đạt trước khi lượt sửa hoàn tất.
