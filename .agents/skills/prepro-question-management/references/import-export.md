# Excel Import/Export — TOEIC Questions

## Import Workflow

### Components liên quan
- `TOEICBulkUpload` (`src/components/TOEICBulkUpload.tsx`) — Main upload UI
- `TOEICBulkUploadMVC` (`src/views/components/TOEICBulkUploadMVC.tsx`) — MVC version
- `ExcelUpload` (`src/components/ExcelUpload.tsx`) — Generic Excel upload

### Library
- Sử dụng `xlsx` package (SheetJS)
- Import: `import * as XLSX from 'xlsx'`

### Excel Template Format

Các cột bắt buộc:

| Column | Type | Mô tả |
|--------|------|--------|
| `part` | 1-7 | Part TOEIC |
| `prompt_text` | string | Nội dung câu hỏi |
| `choice_A` | string | Đáp án A |
| `choice_B` | string | Đáp án B |
| `choice_C` | string | Đáp án C |
| `choice_D` | string | Đáp án D |
| `correct_choice` | A/B/C/D | Đáp án đúng |
| `explain_vi` | string | Giải thích tiếng Việt |
| `explain_en` | string | Giải thích tiếng Anh |

Các cột tùy chọn:

| Column | Type | Default |
|--------|------|---------|
| `difficulty` | easy/medium/hard | medium |
| `tags` | comma-separated | [] |
| `status` | draft/published | draft |
| `audio_url` | URL | null |
| `image_url` | URL | null |
| `transcript` | string | null |

### Validation rules khi import
1. `part` phải là số 1-7
2. `correct_choice` phải là A, B, C, hoặc D
3. `prompt_text` không được trống
4. Ít nhất 2 choices phải có giá trị
5. Part 1: nên có `image_url`
6. Part 1-4: nên có `audio_url`
7. Part 3,4,6,7: cần passage (xử lý riêng)

### Import flow
1. User upload file .xlsx
2. Parse file với SheetJS
3. Validate từng row
4. Hiển thị preview + error report
5. User confirm → batch insert vào Supabase
6. Report kết quả: success/failed counts

## Export Workflow

- Export question bank ra file .xlsx
- Filter theo part, difficulty, status trước khi export
- Cùng format với import template
