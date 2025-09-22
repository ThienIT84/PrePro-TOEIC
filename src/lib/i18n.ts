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