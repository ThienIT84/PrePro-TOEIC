# Views Layer

Thư mục này chứa các pure UI components theo mô hình MVC.

## Cấu trúc:
- `components/` - Reusable UI components
- `pages/` - Page-level components

## Nguyên tắc:
- Chỉ hiển thị UI, không chứa business logic
- Nhận data qua props từ controllers
- Gọi actions qua props callbacks
- Sử dụng UI components từ `src/components/ui/` hiện tại
