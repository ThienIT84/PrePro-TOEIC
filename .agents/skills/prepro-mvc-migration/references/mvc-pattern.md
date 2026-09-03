# MVC Pattern Reference — PrePro-TOEIC

## Tổng quan kiến trúc

```
User Interaction
       ↓
┌─────────────────┐
│   MVC Wrapper   │  ← Routing, side effects, data fetching
│   (*MVC.tsx)    │
├─────────────────┤
│                 │
│  ┌───────────┐  │
│  │Controller │  │  ← Business logic, state management
│  │  Hook     │  │     useXxxController.ts bridges to React
│  │  (.ts)    │  │     XxxController.ts pure logic class
│  └─────┬─────┘  │
│        │ props   │
│  ┌─────▼─────┐  │
│  │   View    │  │  ← Pure UI rendering
│  │ (*View)   │  │     Only receives props, renders JSX
│  └───────────┘  │
│                 │
├─────────────────┤
│  Model Layer    │  ← Data validation, type definitions
│  (entities/)    │     BaseModel → XxxModel
├─────────────────┤
│  Service Layer  │  ← Supabase CRUD operations
│  (domains/)     │     BaseService → DomainService
└─────────────────┘
```

## Controller Pattern chi tiết

Controller sử dụng **Observer Pattern** để notify React components khi state thay đổi:

```typescript
export interface XxxState {
  // Tất cả state fields
  loading: boolean;
  data: SomeType[];
  error: string | null;
}

export class XxxController {
  private state: XxxState;
  private listeners: Array<(state: XxxState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): XxxState {
    return { loading: true, data: [], error: null };
  }

  // Observer pattern
  subscribe(listener: (state: XxxState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l({ ...this.state }));
  }

  getState(): XxxState {
    return { ...this.state };
  }

  // Business logic methods
  async loadData(): Promise<void> {
    this.state = { ...this.state, loading: true };
    this.notify();
    // ... fetch data ...
    this.state = { ...this.state, loading: false, data: result };
    this.notify();
  }

  cleanup(): void {
    this.listeners = [];
    // Clear any intervals, subscriptions, etc.
  }
}
```

## Controller Hook Pattern

```typescript
import { useState, useEffect, useCallback } from 'react';
import { XxxController, XxxState } from './XxxController';

export function useXxxController() {
  const [controller] = useState(() => new XxxController());
  const [state, setState] = useState<XxxState>(controller.getState());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  useEffect(() => {
    return () => controller.cleanup();
  }, [controller]);

  // Wrap methods with useCallback
  const loadData = useCallback(() => {
    controller.loadData();
  }, [controller]);

  return {
    ...state,
    loadData,
  };
}
```

## View Pattern

```tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface XxxViewProps {
  loading: boolean;
  data: SomeType[];
  error: string | null;
  onAction: () => void;
}

const XxxView: React.FC<XxxViewProps> = ({ loading, data, error, onAction }) => {
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <Card>
      <CardContent>
        {/* Pure rendering logic */}
      </CardContent>
    </Card>
  );
};

export default XxxView;
```

## MVC Wrapper Pattern

```tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useXxxController } from '@/controllers/domain/useXxxController';
import XxxView from './XxxView';

const XxxMVC: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { loading, data, error, loadData } = useXxxController();

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  return (
    <XxxView
      loading={loading}
      data={data}
      error={error}
      onAction={() => navigate('/somewhere')}
    />
  );
};

export default XxxMVC;
```

## Controller Composition & Middleware

Dự án cũng hỗ trợ **Controller Composition** với middleware pattern:
- `LoggingMiddleware` — log method calls và performance
- `ValidationMiddleware` — validate params trước khi execute
- `CachingMiddleware` — cache results
- `ErrorHandlingMiddleware` — centralized error handling

Xem chi tiết: `src/controllers/ControllerComposition.ts`

## Danh sách Components đã migrate

Các domain đã có MVC version:
- `exam/` — ExamSession, ExamHistory, ExamReview, ExamSetCreator, ExamSetManagement, ExamQuestionManagement, ExamManagementDashboard
- `question/` — QuestionCreator, QuestionManager, QuestionDetailModal, TOEICQuestionCreator, TOEICBulkUpload
- `analytics/` — TeacherAnalytics, ActivityTimeline
- `bulk/` — BulkOperations
- `user/` — StudentManagement, StudentList, StudentExamResults, ClassManagement
- `cleanup/` — ItemsTableCleanup, DataMigration
- `passage/` — PassageManager
