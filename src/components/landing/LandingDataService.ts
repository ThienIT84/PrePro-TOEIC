import { InteractiveQuestion, MetricStat, ToeicPartInfo, FaqItem, ListeningAccentSample } from './types';

export class LandingDataService {
  /**
   * Ngân hàng câu hỏi mẫu tương tác ngay trên Hero section (không cần đăng nhập)
   */
  static getSampleQuestions(): InteractiveQuestion[] {
    return [
      {
        id: 'sample-q1',
        part: 5,
        promptText: 'Ms. Henderson requested that all expense reports be submitted _______ Friday afternoon.',
        choices: {
          A: 'before',
          B: 'until',
          C: 'during',
          D: 'among'
        },
        correctChoice: 'A',
        explainVi: '"Before Friday afternoon" nghĩa là "trước chiều thứ Sáu" (chỉ thời hạn dứt điểm). "Until" dùng cho hành động kéo dài liên tục, "during" dùng với khoảng thời gian (during the meeting), "among" dùng cho từ 3 đối tượng trở lên.',
        explainEn: '"Before" indicates a deadline by which the action must be completed. "Until" is used for continuous actions up to a point in time.',
        grammarTopic: 'Prepositions of Time',
        difficulty: 'medium'
      },
      {
        id: 'sample-q2',
        part: 5,
        promptText: 'The newly introduced software operates _______ more efficiently than the previous version.',
        choices: {
          A: 'consider',
          B: 'considerable',
          C: 'considerably',
          D: 'consideration'
        },
        correctChoice: 'C',
        explainVi: 'Khoảng trống đứng trước cụm so sánh hơn "more efficiently" (trạng từ) nên cần một trạng từ chỉ mức độ để bổ nghĩa. "Considerably" (đáng kể) bổ nghĩa cho "more efficiently".',
        explainEn: 'We need an adverb of degree ("considerably") to modify the comparative adverb structure "more efficiently".',
        grammarTopic: 'Adverbs of Degree & Comparatives',
        difficulty: 'medium'
      },
      {
        id: 'sample-q3',
        part: 5,
        promptText: 'Participants in the leadership workshop will receive a certificate of _______ upon completion.',
        choices: {
          A: 'achieve',
          B: 'achievement',
          C: 'achieving',
          D: 'achiever'
        },
        correctChoice: 'B',
        explainVi: 'Sau giới từ "of" cần một danh từ để tạo thành cụm danh từ mang nghĩa "chứng chỉ thành tích / hoàn thành xuất sắc" -> "certificate of achievement".',
        explainEn: 'The preposition "of" requires a noun object to form the standard collocation "certificate of achievement".',
        grammarTopic: 'Word Form (Noun Collocation)',
        difficulty: 'easy'
      }
    ];
  }

  /**
   * Dữ liệu các chỉ số thống kê nổi bật
   */
  static getMetrics(): MetricStat[] {
    return [
      {
        value: '10,000+',
        label: 'Câu hỏi chuẩn ETS',
        description: 'Bao quát trọn vẹn 7 Part từ mức cơ bản đến nâng cao 990 điểm',
        iconName: 'BookOpen'
      },
      {
        value: '95.4%',
        label: 'Tăng điểm sau 30 ngày',
        description: 'Học viên ghi nhận mức tăng trung bình 150 - 250+ điểm TOEIC',
        iconName: 'TrendingUp'
      },
      {
        value: 'SM-2',
        label: 'Ghi nhớ ngắt quãng',
        description: 'Tự động tính toán điểm rơi trí nhớ để nhắc ôn tập đúng thời điểm',
        iconName: 'RotateCcw'
      },
      {
        value: '3 Giây',
        label: 'Tạo câu hỏi bằng AI',
        description: 'Giáo viên và học viên sinh đề thi tự động với Groq & Llama 3.1',
        iconName: 'Zap'
      }
    ];
  }

  /**
   * Dữ liệu chi tiết 7 Parts TOEIC cho Phase 2
   */
  static getToeicParts(): ToeicPartInfo[] {
    return [
      {
        part: 1,
        name: 'Mô tả hình ảnh (Photographs)',
        englishName: 'Photographs',
        type: 'listening',
        questionCount: 6,
        duration: 'Nghe ~5 phút',
        description: 'Quan sát 1 bức ảnh và chọn 1 trong 4 câu miêu tả đúng nhất những gì diễn ra trong ảnh.',
        tips: ['Quan sát hành động nhân vật chính', 'Để ý thì hiện tại tiếp diễn hoặc bị động', 'Cảnh giác các từ đồng âm gây nhiễu'],
        badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
      },
      {
        part: 2,
        name: 'Hỏi & Đáp (Question-Response)',
        englishName: 'Question-Response',
        type: 'listening',
        questionCount: 25,
        duration: 'Nghe ~12 phút',
        description: 'Nghe 1 câu hỏi hoặc phát biểu và chọn 1 trong 3 câu trả lời phù hợp nhất (không in sẵn trong đề).',
        tips: ['Bắt từ để hỏi Wh- (Who, Where, When...)', 'Tránh bẫy lặp lại từ cùng âm', 'Câu trả lời gián tiếp thường là đáp án đúng'],
        badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
      },
      {
        part: 3,
        name: 'Đoạn hội thoại (Conversations)',
        englishName: 'Conversations',
        type: 'listening',
        questionCount: 39,
        duration: 'Nghe ~18 phút',
        description: 'Nghe các đoạn đối thoại giữa 2-3 người (13 đoạn, mỗi đoạn 3 câu hỏi) kèm biểu đồ hoặc hình ảnh.',
        tips: ['Đọc lướt câu hỏi trước khi audio phát', 'Xác định bối cảnh nghề nghiệp & địa điểm', 'Tập trung vào câu nói mang hàm ý'],
        badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
      },
      {
        part: 4,
        name: 'Bài nói chuyện ngắn (Short Talks)',
        englishName: 'Short Talks',
        type: 'listening',
        questionCount: 30,
        duration: 'Nghe ~15 phút',
        description: 'Nghe 1 người phát biểu (thông báo sân bay, quảng cáo, tin nhắn thoại, bản tin thời tiết).',
        tips: ['Nắm bắt thông điệp chính ngay 10 giây đầu', 'Ghi nhớ số liệu và thời gian', 'Chú ý lời yêu cầu hoặc hành động tiếp theo'],
        badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
      },
      {
        part: 5,
        name: 'Hoàn thành câu (Incomplete Sentences)',
        englishName: 'Incomplete Sentences',
        type: 'reading',
        questionCount: 30,
        duration: 'Làm trong ~12 phút',
        description: 'Điền từ thích hợp vào chỗ trống để kiểm tra ngữ pháp (từ loại, thì, mệnh đề) và từ vựng kinh doanh.',
        tips: ['Xác định từ loại xung quanh chỗ trống trước', 'Phân biệt collocation thường gặp', 'Không dịch cả câu nếu câu thuần ngữ pháp'],
        badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      },
      {
        part: 6,
        name: 'Hoàn thành đoạn văn (Text Completion)',
        englishName: 'Text Completion',
        type: 'reading',
        questionCount: 16,
        duration: 'Làm trong ~8 phút',
        description: '4 đoạn văn (thư từ, memo, thông báo, bài báo), mỗi đoạn có 4 chỗ trống gồm từ vựng và câu nguyên vẹn.',
        tips: ['Đọc câu liền trước và liền sau để chọn câu điền', 'Để ý các liên từ nối logic (However, Therefore)', 'Kiểm tra tính nhất quán về thì'],
        badgeColor: 'bg-green-500/10 text-green-600 dark:text-green-400'
      },
      {
        part: 7,
        name: 'Đọc hiểu đoạn văn (Reading Comprehension)',
        englishName: 'Reading Comprehension',
        type: 'reading',
        questionCount: 54,
        duration: 'Làm trong ~55 phút',
        description: 'Bao gồm đoạn đơn (Single), đoạn kép (Double) và đoạn ba (Triple passage) với đa dạng tài liệu kinh doanh thực tế.',
        tips: ['Phân bổ thời gian nghiêm ngặt', 'Đọc câu hỏi trước để tìm từ khóa định vị', 'Luyện kỹ năng Skimming & Scanning'],
        badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
      }
    ];
  }

  /**
   * Danh sách câu hỏi thường gặp (FAQ)
   */
  static getFaqs(): FaqItem[] {
    return [
      {
        id: 'faq-1',
        question: 'PrePro-TOEIC có bám sát đề thi TOEIC thật mới nhất không?',
        answer: 'Hệ thống liên tục cập nhật theo format đề thi New Economy & ETS mới nhất. Cấu trúc câu hỏi, dạng bài bẫy, ngữ cảnh thương mại (emails, invoices, memos) đều được chuẩn hóa sát với đề thi thực tế tại IIG.',
        category: 'general'
      },
      {
        id: 'faq-2',
        question: 'Thuật toán Spaced Repetition (SM-2) giúp tôi tăng điểm như thế nào?',
        answer: 'Khi bạn làm sai một câu hỏi, hệ thống không chỉ hiện đáp án mà còn đưa câu đó vào chu kỳ ôn tập. Dựa trên thuật toán SuperMemo-2 (SM-2), câu hỏi sẽ được hẹn giờ xuất hiện lại sau 1 ngày, 3 ngày, 7 ngày... cho đến khi não bộ ghi nhớ sâu vào bộ nhớ dài hạn.',
        category: 'student'
      },
      {
        id: 'faq-3',
        question: 'Tính năng tạo câu hỏi bằng AI hoạt động ra sao?',
        answer: 'PrePro-TOEIC tích hợp mô hình Llama 3.1 siêu tốc qua Groq API. Giáo viên và học viên có thể yêu cầu tạo đề theo từng Part, chọn độ khó (Dễ, Trung bình, Khó) hoặc theo chủ đề cụ thể (Marketing, Tuyển dụng, Tài chính...) chỉ trong chưa đầy 3 giây.',
        category: 'general'
      },
      {
        id: 'faq-4',
        question: 'Giáo viên và Trung tâm ngoại ngữ có thể sử dụng hệ thống như thế nào?',
        answer: 'Giáo viên có quyền quản lý lớp học (Class Management), tự tạo đề thi và giao bài tập, theo dõi thời gian làm bài, bảng xếp hạng và nhận cảnh báo tự động khi có học viên bị hổng kiến thức hoặc có nguy cơ điểm thấp.',
        category: 'teacher'
      },
      {
        id: 'faq-5',
        question: 'Tôi có thể làm bài trên điện thoại được không?',
        answer: 'Hoàn toàn được! Giao diện PrePro-TOEIC được tối ưu hóa responsive 100% trên điện thoại, máy tính bảng và máy tính bàn, hỗ trợ cả chế độ Sáng và Tối giúp bảo vệ mắt khi luyện thi buổi tối.',
        category: 'student'
      }
    ];
  }

  /**
   * Danh sách mẫu bài nghe 4 giọng bản xứ chuẩn ETS
   */
  static getListeningSamples(): ListeningAccentSample[] {
    return [
      {
        id: 'accent-us',
        country: 'US',
        countryName: 'Mỹ (American)',
        flag: '🇺🇸',
        accentTitle: 'Ngữ điệu Bắc Mỹ chuẩn (General American)',
        description: 'Phát âm rõ ràng âm /r/ uốn lưỡi, nguyên âm mở rộng, chiếm ~50% thời lượng bài thi.',
        sampleAudioPrompt: 'Part 2: Question-Response #14',
        speakerText: 'Could you review the quarterly sales presentation before tomorrow morning?',
        translationVi: 'Bạn có thể xem lại bài thuyết trình doanh số quý trước sáng mai được không?',
        keyPhonetics: 'Đặc trưng: Âm /t/ giữa hai nguyên âm phát âm thành flap T (nhẹ như /d/).'
      },
      {
        id: 'accent-uk',
        country: 'UK',
        countryName: 'Anh (British)',
        flag: '🇬🇧',
        accentTitle: 'Phát âm chuẩn Anh quốc (Received Pronunciation)',
        description: 'Âm /r/ câm ở đuôi từ, phụ âm bật mạnh dứt khoát, chiếm ~25% đề thi.',
        sampleAudioPrompt: 'Part 2: Question-Response #18',
        speakerText: 'The maintenance schedule has been postponed until further notice, hasn\'t it?',
        translationVi: 'Lịch bảo trì đã được hoãn lại cho đến khi có thông báo mới, đúng không?',
        keyPhonetics: 'Đặc trưng: Không phát âm /r/ cuối từ (further -> /fɜːðə/), âm /t/ chặn hơi dứt khoát.'
      },
      {
        id: 'accent-au',
        country: 'AU',
        countryName: 'Úc (Australian)',
        flag: '🇦🇺',
        accentTitle: 'Ngữ điệu Úc (Bẫy phát âm phổ biến nhất)',
        description: 'Biến đổi các nguyên âm đôi (dễ nhầm giữa /eɪ/ và /aɪ/), chiếm ~15% đề thi.',
        sampleAudioPrompt: 'Part 3: Short Conversation #42',
        speakerText: 'We should probably take the express train today because of the heavy traffic.',
        translationVi: 'Hôm nay chúng ta có lẽ nên đi tàu tốc hành vì đường đang tắc nghẽn nặng.',
        keyPhonetics: 'Đặc trưng: Từ "today" phát âm gần như "to-die" (/təˈdaɪ/), âm /eɪ/ nghiêng về /aɪ/.'
      },
      {
        id: 'accent-ca',
        country: 'CA',
        countryName: 'Canada (Canadian)',
        flag: '🇨🇦',
        accentTitle: 'Ngữ điệu Canada (Canadian English)',
        description: 'Tương tự giọng Bắc Mỹ nhưng có đặc trưng Canadian Raising ở các nguyên âm đôi.',
        sampleAudioPrompt: 'Part 4: Announcement #75',
        speakerText: 'Attention passengers on flight AC-402, boarding will begin at gate twelve.',
        translationVi: 'Xin hành khách trên chuyến bay AC-402 chú ý, việc lên máy bay sẽ bắt đầu tại cổng 12.',
        keyPhonetics: 'Đặc trưng: Canadian Raising trong các từ "about", "out", phát âm tròn và dứt khoát.'
      }
    ];
  }
}

