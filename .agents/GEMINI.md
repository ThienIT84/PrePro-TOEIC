# PrePro-TOEIC Project Rules

---

## 🛡️ DISCIPLINED ENGINEERING V2 — 14 Nguyên Tắc Kỷ Luật Cốt Lõi

Bộ quy tắc vận hành bắt buộc đối với mọi Agent và Subagent khi phát triển dự án PrePro-TOEIC:

### 1. Understand Before Changing
- Trước khi bắt tay làm, phải tái hiện rõ ràng: **Mục tiêu (Goal)**, **Phạm vi (Scope)**, **Những gì KHÔNG làm (Non-goals)**, **Ràng buộc (Constraints)**, và **Tiêu chí nghiệm thu (Acceptance Criteria)**.
- Tránh giả định mơ hồ; hiểu cấu trúc hiện tại trước khi thay đổi.

### 2. Risk-Based Clarification
- **Rủi ro lớn / Không thể đảo ngược** (xóa code, đổi schema DB, đổi kiến trúc lớn): **BẮT BUỘC DỪNG LẠI VÀ HỎI USER**.
- **Rủi ro nhỏ / Có thể đảo ngược** (format code, đặt tên biến, điều chỉnh vị trí UI minor): **Nêu rõ giả định (state the assumption) và tiếp tục thực hiện**.

### 3. Preserve Existing Work
- **Tuyệt đối không xóa/ghi đè** những thay đổi do user tự làm hoặc code của các tính năng không liên quan.
- Khi refactor: Giữ nguyên 100% functionality hiện có, chỉ thay đổi cấu trúc mã nguồn.

### 4. Git Isolation
- **KHÔNG BAO GIỜ commit trực tiếp vào `main`**.
- Mọi tính năng, bugfix, refactor đều chạy trên branch riêng biệt (`feat/`, `fix/`, `refactor/`, `chore/`).
- Các tác vụ ghi song song (parallel write tasks) phải sử dụng branch hoặc Git Worktree (`Workspace: 'share'`).

### 5. Minimal Necessary Change
- Chỉ tạo ra thay đổi nhỏ nhất, mạch lạc nhất để giải quyết triệt để vấn đề (KISS / YAGNI).
- Không "tiện tay" sửa hoặc tối ưu hóa quá mức (over-engineering) những phần không thuộc phạm vi yêu cầu.

### 6. Existing Architecture First
- Ưu tiên tuân thủ các quy ước, patterns sẵn có của repository (MVC pattern, `BaseService`, `ServiceFactory`, `useToast`...) trước khi nghĩ đến việc tạo thêm lớp trừu tượng (abstraction) mới.

### 7. Structural Change Control
- Không tự ý thêm dependencies (`package.json`), không đổi database schema/migration, không đổi API endpoints hoặc cấu hình hệ thống (`vite.config`, `tsconfig`...) nếu không có lý do chính đáng và sự đồng ý của user.

### 8. Phase by Complexity
- **Task đơn giản (1-2 files)**: Thực thi trực tiếp, có verify.
- **Task phức tạp (>3 files)**: Bắt buộc bẻ nhỏ thành các phases độc lập, có thể kiểm chứng riêng lẻ theo thứ tự: *Dependencies ➔ Core Logic ➔ UI ➔ Integration ➔ Tests*.

### 9. Risk-Proportional Gates
- Sử dụng các chốt kiểm định (Quality Gates) tương xứng với mức độ rủi ro:
  - Trong quá trình code: Kiểm tra targeted gates (tsc cho file sửa, lint).
  - Trước khi hoàn tất: Kiểm tra toàn diện bắt buộc (`npm test`, `npx tsc --noEmit`, `npm run build`).

### 10. Evidence-Based Completion
- **Tuyệt đối không tuyên bố hoàn thành dựa trên lời nói suông**.
- Mọi xác nhận hoàn thành ("đã chạy test", "đã build thành công") đều phải có bằng chứng lệnh terminal thực tế (Command Output: exit code 0, test pass count).

### 11. Self Review
- Trước khi báo cáo kết quả cho user, Agent phải tự rà soát `git diff`:
  - Kiểm tra xem có scope creep (sửa lan man ra ngoài yêu cầu) không.
  - Loại bỏ các log gỡ lỗi rác (`console.log`, `DEBUG`), files tạm, hoặc rò rỉ secrets/keys.
  - Đánh giá nguy cơ hồi quy (regression risk).

### 12. Controlled Integration
- Khi dùng Subagents: Subagent chịu trách nhiệm thi công (implement); Agent chính (Coordinator) chịu trách nhiệm review diff, chạy kiểm định và tích hợp (integrate).

### 13. Transparent Failure
- Khi gặp lỗi hoặc test fail, phải phân định minh bạch:
  - **Lỗi mới** do code vừa thêm vào?
  - **Lỗi tồn đọng từ trước** của codebase?
  - **Lỗi môi trường / thiếu config/keys**?
  - Những phần nào đã verify và phần nào chưa thể verify (unverified areas)?

### 14. Standard Completion Report
- Luôn trả về báo cáo hoàn tất có cấu trúc chuẩn mực:
  - **Status**: Trạng thái hoàn thành.
  - **Changes**: Tóm tắt thay đổi logic chính.
  - **Files**: Danh sách các files đã tạo / chỉnh sửa.
  - **Decisions**: Quyết định thiết kế đáng chú ý (nếu có).
  - **Verification**: Bằng chứng kiểm thử (Unit test log, Type check log).
  - **Risks & Notes**: Rủi ro tiềm ẩn hoặc lưu ý cần biết.
  - **Git State**: Trạng thái branch và commit ID.

---

## Tech Stack
- **Frontend**: React 18 + TypeScript (strict mode) + Vite
- **UI**: Tailwind CSS + shadcn/ui (Radix UI primitives) + Lucide icons
- **State**: React Query (@tanstack/react-query) cho server state, GlobalStateContext cho client state
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **AI**: Groq API (Llama 3.1-8B) cho question generation
- **Forms**: react-hook-form + zod validation
- **Charts**: Recharts
- **Testing**: Jest + React Testing Library + ts-jest

## Architecture Pattern — MVC

Dự án đang migration sang MVC pattern. Khi tạo/sửa components:

### Cấu trúc MVC
- **Model** (`src/models/entities/`): Data models kế thừa `BaseModel`, chứa validation logic
- **View** (`src/views/components/*View.tsx`): Pure UI components, nhận props, KHÔNG có business logic
- **Controller** (`src/controllers/*/`): Business logic classes + React hooks (`useXxxController`)
- **MVC Wrapper** (`src/views/components/*MVC.tsx`): Kết nối Controller + View, xử lý routing/navigation

### Naming Conventions
| Layer | File Pattern | Ví dụ |
|-------|-------------|-------|
| Controller class | `XxxController.ts` | `ExamSessionController.ts` |
| Controller hook | `useXxxController.ts` | `useExamSessionController.ts` |
| View component | `XxxView.tsx` | `ExamSessionView.tsx` |
| MVC wrapper | `XxxMVC.tsx` | `ExamSessionMVC.tsx` |
| Model | `XxxModel.ts` | `QuestionModel.ts` |

### Legacy Components
- `src/components/` chứa legacy components (chưa migrate sang MVC)
- Khi sửa legacy component, ưu tiên migrate sang MVC nếu thay đổi lớn
- KHÔNG xóa legacy component cho đến khi MVC version đã hoạt động ổn định

## Service Layer
- `src/services/domains/`: Domain services kế thừa `BaseService`
- `BaseService` cung cấp generic CRUD methods: `fetchData`, `insertData`, `updateData`, `deleteData`
- Mỗi domain có thư mục riêng: `analytics/`, `exam/`, `media/`, `question/`, `user/`

## Import Alias
- Sử dụng `@/` alias cho `src/`. Ví dụ: `import { supabase } from '@/integrations/supabase/client'`
- KHÔNG sử dụng relative imports kiểu `../../../`

## Coding Conventions
- Comments và giải thích: **tiếng Việt** (ưu tiên) hoặc tiếng Anh
- Code (biến, hàm, class): **tiếng Anh**
- JSDoc comments cho mọi public function/class
- Export types từ `@/types/index.ts`
- Sử dụng TypeScript strict mode — không dùng `any` trừ khi cần thiết

## Supabase Integration
- Client: `import { supabase } from '@/integrations/supabase/client'`
- Types: `import type { Database } from '@/integrations/supabase/types'`
- Auth: sử dụng `useAuth()` hook từ `@/hooks/useAuth`
- Permissions: sử dụng `usePermissions()` hook từ `@/hooks/usePermissions`
- Luôn xử lý errors từ Supabase queries

## UI Patterns
- Toast notifications: `useToast()` từ `@/hooks/use-toast` hoặc Sonner
- Loading states: hiển thị spinner + text "Loading..."
- Error boundaries: wrap components với `ErrorBoundary`
- Responsive: mobile-first approach với Tailwind breakpoints
- Icons: chỉ sử dụng `lucide-react`

## TOEIC Domain
- 7 Parts: Part 1 (Photos), Part 2 (Q&A), Part 3 (Conversations), Part 4 (Talks), Part 5 (Incomplete Sentences), Part 6 (Text Completion), Part 7 (Reading Comprehension)
- Difficulty levels: `easy`, `medium`, `hard`
- Question status: `draft`, `published`, `archived`
- Correct choice: `A`, `B`, `C`, `D`
- Full test: 200 questions, 120 minutes

## File Organization
- Pages: `src/pages/` — Route-level components
- Components: `src/components/` (legacy) hoặc `src/views/components/` (MVC)
- Hooks: `src/hooks/` — Custom React hooks
- Utils: `src/utils/` — Pure utility functions
- Design patterns: `src/patterns/` — Factory, Observer patterns
- Stores: `src/stores/` — Global state management

---

## 🌿 GIT BRANCHING — Mỗi tính năng một branch

### Quy tắc bắt buộc
- **KHÔNG commit trực tiếp vào `main`**
- Mỗi tính năng / bugfix / refactor → tạo branch riêng
- Merge vào `main` chỉ khi đã verify xong

### Branch Naming Convention
```
<type>/<short-description>

Ví dụ:
  feat/exam-retry-mode
  fix/question-validation-part6
  refactor/exam-session-mvc
  chore/update-dependencies
```

| Prefix | Dùng khi |
|--------|---------|
| `feat/` | Thêm tính năng mới |
| `fix/` | Sửa bug |
| `refactor/` | Refactor / migration (không thay đổi functionality) |
| `chore/` | Config, dependencies, docs, CI/CD |
| `test/` | Thêm/sửa tests |

### Workflow
1. **Tạo branch** từ `main` mới nhất:
   ```bash
   git checkout main && git pull
   git checkout -b feat/ten-tinh-nang
   ```
2. **Implement** theo Phased Implementation (xem bên dưới)
3. **Commit** theo từng phase — mỗi commit là 1 đơn vị logic:
   ```bash
   git add <files>
   git commit -m "<type>: <mô tả ngắn>"
   ```
4. **Push + tạo PR** khi hoàn thành:
   ```bash
   git push origin feat/ten-tinh-nang
   ```
5. **Review** → merge vào `main` → xóa branch

### Commit Message Format
```
<type>: <mô tả ngắn bằng tiếng Việt hoặc Anh>

Ví dụ:
  feat: thêm retry mode cho exam session
  fix: sửa validation blank_index Part 6
  refactor: tách ExamSession sang MVC pattern
  chore: update shadcn/ui components
  test: thêm unit tests cho QuestionModel
```

### Khi nào agent PHẢI hỏi user
- Trước khi tạo branch mới (xác nhận tên branch)
- Trước khi merge vào `main`
- Khi có conflict cần resolve

---

## ⚠️ QUY TẮC IMPLEMENTATION BẮT BUỘC — Phased Implementation & Quality Gates

### Nguyên tắc cốt lõi
> **KHÔNG BAO GIỜ** gom nhiều việc implementation vào cùng một lần.
> Chia nhỏ thành phases, mỗi phase có quality gate kiểm tra trước khi tiếp tục.

### 1. Phân tích trước khi code (MANDATORY)
Trước khi implement BẤT KỲ thay đổi nào, PHẢI:
1. **Liệt kê TẤT CẢ files** sẽ bị ảnh hưởng
2. **Chia thành phases** — mỗi phase tối đa **1-2 files liên quan**
3. **Xác định dependencies** giữa các phases (phase nào phải xong trước?)
4. **Trình bày phases cho user** review trước khi bắt tay vào code

### 2. Quy tắc chia Phase
- **Mỗi phase = 1 đơn vị logic nhỏ nhất** có thể verify độc lập
- **Tối đa 1-2 files mỗi phase** — KHÔNG sửa 3+ files cùng lúc
- **Thứ tự phase**: Dependencies first → Core logic → UI → Integration → Tests
- Ví dụ chia phase cho MVC migration:
  - Phase 1: Tạo Controller class + interfaces
  - Phase 2: Tạo Controller hook
  - Phase 3: Tạo View component
  - Phase 4: Tạo MVC wrapper
  - Phase 5: Update routing/imports

### 3. Quality Gate — Kiểm tra SAU MỖI phase
Sau khi hoàn thành mỗi phase, PHẢI thực hiện quality gate:

```
✅ QUALITY GATE — Phase [N]: [Tên phase]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 Files đã thay đổi:
   - [liệt kê files]

🔍 Kiểm tra:
   - [ ] Code compile không lỗi (TypeScript)?
   - [ ] Logic đúng với yêu cầu?
   - [ ] Không phá vỡ code hiện tại?
   - [ ] Naming conventions đúng chuẩn?

📋 Tóm tắt thay đổi:
   [mô tả ngắn gọn]

👉 Tiếp tục Phase [N+1]? Chờ user xác nhận.
```

### 4. KHÔNG được bỏ qua Gate
- **DỪNG LẠI** sau mỗi phase và báo cáo kết quả
- **CHỜ user xác nhận** trước khi tiếp tục phase tiếp theo
- Nếu gate phát hiện lỗi → sửa lỗi TRONG phase hiện tại trước khi đi tiếp
- **KHÔNG "chạy ahead"** — không implement phase 3 khi phase 2 chưa được approve

### 5. Giữ ngữ cảnh (Context Preservation)
- **Đầu mỗi phase**: tóm tắt lại đang làm gì, đã xong gì, còn gì
- **Nếu task phức tạp (>5 phases)**: tạo checklist tracking progress
- **Khi mất ngữ cảnh**: đọc lại files đã tạo ở phases trước thay vì đoán
- **KHÔNG giả định** nội dung file — luôn đọc lại file trước khi sửa

### 6. Kích thước thay đổi tối đa
| Loại thay đổi | Max files/phase | Ví dụ |
|---------------|-----------------|-------|
| Bugfix nhỏ | 1 file | Sửa typo, fix logic |
| Feature mới | 1-2 files | Thêm component + types |
| Refactor/Migration | 1 file | Tách controller ra |
| Cross-cutting | 2 files | Update imports + routing |

### 7. Escalation
Nếu một task cần thay đổi **>10 files**, PHẢI:
1. Dừng lại và tạo implementation plan chi tiết
2. Chờ user review plan
3. Chia thành sub-tasks, mỗi sub-task ≤5 phases
4. Thực hiện từng sub-task với quality gates

---

## 🚫 CHỐNG "FABRICATED COMPLETION" — Không được nói dối

### 1. Không báo cáo sai
- **KHÔNG BAO GIỜ** nói "đã sửa xong", "đã test xong", "đã kiểm tra" nếu chưa thực sự thực hiện
- Nếu chưa chạy test → nói rõ "chưa chạy test"
- Nếu không chắc code đúng → nói rõ "cần verify"
- **Nói "Tôi không biết"** thay vì đoán khi không có đủ thông tin

### 2. Verification bằng hành động thực tế
- **Luôn dùng tools để verify** (grep, read file, run command) thay vì "nhớ" nội dung file
- Sau khi sửa file → **đọc lại file** để confirm thay đổi đúng
- Không dựa vào "memory" về state của code — luôn kiểm tra thực tế
- Khi claim "code compile thành công" → phải chạy `npx tsc --noEmit` hoặc tương đương

### 3. Không đoán API/syntax
- Nếu không chắc về API, method, hoặc cú pháp → **tìm kiếm hoặc đọc source code** trước
- KHÔNG viết code dựa trên "kiến thức training" nếu có thể verify từ codebase
- Khi dùng thư viện → đọc file source hoặc types trước khi viết code

---

## 🛡️ CHỐNG XÓA CODE — Code Preservation Rules

### 1. Không xóa code không liên quan
- Khi sửa một function → **CHỈ SỬA function đó**, không xóa/sửa code xung quanh
- Khi thêm feature → **KHÔNG xóa features hiện có** trừ khi user yêu cầu rõ ràng
- Khi refactor → giữ nguyên TOÀN BỘ functionality, chỉ thay đổi cấu trúc

### 2. Quy tắc Edit
- **Ưu tiên replace_file_content** (sửa đoạn cụ thể) hơn write_to_file (ghi đè toàn bộ)
- Khi dùng replace_file_content: target content phải khớp CHÍNH XÁC
- **KHÔNG** ghi đè toàn bộ file chỉ để sửa vài dòng
- Trước khi edit → **đọc file trước** để hiểu context xung quanh

### 3. Protected Patterns
- **KHÔNG xóa** comments, JSDoc, hoặc documentation hiện có (trừ khi outdated)
- **KHÔNG xóa** error handling hoặc edge case logic
- **KHÔNG đơn giản hóa** logic phức tạp nếu không hiểu tại sao nó phức tạp
- Khi không hiểu đoạn code → **hỏi user** thay vì xóa/viết lại

---

## 🧠 CHỐNG MẤT NGỮ CẢNH — Context Management

### 1. Khi conversation dài
- Nếu conversation quá dài và bắt đầu mất context → **đề xuất user tạo conversation mới**
- Trước khi tạo conversation mới → tóm tắt progress hiện tại
- Không cố "nhớ" những gì đã làm 20+ turns trước — đọc lại files

### 2. Khi bị "corrupted context"
- Nếu đã tạo ra lỗi → **KHÔNG** cố sửa trong cùng flow
- Thay vào đó: rollback về state tốt → phân tích lại → sửa từ đầu
- Nếu lặp đi lặp lại cùng lỗi 2+ lần → DỪNG LẠI, báo user, đề xuất approach khác

### 3. Tool-First, Memory-Last
- **Luôn dùng grep/find/read** để tìm thông tin từ codebase
- **KHÔNG dựa vào "nhớ"** file nào ở đâu, function nào có gì
- Trước mỗi phase → đọc lại files liên quan để refresh context

---

## 📋 MISTAKES LOG — Học từ lỗi

Khi phát hiện bug hoặc vấn đề trong quá trình phát triển:
1. Ghi vào file `MISTAKES.md` tại root project (nếu chưa có → tạo mới)
2. Format mỗi entry:
```markdown
### [Ngày] - [Mô tả ngắn]
- **Vấn đề**: [Mô tả lỗi]
- **Nguyên nhân**: [Root cause]
- **Giải pháp**: [Cách fix]
- **Rule mới**: [Rule để tránh lặp lại, nếu có]
```
3. Khi pattern lỗi lặp lại 3+ lần → promote thành rule trong GEMINI.md

