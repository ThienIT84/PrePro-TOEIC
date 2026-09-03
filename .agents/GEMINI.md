# PrePro-TOEIC Project Rules

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
