---
name: prepro-supabase
description: >-
  Hướng dẫn làm việc với Supabase trong dự án PrePro-TOEIC.
  Sử dụng skill này khi cần tương tác database, authentication,
  storage, real-time subscriptions, hoặc tạo RLS policies.
---

# Supabase Integration Guide — PrePro-TOEIC

## Setup

```typescript
// Client import (dùng ở mọi nơi)
import { supabase } from '@/integrations/supabase/client';

// Database types
import type { Database } from '@/integrations/supabase/types';
```

Environment variables (trong `.env`):
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

## Authentication

### Hook: `useAuth()`
```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, loading, signIn, signUp, signOut } = useAuth();
// user: Supabase User object | null
// loading: boolean
```

### Hook: `usePermissions()`
```typescript
import { usePermissions } from '@/hooks/usePermissions';

const { permissions } = usePermissions();
// permissions.canCreateQuestions: boolean
// permissions.canCreateExamSets: boolean  
// permissions.canManageStudents: boolean
```

### Roles
- `student` — Làm bài, xem kết quả, ôn tập
- `teacher` — Tạo câu hỏi, quản lý đề, quản lý học viên, xem analytics

## Service Layer Pattern

### BaseService
```typescript
import { BaseService } from '@/services/domains/BaseService';

class MyService extends BaseService {
  async getItems() {
    return this.fetchData<MyType>('table_name', '*', { status: 'active' });
  }

  async createItem(data: Partial<MyType>) {
    return this.insertData<MyType>('table_name', data);
  }

  async updateItem(id: string, updates: Partial<MyType>) {
    return this.updateData<MyType>('table_name', id, updates);
  }

  async removeItem(id: string) {
    return this.deleteData('table_name', id);
  }
}
```

### BaseService methods
- `fetchData<T>(table, select, filters?, orderBy?)` — SELECT
- `insertData<T>(table, data)` — INSERT + return single
- `updateData<T>(table, id, updates)` — UPDATE by id
- `deleteData(table, id)` — DELETE by id

## React Query Integration

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['questions', part],
  queryFn: () => fetchQuestions(part),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutation with cache invalidation
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: createQuestion,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['questions'] });
    toast({ title: 'Tạo câu hỏi thành công!' });
  },
});
```

### Query Key Conventions
- `['questions']` — All questions
- `['questions', part]` — Questions by part
- `['exam-sets']` — All exam sets
- `['exam-session', sessionId]` — Specific session
- `['analytics', userId]` — User analytics

## Tham khảo chi tiết
- [Database Schema](./references/database-schema.md)
- [RLS Policies](./references/rls-policies.md)
