---
name: prepro-mvc-migration
description: >-
  Hướng dẫn migration component legacy sang MVC pattern trong dự án PrePro-TOEIC.
  Sử dụng skill này khi cần tạo mới hoặc refactor component theo kiến trúc MVC
  (Model-View-Controller) của dự án.
---

# MVC Migration Guide — PrePro-TOEIC

Dự án đang migration từ monolithic components (`src/components/`) sang MVC pattern (`src/views/components/` + `src/controllers/`). Hiện tại đã migrate 21/58 components.

## Khi nào cần Migration?

- Component có > 300 lines of code
- Component trộn lẫn business logic và UI rendering
- Component cần được tái sử dụng ở nhiều nơi
- Khi có yêu cầu thay đổi lớn trên legacy component

## Quy trình Migration (5 bước)

### Bước 1: Phân tích Component hiện tại
- Xác định state management logic → sẽ chuyển vào Controller
- Xác định Supabase queries → sẽ chuyển vào Service
- Xác định UI rendering → sẽ giữ lại trong View
- Xác định types/interfaces → sẽ export từ Controller hoặc `@/types`

### Bước 2: Tạo Controller class
- Đặt trong `src/controllers/<domain>/XxxController.ts`
- Kế thừa pattern từ existing controllers (Observer pattern với subscribe/notify)
- Chứa toàn bộ business logic, state management
- KHÔNG import React, KHÔNG có JSX

```typescript
// Pattern chuẩn:
export class XxxController {
  private state: XxxState;
  private listeners: Array<(state: XxxState) => void> = [];

  subscribe(listener: (state: XxxState) => void): () => void { ... }
  private notify(): void { this.listeners.forEach(l => l({...this.state})); }
  getState(): XxxState { return {...this.state}; }
  cleanup(): void { /* clear intervals, subscriptions */ }
}
```

### Bước 3: Tạo Controller hook
- Đặt trong `src/controllers/<domain>/useXxxController.ts`
- Bridge giữa Controller class và React component
- Subscribe to controller state changes via `useState` + `useEffect`
- Wrap controller methods với `useCallback`

### Bước 4: Tạo View component
- Đặt trong `src/views/components/XxxView.tsx`
- Pure presentational component — nhận mọi thứ qua props
- KHÔNG có business logic, KHÔNG gọi Supabase trực tiếp
- KHÔNG sử dụng hooks ngoại trừ UI hooks (useToast, useMobile)

### Bước 5: Tạo MVC Wrapper
- Đặt trong `src/views/components/XxxMVC.tsx`
- Kết nối Controller hook + View
- Xử lý routing (useParams, useNavigate)
- Xử lý side effects (data fetching, subscriptions)

## Verification Checklist

- [ ] Controller không import React
- [ ] View không gọi Supabase hoặc chứa business logic
- [ ] MVC wrapper kết nối đúng Controller ↔ View
- [ ] Legacy component vẫn hoạt động (không xóa ngay)
- [ ] Export mới được thêm vào `src/views/components/index.ts`
- [ ] Types được export đúng chỗ

## Tham khảo chi tiết
- [MVC Pattern Reference](./references/mvc-pattern.md)
- [Ví dụ migration thực tế](./examples/example-migration.md)
