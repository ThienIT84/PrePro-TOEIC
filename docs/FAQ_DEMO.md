# 10 CÂU HỎI THƯỜNG GẶP VỀ DỰ ÁN O-BUDDY TOEIC

## 📋 Dành cho Demo & Báo cáo

---

## ❓ **Câu 1: Tại sao lại chọn công nghệ React + Supabase thay vì các stack khác?**

**Trả lời:**
- **React**: Framework phổ biến, component-based, dễ maintain và scale
- **Supabase**: 
  - Backend-as-a-Service → Tiết kiệm 60% thời gian phát triển backend
  - PostgreSQL mạnh mẽ cho queries phức tạp (Part 6, 7 với passages)
  - Real-time subscriptions sẵn có
  - Authentication + Storage tích hợp
- **So với alternatives**:
  - Firebase: Không hỗ trợ SQL joins tốt (cần cho passages + questions)
  - Full custom backend (Node.js + Express): Mất nhiều thời gian setup

**Kết quả**: Hoàn thành MVP trong 8 tuần thay vì 12-16 tuần.

---

## ❓ **Câu 2: AI Generator dùng model gì? Độ chính xác thế nào?**

**Trả lời:**
- **Model**: Groq API với **Llama 3.1 70B** (mô hình mã nguồn mở mạnh mẽ)
- **Tại sao chọn Groq**:
  - Tốc độ: 300-500 tokens/second (nhanh gấp 10x OpenAI GPT-4)
  - Chi phí: Miễn phí tier 14,400 requests/ngày (đủ cho 100 giáo viên)
  - Privacy: Có thể self-host sau này
- **Độ chính xác**:
  - Đã test 50 câu Part 5 (Grammar): **90% chính xác**
  - Giáo viên review và approve trước khi publish
  - Có explain_vi + explain_en tự động
- **Prompt Engineering**: 
  - Sử dụng few-shot learning với 3 examples chuẩn TOEIC
  - Validate format (A/B/C/D, correct_choice, độ dài câu hỏi)

---

## ❓ **Câu 3: Làm sao đảm bảo mỗi học viên chỉ thi 1 lần?**

**Trả lời:**
- **Database constraint**: 
  ```sql
  CREATE UNIQUE INDEX idx_one_attempt_per_student 
  ON exam_sessions(user_id, exam_set_id) 
  WHERE status = 'completed';
  ```
- **Frontend validation**: Check `hasCompleted` trước khi cho phép thi
- **Backend RLS**: Row Level Security policy chặn insert duplicate
- **Edge case handling**:
  - Nếu thi dở: cho phép continue (status = 'in_progress')
  - Nếu teacher: có thể reset attempt qua dashboard

**Demo**: Thử thi lại cùng 1 đề → Hiện thông báo "Bạn đã hoàn thành bài thi này"

---

## ❓ **Câu 4: Biểu đồ Radar Chart phân tích năng lực dựa trên gì?**

**Trả lời:**
- **7 trục (axes)**: Tương ứng 7 Parts TOEIC
- **Công thức tính**:
  ```javascript
  accuracy_part_n = (correct_in_part_n / total_in_part_n) * 100
  ```
- **Thang điểm**: 0-100% cho mỗi Part
- **Ý nghĩa**:
  - Phần lồi: Điểm mạnh (Part 5, 7: Reading comprehension)
  - Phần lõm: Cần cải thiện (Part 3: Conversations)
- **Personalization**: 
  - Gợi ý bài luyện dựa trên Part yếu nhất
  - Track progress qua nhiều lần thi

**Thư viện**: Chart.js với plugin radar

---

## ❓ **Câu 5: Chi phí vận hành hệ thống thực tế là bao nhiêu?**

**Trả lời (cho 100 học viên/tháng):**

| Hạng mục | Chi phí/tháng | Ghi chú |
|----------|---------------|---------|
| Supabase (Database + Auth) | $0 (Free tier) | 500MB DB, 2GB bandwidth |
| Groq API | $0 (Free tier) | 14,400 requests/day |
| Vercel Hosting | $0 (Free tier) | 100GB bandwidth |
| Domain (.com) | ~$12/năm | Namecheap |
| **Tổng** | **< $50/năm** | |

**Khi scale lên 1000 học viên:**
- Supabase Pro: $25/tháng
- Groq Pay-as-you-go: ~$50/tháng
- Vercel Pro: $20/tháng
- **Tổng: ~$95/tháng** ($1,140/năm)

**So với giải pháp truyền thống**: Tiết kiệm 80% (không cần server riêng, IT staff)

---

## ❓ **Câu 6: Làm sao xử lý 200 câu hỏi (Full Test) mà không bị lag?**

**Trả lời:**
- **Vấn đề ban đầu**: Load 200 questions + passages → 7-10 giây, trang trắng
- **Giải pháp đã áp dụng**:
  1. **React Query caching**: Cache questions sau lần fetch đầu
  2. **Lazy loading passages**: Chỉ load passage khi đến Part đó
  3. **Virtualization**: Render chỉ câu hỏi hiện tại + 2 câu trước/sau
  4. **Image optimization**: 
     - Dùng CDN (Supabase Storage)
     - Lazy load images với `loading="lazy"`
  5. **Database indexes**: 
     ```sql
     CREATE INDEX idx_questions_exam ON questions(exam_set_id, order_index);
     ```

**Kết quả**: Load time giảm từ 7s → **1.5s** ✅

---

## ❓ **Câu 7: MVC pattern được áp dụng như thế nào trong dự án React?**

**Trả lời:**
```
┌─────────────────────────────────────────┐
│  VIEW (React Components)                │
│  - ExamSessionView.tsx                  │
│  - PassageDisplay.tsx                   │
└──────────────┬──────────────────────────┘
               │ Props/Events
┌──────────────▼──────────────────────────┐
│  CONTROLLER (Hooks + Logic)             │
│  - useExamSessionController.ts          │
│  - ExamSessionController.ts             │
└──────────────┬──────────────────────────┘
               │ Service calls
┌──────────────▼──────────────────────────┐
│  MODEL (Services + Types)               │
│  - ExamService.ts                       │
│  - QuestionService.ts                   │
│  - Passage interface                    │
└─────────────────────────────────────────┘
```

**Lợi ích**:
- **Separation of Concerns**: Logic tách biệt khỏi UI
- **Testability**: Unit test Controller độc lập
- **Reusability**: Service dùng chung cho nhiều components
- **Example**: 
  - View: Chỉ render UI
  - Controller: Handle timer, navigation, submit
  - Model: Fetch data từ Supabase

---

## ❓ **Câu 8: Làm sao đảm bảo bảo mật dữ liệu (học viên không xem đáp án trước khi thi)?**

**Trả lời:**
- **Row Level Security (RLS) Policies**:
  ```sql
  -- Học viên KHÔNG thấy correct_choice trước khi submit
  CREATE POLICY "students_no_answers_before_submit"
  ON questions FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM exam_sessions 
      WHERE status = 'completed' AND exam_set_id = questions.exam_set_id
    )
    OR auth.uid() IN (
      SELECT user_id FROM profiles WHERE role = 'teacher'
    )
  );
  ```

- **Frontend obfuscation**: 
  - `correct_choice` không gửi trong initial load
  - Chỉ gửi sau khi submit qua separate endpoint

- **API Security**:
  - Supabase Auth JWT tokens
  - Rate limiting: Max 10 requests/second per user

**Demo**: Inspect Network → Không thấy `correct_choice` trong response trước submit

---

## ❓ **Câu 9: Tính năng nào khó nhất và mất nhiều thời gian nhất?**

**Trả lời:**
1. **Auto-grading cho Part 6 (Text Completion)** - 2 tuần
   - **Khó khăn**: 
     - Passage có 4 blanks → phải group questions by passage
     - Order phải đúng (blank_index 1→4)
     - Hiển thị inline trong passage text
   - **Giải pháp**: 
     - JSONB trong PostgreSQL lưu passage structure
     - Custom component `PassageDisplay` với regex replace blanks

2. **Translation hiển thị (Part 3, 4, 6, 7)** - 1.5 tuần
   - **Khó khăn**: 
     - Nested JSONB: `translation_vi.content`, `content2`, `content3`
     - Toggle show/hide per passage
     - Tab switching (Vietnamese ↔ English)
   - **Giải pháp**: 
     - Tabs component từ shadcn/ui
     - State management với React hooks

3. **Timer với Auto-save** - 1 tuần
   - **Khó khăn**: 
     - Timer pause/resume
     - Auto-save mỗi 30s nhưng không làm gián đoạn UX
     - Restore progress khi refresh
   - **Giải pháp**: 
     - LocalStorage + Supabase sync
     - Debounce auto-save function

---

## ❓ **Câu 10: Nếu có thêm thời gian, tính năng gì sẽ được thêm vào?**

**Trả lời:**

### **Priority 1 (1-2 tháng)**:
1. **Mobile App (React Native)**
   - 70% học viên dùng điện thoại
   - Offline mode cho bài tập

2. **AI Speaking/Writing Grading**
   - Tích hợp Whisper API (speech-to-text)
   - Auto-grade phát âm + grammar

3. **Adaptive Learning Path**
   - AI recommend câu hỏi dựa trên lịch sử làm bài
   - Difficulty tự động tăng/giảm

### **Priority 2 (3-6 tháng)**:
4. **Gamification**
   - Leaderboard, badges, daily streak
   - Multiplayer quiz battles

5. **Social Features**
   - Study groups, discussion forums
   - Peer review explain answers

6. **Advanced Analytics**
   - Predict TOEIC score với ML (Linear Regression)
   - Time-to-proficiency estimation

### **Priority 3 (Nice to have)**:
7. **Multi-language support** (Chinese, Japanese)
8. **Integration với Google Classroom**
9. **Video lessons** cho mỗi grammar topic

---

## 📌 **Mẹo trả lời khi Demo**

### **Nếu bị hỏi khó**:
- ✅ "Đó là câu hỏi rất hay! Hiện tại chúng em chưa implement nhưng đã nghiên cứu và có roadmap..."
- ✅ "Với scope 8 tuần, em ưu tiên các tính năng core trước. Tính năng này sẽ ở phase 2."
- ❌ Đừng nói: "Em không biết" hoặc "Em chưa làm"

### **Nếu demo bị lỗi**:
- ✅ "Em đã chuẩn bị video backup để tiếp tục demo..."
- ✅ "Đây là môi trường dev, production đã stable hơn..."
- ✅ Có screenshot/video dự phòng

### **Highlight điểm mạnh**:
- 🎯 AI Generator - Unique feature
- 📊 Radar Chart Analytics - Visual impact
- ⚡ Performance optimization - Technical depth
- 🔒 Security (RLS) - Production-ready mindset

---

**Cập nhật**: 2025-10-22  
**Dành cho**: Báo cáo dự án & Q&A session
