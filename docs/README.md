# 📚 TÀI LIỆU CƠ SỞ DỮ LIỆU - O-BUDDY HELLO
## TOEIC Learning Management System

---

## 🎯 GIỚI THIỆU

Đây là bộ tài liệu **hoàn chỉnh và chi tiết** về cơ sở dữ liệu của hệ thống **O-Buddy Hello - TOEIC Learning Management System**.

Tài liệu được tạo ra để:
- ✅ **Import vào báo cáo quản lý dự án** công nghệ thông tin
- ✅ **Tham khảo khi phát triển** tính năng mới
- ✅ **Onboarding** cho developer mới
- ✅ **Tài liệu kỹ thuật** cho stakeholders
- ✅ **Tái tạo database** khi cần thiết

---

## 📂 CẤU TRÚC TÀI LIỆU

Bộ tài liệu gồm **4 file chính**:

| File | Mục đích | Sử dụng cho |
|------|----------|-------------|
| **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** | Tổng quan kiến trúc database | Hiểu tổng thể hệ thống |
| **[DATABASE_ERD_SIMPLE.md](./DATABASE_ERD_SIMPLE.md)** ⭐ | **Sơ đồ ERD đơn giản** | **CHO BÁO CÁO - Dễ hiểu, trực quan** |
| **[DATABASE_ERD.md](./DATABASE_ERD.md)** | Sơ đồ ERD chi tiết | Tài liệu kỹ thuật cho developer |
| **[DATA_DICTIONARY.md](./DATA_DICTIONARY.md)** | Từ điển dữ liệu chi tiết | Tra cứu từng column, constraint |
| **[DATABASE_DDL.sql](./DATABASE_DDL.sql)** | SQL script tạo database | Tái tạo hoặc migrate database |
| **[TEST_CASES.md](./TEST_CASES.md)** 🧪 | **Báo cáo kiểm thử hệ thống** | **167 test cases cho báo cáo QA** |

---

## 🚀 HƯỚNG DẪN SỬ DỤNG

### **1️⃣ Để hiểu tổng quan hệ thống**

📖 **Đọc file:** `DATABASE_SCHEMA.md`

**Nội dung:**
- Thông tin tổng quan (17 tables, 2 views, 27 functions)
- Mục đích của hệ thống
- Kiến trúc database (Core tables, Exam tables, Class Management...)
- Chi tiết từng bảng (mô tả, business rules, sample data)
- Quan hệ giữa các bảng
- Bảo mật & phân quyền (RLS)
- Indexes & Performance
- Best practices

**Khi nào dùng:**
- Onboarding developer mới
- Viết báo cáo dự án
- Trình bày cho stakeholders
- Hiểu logic nghiệp vụ

---

### **2️⃣ Để xem sơ đồ quan hệ (ERD)**

📊 **Cho báo cáo:** `DATABASE_ERD_SIMPLE.md` ⭐ **KHUYÊN DÙNG**  
📊 **Cho developer:** `DATABASE_ERD.md` (chi tiết)

**Nội dung:**
- **Full ERD Diagram** (Mermaid) - Tất cả bảng và quan hệ
- **Simplified ERD** - Chỉ các bảng chính
- **ERD theo Module** (6 modules):
  - User Management
  - Question Bank
  - Exam Management
  - Learning & Practice
  - Class Management
  - Alerts & Notifications
- **Cardinality Summary** (bảng tóm tắt quan hệ)
- **Data Flow Diagrams** (quy trình tạo đề, làm bài thi...)
- **Hướng dẫn import** vào Draw.io, Notion, Confluence...

**Khi nào dùng:**
- Visualize database structure
- Trình bày trong slide
- Import vào tools design (Draw.io, Lucidchart)
- Hiểu relationships nhanh chóng

**Công cụ hỗ trợ:**
- https://mermaid.live/ (render online)
- VS Code + Extension "Markdown Preview Mermaid Support"
- Notion, GitHub, GitLab (tự động render Mermaid)
- Draw.io (Insert → Mermaid)

---

### **3️⃣ Để tra cứu chi tiết từng column**

📋 **Đọc file:** `DATA_DICTIONARY.md`

**Nội dung:**
- **Từ điển chi tiết** cho 17 tables
- Mỗi table bao gồm:
  - Tên column, data type, length
  - Nullable, Default value
  - Primary Key, Foreign Key, Unique Key
  - Description (mô tả chi tiết)
  - JSONB structures (cấu trúc JSON)
  - Constraints & Indexes
  - Business rules
  - Sample data
  - Related tables
- **Database Views** (2 views)
- **Enums & Types** (3 enums)
- **Database Statistics**
- **Data Retention Policy**

**Khi nào dùng:**
- Viết queries
- Debugging
- Code review
- Thiết kế API
- Validate data

**Ví dụ sử dụng:**
```
Q: "Column target_score trong profiles có range nào?"
A: Tra DATA_DICTIONARY.md → profiles → target_score → CHECK (0-990)

Q: "Cấu trúc JSONB của column choices trong questions?"
A: Tra DATA_DICTIONARY.md → questions → choices → Example structure
```

---

### **4️⃣ Để tạo lại database từ đầu**

🛠️ **Chạy file:** `DATABASE_DDL.sql`

**Nội dung:**
- **Complete DDL script** để tạo toàn bộ database
- Extensions (uuid-ossp, vector)
- Custom types & enums
- 17 tables với full constraints
- Indexes (50+ indexes)
- Views (2 views)
- Triggers (auto-update updated_at, question_count)
- Functions & Stored Procedures
- Row Level Security setup
- Sample data (commented)
- Database grants

**Khi nào dùng:**
- Setup môi trường dev mới
- Migrate database
- Disaster recovery
- Clone database cho testing

**Cách sử dụng:**

#### **A. Trên Supabase Dashboard:**
1. Vào Supabase Project → SQL Editor
2. Tạo new query
3. Copy toàn bộ nội dung `DATABASE_DDL.sql`
4. Paste và Run

#### **B. Qua psql (PostgreSQL CLI):**
```bash
# Connect to database
psql -h [your-supabase-host] -U postgres -d postgres

# Run script
\i path/to/DATABASE_DDL.sql

# Or pipe directly
psql -h [host] -U postgres -d postgres < DATABASE_DDL.sql
```

#### **C. Qua pgAdmin:**
1. Connect to database
2. Tools → Query Tool
3. File → Open → Chọn `DATABASE_DDL.sql`
4. Execute (F5)

---

## 📊 THÔNG TIN DATABASE

### **Overview**

| Metric | Value |
|--------|-------|
| **Database Type** | PostgreSQL 13+ |
| **Host** | Supabase |
| **Total Tables** | 17 |
| **Total Views** | 2 |
| **Total Functions** | 27 |
| **Total Indexes** | ~50+ |
| **Estimated Rows** | 30,000,000+ |
| **Estimated Size** | 1-2 GB |

---

### **Tables Summary**

| # | Table Name | Records (Est.) | Purpose |
|---|------------|----------------|---------|
| 1 | `profiles` | 10,000+ | User profiles (students/teachers) |
| 2 | `questions` | 50,000+ | TOEIC question bank (7 parts) |
| 3 | `passages` | 10,000+ | Passages for Part 3,4,6,7 |
| 4 | `exam_sets` | 5,000+ | Exam sets / practice tests |
| 5 | `exam_questions` | 500,000+ | Questions in exam sets (M:N) |
| 6 | `exam_sessions` | 100,000+ | Exam taking sessions |
| 7 | `exam_attempts` | 20,000,000+ | Answer details per question |
| 8 | `exam_statistics` | 5,000+ | Exam statistics (1:1 with exam_sets) |
| 9 | `attempts` | 5,000,000+ | Practice history (legacy) |
| 10 | `reviews` | 1,000,000+ | Spaced repetition reviews (SM-2) |
| 11 | `question_drafts` | 10,000+ | Question drafts (auto-save) |
| 12 | `classes` | 1,000+ | Classes created by teachers |
| 13 | `class_students` | 50,000+ | Students in classes (M:N) |
| 14 | `teacher_students` | 20,000+ | Teacher-student relationships |
| 15 | `alerts` | 100,000+ | Notifications for teachers |
| 16 | `alert_rules` | 1,000+ | Auto-alert rules |

---

### **Modules**

Hệ thống được chia thành 6 modules chính:

```
1. 👤 User Management
   - profiles
   - teacher_students

2. 📝 Question Bank
   - questions
   - passages
   - question_drafts

3. 📋 Exam Management
   - exam_sets
   - exam_questions
   - exam_sessions
   - exam_attempts
   - exam_statistics

4. 🎓 Learning & Practice
   - attempts
   - reviews (Spaced Repetition)

5. 🏫 Class Management
   - classes
   - class_students

6. 🔔 Alerts & Notifications
   - alerts
   - alert_rules
```

---

## 🎨 HƯỚNG DẪN IMPORT VÀO BÁO CÁO

### **Cho Microsoft Word:**

1. **Copy toàn bộ nội dung** từ các file `.md`
2. Paste vào Word (giữ format Markdown)
3. Convert Markdown → Word:
   - Sử dụng Pandoc: `pandoc -f markdown -t docx -o output.docx DATABASE_SCHEMA.md`
   - Hoặc online converter: https://word2md.com/ (reverse mode)

4. **Chèn ERD:**
   - Mở `DATABASE_ERD.md`
   - Copy Mermaid code
   - Render tại https://mermaid.live/
   - Export as PNG/SVG
   - Insert image vào Word

---

### **Cho Google Docs:**

1. Convert Markdown → HTML: https://markdowntohtml.com/
2. Copy HTML result
3. Paste vào Google Docs (Ctrl+Shift+V)

**Hoặc:**
- Sử dụng Google Docs add-on: "Docs to Markdown"

---

### **Cho LaTeX:**

1. Sử dụng package `markdown` hoặc `pandoc`
2. Convert:
```bash
pandoc DATABASE_SCHEMA.md -o database_schema.tex
```
3. Include trong LaTeX document:
```latex
\input{database_schema.tex}
```

---

### **Cho Confluence:**

1. Create new page
2. Insert macro: "Markdown"
3. Paste nội dung file `.md`
4. Save

**Chèn ERD:**
1. Install plugin: "Mermaid Diagrams for Confluence"
2. Insert Mermaid macro
3. Paste Mermaid code từ `DATABASE_ERD.md`

---

### **Cho Notion:**

1. Import file `.md` trực tiếp:
   - New Page → Import → Markdown
   - Chọn file `.md`

2. Chèn Mermaid diagram:
   - Tạo Code block: `/code`
   - Chọn language: `mermaid`
   - Paste Mermaid code

---

## 🔍 USE CASES THỰC TẾ

### **Use Case 1: Developer mới join team**

**Nhiệm vụ:** Hiểu database trong 1 giờ

**Steps:**
1. ✅ Đọc `DATABASE_SCHEMA.md` (30 phút)
   - Phần "Thông tin tổng quan"
   - Phần "Kiến trúc Database"
   - Phần "Chi tiết các bảng" (skim through)

2. ✅ Xem ERD trong `DATABASE_ERD.md` (15 phút)
   - Full ERD Diagram
   - ERD by Module

3. ✅ Khi code, tra cứu `DATA_DICTIONARY.md` (ongoing)

**Result:** Developer hiểu 80% database structure, ready to code

---

### **Use Case 2: Viết báo cáo đồ án/luận văn**

**Nhiệm vụ:** Viết phần "Thiết kế CSDL" trong báo cáo

**Steps:**
1. ✅ Copy phần "Thông tin tổng quan" từ `DATABASE_SCHEMA.md`
   - Tables summary
   - Modules
   - Overview

2. ✅ Chèn ERD từ `DATABASE_ERD.md`
   - Render Mermaid → Export PNG
   - Insert vào Word/LaTeX
   - Caption: "Sơ đồ quan hệ thực thể (ERD)"

3. ✅ Copy phần "Chi tiết các bảng" từ `DATA_DICTIONARY.md`
   - Chọn các bảng quan trọng
   - Format thành table trong Word

4. ✅ Copy SQL DDL (optional)
   - Phần Appendix
   - "Phụ lục: SQL Script tạo database"

**Result:** Phần CSDL hoàn chỉnh, chuyên nghiệp

---

### **Use Case 3: Tạo API endpoint mới**

**Nhiệm vụ:** Tạo endpoint `GET /api/exam-sessions/:id`

**Steps:**
1. ✅ Tra cứu table `exam_sessions` trong `DATA_DICTIONARY.md`
   - Xem columns, data types
   - Xem relationships (→ exam_sets, → exam_attempts)

2. ✅ Xem ERD để hiểu related tables
   - `DATABASE_ERD.md` → Module 3: Exam Management

3. ✅ Viết query (reference từ DDL)
   - Copy structure từ `DATABASE_DDL.sql`
   - Sử dụng View `exam_questions_full` nếu cần

**Result:** API endpoint chính xác, đầy đủ thông tin

---

### **Use Case 4: Database migration**

**Nhiệm vụ:** Thêm column mới `difficulty_score` vào `questions`

**Steps:**
1. ✅ Check cấu trúc hiện tại: `DATA_DICTIONARY.md` → questions

2. ✅ Viết migration SQL:
```sql
-- Add column
ALTER TABLE questions 
ADD COLUMN difficulty_score INTEGER DEFAULT 2 
CHECK (difficulty_score >= 1 AND difficulty_score <= 3);

-- Create index
CREATE INDEX idx_questions_difficulty_score ON questions(difficulty_score);

-- Update comment
COMMENT ON COLUMN questions.difficulty_score IS 'Numeric difficulty: 1=easy, 2=medium, 3=hard';
```

3. ✅ Update tài liệu:
   - Update `DATA_DICTIONARY.md`
   - Update `DATABASE_SCHEMA.md`
   - Update `DATABASE_DDL.sql`

**Result:** Migration thành công, tài liệu sync

---

## 🛠️ TOOLS & RESOURCES

### **Database Tools:**

| Tool | Purpose | Link |
|------|---------|------|
| **Supabase Dashboard** | Manage database | https://app.supabase.com/ |
| **pgAdmin** | PostgreSQL GUI | https://www.pgadmin.org/ |
| **DBeaver** | Universal DB tool | https://dbeaver.io/ |
| **DataGrip** | JetBrains DB IDE | https://www.jetbrains.com/datagrip/ |

---

### **Diagram Tools:**

| Tool | Purpose | Link |
|------|---------|------|
| **Mermaid Live** | Render Mermaid online | https://mermaid.live/ |
| **Draw.io** | Free diagram tool | https://app.diagrams.net/ |
| **Lucidchart** | Professional diagrams | https://www.lucidchart.com/ |
| **dbdiagram.io** | Database diagram from SQL | https://dbdiagram.io/ |

---

### **Markdown Tools:**

| Tool | Purpose | Link |
|------|---------|------|
| **Pandoc** | Convert Markdown to any format | https://pandoc.org/ |
| **StackEdit** | Online Markdown editor | https://stackedit.io/ |
| **Typora** | WYSIWYG Markdown editor | https://typora.io/ |

---

## 📞 SUPPORT & CONTRIBUTION

### **Nếu có câu hỏi:**

1. Check `DATA_DICTIONARY.md` trước
2. Xem ERD trong `DATABASE_ERD.md`
3. Search trong `DATABASE_SCHEMA.md`
4. Liên hệ team lead

### **Nếu cần update tài liệu:**

1. Update file tương ứng (`.md` hoặc `.sql`)
2. Update version history
3. Commit với message rõ ràng:
   ```
   docs(database): Add new column user_avatar to profiles table
   ```

---

## 📝 VERSION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Oct 2025 | System | Initial comprehensive documentation |

---

## 📄 LICENSE & CREDITS

**Project:** O-Buddy Hello - TOEIC Learning Management System  
**Database:** Supabase PostgreSQL 13+  
**Documentation Generated:** October 2025  

---

## 🎯 NEXT STEPS

Sau khi đọc tài liệu này, bạn có thể:

1. ✅ **Bắt đầu development**
   - Setup local database từ `DATABASE_DDL.sql`
   - Tham khảo `DATA_DICTIONARY.md` khi code

2. ✅ **Viết báo cáo dự án**
   - Copy nội dung từ `DATABASE_SCHEMA.md`
   - Insert ERD từ `DATABASE_ERD.md`

3. ✅ **Thiết kế API**
   - Reference table structures
   - Design endpoints based on relationships

4. ✅ **Database optimization**
   - Review indexes trong `DATABASE_DDL.sql`
   - Check query performance

---

## 📚 QUICK REFERENCE

### **Các bảng quan trọng nhất:**

```
profiles        → User info
questions       → Question bank (50,000+ questions)
passages        → Passages for reading/listening
exam_sets       → Exam definitions
exam_sessions   → User exam attempts
exam_attempts   → Answer details (20M+ records)
```

### **Các View hữu ích:**

```
questions_with_passages  → Questions + Passages (JOIN)
exam_questions_full      → Full exam question info
```

### **Các Function quan trọng:**

```
get_user_role()                    → Get current user role
get_teacher_students(teacher_id)   → Get teacher's students
get_exam_result(session_id)        → Get exam result details
has_user_completed_exam(...)       → Check if user completed exam
```

---

**Happy Coding! 🚀**

Nếu bạn thấy tài liệu này hữu ích, đừng quên ⭐ star repository!

---

**📧 Contact:**  
Database Architecture Team  
O-Buddy Hello Project

**🔗 Related Documentation:**
- [API Documentation](../API_DOCS.md) *(if exists)*
- [Deployment Guide](../DEPLOYMENT.md) *(if exists)*
- [Contributing Guide](../CONTRIBUTING.md) *(if exists)*

