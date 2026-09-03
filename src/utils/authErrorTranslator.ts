/**
 * Tiện ích dịch thông báo lỗi Supabase Auth sang tiếng Việt thân thiện
 */
export function translateAuthError(error: any): string {

  const message = typeof error === 'string' ? error : error.message || '';
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials')) {
    return 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
  }

  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'Email này đã được đăng ký tài khoản. Bạn có thể đăng nhập hoặc dùng chức năng Quên mật khẩu.';
  }

  if (lower.includes('password should be at least 6 characters')) {
    return 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.';
  }

  if (lower.includes('rate limit')) {
    return 'Bạn đã thao tác quá nhiều lần. Vui lòng đợi 1-2 phút rồi thử lại.';
  }

  if (lower.includes('email not confirmed')) {
    return 'Email của bạn chưa được kích hoạt. Vui lòng kiểm tra hộp thư để xác nhận.';
  }

  if (lower.includes('invalid email') || lower.includes('unable to validate email')) {
    return 'Địa chỉ email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: name@gmail.com).';
  }

  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền Internet.';
  }

  return message || 'Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại.';
}
