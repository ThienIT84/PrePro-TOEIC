# Models Layer

Thư mục này chứa các data models và business logic theo mô hình MVC.

## Cấu trúc:
- `entities/` - Các entity classes (Question, ExamSet, User, etc.)
- `repositories/` - Data access layer (tương tác với Supabase)

## Nguyên tắc:
- Chỉ chứa business logic và data validation
- Không chứa UI logic
- Sử dụng types từ `src/types/index.ts` hiện tại
- Không thay đổi Supabase schema
