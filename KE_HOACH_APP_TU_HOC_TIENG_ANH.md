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

### Luồng ảnh đề bài và trợ giảng chi tiết (Kilo, 21/10/2026)

Phạm vi mới theo yêu cầu: tải nhiều ảnh câu hỏi tiếng Anh, đọc đề/đáp án, trả lời theo chế độ. AI phải nêu phần không đọc được/thiếu ngữ cảnh thay vì đoán chắc; kết quả AI không phải đáp án chuẩn đã kiểm duyệt. Kilo nhận các file assistant/backend AI và UI ảnh trong lượt này; AI song song giữ phần CI/PostgreSQL, tránh sửa chồng các file assistant. Không push/deploy trong lượt Kilo.

- [x] IMG01: Hợp đồng multipart `/api/v1/assistant-requests`, cấu hình vision/capabilities, giới hạn ảnh và kế hoạch kiểm thử.
- [x] IMG02: Backend xác thực session/CSRF, kiểm tra nội dung PNG/JPEG, dung lượng/kích thước, loại metadata; gửi ảnh thực tới provider có vision, không dùng model text-only âm thầm. Kiểm chứng bằng HTTP fixture; provider thật cần nghiệm thu riêng.
- [x] IMG03: Các chế độ đáp án nhanh, phân tích từng lựa chọn, gợi ý không lộ đáp án, dịch, chép chữ và tạo bài luyện; kết quả có cấu trúc, thiếu dữ kiện phải nêu rõ, không khẳng định chính xác tuyệt đối. Bộ lọc gợi ý chặn lộ đáp án tường minh thường gặp, không cam kết phát hiện mọi cách ám chỉ ngữ nghĩa.
- [x] IMG04: Giữ idempotency, hạn mức riêng ảnh/output chi tiết, lịch sử kết quả và hỏi tiếp; không lưu ảnh gốc trên server/backup, không log ảnh hay bí mật.
- [x] IMG05: React chọn/kéo thả/dán ảnh clipboard, nhiều ảnh theo thứ tự, xem trước/phóng to/xóa; chọn chế độ, nhập câu hỏi/số câu cần giải/đáp án của mình, hiển thị kết quả từng câu và lưu từ vào sổ tay.
- [x] IMG06: Unit/integration ảnh thật với HTTP provider test, ảnh giả/hỏng/quá lớn, quyền/CSRF, prompt/đáp án cấu trúc, retry/hạn mức/lịch sử/backup; frontend và E2E upload/preview/kết quả/lỗi.
- [x] IMG07: Ghi lệnh/kết quả kiểm chứng, env mẫu, hướng dẫn vision, giới hạn độ chính xác và bước xác minh với provider thật.
- [ ] IMG08 (nghiệm thu thực tế): Cấu hình credential/model vision thật, thử ảnh đề của người dùng ở nhiều mức rõ/mờ/xoay/nhiều câu; đối chiếu đáp án chuẩn và đo chi phí/độ trễ. Không đánh đồng HTTP fixture với độ chính xác AI thật.

Nhật ký ảnh:
- 21/10/2026 12:59 UTC: Bắt đầu khảo sát mã assistant và provider. Giữ nguyên API văn bản và các luồng cũ; thêm multipart cùng tài nguyên. Ảnh chỉ gửi trong yêu cầu hiện tại, không tự giữ ảnh gốc để tránh lưu dữ liệu nhạy cảm; lịch sử giữ phần nhận dạng và phân tích nếu người dùng bật lưu. Provider vision cần cấu hình rõ từ môi trường, chưa coi việc model của phiên chat không đọc ảnh là giới hạn của ứng dụng.
- 21/10/2026 13:07 UTC: Đã thêm endpoint capabilities, multipart metadata+images, kiểm tra signature/decoder/pixel/bytes và mã hóa lại loại metadata trong RAM. AiService gửi multimodal image_url theo đúng thứ tự, vision model riêng, chế độ JSON và output budget riêng; fingerprint gồm ảnh chuẩn hóa + task + metadata; ảnh gốc/base64 không vào DB/backup. Prompt có 6 chế độ và quy tắc chống đoán khi thiếu đề. Kết quả bị cắt hoặc JSON sai bị từ chối 502. Backend regression cũ vẫn chạy thành công sau lần tích hợp đầu; đang bổ sung bộ test ảnh riêng và UI song song ở phạm vi tách biệt.
- 21/10/2026 13:12 UTC: Frontend 60/60 tests đạt (22 test ảnh), production build đạt. E2E ảnh qua trình duyệt Edge + Vite + backend JAR thật + HTTP vision fixture đạt 1/1: upload PNG, zoom, multipart chỉ ảnh, ABCD 4 lựa chọn, tải lại lịch sử, lưu kiến thức vào sổ tay, gợi ý không hiện đáp án, 360/1440px không tràn ngang, export không có data:image. E2E cũ không provider cũng đạt 1/1. Đây là kiểm chứng giao thức/luồng, chưa chứng minh provider thật đọc/giải đúng. Đang chốt thêm test decoder/security/budget/JSON để tick IMG02-04/06.
- 21/10/2026 13:17 UTC: Thêm 98 test ảnh backend (42 integration + 56 validation). Lần test đầu phát hiện HINT lộ đáp án trong text và trạng thái thiếu dữ kiện không có cảnh báo; đã bổ sung kiểm tra và regression. `rtk mvn test -q` toàn bộ thành công trên Java17: báo cáo Surefire có 124 test đạt (98 ảnh + 26 cũ), 1 PostgreSQL skipped vì local chưa có TEST_POSTGRES_URL. `rtk npm test` 60/60 và build đạt. Request ảnh lỗi upstream/JSON/timeout giữ khoản dự trù theo cơ chế cũ để không retry vượt chi phí; UI giữ ảnh và nội dung khi lỗi mạng. Không có provider credential thật nên chưa chấm độ đúng ABCD/OCR ngoài fixture.
- 21/10/2026 13:21 UTC: Review độc lập phát hiện 4 rủi ro trước khi chốt: retry request FAILED dùng mã cũ bị 409; tắt lịch sử trong hội thoại cũ làm mất kết quả tạm trên UI; ảnh điện thoại mất chiều EXIF; fingerprint encoded bytes không tương ứng pixel. Đã sửa backend áp dụng 8 kiểu xoay/lật JPEG EXIF trước loại metadata, hash kích thước+ARGB thay vì encoded bytes. Thêm 12 regression (8 transform, 2 endian EXIF integration, 1 palette/RGB cùng pixel, 1 EXIF hỏng), `rtk mvn test -q` toàn bộ đạt; frontend đang bổ sung cách chủ động tạo request mới và merge kết quả tạm với lịch sử. Không coi review đã xong trước khi kiểm thử lại 2 lỗi frontend.
- 21/10/2026 13:25 UTC (chốt luồng ảnh): Sau sửa review, backend **136 tests đạt**, 1 PostgreSQL test skipped local; frontend **64/64 đạt** (26 regression ảnh), production build đạt. E2E ảnh JAR cuối **1/1 đạt** trong 23.2s, thêm kiểm tra thực tế tắt history giữa hội thoại giữ lời giải không lưu DB và provider lỗi502 -> chủ động gửi yêu cầu mới giữ ảnh/nội dung thành công. E2E luồng cũ thiếu provider **1/1 đạt** trong 27.2s. `rtk git diff --check` đạt. Hướng dẫn, env và hợp đồng cập nhật trong README/docs/API/docs/TEST_REPORT. IMG01-07 hoàn tất kỹ thuật, IMG08 chưa nghiệm thu vì chưa có provider thật/ảnh đề đáp án chuẩn. Không cài provider giả trong runtime, không commit/push/deploy.

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

## 20. Roadmap chi tiết 31/10/2026 (đề xuất, chưa triển khai)

**Trạng thái:** Kế hoạch đề xuất sau khi audit toàn bộ source, đọc ảnh E2E 360px/1440px và nghiên cứu 4 nhóm đối thủ. Chưa sửa code, chưa tạo migration, chưa cấu hình provider thật.
**Mục tiêu 90 ngày:** từ MVP cá nhân → sản phẩm học hằng ngày cho người Việt đi làm, đủ điều kiện beta 10–20 người.
**North Star Metric:** số người học hoàn thành trọn vòng **tra/ảnh → lưu → ôn → dùng lại (viết/nói)** mỗi tuần.
**Liên kết checklist cũ:** P14 (AI thật) → P0-07; P15 (kiểm duyệt/dùng thật/beta) → P1A-06, P1B-04, P1B-05; P16 (PWA/offline/nhắc học/thương mại) → P2.

### 20.1 Cơ sở nghiên cứu và kết luận

- **Duolingo/Busuu/Babbel/Memrise:** giữ nhịp nhờ bài ngắn, “việc tiếp theo” rõ, phần thưởng tức thì; nhưng Energy/hearts, streak phạt, leaderboard và drill dịch bị người dùng phàn nàn. Không sao chép các cơ chế gây áp lực.
- **Anki/Quizlet/LingQ/Readlang/Migaku/Language Reactor:** SRS và capture ngữ cảnh mạnh, nhưng tạo thẻ thủ công là điểm bỏ cuộc; hầu hết dừng ở nhận diện, chưa schedule production. Cơ hội: AI soạn thẻ từ ngữ cảnh + luyện dùng lại.
- **ELSA/Speak/Praktika/Talkpal/Cambly/ChatGPT Voice:** nhu cầu nói là thật; real-time voice đã rẻ, nhưng chấm phát âm đến âm vị bằng transcript/LLM thường quá dễ tính và phản hồi nông. Làm hội thoại trước, read-aloud có caveat sau; không hứa “native-like”.
- **Thị trường Việt:** EF EPI 2025 xếp Việt Nam 64/123, điểm nói 461 thấp hơn đọc 522; nhu cầu gắn với công việc/thi cử. eJOY mạnh video/extension, ELSA mạnh phát âm, Cake mạnh video ngắn, Monkey/Edupia hướng trẻ em, IOE thi trường. Chưa ai sở hữu trọn vòng “ảnh đề → giải thích tiếng Việt → sổ tay → ôn → nói lại”.
- **Định vị đề xuất:** “Tiếng Anh cho người Việt đi làm, mất gốc A1–B1, học từ chính tài liệu/đề bài họ gặp”. Đào sâu A1 + gói công việc/IT, không trải A1–C2.
- **Kết luận:** app hiện đủ dùng cho cá nhân ở tầng công cụ, chưa đủ cho người dùng phổ thông. Nút thắt là nội dung, sản xuất (nói/viết), onboarding, thói quen và mobile UX — không phải thiếu chatbot.

### 20.2 Nguyên tắc triển khai

1. API `/api/v1` chỉ thêm trường/endpoint, không phá hợp đồng cũ.
2. Migration forward-only; thay đổi lớn có feature flag + rollback; backup trước deploy.
3. Server là nguồn chấm điểm/quota/quyền sở hữu duy nhất; React không tự chấm, không tự cấp quyền.
4. Không fixture/số liệu giả trong runtime; AI lỗi phải báo lỗi thật.
5. Không gamification độc hại: không energy, không streak phạt, không leaderboard.
6. Mỗi task chỉ tick khi có test + bằng chứng chạy thật; không tick theo suy đoán.
7. Nội dung chỉ gắn `REVIEWED` khi có người duyệt; nếu chưa, giữ `DRAFT` và không quảng cáo.
8. Không commit secret, không push/deploy nếu chưa được phép.

### 20.3 Tổng quan phase

| Phase | Thời lượng gợi ý | Mục tiêu | Gate |
|---|---|---|---|
| P0 — Nền tin cậy | 2 tuần, ~35–45h | Sửa UX chặn mobile, CTA thông minh, quota/lỗi AI, nghiệm thu provider thật | Gate 0: dùng được 7 ngày trên mobile; AI thật đã đo |
| P1A — Cá nhân hóa & ôn tập | 3–4 tuần, ~80–110h | Placement, FSRS, ôn gõ đáp án/cloze, session composer, báo cáo tuần | Gate 1A: người mới biết bắt đầu; ôn tập có chiều sâu |
| P1B — Sản xuất & nội dung | 4–5 tuần, ~90–120h | Photo-to-Mastery, lỗi Việt, production viết/nói, 2 gói nội dung có duyệt | Gate 1B: 5 người nội bộ hoàn thành vòng lặp đầy đủ |
| P2 — Hào & vận hành | 8 tuần, ~120–160h | Reader, PWA/offline, nhắc học, beta invite, phát âm, role-play, thanh toán | Gate 2: retention + sẵn sàng thu tiền |

Tổng: 17–21 tuần nếu làm 15–20h/tuần; 10–12 tuần nếu full-time 30–35h/tuần. Nội dung là đường găng, không phải code.

### 20.4 PHASE 0 — Nền tin cậy (2 tuần)

**Mục tiêu:** mobile dùng được thật, mở app biết làm gì, AI lỗi có cách xử lý, provider thật được đo. Không thêm tính năng học mới.

#### P0-01 — Mobile shell & navigation — S (4–6h)
- [ ] Thêm bottom navigation cho `<700px` với 5 mục: Hôm nay, Hỏi & Dịch, Sổ tay, Ôn tập, Tiến bộ; có `aria-current`, active state.
- [ ] Đưa Cài đặt + Đăng xuất vào sheet/dialog ở header mobile; không phụ thuộc sidebar bottom đang bị ẩn.
- [ ] StudyBar mobile thu gọn thành chip “Phiên học” trong header hoặc đặt dưới topbar, không chiếm first viewport.
- [ ] Thêm `padding-bottom` cho content để bottom nav không che nội dung; kiểm tra 360/390/768/1440.
- [ ] Sửa `aria-label` cho nút Cài đặt; thêm skip link nếu kịp.
- **File:** `frontend/src/App.jsx`, `frontend/src/styles.css`, có thể tách `components/MobileNav.jsx`.
- **API/DB:** Không.
- **Test/acceptance:** Playwright 360px đủ 5 nav item, click từng route, mở settings, logout thành công; không `scrollWidth > clientWidth`; 1440px không đổi layout desktop; keyboard focus nhìn thấy; không nút icon thiếu tên.

#### P0-02 — Hỏi & Dịch: composer lên trước, hủy được, lỗi tiếng Việt — M (6–8h)
- [ ] Mobile: composer đứng trước, “Lịch sử” gập vào `<details>`/drawer; desktop giữ sidebar.
- [ ] Thêm 3–4 chip ví dụ bấm được: “look forward to”, “I have been working…”, “Sửa email này giúp tôi”, “Giải thích thì hiện tại hoàn thành”.
- [ ] Thêm `AbortController` + nút “Dừng chờ”; hiển thị số giây đã chờ; giữ request ID để retry cùng mã; không tự tạo request mới.
- [ ] TTS: phát hiện tiếng Việt/Anh bằng heuristic dấu; `vi-VN` cho tiếng Việt, `en-US` cho tiếng Anh; vẫn ghi “Giọng tổng hợp”.
- [ ] “Hội thoại mới” hỏi xác nhận nếu đang có draft; xóa draft sau khi xác nhận.
- [ ] Lỗi 429/503/502 map sang tiếng Việt + hành động; chi tiết kỹ thuật trong expandable nhỏ.
- **File:** `frontend/src/pages/Assistant.jsx`, `frontend/src/services/api.js`, `frontend/src/styles.css`, mới `services/errors.js`.
- **API/DB:** Không bắt buộc; P0-06 thêm `code` cho lỗi.
- **Test/acceptance:** 360×800 thấy textarea + nút gửi mà không cuộn qua lịch sử; chip điền nội dung và focus textarea; fixture delay + bấm hủy dừng trạng thái chờ, không tự gọi lại; không còn lỗi AI chỉ hiện tiếng Anh.

#### P0-03 — Dashboard: một CTA đúng, next lesson, vòng mục tiêu — M (5–7h)
- [ ] Tách hàm thuần `nextAction({dueCount,nextLesson,notebookCount})`:
  - `dueCount > 0` → Ôn tập.
  - `dueCount = 0 && nextLesson` → Học bài tiếp theo.
  - `notebookCount = 0` → Hỏi & lưu điều đầu tiên.
  - còn lại → Mở sổ tay/Đọc lại.
- [ ] Render `nextLesson.title/objective` từ API (server đã tính trong `DashboardService`, UI đang bỏ qua).
- [ ] Vòng mục tiêu ngày: `activeMinutesToday / profile.dailyMinutes`, cap 100%; text “12/15 phút hôm nay”.
- [ ] “Tuần này: 3/5 ngày có học” từ `weeklyLearning`; không phạt, không “mất chuỗi”.
- [ ] Giảm CTA trùng: hero 1 CTA chính; form hỏi là secondary; “Bước nhỏ tiếp theo” thành card phụ.
- [ ] Lỗi dashboard có nút “Thử lại” dùng `reload` từ `useResource`.
- **File:** `frontend/src/pages/Dashboard.jsx`, `frontend/src/styles.css`.
- **API/DB:** Không; `nextLesson`, `activeMinutesToday`, `weeklyLearning` đã có.
- **Test/acceptance:** unit test `nextAction` đủ 4 nhánh; E2E due=0 + nextLesson mở đúng bài; due>0 mở review; notebook trống mở assistant; vòng mục tiêu khớp số server, không hard-code.

#### P0-04 — Ôn tập: phiên 20 thẻ, phím tắt, audio, empty state — M (6–8h)
- [ ] Backend: `GET /api/v1/review-cards?due=true&limit=20`; `limit` mặc định 20, max 100; SQL `limit ?`.
- [ ] Client: hiển thị “Thẻ 1/20”; hết phiên hiện recap “Đã ôn X thẻ, còn Y thẻ đến hạn”.
- [ ] Phím tắt: Space xem đáp án; 1–4 chọn Quên/Khó/Nhớ/Dễ.
- [ ] Nút nghe expression/example bằng SpeechSynthesis; nhãn “Giọng tổng hợp”.
- [ ] Empty state: nếu không có thẻ due, CTA “Chọn bài tiếp theo” về `/progress`, không chỉ “Mở sổ tay”.
- [ ] Giữ footnote “xem đáp án không tính là đã nhớ”; không undo rating ở P0 để tránh phá tính toàn vẹn SRS.
- **File:** `frontend/src/pages/Reviews.jsx`, `backend/src/main/java/com/learningen/ReviewController.java`, `frontend/src/styles.css`.
- **Test/acceptance:** integration test `limit` + owner; RTL keyboard; E2E 360px ôn 3 thẻ bằng phím, recap hiện; empty state không dead-end.

#### P0-05 — Sổ tay: bật/tắt ôn một chạm, reset filter — S (3–4h)
- [ ] Trên mỗi card, thêm toggle “Bật ôn”/“Tắt ôn”; gọi `PUT /learning-items/{id}` với đầy đủ field hiện có + `reviewEnabled`; optimistic update + rollback khi lỗi.
- [ ] Empty state khi filter không có kết quả: nút “Đặt lại bộ lọc”.
- [ ] Ghi chú nhỏ: “Bật ôn sẽ tạo thẻ đến hạn ngay”.
- **File:** `frontend/src/pages/Notebook.jsx`, `frontend/src/features/notebook/ItemForm.jsx`.
- **API/DB:** Không; dùng endpoint hiện có.
- **Test/acceptance:** RTL toggle gọi API đúng payload; lỗi rollback; E2E toggle → sang Reviews thấy thẻ.

#### P0-06 — Mã lỗi ổn định + quota AI hiển thị — M (6–8h)
- [ ] Backend: thêm `code` vào ProblemDetail: `AI_BUDGET`, `AI_UPSTREAM`, `AI_NOT_CONFIGURED`, `AUTH_REQUIRED`, `CSRF`, `NOT_FOUND`, `CONFLICT`, `INVALID`, `TOO_LARGE`. Giữ `detail` cũ.
- [ ] `DashboardService`: thêm object `aiQuota`:
  `{date, requestsUsed, requestLimit, tokensUsed, tokenLimit, remainingRequests, remainingTokens, resetAt}`; đọc `ai_daily_budgets` ngày UTC + env limit.
- [ ] Assistant hiển thị “Còn X lượt AI hôm nay”; nếu 0, disable gửi + giải thích reset UTC, vẫn dùng sổ tay/ôn.
- [ ] `errors.js`: map code/status → tiếng Việt; `ErrorNotice` dùng `error.userMessage` nếu có.
- [ ] Preferences hiển thị quota + link giải thích; sửa copy restore đang nói “thêm dữ liệu” trong khi backend chỉ nhận workspace trống.
- **File:** `backend/src/main/java/com/learningen/ApiExceptionHandler.java`, `backend/src/main/java/com/learningen/data/DashboardService.java`, `frontend/src/services/api.js`, `frontend/src/components/Common.jsx`, `frontend/src/pages/Preferences.jsx`.
- **API/DB:** Không migration; dashboard additive.
- **Test/acceptance:** backend test `code`; dashboard quota đúng ngày UTC; frontend test mapping 429/503/502; E2E fixture 429 thấy thông báo tiếng Việt + hướng dẫn.

#### P0-07 — Nghiệm thu provider AI thật (P14/IMG08) — M (4–6h + provider)
- [ ] Chuẩn bị 60 case text (15 từ đa nghĩa, 15 câu dịch, 15 sửa câu, 15 ngữ pháp) + 20 ảnh đề thật (rõ/mờ/xoay/nhiều câu/thiếu dữ kiện).
- [ ] Chạy với provider thật; ghi accuracy, latency, cost, lỗi; kiểm tra HINT/TRANSLATE không lộ đáp án, JSON cut-off, ảnh mờ → warning.
- [ ] Đo token reservation thực tế; chỉnh `AI_DAILY_TOKENS`, `AI_VISION_MAX_OUTPUT_TOKENS`, `AI_VISION_TOKENS_PER_IMAGE`; nếu request 3 ảnh vẫn chiếm >50% trần ngày, đề xuất tách budget vision hoặc tăng trần.
- [ ] Không commit credential; cập nhật README/docs/API/TEST_REPORT với số đo thật.
- [ ] Nếu chưa có credential: giữ task `BLOCKED`, không đánh dấu P14 xong.
- **File:** `README.md`, `docs/API.md`, `.env.example`, `backend/src/main/resources/application.properties`.
- **Test/acceptance:** có bảng kết quả 60+20 case; ghi rõ case sai; cấu hình mẫu chạy được; không lộ key.

#### P0-08 — Regression, E2E, ảnh chụp, nhật ký — S (4–5h)
- [ ] Chạy `mvn verify`, `npm test`, `npm run build`, E2E 360/1440; `git diff --check`.
- [ ] Chụp lại 5 màn mobile + desktop; lưu `work/e2e/`.
- [ ] Cập nhật checklist/nhật ký trong file này sau khi có bằng chứng.
- [ ] Không push/deploy nếu chưa được phép.
- **Gate 0:** tất cả test xanh; mobile không tràn; AI thật đã đo; quota hiển thị; không còn lỗi P0.

### 20.5 PHASE 1A — Cá nhân hóa & ôn tập (3–4 tuần)

**Mục tiêu:** người mới biết bắt đầu ở đâu; ôn tập sâu hơn nhận diện; buổi học có cấu trúc.

#### P1A-01 — Placement & onboarding — M–L (12–16h + 4h content)
**Schema V5 — `V5__personalization_review.sql`:**
- `accounts` thêm: `placement_level VARCHAR(20)`, `placement_score INTEGER`, `placement_completed_at TIMESTAMPTZ`, `onboarding_completed_at TIMESTAMPTZ`, `desired_retention DOUBLE PRECISION DEFAULT 0.9`, `weekly_goal_days INTEGER DEFAULT 5`.
- Bảng `placement_attempts(id, owner_id, request_id, answers TEXT, score INT, level VARCHAR(20), response TEXT, created_at, UNIQUE(owner_id,request_id))`.

**API:**
- `GET /api/v1/placement` → 12–15 câu, không có đáp án.
- `POST /api/v1/placement/attempts` `{requestId,answers}` → server chấm, idempotent, trả `{score, level, recommendation, completedAt}`.
- `PATCH /profile` thêm `weeklyGoalDays` optional; giữ field cũ bắt buộc.

**UX:** 3 bước sau login nếu chưa onboarding: mục tiêu (công việc/đọc/thi), thời gian (5/20/30), tự đánh giá → placement 10–15 câu → gợi ý bài bắt đầu. Luôn có “Bỏ qua, bắt đầu A1”; không khóa bài.
**Content:** `placement.json` 15 câu được duyệt; không gọi là chứng chỉ CEFR.
**Test:** scoring, idempotency, owner, không lộ đáp án, skip.
**Acceptance:** hoàn thành/bỏ qua <3 phút; dashboard hiện bài gợi ý; không hard-gate.

#### P1A-02 — FSRS (spike + migrate có rollback) — L (16–24h)
- Spike 2 ngày chọn thư viện FSRS Java có license phù hợp; nếu không có, port FSRS-5 và đối chiếu **test vector chính thức** của fsrs4anki. Không tự viết công thức mới.
- **Schema V5:** `review_cards` thêm `fsrs_stability`, `fsrs_difficulty`, `fsrs_state`, `fsrs_step`, `last_reviewed_at`, `lapses`; giữ cột SM-2 cũ để rollback/so sánh.
- Interface `ReviewScheduler`; `Sm2Scheduler` và `FsrsScheduler` cùng implement.
- Feature flag `app.review.scheduler=sm2|fsrs`; chạy shadow mode 1 tuần (tính FSRS nhưng vẫn dùng SM-2), so sánh interval; sau đó switch.
- Migration dữ liệu cũ: map `repetitions/interval/ease` → stability/difficulty ban đầu; test H2 + PostgreSQL.
- **Test:** test vector FSRS, monotonic interval, AGAIN→relearn, timezone, rollback flag.
- **Acceptance:** không mất lịch sử; rollback được; retention stats hiển thị.

#### P1A-03 — Ôn tập gõ đáp án/cloze + giới hạn thẻ mới — L (16–20h)
- **Schema V5:** `reviews` thêm `mode VARCHAR(20) DEFAULT 'RECOGNITION'`, `answer_correct BOOLEAN`.
- **API:**
  - `GET /review-cards?due=true&limit=20&mode=...`.
  - `POST /review-cards/{id}/reviews` thêm `{mode,answer?}`.
  - Server chuẩn hóa answer (trim/lower/collapse spaces/bỏ punctuation), so với `expression` (TYPING) hoặc chỗ trống trong `context` (CLOZE). Sai → chỉ cho `AGAIN`; đúng → cho HARD/GOOD/EASY.
  - Không trả đáp án trước khi nộp; sau khi nộp trả `expected`.
- **UX:** chọn chế độ; ô nhập; cloze highlight; nghe audio; hiển thị “Đã đúng/Chưa đúng, thử lại”.
- **Test:** normalization, wrong→AGAIN, idempotency, version conflict, không leak.
- **Acceptance:** gõ/cloze hoạt động; sai không thể GOOD/EASY; giới hạn thẻ mới/ngày.

#### P1A-04 — Session Composer + recap — L (14–18h)
**Schema V6 — `V6__session_and_reports.sql`:**
- `study_sessions` thêm `plan TEXT` (JSON các bước).
- `reviews`, `lesson_attempts` thêm `study_session_id UUID NULL REFERENCES study_sessions(id) ON DELETE SET NULL`.

**API:**
- `POST /study-sessions` trả thêm `plan` (additive): 5 phút = ôn + 1 production; 20 phút = ôn 5’ + bài 7’ + production 5’ + recap 3’; 30 phút = ôn 8’ + bài 10’ + production 8’ + recap 4’.
- `GET /study-sessions/{id}/summary` → thời gian, số review, bài làm, production, thẻ còn lại, next lesson.
- Review/lesson attempt nhận `studySessionId` optional; server kiểm tra owner/active.
**UX:** “Bắt đầu 20 phút” mở plan preview; stepper; pause; recap cuối phiên; dashboard hiển thị phiên đang dở.
**Test:** plan 5/20/30, summary, owner, idempotency.
**Acceptance:** một CTA tạo buổi có cấu trúc; recap có số thật; không còn đồng hồ rời.

#### P1A-05 — Báo cáo tuần v1 — M (8–10h)
- **API:** `GET /reports/weekly` → `{weekStart, reviews, retentionRate, lessons, activeMinutes, nextFocus, unassessed:[...]}`. Chưa có error tags.
- **UX:** section trong `frontend/src/pages/Progress.jsx`; “Nghe/Nói: Chưa đánh giá” trung thực; CTA “Học 5 phút”.
- **Test:** timezone, empty state, không bịa điểm.
- **Acceptance:** số liệu DB-driven; kỹ năng chưa đo ghi rõ.

#### P1A-06 — Content schema v2 + mở rộng A1 — L (10–14h dev + 20–30h content)
- `CourseContentLoader` hỗ trợ nhiều file (`app.learning.content` comma-separated), metadata `author/reviewer/reviewedAt/source/license`.
- Schema câu hỏi thêm `LISTENING`, `WRITING`, `SPEAKING_PROMPT`; listening dùng browser TTS ở P1 (ghi rõ “giọng tổng hợp”, không chống gian lận).
- Mở A1 từ 16 → 30 bài; mỗi bài 3–5 MCQ + 1 listening + 1 writing/speaking prompt; 3 checkpoint + 2 application.
- **Chỉ tick `REVIEWED` khi giáo viên duyệt**; nếu chưa, giữ `DRAFT` và không quảng cáo. Không đụng A2–C2.
- **Test:** loader validation, answer key, unique IDs, không lộ đáp án trong detail, audio script không hiện trước khi trả lời.
- **Acceptance:** 2 course load được; course reviewed không còn badge DRAFT; listening chạy.

#### P1A-07 — Gate 1A
- [ ] Chạy toàn bộ test + E2E placement → review → session → recap.
- [ ] Đo activation: % tài khoản mới lưu trong phiên đầu; % quay lại review trong 48h.
- [ ] Chỉ sang P1B khi content A1 đã có người duyệt và FSRS ổn định 1 tuần.

### 20.6 PHASE 1B — Sản xuất & nội dung (4–5 tuần)

**Mục tiêu:** đóng vòng lặp “hiểu → nhớ → dùng”; tạo lợi thế khó copy.

#### P1B-01 — Photo-to-Mastery — L (24–32h)
**Schema V7 — `V7__practice_errors_production.sql`:**
- `practice_attempts(id, owner_id, source_message_id, request_id, answers TEXT, score INT, feedback TEXT, created_at, UNIQUE(owner_id,request_id))`.
- `error_tags(code PRIMARY KEY, label_vi, category, description)` seed 30–50 tag.
- `error_events(id, owner_id, source_type, source_id, tag_code, severity, context_excerpt, created_at)`.

**API/prompt:**
- Mở rộng JSON ảnh: mỗi question thêm `errorTags:[code]`; chỉ cho phép code trong taxonomy, validate ở `ImageTutor`.
- `POST /assistant-requests/{id}/practice-attempts` chấm practice từ message đã lưu; nếu history off → UI self-check có nhãn rõ, không giả server grading.
- `GET /error-tags` trả taxonomy.

**UX:**
- Hiện “AI đọc được gì” trước khi phân tích; hiển thị text OCR để người dùng kiểm tra.
- Sau giải: “Luyện 5 câu tương tự” → từng câu → feedback → “Lưu 1–3 mục vào sổ tay”.
- “Phiếu lỗi cuối phiên”: câu sai, tag, drill gợi ý.
**Test:** fixture ảnh có practice/errorTags; grading; tag validation; history off; không lộ đáp án HINT/TRANSLATE.
**Acceptance:** ảnh → luyện → lưu → thẻ due trong một luồng; tag lỗi hiện trong báo cáo.

#### P1B-02 — Lỗi Việt + báo cáo tuần v2 — M (12–16h + 10h content)
- Taxonomy 30–50 lỗi L1: phụ âm cuối /s,z,t,d,k,p/; cụm /str,skr/; /θ,ð/; v/w; -ed; plural -s; mạo từ; thì; giới từ; countability; “very like”, “I have 20 years old”, “discuss about”…
- Mapping tag → drill ngắn (10–15 bài).
- `GET /reports/weekly` thêm `topErrors:[{tag,count,trend,drillId}]`.
- UI: “3 lỗi lặp lại tuần này” + CTA luyện 5 phút; tiến bộ theo tag.
- Không gọi là chấm phát âm; chỉ là mẫu lỗi.

#### P1B-03 — Production session (viết + nói Stage 1) — L (24–32h)
**Schema V7:**
- `production_tasks(id, owner_id, prompt_vi, target_item_ids TEXT, due_at, status, source, created_at)`.
- `production_attempts(id, owner_id, task_id, request_id, text, transcript, feedback TEXT, audio_seconds, asr_model, created_at, UNIQUE(owner_id,request_id))`.
- `production_attempts.study_session_id` nullable.

**API:**
- `GET /production-tasks?due=true`; `POST /production-tasks` chọn 4–6 thẻ due (server, không AI).
- `POST /production-attempts` multipart `{taskId,requestId,text?,audio?}`:
  - Text: kiểm tra độ dài; gọi AI rubric: dùng đúng target chưa, tự nhiên chưa, 1 lỗi quan trọng, 1 gợi ý; JSON validate.
  - Audio: `SpeechService` (OpenAI-compatible `/audio/transcriptions`) → transcript; lưu transcript, **không lưu audio**; 60s/5MB; consent.
  - Không cấu hình ASR → 503 cho audio, text vẫn chạy.
- `GET /production-attempts/{id}`.

**UX:** trang `/production`; chọn text hoặc ghi âm; nghe lại trước khi gửi (audio không upload nếu chưa đồng ý); hiện transcript, cho sửa và ghi rõ “đã sửa”; feedback + mẫu.
**Test:** text, audio validation, ASR fixture, idempotency, budget, history off, không audio trong DB/export.
**Acceptance:** 5 phút dùng 4–6 từ due; text chạy không cần ASR; nhãn trung thực “phản hồi độ rõ/ngữ pháp, không phải điểm accent”.

#### P1B-04 — Gói nội dung công việc/IT + listening — L (12–16h dev + 30–40h content)
- 20 bài A2/B1: email, Slack, standup, code review, meeting, phỏng vấn, CV, lương, small talk, tài liệu.
- Mỗi bài: 3–5 MCQ + 1 listening + 1 writing + 1 speaking prompt + 3 review cards.
- Listening dùng TTS trình duyệt, transcript ẩn sau khi trả lời; ghi rõ giọng tổng hợp.
- Giáo viên duyệt trước khi `REVIEWED`.

#### P1B-05 — Beta nội bộ
- [ ] 5 người nội bộ dùng 2 tuần; tạo tài khoản thủ công (chưa mở đăng ký).
- [ ] Theo dõi activation, core loop, lỗi, chi phí AI; phỏng vấn 20 phút/người.
- **Gate 1B:** ≥3/5 người hoàn thành vòng lặp đầy đủ; không lỗi chặn; nội dung reviewed.

### 20.7 PHASE 2 — Hào & vận hành (8 tuần)

| Task | Nội dung | Acceptance |
|---|---|---|
| P2-01 Reader | Dán text/URL (ưu tiên text), tô màu chưa biết/đang học/đã biết, bấm từ → giải thích tiếng Việt, lưu câu + nguồn, i+1, TTS. Không host toàn văn; chỉ trích đoạn + link; bắt đầu public-domain/paste-only | Dán 300–1000 từ, lưu 3 mục; không fetch bừa; bản quyền an toàn |
| P2-02 PWA/offline | Manifest, service worker, cache app shell + thẻ due; IndexedDB queue; sync idempotent; xóa local khi logout | Cài trên Android, ôn 10 thẻ offline, sync không mất dữ liệu |
| P2-03 Nhắc học | Email/Zalo OA; opt-in, giờ/ngày, unsubscribe; scheduler timezone; không guilt | Tối đa 1 nhắc/ngày; tắt được; không trùng |
| P2-04 Beta signup | Invite code + rate limit + email verification; quên mật khẩu; owner isolation | 10–20 người onboard không cần SQL tay; không abuse |
| P2-05 Phát âm | Read-aloud + Azure Pronunciation Assessment; 2–3 âm, minimal pair; lưu score, không lưu audio; copy “ước lượng, không phải chứng chỉ” | Test-retest ổn; user xóa được; chi phí đo được |
| P2-06 Role-play | 5–10 tình huống công việc/đời sống; text trước, voice sau; mục tiêu hội thoại; safety filter; cost cap | Hoàn thành scenario; feedback 2 lỗi; không lưu audio mặc định |
| P2-07 Thanh toán | VietQR/MoMo/ZaloPay; plans 79k/tháng, 599k/năm (giả thuyết); free tier theo chi phí; trial 7 ngày; webhook ký/không replay | Sandbox pass; entitlement server-side; hủy 2 chạm |
| P2-08 PDPL & tin cậy | Privacy notice tiếng Việt, consent AI/voice, export/delete, subprocessors, breach process; legal review | Trang privacy; xóa sạch dữ liệu mới; không secret trong export |

**Gate 2:** D7 ≥ 25% (beta nhỏ, định hướng), core loop ≥ 40% weekly users, AI cost/active learner/ngày trong trần, 0 lỗi bảo mật nghiêm trọng. Chỉ mở bán khi có người quay lại tuần 2/4.

### 20.8 Tổng hợp schema/API

**Migrations đề xuất:**

| Version | Nội dung | Phase |
|---|---|---|
| V5 | placement, FSRS fields, review mode, retention/weekly goal | P1A |
| V6 | session plan + `study_session_id` links | P1A |
| V7 | practice attempts, error tags/events, production tasks/attempts | P1B |
| V8 | PWA/reminder/speech attempts | P2 |
| V9 | invite codes, subscriptions, billing events, entitlements | P2 |

**API mới (additive):**
- P0: `GET /dashboard` + `aiQuota`; `GET /review-cards?limit=`; ProblemDetail `code`.
- P1A: `GET/POST /placement`; `PATCH /profile` + `weeklyGoalDays`; `POST /review-cards/{id}/reviews` + `mode/answer`; `GET /study-sessions/{id}/summary`; `GET /reports/weekly`; `GET /features`.
- P1B: `POST /assistant-requests/{id}/practice-attempts`; `GET /error-tags`; `GET/POST /production-tasks`; `POST /production-attempts`; `GET /assistant-capabilities` + `speechEnabled`.
- P2: `/reader/lookups`, `/speech/assessments`, `/roleplay/sessions`, `/billing/*`, `/auth/register` hoặc `/auth/invite`.

Không đổi endpoint hiện có theo cách phá vỡ; field mới optional.

### 20.9 Kiểm thử & bằng chứng

| Lớp | Nội dung | Bằng chứng |
|---|---|---|
| Unit | `nextAction`, error mapping, FSRS vectors, placement scoring, tag validation, session plan | Surefire/Vitest report |
| Integration | Auth/CSRF, owner, idempotency, quota, limit, migrations H2 + PostgreSQL | `mvn verify`, CI Postgres |
| Frontend | RTL cho nav/chips/review keyboard/toggle/quota | `npm test` |
| E2E | 360/1440: login → dashboard → assistant → photo fixture → save → review → placement → session recap → production text | Playwright screenshots + JSON result |
| AI provider | 60 text + 20 ảnh; accuracy/latency/cost; HINT leak; cut-off | `docs/TEST_REPORT.md` |
| Accessibility | Keyboard, focus, aria, contrast, skip link | Checklist + axe nếu thêm |
| Security | CSRF, owner, upload, rate limit, no secrets | Test + review |

**Definition of Done mỗi task:** code + test + API docs + env mẫu + screenshot (UI) + owner isolation + không secret + cập nhật nhật ký. Không tick nếu chưa chạy.

### 20.10 Timeline & nguồn lực

| Tuần | Việc chính | Gate |
|---|---|---|
| 1 | P0-01, P0-02, P0-03 | — |
| 2 | P0-04 → P0-08; đo AI thật | Gate 0 |
| 3–5 | P1A-01 → P1A-05 | — |
| 6–7 | P1A-06 content + review; Gate 1A | Gate 1A |
| 8–11 | P1B-01 → P1B-03 | — |
| 12–13 | P1B-04, P1B-05 | Gate 1B |
| 14–21 | P2-01 → P2-08 | Gate 2 |

**Effort:** P0 35–45h; P1A 80–110h + 25–35h content; P1B 90–120h + 40–50h content; P2 120–160h. Tổng ~325–435h dev + 65–85h content. Với 20h/tuần: 18–22 tuần. Với 35h/tuần: 11–14 tuần.
**Đường găng:** giáo viên duyệt nội dung + provider AI thật. Code có thể song song, nhưng không thể thay hai việc này.

### 20.11 Metrics cần đo

- **Activation:** % tài khoản mới lưu ít nhất 1 mục trong phiên đầu; % review trong 48h.
- **Core loop:** % weekly users có ≥1 lưu + ≥1 review (P1B thêm ≥1 production).
- **Retention:** D1/D7/D30; số ngày có học/tuần; không dùng streak phạt.
- **Learning:** retention tự đánh giá; lỗi lặp lại giảm; % production dùng đúng target.
- **AI:** cost/active learner/ngày; p95 latency; 429 rate; % ảnh cần chụp lại.
- **Content:** completion, pass rate, listening completion; tỷ lệ câu bị báo sai.
- **Business (P2):** trial→paid, churn, ARPU, refund.

Có thể query từ `learning_items`, `reviews`, `lesson_attempts`, `study_sessions`, `ai_requests`, `production_attempts`; chưa cần thêm tracking phức tạp.

### 20.12 Rủi ro & rollback

| Rủi ro | Giảm thiểu | Rollback |
|---|---|---|
| Nội dung mỏng/không duyệt kịp | Tuyển reviewer từ tuần 1; AI draft + người sửa; chỉ REVIEWED khi ký | Giữ DRAFT, không quảng cáo |
| FSRS sai/migration lỗi | Spike + test vector + shadow mode 1 tuần | Flag `scheduler=sm2`; giữ cột cũ |
| AI provider sai/đắt | Bộ 60+20 case; quota; cache; model rẻ cho tra nhanh | Tắt vision/ASR bằng env; text vẫn chạy |
| Voice riêng tư/accuracy | Chỉ transcript; consent; Azure read-aloud; không claim phoneme | Tắt `features.voice` |
| Bản quyền reader | Paste-only, trích đoạn + link, public domain | Tắt reader |
| Public signup abuse | Invite code + rate limit + email verify | Đóng invite |
| Scope creep | Gate + “không làm” list | Cắt P2 |
| Mất dữ liệu | Migration additive + backup trước deploy + test restore | Restore backup, flag off |

**Không làm trong 90 ngày:** leaderboard/energy/streak phạt; A1–C2 tổng quát; app native; social/marketplace; host PDF/phụ đề; chấm âm vị bằng LLM transcript; chứng chỉ CEFR; bán gói “không giới hạn”.

### 20.13 Việc cần chốt trước khi triển khai

1. **Niche nội dung:** đề xuất A1 nền tảng + gói “công việc/IT” (email, meeting, standup, phỏng vấn). Hay nhắm chung A1?
2. **Người duyệt nội dung:** ai duyệt 50–70 bài? Có sẵn giáo viên chưa? Đây là đường găng.
3. **Provider AI:** model text/vision nào? Có credential chưa? ASR/TTS dùng provider nào?
4. **Voice:** đề xuất Stage 1 (ghi âm → transcript → feedback ngữ pháp/độ rõ) ở P1B; phát âm chuyên sâu ở P2. Đồng ý không?
5. **Beta:** invite-only 10–20 người ở P2, hay mở đăng ký sớm hơn?
6. **Thời gian:** làm được bao nhiêu giờ/tuần để chốt timeline thật?
7. **Lưu plan:** roadmap này đã ghi trong file; có cần tách thành `docs/ROADMAP.md` riêng để dễ theo dõi không?

### 20.14 Nhật ký roadmap

- 31/10/2026: Audit toàn bộ source, đọc ảnh E2E 360px/1440px, đếm nội dung JSON (16 mục, 46 câu, 45 MCQ + 1 writing, toàn khóa DRAFT), nghiên cứu 4 nhóm đối thủ (Duolingo/Busuu/Babbel/Memrise; Anki/Quizlet/LingQ/Readlang/Migaku/Language Reactor; ELSA/Speak/Praktika/Talkpal/Cambly; eJOY/Cake/Monkey/Edupia/IOE + thanh toán/Zalo/PDPL). Lập roadmap P0/P1A/P1B/P2. Chưa sửa code, chưa migration, chưa cấu hình provider thật. Đề xuất bắt đầu P0 trong 2 tuần; P0-07 cần credential provider.
- 31/10/2026: Chưa tick task nào; chờ chủ dự án duyệt P0 và chốt các mục 20.13.

## 21. Bộ đề B1 từ PDF do người dùng cung cấp (01/11/2026)

Theo yêu cầu mới, tạm gác roadmap mục 20; thực hiện màn bộ đề riêng, không giới hạn thời gian. Phần nghe để người học tự nghe ngoài và chọn, không cung cấp đáp án nghe. Nội dung scan bị thiếu hoặc che được đánh dấu thay vì suy đoán.

- [x] B101 — Kiểm kê PDF 90 trang, tham khảo nhiều agent; người dùng xác nhận đánh dấu các câu thiếu thay vì tự tạo nội dung.
- [x] B102 — Biên soạn câu đọc, viết và nói kèm đáp án hoặc bài mẫu, giải thích và bản dịch; ghi chú các câu nguồn thiếu/mơ hồ. Nội dung được đối chiếu một phần, chưa được giáo viên thẩm định toàn bộ.
- [x] B103 — Trích hình phần nghe và hình thông báo; hoàn thiện màn làm đề riêng và API.
- [x] B104 — Kiểm thử server, giao diện desktop/mobile và kiểm kê số mục; ghi rõ giới hạn chất lượng và các câu nguồn không đọc được.
- [x] B105 — Theo xác nhận của người dùng, tự lưu bài làm theo tài khoản lên máy chủ; hỗ trợ xuất/khôi phục/xóa, kiểm thử cách ly tài khoản và tiếp tục sau tải lại.

Nhật ký:
- 01/11/2026: Đã render 90 trang PDF scan, nhận dạng OCR để hỗ trợ, chia việc biên soạn và đối chiếu độc lập. Người dùng chọn đánh dấu thiếu các câu không thấy hoặc bị che. Màn bộ đề gồm 614 mục, trong đó có 195 câu nghe, các câu thiếu được giữ trạng thái không khả dụng; có 72 ảnh. Các lời giải được đối chiếu một phần, chưa được giáo viên thẩm định toàn bộ; audio do người học tự cung cấp.
- 01/11/2026: Theo xác nhận của người dùng, đã thêm migration V5 và tự lưu bài B1 theo tài khoản, kiểm tra version, hỗ trợ xuất/khôi phục/xóa. Backend 141 test thực thi đạt, 1 test PostgreSQL skipped; frontend 67/67 đạt, build đạt; E2E Edge 360px và 1440px xác nhận làm đề, xem đáp án, chọn nghe và tải lại giữ bài. PostgreSQL và đồng thời thực tế chưa kiểm chứng tại máy này.
