type Language = 'vi' | 'en';

interface Translations {
  [key: string]: {
    vi: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.dashboard': { vi: 'Bảng điều khiển', en: 'Dashboard' },
  'nav.drills': { vi: 'Luyện tập', en: 'Drills' },
  'nav.review': { vi: 'Ôn tập', en: 'Review' },
  'nav.analytics': { vi: 'Thống kê', en: 'Analytics' },
  'nav.settings': { vi: 'Cài đặt', en: 'Settings' },
  
  // Auth
  'auth.sign_in': { vi: 'Đăng nhập', en: 'Sign In' },
  'auth.sign_up': { vi: 'Đăng ký', en: 'Sign Up' },
  'auth.sign_out': { vi: 'Đăng xuất', en: 'Sign Out' },
  'auth.email': { vi: 'Email', en: 'Email' },
  'auth.password': { vi: 'Mật khẩu', en: 'Password' },
  'auth.forgot_password': { vi: 'Quên mật khẩu?', en: 'Forgot password?' },
  
  // Dashboard
  'dashboard.welcome': { vi: 'Chào mừng đến với LexiSprint!', en: 'Welcome to LexiSprint!' },
  'dashboard.your_progress': { vi: 'Tiến độ của bạn', en: 'Your Progress' },
  'dashboard.streak': { vi: 'Chuỗi ngày học', en: 'Streak' },
  'dashboard.accuracy': { vi: 'Độ chính xác', en: 'Accuracy' },
  'dashboard.today_review': { vi: 'Ôn tập hôm nay', en: "Today's Review" },
  'dashboard.quick_start': { vi: 'Bắt đầu nhanh', en: 'Quick Start' },
  
  // Drills
  'drill.vocabulary': { vi: 'Từ vựng', en: 'Vocabulary' },
  'drill.grammar': { vi: 'Ngữ pháp', en: 'Grammar' },
  'drill.listening': { vi: 'Nghe', en: 'Listening' },
  'drill.reading': { vi: 'Đọc', en: 'Reading' },
  'drill.mixed': { vi: 'Hỗn hợp', en: 'Mixed' },
  'drill.start': { vi: 'Bắt đầu', en: 'Start' },
  'drill.submit': { vi: 'Gửi', en: 'Submit' },
  'drill.next': { vi: 'Tiếp theo', en: 'Next' },
  'drill.previous': { vi: 'Trước', en: 'Previous' },
  'drill.correct': { vi: 'Đúng!', en: 'Correct!' },
  'drill.incorrect': { vi: 'Sai rồi', en: 'Incorrect' },
  'drill.explanation': { vi: 'Giải thích', en: 'Explanation' },
  'drill.play_audio': { vi: 'Phát âm thanh', en: 'Play Audio' },
  'drill.show_transcript': { vi: 'Hiện transcript', en: 'Show Transcript' },
  
  // Difficulty levels
  'difficulty.easy': { vi: 'Dễ', en: 'Easy' },
  'difficulty.medium': { vi: 'Trung bình', en: 'Medium' },
  'difficulty.hard': { vi: 'Khó', en: 'Hard' },
  
  // Settings
  'settings.profile': { vi: 'Hồ sơ', en: 'Profile' },
  'settings.target_score': { vi: 'Điểm mục tiêu', en: 'Target Score' },
  'settings.test_date': { vi: 'Ngày thi', en: 'Test Date' },
  'settings.language': { vi: 'Ngôn ngữ', en: 'Language' },
  'settings.focus_areas': { vi: 'Kỹ năng ưu tiên', en: 'Focus Areas' },
  'settings.save': { vi: 'Lưu', en: 'Save' },
  
  // Common
  'common.loading': { vi: 'Đang tải...', en: 'Loading...' },
  'common.error': { vi: 'Lỗi', en: 'Error' },
  'common.success': { vi: 'Thành công', en: 'Success' },
  'common.cancel': { vi: 'Hủy', en: 'Cancel' },
  'common.confirm': { vi: 'Xác nhận', en: 'Confirm' },
  'common.days': { vi: 'ngày', en: 'days' },
  'common.minutes': { vi: 'phút', en: 'minutes' },
  
  // Question Assignment (qa)
  'qa.progress_title': { vi: 'Tiến độ gán câu hỏi', en: 'Question Assignment Progress' },
  'qa.progress_subtitle': { vi: 'Gán câu hỏi cho từng phần của đề', en: 'Assign questions to each part of your exam' },
  'qa.assigned': { vi: 'Đã gán', en: 'Assigned' },
  'qa.needed': { vi: 'Cần', en: 'Needed' },
  'qa.remaining': { vi: 'Còn thiếu', en: 'Remaining' },
  'qa.complete': { vi: 'Hoàn tất', en: 'Complete' },
  'qa.auto_assign': { vi: 'Gán tự động (theo cấu hình)', en: 'Auto assign (configured)' },
  'qa.auto_assign_tooltip': { vi: 'Gán tự động theo độ khó và phần đã bật', en: 'Auto assign by difficulty and enabled parts' },
  'qa.manual_assignment': { vi: 'Chọn thủ công', en: 'Manual assignment' },
  'qa.overview': { vi: 'Tổng quan', en: 'Overview' },
  'qa.question_bank': { vi: 'Ngân hàng câu hỏi', en: 'Question Bank' },
  'qa.select_questions_hint': { vi: 'Chọn câu hỏi để gán vào các phần của đề', en: 'Select questions to assign to exam parts' },
  'qa.search_questions_placeholder': { vi: 'Tìm kiếm câu hỏi...', en: 'Search questions...' },
  'qa.all_types': { vi: 'Tất cả loại', en: 'All Types' },
  'qa.all_levels': { vi: 'Tất cả mức', en: 'All Levels' },
  'qa.progress': { vi: 'Tiến độ', en: 'Progress' },
  'qa.assigned_questions': { vi: 'Câu đã gán', en: 'Assigned Questions' },
  'qa.add_selected': { vi: 'Thêm các câu đã chọn', en: 'Add Selected Questions' },
  'qa.questions_needed': { vi: 'câu cần thêm', en: 'questions needed' },
  'qa.complete_parts': { vi: 'Phần đã hoàn tất', en: 'Complete Parts' },
  'qa.incomplete_parts': { vi: 'Phần chưa hoàn tất', en: 'Incomplete Parts' },
  'qa.total_assigned': { vi: 'Tổng đã gán', en: 'Total Assigned' },
  'qa.still_needed': { vi: 'Cần thêm', en: 'Still Needed' },
  
  // Wizard (Create Exam Set)
  'wizard.title': { vi: 'Tạo bộ đề mới', en: 'Create New Exam Set' },
  'wizard.subtitle': { vi: 'Sử dụng trình hướng dẫn để tạo bộ đề TOEIC hoàn chỉnh', en: 'Use this wizard to create a comprehensive TOEIC exam set' },
  'wizard.step.basic': { vi: 'Thông tin cơ bản', en: 'Basic Information' },
  'wizard.step.basic_desc': { vi: 'Chi tiết đề và cài đặt', en: 'Exam details and settings' },
  'wizard.step.parts': { vi: 'Cấu hình phần thi', en: 'Parts Configuration' },
  'wizard.step.parts_desc': { vi: 'Thiết lập các phần TOEIC', en: 'Configure TOEIC parts' },
  'wizard.step.assign': { vi: 'Gán câu hỏi', en: 'Question Assignment' },
  'wizard.step.assign_desc': { vi: 'Gán câu hỏi vào từng phần', en: 'Assign questions to parts' },
  'wizard.step.review': { vi: 'Xem lại', en: 'Review & Preview' },
  'wizard.step.review_desc': { vi: 'Kiểm tra cấu hình đề', en: 'Review exam configuration' },
  'wizard.step.complete': { vi: 'Hoàn tất', en: 'Complete' },
  'wizard.step.complete_desc': { vi: 'Lưu và kích hoạt đề', en: 'Save and activate exam' },
  
  'wizard.basic.title': { vi: 'Thông tin cơ bản', en: 'Basic Information' },
  'wizard.basic.subtitle': { vi: 'Nhập các thông tin cơ bản cho bộ đề', en: 'Provide basic details about your exam set' },
  'wizard.field.title': { vi: 'Tiêu đề đề thi', en: 'Exam Title' },
  'wizard.field.title_ph': { vi: 'VD: TOEIC Practice Test #1', en: 'e.g., TOEIC Practice Test #1' },
  'wizard.field.type': { vi: 'Loại đề', en: 'Exam Type' },
  'wizard.field.description': { vi: 'Mô tả', en: 'Description' },
  'wizard.field.description_ph': { vi: 'Mô tả mục tiêu và nội dung của bộ đề...', en: 'Describe the purpose and content of this exam...' },
  'wizard.field.difficulty': { vi: 'Độ khó', en: 'Difficulty Level' },
  'wizard.field.status': { vi: 'Trạng thái', en: 'Status' },
  'wizard.field.allow_multi': { vi: 'Cho phép làm nhiều lần', en: 'Allow multiple attempts' },
  'wizard.field.max_attempts': { vi: 'Số lần tối đa', en: 'Maximum Attempts' },
  'wizard.field.max_attempts_ph': { vi: 'Để trống nếu không giới hạn', en: 'Leave empty for unlimited' },
  
  'wizard.templates.title': { vi: 'Mẫu nhanh', en: 'Quick Templates' },
  'wizard.templates.subtitle': { vi: 'Chọn một mẫu để bắt đầu nhanh', en: 'Choose a template to get started quickly' },
  'wizard.template.full': { vi: 'Full TOEIC (200 câu)', en: 'Full TOEIC (200 questions)' },
  'wizard.template.mini': { vi: 'Mini TOEIC (50 câu)', en: 'Mini TOEIC (50 questions)' },
  'wizard.common.questions': { vi: 'câu hỏi', en: 'questions' },
  'wizard.common.minutes': { vi: 'phút', en: 'minutes' },
  
  'wizard.buttons.previous': { vi: 'Trước', en: 'Previous' },
  'wizard.buttons.next': { vi: 'Tiếp theo', en: 'Next' },
  'wizard.buttons.create': { vi: 'Tạo bộ đề', en: 'Create Exam Set' },
};

let currentLanguage: Language = 'vi';

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  localStorage.setItem('lexisprint-lang', lang);
};

export const getLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('lexisprint-lang') as Language;
    if (stored && ['vi', 'en'].includes(stored)) {
      currentLanguage = stored;
      return stored;
    }
  }
  return currentLanguage;
};

export const t = (key: string): string => {
  const lang = getLanguage();
  const translation = translations[key];
  if (translation && translation[lang]) {
    return translation[lang];
  }
  console.warn(`Missing translation for key: ${key}`);
  return key;
};

// Initialize language from localStorage on module load
if (typeof window !== 'undefined') {
  getLanguage();
}