# 🎯 Next Steps Action Plan

Detailed action plan cho các bước tiếp theo ngay lập tức.

## 🚀 **Immediate Actions (This Week)**

### **Day 1-2: Prepare for Phase 2**

#### **1. Set up Migration Tracking**
```bash
# Create migration tracking file
touch src/MIGRATION_PROGRESS.md

# Create component migration checklist
touch src/COMPONENT_MIGRATION_CHECKLIST.md
```

#### **2. Analyze Next Target Components**
- [ ] **TOEICQuestionCreator.tsx** (805 dòng)
  - [ ] Identify business logic to extract
  - [ ] Identify UI components to separate
  - [ ] Plan controller structure
  - [ ] Plan view structure

- [ ] **TOEICBulkUpload.tsx** (770 dòng)
  - [ ] Identify Excel processing logic
  - [ ] Identify validation logic
  - [ ] Plan service integration
  - [ ] Plan error handling

#### **3. Create Migration Templates**
- [ ] **Controller Template**
  - [ ] Create `src/templates/ControllerTemplate.ts`
  - [ ] Include common patterns
  - [ ] Include error handling
  - [ ] Include logging

- [ ] **View Template**
  - [ ] Create `src/templates/ViewTemplate.tsx`
  - [ ] Include props interface
  - [ ] Include loading states
  - [ ] Include error states

- [ ] **Hook Template**
  - [ ] Create `src/templates/HookTemplate.ts`
  - [ ] Include state management
  - [ ] Include event handling
  - [ ] Include cleanup

### **Day 3-5: Migrate TOEICQuestionCreator.tsx**

#### **Step 1: Create Controller**
```typescript
// src/controllers/question/QuestionCreatorController.ts
export class QuestionCreatorController {
  // Extract business logic from TOEICQuestionCreator
  // Handle form validation
  // Handle question creation
  // Handle part-specific logic
}
```

#### **Step 2: Create View**
```typescript
// src/views/components/QuestionCreatorView.tsx
export const QuestionCreatorView = ({ 
  // Pure UI props
  // No business logic
  // Props-driven
}) => {
  // Pure UI rendering
}
```

#### **Step 3: Create Hook**
```typescript
// src/controllers/question/useQuestionCreatorController.ts
export function useQuestionCreatorController() {
  // React integration
  // State management
  // Event handling
}
```

#### **Step 4: Create MVC Wrapper**
```typescript
// src/views/components/QuestionCreatorMVC.tsx
export const QuestionCreatorMVC = () => {
  const controller = useQuestionCreatorController();
  return <QuestionCreatorView {...controller} />;
}
```

#### **Step 5: Test Migration**
- [ ] Test functionality
- [ ] Test performance
- [ ] Test error handling
- [ ] Update tests

## 📋 **Week 2: TOEICBulkUpload.tsx Migration**

### **Day 1-2: Analyze and Plan**

#### **1. Analyze Component**
- [ ] **Excel Processing Logic**
  - [ ] Identify XLSX parsing logic
  - [ ] Identify data transformation logic
  - [ ] Identify validation logic
  - [ ] Identify error handling

- [ ] **UI Logic**
  - [ ] Identify file upload UI
  - [ ] Identify progress display
  - [ ] Identify error display
  - [ ] Identify success display

#### **2. Plan Architecture**
- [ ] **Controller**: `BulkUploadController.ts`
  - [ ] Excel processing methods
  - [ ] Validation methods
  - [ ] Progress tracking
  - [ ] Error handling

- [ ] **Service**: `BulkUploadService.ts`
  - [ ] Excel parsing
  - [ ] Data transformation
  - [ ] Batch processing
  - [ ] Error recovery

- [ ] **View**: `BulkUploadView.tsx`
  - [ ] File upload UI
  - [ ] Progress display
  - [ ] Error display
  - [ ] Success display

### **Day 3-5: Implement Migration**

#### **Step 1: Create Service**
```typescript
// src/services/domains/upload/BulkUploadService.ts
export class BulkUploadService extends BaseService {
  // Excel parsing logic
  // Data transformation
  // Batch processing
  // Error handling
}
```

#### **Step 2: Create Controller**
```typescript
// src/controllers/upload/BulkUploadController.ts
export class BulkUploadController {
  // Use BulkUploadService
  // Handle UI state
  // Handle progress tracking
  // Handle error handling
}
```

#### **Step 3: Create View**
```typescript
// src/views/components/BulkUploadView.tsx
export const BulkUploadView = ({ 
  // File upload props
  // Progress props
  // Error props
  // Success props
}) => {
  // Pure UI rendering
}
```

#### **Step 4: Create Hook**
```typescript
// src/controllers/upload/useBulkUploadController.ts
export function useBulkUploadController() {
  // React integration
  // File handling
  // Progress tracking
  // Error handling
}
```

## 📊 **Week 3: TOEICQuestionManager.tsx Migration**

### **Day 1-2: Analyze and Plan**

#### **1. Analyze Component**
- [ ] **CRUD Operations**
  - [ ] Identify question listing logic
  - [ ] Identify question editing logic
  - [ ] Identify question deletion logic
  - [ ] Identify question filtering logic

- [ ] **UI Logic**
  - [ ] Identify table display
  - [ ] Identify search functionality
  - [ ] Identify pagination
  - [ ] Identify bulk operations

#### **2. Plan Architecture**
- [ ] **Controller**: `QuestionManagerController.ts`
  - [ ] CRUD operations
  - [ ] Search and filtering
  - [ ] Pagination
  - [ ] Bulk operations

- [ ] **View**: `QuestionManagerView.tsx`
  - [ ] Table display
  - [ ] Search UI
  - [ ] Pagination UI
  - [ ] Bulk action UI

### **Day 3-5: Implement Migration**

#### **Step 1: Create Controller**
```typescript
// src/controllers/question/QuestionManagerController.ts
export class QuestionManagerController {
  // Use existing QuestionService
  // Handle CRUD operations
  // Handle search and filtering
  // Handle pagination
  // Handle bulk operations
}
```

#### **Step 2: Create View**
```typescript
// src/views/components/QuestionManagerView.tsx
export const QuestionManagerView = ({ 
  // Questions data
  // Search props
  // Pagination props
  // Bulk action props
}) => {
  // Pure UI rendering
}
```

## 🔧 **Week 4: EnhancedExamSetCreator.tsx Migration**

### **Day 1-2: Analyze and Plan**

#### **1. Analyze Component**
- [ ] **Exam Set Creation Logic**
  - [ ] Identify exam set validation
  - [ ] Identify question selection logic
  - [ ] Identify time calculation logic
  - [ ] Identify difficulty calculation logic

- [ ] **UI Logic**
  - [ ] Identify form UI
  - [ ] Identify question selection UI
  - [ ] Identify preview UI
  - [ ] Identify validation UI

#### **2. Plan Architecture**
- [ ] **Controller**: `ExamSetCreatorController.ts`
  - [ ] Exam set creation
  - [ ] Question selection
  - [ ] Validation
  - [ ] Preview generation

- [ ] **View**: `ExamSetCreatorView.tsx`
  - [ ] Form UI
  - [ ] Question selection UI
  - [ ] Preview UI
  - [ ] Validation UI

### **Day 3-5: Implement Migration**

#### **Step 1: Create Controller**
```typescript
// src/controllers/exam/ExamSetCreatorController.ts
export class ExamSetCreatorController {
  // Use existing ExamService
  // Handle exam set creation
  // Handle question selection
  // Handle validation
  // Handle preview
}
```

#### **Step 2: Create View**
```typescript
// src/views/components/ExamSetCreatorView.tsx
export const ExamSetCreatorView = ({ 
  // Form props
  // Question selection props
  // Preview props
  // Validation props
}) => {
  // Pure UI rendering
}
```

## 📈 **Progress Tracking**

### **Daily Checklist**
- [ ] **Morning**: Review previous day's progress
- [ ] **Planning**: Plan day's migration tasks
- [ ] **Implementation**: Implement planned tasks
- [ ] **Testing**: Test implemented functionality
- [ ] **Documentation**: Update documentation
- [ ] **Evening**: Review day's progress

### **Weekly Checklist**
- [ ] **Monday**: Plan week's migration targets
- [ ] **Wednesday**: Mid-week progress review
- [ ] **Friday**: Week's progress review
- [ ] **Weekend**: Documentation and cleanup

### **Success Metrics**
- [ ] **Code Quality**: < 200 lines per component
- [ ] **Test Coverage**: > 90% test coverage
- [ ] **Performance**: < 100ms render time
- [ ] **Functionality**: 100% feature parity

## 🚨 **Risk Mitigation**

### **Technical Risks**
- [ ] **Breaking Changes**
  - [ ] Comprehensive testing
  - [ ] Gradual migration
  - [ ] Rollback plan

- [ ] **Performance Issues**
  - [ ] Performance monitoring
  - [ ] Load testing
  - [ ] Optimization

### **Timeline Risks**
- [ ] **Scope Creep**
  - [ ] Strict scope management
  - [ ] Regular reviews
  - [ ] Priority management

- [ ] **Resource Constraints**
  - [ ] Resource planning
  - [ ] Backup plans
  - [ ] External help

## 🎯 **Success Criteria**

### **Phase 2 Completion**
- [ ] All major components migrated to MVC
- [ ] 100% test coverage
- [ ] 0 breaking changes
- [ ] Performance maintained or improved
- [ ] Documentation complete

### **Quality Gates**
- [ ] **Code Review**: All code reviewed
- [ ] **Testing**: All tests passing
- [ ] **Performance**: Performance benchmarks met
- [ ] **Documentation**: Documentation complete
- [ ] **User Testing**: User acceptance testing passed

## 🚀 **Next Immediate Actions (Today)**

1. **Create migration tracking files**
2. **Analyze TOEICQuestionCreator.tsx**
3. **Create migration templates**
4. **Start TOEICQuestionCreator.tsx migration**
5. **Set up daily progress tracking**

---

*This action plan will be updated daily based on progress and learnings.*
