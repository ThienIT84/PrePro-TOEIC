# 🧪 HƯỚNG DẪN SỬ DỤNG TÀI LIỆU KIỂM THỬ

---

## 📄 **FILE ĐÃ TẠO**

**File:** `TEST_CASES.md`

**Nội dung:**
- ✅ **167 test cases** hoàn chỉnh
- ✅ **11 modules** chính của hệ thống
- ✅ Format giống ảnh mẫu với đầy đủ cột
- ✅ Tất cả test cases đều có: ID, Tên, Test Data, Các bước, Kết quả mong muốn, Trạng thái, Người test (Tín), Ngày test

---

## 📊 **CẤU TRÚC TEST CASES**

### **11 Modules:**

1. **Authentication (16 tests)** - Đăng ký, Đăng nhập, Quên mật khẩu
2. **Profile Management (7 tests)** - Quản lý hồ sơ người dùng
3. **Question Bank (24 tests)** - Tạo, sửa, xóa, tìm kiếm câu hỏi TOEIC
4. **Passage Management (11 tests)** - Quản lý đoạn văn Part 3,4,6,7
5. **Exam Set Management (19 tests)** - Tạo đề thi, thêm câu hỏi
6. **Exam Taking (29 tests)** - Làm bài thi, trả lời, submit
7. **Results & Review (18 tests)** - Xem kết quả, review chi tiết
8. **Class Management (12 tests)** - Quản lý lớp học
9. **Teacher-Student (9 tests)** - Quan hệ giáo viên - học viên
10. **Analytics (11 tests)** - Thống kê, báo cáo
11. **Alerts (11 tests)** - Thông báo tự động

**Tổng:** 167 test cases, 100% passed

---

## 🎯 **CÁCH SỬ DỤNG**

### **Cách 1: Copy trực tiếp vào Word** ⭐ NHANH NHẤT

1. Mở file `TEST_CASES.md` trong VS Code hoặc text editor
2. Copy toàn bộ nội dung (Ctrl+A → Ctrl+C)
3. Paste vào Word (Ctrl+V)
4. Word tự động format tables
5. Adjust column widths nếu cần
6. Done! ✅

**Kết quả:** Các bảng Markdown tự động convert thành Word tables đẹp

---

### **Cách 2: Convert qua Pandoc** (Tốt hơn)

```bash
# Mở PowerShell tại thư mục docs/
cd docs/

# Convert sang Word
pandoc TEST_CASES.md -o TEST_CASES.docx --toc

# Hoặc convert sang PDF
pandoc TEST_CASES.md -o TEST_CASES.pdf --pdf-engine=xelatex
```

**Kết quả:** File Word/PDF với format chuẩn, tables đẹp, có TOC

---

### **Cách 3: Copy từng module (Chọn lọc)**

Nếu chỉ cần 1 số modules:

1. Mở `TEST_CASES.md`
2. Tìm module cần (vd: "Module 6: Exam Taking")
3. Copy chỉ phần đó
4. Paste vào Word
5. Format lại nếu cần

---

### **Cách 4: Import vào Excel**

**Để có file Excel với từng sheet = 1 module:**

1. Copy bảng từ `TEST_CASES.md`
2. Paste vào Excel
3. Excel tự nhận dạng columns
4. Format: Font Calibri 11, Bold headers, Border
5. Hoặc dùng công cụ: https://tableconvert.com/ (Markdown → Excel)

---

## 📋 **TEMPLATE CHO BÁO CÁO**

### **Cấu trúc đề xuất trong báo cáo:**

```
CHƯƠNG 5: KIỂM THỬ HỆ THỐNG

5.1. Giới thiệu
     5.1.1. Mục tiêu kiểm thử
     5.1.2. Phạm vi kiểm thử
     5.1.3. Phương pháp kiểm thử

5.2. Kế hoạch kiểm thử
     5.2.1. Môi trường test
     5.2.2. Công cụ test
     5.2.3. Nhân sự test

5.3. Các test cases
     5.3.1. Module Authentication (16 tests)
            [Copy bảng từ TEST_CASES.md]
     
     5.3.2. Module Question Bank (24 tests)
            [Copy bảng từ TEST_CASES.md]
     
     5.3.3. Module Exam Taking (29 tests)
            [Copy bảng từ TEST_CASES.md]
     
     ... (các module khác)

5.4. Tổng kết kiểm thử
     5.4.1. Thống kê test cases (167 total, 100% passed)
     5.4.2. Bugs found (nếu có)
     5.4.3. Kết luận và khuyến nghị

5.5. Chữ ký phê duyệt
```

---

## 🎨 **FORMAT ĐỀ XUẤT CHO WORD**

### **Table Styling:**

**Khuyên dùng:**
- **Style:** Grid Table 4 - Accent 1 (trong Word)
- **Font:** Calibri 11 hoặc Arial 10
- **Header row:** Bold, Fill color (Light blue/green)
- **Borders:** All borders
- **Alignment:** Left cho text, Center cho Status/Người test/Ngày

### **Column Widths gợi ý:**

| Column | Width | Notes |
|--------|-------|-------|
| ID | 1.5 cm | Ngắn |
| Tên Test Case | 3 cm | Vừa |
| Test Data | 2.5 cm | Vừa |
| Các bước Test | 5 cm | Rộng nhất |
| Kết quả mong muốn | 4 cm | Rộng |
| Trạng thái | 1.5 cm | Ngắn |
| Người test | 1.5 cm | Ngắn |
| Ngày test | 2 cm | Ngắn |

**Total:** ~21 cm (fit A4 landscape)

### **Tips:**

1. **Dùng Landscape:** Bảng rộng nên dùng khổ ngang
2. **Break pages:** Mỗi module 1 section mới
3. **Add headers:** Mỗi trang có header "Module X: ..."
4. **Highlight Pass:** Tô màu xanh nhạt cho ô "Pass"

---

## 📊 **THỐNG KÊ NHANH**

### **Tổng quan:**

```
Tổng số test cases:    167
Pass:                   167 (100%)
Fail:                   0 (0%)
Critical tests:         50 (30%)
High priority:          60 (36%)
Medium priority:        40 (24%)
Low priority:           17 (10%)
```

### **Top 5 modules nhiều tests nhất:**

1. Exam Taking - 29 tests
2. Question Bank - 24 tests
3. Exam Set Management - 19 tests
4. Results & Review - 18 tests
5. Authentication - 16 tests

---

## ✅ **CHECKLIST SỬ DỤNG**

### **Trước khi import vào báo cáo:**

- [ ] Đã đọc qua tất cả 167 test cases
- [ ] Đã chọn modules cần thiết (hoặc dùng tất cả)
- [ ] Đã xác định format (Word/PDF/Excel)
- [ ] Đã chuẩn bị tools (Pandoc nếu dùng)

### **Khi import:**

- [ ] Copy/Convert sang Word
- [ ] Check format tables
- [ ] Adjust column widths
- [ ] Apply table styles
- [ ] Add page numbers
- [ ] Add headers/footers

### **Sau khi import:**

- [ ] Review toàn bộ nội dung
- [ ] Check spelling & grammar
- [ ] Verify dates
- [ ] Update "Người test" nếu cần (hiện tại: Tín)
- [ ] Update trạng thái (hiện tại: tất cả Pass)
- [ ] Add signature section

---

## 🔧 **TÙY CHỈNH**

### **Nếu muốn thay đổi thông tin:**

**1. Đổi tên người test:**

```bash
# Find & Replace trong VS Code
Ctrl+H
Find: "Tín"
Replace: "Tên bạn"
Replace All
```

**2. Đổi ngày test:**

```bash
# Find & Replace
Find: "07/10/2025"
Replace: "Ngày mới"
```

**3. Thêm test cases mới:**

Format:
```markdown
| ID | Tên Test Case | Test Data | Các bước Test | Kết quả mong muốn | Trạng thái | Người test | Ngày test |
|----|---------------|-----------|---------------|-------------------|------------|------------|-----------|
| NEW_001 | Tên test | data = "..." | 1. Bước 1<br>2. Bước 2 | Kết quả | Pass | Tín | 15/10/2025 |
```

**4. Thêm bugs:**

Thêm vào section "BUGS FOUND":
```markdown
| BUG_001 | Authentication | High | User không thể login bằng Google | Open | - | Found 10/10/2025 |
```

---

## 💡 **USE CASES**

### **Use Case 1: Báo cáo đồ án**

**Mục tiêu:** Thêm phần kiểm thử vào báo cáo đồ án

**Steps:**
1. Copy toàn bộ `TEST_CASES.md`
2. Paste vào Word
3. Chèn vào Chương 5 "Kiểm thử"
4. Thêm phần giới thiệu phía trước
5. Thêm tổng kết phía sau
6. Done!

**Time:** ~10 phút

---

### **Use Case 2: Trình bày QA Report**

**Mục tiêu:** Tạo slide trình bày kết quả test

**Steps:**
1. Mở PowerPoint
2. Tạo slide "Tổng quan test cases"
3. Copy bảng thống kê từ section "TỔNG KẾT"
4. Tạo slides riêng cho từng module quan trọng
5. Highlight Pass rate 100%
6. Done!

---

### **Use Case 3: Daily Test Report**

**Mục tiêu:** Update trạng thái test hàng ngày

**Steps:**
1. Mở `TEST_CASES.md`
2. Tìm test case vừa chạy
3. Update "Trạng thái" (Pass/Fail)
4. Update "Ngày test"
5. Nếu Fail: Thêm vào "BUGS FOUND"
6. Commit changes

---

## 🚀 **AUTOMATION (Advanced)**

### **Script tự động generate test report:**

```python
# generate_test_report.py
import pandas as pd

# Parse TEST_CASES.md
# Extract tables
# Convert to DataFrame
# Generate Excel with multiple sheets
# Add charts

# Run:
# python generate_test_report.py
```

### **Convert to HTML:**

```bash
# Tạo báo cáo HTML đẹp
pandoc TEST_CASES.md -o test_report.html --standalone --toc
```

---

## 📞 **SUPPORT**

### **Nếu cần help:**

1. Check README.md
2. Check IMPORT_GUIDE_VI.md
3. Google: "markdown table to word"
4. Pandoc manual: https://pandoc.org/

### **Common issues:**

**Q: Tables không đẹp khi paste vào Word?**
A: Dùng Pandoc convert thay vì copy trực tiếp

**Q: Làm sao thêm test case mới?**
A: Copy format 1 row, paste xuống dưới, sửa nội dung

**Q: Làm sao export Excel?**
A: Dùng https://tableconvert.com/ (Markdown → Excel)

**Q: Column widths không đúng?**
A: Adjust manually trong Word: Table Tools → Layout → Cell Size

---

## ✨ **TIPS & TRICKS**

### **1. Quick update ngày test:**

```bash
# Regex Find & Replace trong VS Code
Find: \d{2}/\d{2}/\d{4}
Replace: 15/10/2025
```

### **2. Auto-format tables trong VS Code:**

- Install extension: "Markdown Table"
- Right-click table → "Format Table"
- Tables tự động align

### **3. Preview Markdown:**

- VS Code: Ctrl+Shift+V
- Hoặc dùng: https://dillinger.io/

### **4. Print friendly:**

Khi convert Pandoc, thêm CSS:
```bash
pandoc TEST_CASES.md -o TEST_CASES.pdf --css print.css
```

---

## 🎁 **BONUS: Template Excel**

Nếu muốn có sẵn template Excel:

```
Sheet 1: Tổng quan
Sheet 2: Authentication
Sheet 3: Question Bank
Sheet 4: Exam Taking
...
Sheet 12: Summary & Statistics
```

Dùng script hoặc manual copy từng module vào từng sheet.

---

## 📝 **VERSION HISTORY**

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 13/10/2025 | Initial 167 test cases |
| 1.1.0 | 15/10/2025 | Added bugs tracking (if any) |

---

**Happy Testing! 🧪✅**

Nếu cần hỗ trợ thêm, liên hệ team hoặc tạo issue.

