# 🎯 HƯỚNG DẪN IMPORT VÀO BÁO CÁO DỰ ÁN
## Dành cho Báo cáo Quản lý Dự án Công nghệ Thông tin

---

## 📦 TÀI LIỆU ĐÃ TẠO

Bạn đã có **4 file tài liệu hoàn chỉnh** về CSDL:

| # | File | Kích thước | Mục đích |
|---|------|------------|----------|
| 1 | `DATABASE_SCHEMA.md` | ~30 KB | Tổng quan kiến trúc database |
| 2 | `DATABASE_ERD_SIMPLE.md` ⭐ | ~15 KB | **Sơ đồ ERD đơn giản - CHO BÁO CÁO** |
| 3 | `DATABASE_ERD.md` | ~25 KB | Sơ đồ ERD chi tiết (cho developer) |
| 4 | `DATA_DICTIONARY.md` | ~40 KB | Từ điển dữ liệu chi tiết |
| 5 | `DATABASE_DDL.sql` | ~35 KB | SQL script tái tạo DB |

**Tổng cộng:** ~130 KB documentation

---

## ✅ PHƯƠNG ÁN IMPORT - NHANH NHẤT

### **PHƯƠNG ÁN 1: Microsoft Word** ⭐ KHUYÊN DÙNG

#### **Bước 1: Cài đặt công cụ Pandoc**

**Windows:**
```powershell
# Tải Pandoc installer
# Download từ: https://pandoc.org/installing.html
# Hoặc dùng Chocolatey:
choco install pandoc
```

**macOS:**
```bash
brew install pandoc
```

**Linux:**
```bash
sudo apt-get install pandoc
```

#### **Bước 2: Convert Markdown → Word**

Mở Terminal/PowerShell tại thư mục `docs/`, chạy lệnh:

```bash
# Convert từng file
pandoc DATABASE_SCHEMA.md -o DATABASE_SCHEMA.docx
pandoc DATABASE_ERD.md -o DATABASE_ERD.docx
pandoc DATA_DICTIONARY.md -o DATA_DICTIONARY.docx

# Hoặc merge tất cả thành 1 file
pandoc DATABASE_SCHEMA.md DATABASE_ERD.md DATA_DICTIONARY.md \
  -o CSDL_FULL_DOCUMENTATION.docx \
  --toc \
  --toc-depth=3 \
  -V geometry:margin=1in
```

**Options giải thích:**
- `--toc`: Tự động tạo Table of Contents
- `--toc-depth=3`: TOC đến heading level 3
- `-V geometry:margin=1in`: Set lề 1 inch

#### **Bước 3: Chèn ERD Diagrams**

⚠️ **QUAN TRỌNG: Dùng file ERD đơn giản cho báo cáo!**
- ✅ Dùng: `DATABASE_ERD_SIMPLE.md` (đơn giản, dễ hiểu)
- ❌ Không dùng: `DATABASE_ERD.md` (quá chi tiết, khó nhìn)

**Cách 1: Render online (Nhanh)** ⭐ KHUYÊN DÙNG
1. Mở https://mermaid.live/
2. Copy Mermaid code từ `DATABASE_ERD_SIMPLE.md` (diagram tổng quan)
3. Paste vào editor
4. Click "PNG" hoặc "SVG" để download
5. Insert ảnh vào Word

**Cách 2: VS Code Extension (Cho developer)**
1. Install extension: "Markdown Preview Mermaid Support"
2. Mở file `DATABASE_ERD.md`
3. Ctrl+Shift+V (Preview)
4. Right-click diagram → Copy as Image
5. Paste vào Word

**Cách 3: CLI (Automated)**
```bash
# Install mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Extract diagrams và convert to PNG
mmdc -i DATABASE_ERD.md -o erd-full.png

# Hoặc từng diagram riêng
mmdc -i diagram1.mmd -o diagram1.png
```

#### **Bước 4: Format lại trong Word**

1. Apply styles (Heading 1, Heading 2, ...)
2. Update Table of Contents (References → Update Table)
3. Adjust hình ảnh (resize, center, add captions)
4. Check page breaks
5. Add page numbers

**✅ Hoàn thành!** File Word sẵn sàng để merge vào báo cáo.

---

### **PHƯƠNG ÁN 2: Google Docs**

#### **Cách 1: Online Converter (Đơn giản nhất)**

1. Mở https://markdowntohtml.com/
2. Paste nội dung file `.md`
3. Click "Convert"
4. Copy HTML output
5. Mở Google Docs → Paste (Ctrl+V)
6. Format lại nếu cần

#### **Cách 2: Google Docs Add-on**

1. Mở Google Docs
2. Extensions → Add-ons → Get add-ons
3. Tìm "Docs to Markdown" (hoặc ngược lại)
4. Install
5. Import Markdown file

#### **Cách 3: Via Pandoc → DOCX → Google Docs**

```bash
# Convert to DOCX
pandoc DATABASE_SCHEMA.md -o DATABASE_SCHEMA.docx

# Upload to Google Drive
# Open with Google Docs
# File → Save as Google Docs
```

---

### **PHƯƠNG ÁN 3: LaTeX** (Cho báo cáo khoa học)

#### **Bước 1: Convert Markdown → LaTeX**

```bash
pandoc DATABASE_SCHEMA.md -o database_schema.tex
pandoc DATABASE_ERD.md -o database_erd.tex
pandoc DATA_DICTIONARY.md -o data_dictionary.tex
```

#### **Bước 2: Include trong LaTeX document**

```latex
\documentclass[12pt,a4paper]{report}
\usepackage[utf8]{vietnam}
\usepackage{graphicx}
\usepackage{hyperref}
\usepackage{longtable}
\usepackage{booktabs}

\begin{document}

\chapter{Thiết kế Cơ sở dữ liệu}

\section{Tổng quan}
\input{database_schema.tex}

\section{Sơ đồ ERD}
\input{database_erd.tex}
\begin{figure}[h]
  \centering
  \includegraphics[width=\textwidth]{erd-full.png}
  \caption{Sơ đồ quan hệ thực thể (ERD)}
  \label{fig:erd}
\end{figure}

\section{Từ điển dữ liệu}
\input{data_dictionary.tex}

\end{document}
```

#### **Bước 3: Compile**

```bash
pdflatex main.tex
# Hoặc
xelatex main.tex  # Tốt hơn cho tiếng Việt
```

---

### **PHƯƠNG ÁN 4: Notion** (Modern)

#### **Import trực tiếp:**

1. Mở Notion
2. New Page
3. Click "..." → Import
4. Chọn "Markdown"
5. Select files: `DATABASE_SCHEMA.md`, etc.
6. Click "Import"

**✅ Done!** Notion tự động parse Markdown với format đẹp.

#### **Render Mermaid Diagram trong Notion:**

1. Tạo Code block: `/code`
2. Chọn language: `mermaid`
3. Paste Mermaid code từ `DATABASE_ERD.md`
4. Notion tự động render thành diagram!

---

### **PHƯƠNG ÁN 5: Confluence** (Cho team)

#### **Import Markdown:**

1. Create new page
2. Insert macro: "Markdown"
3. Paste nội dung từ `.md` files
4. Save

#### **Mermaid Diagram:**

1. Install plugin: "Mermaid Diagrams for Confluence"
2. Insert macro: "Mermaid"
3. Paste Mermaid code
4. Preview & Save

---

## 📐 CÁCH TẠO ERD DIAGRAM TỪ MERMAID

### **Tool 1: Mermaid Live Editor** ⭐ KHUYÊN DÙNG

**URL:** https://mermaid.live/

**Steps:**
1. Copy toàn bộ code Mermaid từ `DATABASE_ERD.md`
   ```mermaid
   erDiagram
     PROFILES ||--o{ QUESTIONS : creates
     ...
   ```
2. Paste vào editor bên trái
3. Diagram tự động render bên phải
4. Click "Actions" → "PNG" hoặc "SVG"
5. Download → Insert vào báo cáo

**Export options:**
- PNG (raster, tốt cho Word/PDF)
- SVG (vector, scale tốt, tốt cho web)
- Markdown (embed trực tiếp)

---

### **Tool 2: Draw.io (Diagrams.net)**

**URL:** https://app.diagrams.net/

**Steps:**
1. File → New
2. Insert → Advanced → Mermaid
3. Paste Mermaid code
4. Click OK
5. Edit/Style diagram nếu cần
6. File → Export as → PNG/SVG/PDF

**Ưu điểm:**
- Có thể edit diagram sau khi import
- Nhiều export formats
- Integrate với Google Drive, OneDrive

---

### **Tool 3: VS Code + Extension**

**Extension:** "Markdown Preview Mermaid Support"

**Steps:**
1. Install extension
2. Mở `DATABASE_ERD.md` trong VS Code
3. Ctrl+Shift+V (Open Preview)
4. Right-click diagram → "Copy as Image"
5. Paste vào Word/PowerPoint

---

### **Tool 4: CLI (Automated)**

```bash
# Install mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Convert Mermaid code to image
mmdc -i input.mmd -o output.png

# Hoặc từ Markdown file
mmdc -i DATABASE_ERD.md -o erd-full.png

# Multiple formats
mmdc -i input.mmd -o output.svg -b transparent
mmdc -i input.mmd -o output.pdf
```

**Options:**
- `-b transparent`: Background trong suốt
- `-w 1920`: Set width 1920px
- `-H 1080`: Set height 1080px
- `-t forest`: Theme (forest, dark, neutral, default)

---

## 🎨 TEMPLATE CHO BÁO CÁO

### **Cấu trúc đề xuất cho Chương "Thiết kế CSDL":**

```
CHƯƠNG 3: THIẾT KẾ CƠ SỞ DỮ LIỆU

3.1. Tổng quan hệ thống
     3.1.1. Mục đích
     3.1.2. Kiến trúc tổng thể
     3.1.3. Công nghệ sử dụng (PostgreSQL, Supabase)

3.2. Sơ đồ quan hệ thực thể (ERD)
     3.2.1. Sơ đồ tổng quan
     3.2.2. Sơ đồ chi tiết theo module
     3.2.3. Giải thích quan hệ

3.3. Mô tả các bảng dữ liệu
     3.3.1. Bảng Profiles (Hồ sơ người dùng)
     3.3.2. Bảng Questions (Ngân hàng câu hỏi)
     3.3.3. Bảng Passages (Đoạn văn)
     3.3.4. Bảng Exam_Sets (Đề thi)
     3.3.5. Bảng Exam_Sessions (Phiên thi)
     ...

3.4. Ràng buộc và quy tắc nghiệp vụ
     3.4.1. Primary Keys
     3.4.2. Foreign Keys
     3.4.3. Check Constraints
     3.4.4. Business Rules

3.5. Indexes và Optimization
     3.5.1. Indexes chính
     3.5.2. Composite Indexes
     3.5.3. Performance Considerations

3.6. Views và Stored Procedures
     3.6.1. Database Views
     3.6.2. Stored Functions
     3.6.3. Triggers

3.7. Bảo mật và phân quyền
     3.7.1. Row Level Security (RLS)
     3.7.2. Policies
     3.7.3. Authentication & Authorization

PHỤ LỤC A: SQL Script tạo Database
PHỤ LỤC B: Data Dictionary đầy đủ
```

---

### **Nội dung copy từ file nào:**

| Phần báo cáo | Copy từ file | Phần nào |
|--------------|--------------|----------|
| 3.1 Tổng quan | `DATABASE_SCHEMA.md` | "Thông tin tổng quan", "Mục đích hệ thống" |
| 3.2 ERD | `DATABASE_ERD.md` | Full ERD, Simplified ERD, ERD by Module |
| 3.3 Mô tả bảng | `DATA_DICTIONARY.md` | Chi tiết từng table (chọn quan trọng) |
| 3.4 Ràng buộc | `DATABASE_SCHEMA.md` | "Constraints & Indexes" |
| 3.5 Indexes | `DATABASE_DDL.sql` | Phần CREATE INDEX |
| 3.6 Views | `DATABASE_SCHEMA.md` | "VIEWS (Database Views)" |
| 3.7 Bảo mật | `DATABASE_SCHEMA.md` | "BẢO MẬT & PHÂN QUYỀN" |
| Phụ lục A | `DATABASE_DDL.sql` | Toàn bộ file |
| Phụ lục B | `DATA_DICTIONARY.md` | Toàn bộ file |

---

## 📊 CHECKLIST HOÀN THÀNH

Đánh dấu ✅ khi hoàn thành:

### **Chuẩn bị tài liệu**
- [ ] Đã đọc qua tất cả 4 files
- [ ] Đã hiểu cấu trúc database
- [ ] Đã chọn công cụ (Word/Google Docs/LaTeX)

### **Convert Markdown**
- [ ] Đã cài Pandoc (nếu dùng Word)
- [ ] Đã convert `.md` → `.docx`
- [ ] Đã check format (headings, tables, lists)

### **Tạo ERD Diagrams**
- [ ] Đã render Mermaid diagrams
- [ ] Đã export as PNG/SVG
- [ ] Đã insert vào document
- [ ] Đã thêm captions cho hình

### **Format báo cáo**
- [ ] Đã apply styles (Heading 1, 2, 3...)
- [ ] Đã tạo Table of Contents
- [ ] Đã đánh số trang
- [ ] Đã thêm headers/footers
- [ ] Đã check spelling & grammar

### **Review cuối**
- [ ] Đã review toàn bộ nội dung
- [ ] Đã check tất cả hình ảnh hiển thị đúng
- [ ] Đã check tables format đúng
- [ ] Đã check cross-references
- [ ] Đã generate PDF (nếu cần)

---

## 🚀 TIPS & TRICKS

### **Tip 1: Table format đẹp trong Word**

Sau khi convert, tables có thể chưa đẹp:

1. Select table → Table Design → Chọn style
2. Khuyên dùng: "Grid Table 4 - Accent 1"
3. Adjust column widths
4. Enable "Header Row" repeat

### **Tip 2: Code blocks trong Word**

Markdown code blocks convert thành plain text. Để đẹp hơn:

1. Select code block
2. Font → "Consolas" hoặc "Courier New"
3. Shading → Light Gray (10%)
4. Paragraph → Reduce spacing

### **Tip 3: Mermaid diagram crisp trong Word**

Export SVG thay vì PNG để giữ chất lượng:

```bash
# Export SVG từ Mermaid Live
# Insert → Pictures → từ SVG file
# Right-click → "Convert to Shape" (optional)
```

### **Tip 4: Auto-update TOC**

Trong Word:
1. Click vào Table of Contents
2. References → Update Table → "Update entire table"

### **Tip 5: Add Watermark**

Nếu là draft:
1. Design → Watermark → Custom Watermark
2. Text: "DRAFT" hoặc "CONFIDENTIAL"

---

## ⚠️ LƯU Ý QUAN TRỌNG

### **1. Encoding UTF-8**

File `.md` dùng UTF-8. Nếu mở bằng Notepad thấy ký tự lỗi:
- Dùng VS Code, Notepad++, hoặc Sublime Text
- Hoặc: Notepad → Save As → Encoding: UTF-8

### **2. Mermaid không render**

Nếu Mermaid không render:
- Check syntax (missing quote, bracket)
- Try online editor first: https://mermaid.live/
- Check version compatibility

### **3. Pandoc errors**

Common errors:
```
Error: Could not find pandoc
→ Solution: Install Pandoc hoặc thêm vào PATH

Error: File not found
→ Solution: cd vào đúng thư mục trước khi chạy

Error: pdflatex not found (khi dùng --pdf-engine)
→ Solution: Install MiKTeX (Windows) hoặc MacTeX (Mac)
```

### **4. File size lớn**

Nếu file DOCX quá lớn (>50MB):
- Compress images: File → Options → Advanced → Compress pictures
- Save as PDF thay vì DOCX
- Split thành nhiều files

---

## 📞 HỖ TRỢ THÊM

### **Nếu cần help:**

1. **Check README.md** trong thư mục `docs/`
2. **Google:** "pandoc markdown to word"
3. **Mermaid docs:** https://mermaid.js.org/
4. **Pandoc manual:** https://pandoc.org/MANUAL.html

### **Video tutorials:**

- Pandoc basics: https://youtube.com/results?search_query=pandoc+tutorial
- Mermaid diagrams: https://youtube.com/results?search_query=mermaid+diagram+tutorial
- LaTeX: https://youtube.com/results?search_query=latex+tutorial

---

## ✅ TÓM TẮT - CÁCH NHANH NHẤT

**CHỈ 5 BƯỚC - 10 PHÚT:**

```bash
# Bước 1: Mở Terminal tại thư mục docs/
cd docs/

# Bước 2: Convert to Word (yêu cầu Pandoc)
pandoc DATABASE_SCHEMA.md DATABASE_ERD.md DATA_DICTIONARY.md \
  -o CSDL_Documentation.docx --toc

# Bước 3: Tạo ERD images
# → Vào https://mermaid.live/
# → Copy code từ DATABASE_ERD.md
# → Export PNG

# Bước 4: Mở CSDL_Documentation.docx
# → Insert ảnh ERD
# → Format lại (headings, tables)

# Bước 5: Save & Done! ✅
```

**That's it!** 🎉

---

## 🎁 BONUS: Export PDF trực tiếp

```bash
# Via Pandoc (yêu cầu LaTeX)
pandoc DATABASE_SCHEMA.md -o DATABASE_SCHEMA.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=1in \
  --toc

# Hoặc: Word → PDF
# File → Save As → PDF

# Hoặc: Online converter
# https://convertio.co/docx-pdf/
```

---

**Chúc bạn hoàn thành báo cáo xuất sắc! 🚀📚**

Nếu cần hỗ trợ thêm, tạo issue hoặc liên hệ team.

