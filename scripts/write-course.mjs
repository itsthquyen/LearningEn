import fs from 'node:fs';

// Editorial source; generated JSON is versioned and loaded into the database.
const mc = (id, prompt, options, answer, explanation) => ({ id, prompt, options, answer, explanation, type: 'MULTIPLE_CHOICE' });
const units = [
  ['greetings', 'Chào hỏi và giới thiệu', 'Giới thiệu tên và hỏi tên người khác.',
    'Dùng “I am …” hoặc “My name is …” để giới thiệu. “What is your name?” hỏi tên. “Nice to meet you” dùng khi gặp lần đầu.\nVí dụ: Hello, I am Linh. — Xin chào, tôi là Linh.\nMy name is Nam. — Tên tôi là Nam.',
    [['Điền: My name ___ Mai.', ['is','are','am'], 'is', 'My name là chủ ngữ số ít, đi với is.'], ['Câu nào hỏi tên?', ['What is your name?','How old are you?','Where are you from?'], 'What is your name?', 'What is your name? nghĩa là Bạn tên gì?'], ['Chọn câu giới thiệu đúng.', ['I am An.','I is An.','I are An.'], 'I am An.', 'I đi với am.']]],
  ['be', 'Động từ be: am, is, are', 'Dùng be với các đại từ nhân xưng.',
    'I → am; he/she/it → is; you/we/they → are. Phủ định thêm not sau be. Câu hỏi đưa be lên trước chủ ngữ.\nShe is a teacher. — Cô ấy là giáo viên.\nAre you ready? — Bạn sẵn sàng chưa?',
    [['They ___ students.', ['am','is','are'], 'are', 'They là số nhiều, dùng are.'], ['Chọn câu phủ định đúng.', ['He is not tired.','He not is tired.','He does not is tired.'], 'He is not tired.', 'Thêm not ngay sau is.'], ['Chọn câu hỏi đúng.', ['Are you a student?','You are a student?','Is you a student?'], 'Are you a student?', 'Đảo are lên trước you để hỏi.']]],
  ['articles', 'Danh từ và a/an', 'Dùng mạo từ với danh từ đếm được số ít.',
    'Danh từ đếm được số ít thường cần a/an hoặc từ hạn định. Chọn a/an theo ÂM đầu: a book, an apple, an hour, a university. Không chỉ nhìn chữ cái.\nThis is an apple. — Đây là một quả táo.',
    [['Chọn: ___ apple.', ['a','an','two'], 'an', 'Apple bắt đầu bằng nguyên âm /æ/.'], ['Chọn: ___ university.', ['an','a','three'], 'a', 'University bắt đầu bằng phụ âm /j/.'], ['Số nhiều của book là gì?', ['books','bookes','bookies'], 'books', 'Thông thường thêm -s: books.']]],
  ['present', 'Thói quen mỗi ngày', 'Dùng hiện tại đơn để nói về thói quen.',
    'I/you/we/they dùng động từ nguyên mẫu. He/she/it thường thêm -s hoặc -es. Dùng do/does để hỏi; don’t/doesn’t để phủ định, sau đó dùng động từ nguyên mẫu.\nShe works every day. — Cô ấy làm việc mỗi ngày.\nHe does not work on Sunday. — Anh ấy không làm việc vào Chủ nhật.',
    [['She ___ English every day.', ['study','studies','studying'], 'studies', 'She + studies; phụ âm + y chuyển thành -ies.'], ['He does not ___ coffee.', ['drinks','drink','drinking'], 'drink', 'Sau does not dùng nguyên mẫu.'], ['___ you work here?', ['Do','Does','Are'], 'Do', 'You đi với trợ động từ do.']]],
  ['questions', 'Hỏi thông tin cơ bản', 'Phân biệt what, where, when và who.',
    'What hỏi sự vật/hoạt động. Where hỏi nơi chốn. When hỏi thời điểm. Who hỏi người.\nWhere do you live? — Bạn sống ở đâu?\nWhen does the meeting start? — Cuộc họp bắt đầu khi nào?',
    [['___ do you live? — In Hanoi.', ['Where','Who','When'], 'Where', 'In Hanoi là địa điểm.'], ['___ is your teacher? — Ms Lan.', ['When','Who','Where'], 'Who', 'Ms Lan là người.'], ['___ does class start? — At nine.', ['When','Where','Who'], 'When', 'At nine là thời gian.']]],
  ['time', 'Giờ và lịch hẹn', 'Dùng giới từ thời gian at, on, in.',
    'Dùng at với giờ: at 9 am. Dùng on với ngày/thứ: on Monday. Dùng in với tháng/năm: in May, in 2026.\nThe meeting is on Tuesday at ten. — Cuộc họp vào thứ Ba lúc mười giờ.',
    [['The lesson starts ___ 8 am.', ['at','on','in'], 'at', 'Giờ cụ thể dùng at.'], ['We meet ___ Monday.', ['in','at','on'], 'on', 'Thứ trong tuần dùng on.'], ['My birthday is ___ May.', ['at','in','on'], 'in', 'Tháng dùng in.']]],
  ['can', 'Khả năng và lời nhờ', 'Dùng can + động từ nguyên mẫu.',
    'Can diễn tả khả năng hoặc lời nhờ. Sau can dùng nguyên mẫu không to. Không thêm -s sau he/she. Can you help me? — Bạn có thể giúp tôi không?\nShe can swim. — Cô ấy biết bơi.',
    [['She can ___ English.', ['speaks','speak','to speak'], 'speak', 'Can + nguyên mẫu không to.'], ['Chọn lời nhờ lịch sự.', ['Can you help me, please?','You helps me.','Can you to help?'], 'Can you help me, please?', 'Can you …, please? là mẫu lời nhờ.'], ['Phủ định của can là gì?', ['cannot','does not can','can no'], 'cannot', 'Cannot hoặc dạng rút gọn can’t.']]],
  ['there', 'Mô tả nơi chốn', 'Dùng there is/there are và giới từ vị trí.',
    'There is + danh từ số ít. There are + danh từ số nhiều. On = trên bề mặt, in = bên trong, under = bên dưới.\nThere is a book on the table. — Có một quyển sách trên bàn.',
    [['There ___ two chairs.', ['is','are','am'], 'are', 'Two chairs là số nhiều.'], ['There ___ a cafe here.', ['is','are','be'], 'is', 'A cafe là số ít.'], ['The cat is under the table. Con mèo ở đâu?', ['Dưới bàn','Trên bàn','Trong bàn'], 'Dưới bàn', 'Under nghĩa là bên dưới.']]],
  ['continuous', 'Việc đang xảy ra', 'Dùng be + V-ing cho hành động lúc nói.',
    'Hiện tại tiếp diễn: am/is/are + động từ -ing. Dùng cho hành động đang diễn ra. Phân biệt với thói quen ở hiện tại đơn.\nI am reading now. — Tôi đang đọc.\nI read every day. — Tôi đọc mỗi ngày.',
    [['Look! She ___ a book.', ['is reading','reads every day','read'], 'is reading', 'Look! báo hiệu hành động đang diễn ra.'], ['They ___ working now.', ['is','am','are'], 'are', 'They + are + V-ing.'], ['Câu nào nói về thói quen?', ['I walk to work every day.','I am walking now.','Look, I am walking!'], 'I walk to work every day.', 'Every day thể hiện thói quen.']]],
  ['past', 'Kể chuyện đã qua', 'Nhận biết quá khứ đơn với mốc thời gian.',
    'Dùng quá khứ đơn cho sự việc đã kết thúc. Động từ thường thêm -ed, một số bất quy tắc: go → went. Phủ định dùng did not + nguyên mẫu. Be có was/were.\nI worked yesterday. — Hôm qua tôi đã làm việc.\nWe went home. — Chúng tôi đã về nhà.',
    [['Yesterday, I ___ to school.', ['go','went','going'], 'went', 'Quá khứ của go là went.'], ['She did not ___ yesterday.', ['worked','work','works'], 'work', 'Sau did not dùng nguyên mẫu.'], ['They ___ at home last night.', ['was','were','is'], 'were', 'They dùng were trong quá khứ.']]],
  ['plans', 'Nói về kế hoạch', 'Dùng be going to + nguyên mẫu.',
    'Be going to + động từ nguyên mẫu diễn tả dự định. Chọn am/is/are theo chủ ngữ.\nI am going to study tonight. — Tôi định học tối nay.\nWhat are you going to do? — Bạn định làm gì?',
    [['I ___ going to study tonight.', ['am','is','are'], 'am', 'I dùng am.'], ['She is going to ___ a book.', ['reads','reading','read'], 'read', 'Going to + nguyên mẫu.'], ['Chọn câu hỏi đúng.', ['Are you going to travel?','Do you going to travel?','You is going travel?'], 'Are you going to travel?', 'Đảo are lên trước you.']]],
  ['work-email', 'Tin nhắn trong công việc', 'Hiểu lời nhờ và lời cảm ơn ngắn.',
    'Could you send me the report, please? — Bạn có thể gửi cho tôi báo cáo không?\nThank you for your help. — Cảm ơn sự giúp đỡ của bạn.\nI look forward to hearing from you. — Tôi mong nhận được phản hồi từ bạn.\nSau look forward to dùng danh từ hoặc V-ing; to ở đây là giới từ.',
    [['I look forward to ___ from you.', ['hear','hearing','heard'], 'hearing', 'Look forward to + V-ing.'], ['Chọn lời nhờ phù hợp email.', ['Could you send me the report, please?','Report me now!','You sends report?'], 'Could you send me the report, please?', 'Could you …, please? diễn đạt lời nhờ.'], ['Thank you ___ your help.', ['for','to','at'], 'for', 'Thank you for + danh từ hoặc V-ing.']]],
];
const lessons=[];
for(let i=0;i<units.length;i++) {
  const [code,title,objective,body,questions]=units[i];
  lessons.push({code,title,objective,kind:'LESSON',body,questions:questions.map((q,j)=>mc(`q${j+1}`,...q))});
  if((i+1)%4===0) {
    const index=(i+1)/4;
    const checkpointQuestions = [
      [mc('c1','My brother ___ a doctor.',['am','is','are'],'is','My brother là số ít.'),mc('c2','An là mạo từ phù hợp trước từ nào?',['hour','book','university'],'hour','Hour có âm đầu là nguyên âm, h không phát âm.'),mc('c3','Does she ___ here?',['works','work','working'],'work','Sau does dùng nguyên mẫu.')],
      [mc('c1','The train leaves ___ Friday ___ 7 am.',['on / at','in / on','at / in'],'on / at','On + ngày, at + giờ.'),mc('c2','___ can I find a pharmacy?',['Where','Who','When'],'Where','Hỏi địa điểm dùng where.'),mc('c3','There ___ three people in the room.',['is','are','am'],'are','Three people là số nhiều.')],
      [mc('c1','Last week we ___ a new project.',['start','started','starting'],'started','Last week là thời gian đã kết thúc.'),mc('c2','Listen! Someone ___ at the door.',['is knocking','knocks yesterday','knock'],'is knocking','Hành động đang xảy ra: is knocking.'),mc('c3','We are going to ___ tomorrow.',['meeting','meets','meet'],'meet','Going to + nguyên mẫu.')],
    ][index-1];
    lessons.push({code:`checkpoint-${index}`,title:`Kiểm tra mốc ${index}`,objective:'Tự trả lời câu hỏi mới, không dùng gợi ý; đây là đánh giá nội bộ, không phải chứng chỉ CEFR.',kind:'CHECKPOINT',body:'Hãy trả lời trước khi xem lại bài. Nếu có dùng gợi ý, đánh dấu ô hỗ trợ. Kết quả có hỗ trợ không được tính là đã đạt độc lập.',questions:checkpointQuestions});
  }
}
lessons.push({code:'application',title:'Vận dụng: giới thiệu và hẹn gặp',objective:'Viết 4–6 câu giới thiệu bản thân, thói quen và một lời hẹn.',kind:'APPLICATION',body:'Viết một email ngắn cho đồng nghiệp mới. Giới thiệu tên/công việc, một thói quen học và một lịch hẹn cụ thể.\nTự kiểm tra: có chủ ngữ và động từ; be đúng; giới từ ngày/giờ đúng; lời nhờ lịch sự. Bài viết được lưu làm bằng chứng thực hành; cần người duyệt để xác nhận năng lực.',questions:[{id:'writing',prompt:'Viết email của bạn bằng tiếng Anh (4–6 câu).',type:'WRITING',options:[],answer:'Hi, I am Linh. I work in Hanoi. I study English every evening. Can we meet on Monday at 9 am? Thank you for your help.',explanation:'Đây chỉ là ví dụ tham khảo. Bài viết không tự chấm đạt; cần kiểm tra theo rubric: đúng ý, rõ nghĩa, cấu trúc cơ bản và cách dùng thời gian.'}]});
fs.mkdirSync('backend/src/main/resources/content',{recursive:true});
fs.writeFileSync('backend/src/main/resources/content/a1-foundations.json',JSON.stringify({code:'a1-foundations-v1',title:'Nền tảng tiếng Anh trong đời sống',level:'A1',description:'12 bài ngắn, 3 kiểm tra mốc và 1 nhiệm vụ vận dụng. Nội dung tự biên soạn bản nháp, cần người có chuyên môn duyệt trước phát hành.',contentStatus:'DRAFT',version:1,lessons},null,2)+'\n');
